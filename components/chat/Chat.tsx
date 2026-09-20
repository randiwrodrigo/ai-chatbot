"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { Code2, GraduationCap, Home, PenLine } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import type { ChatMessage } from "@/lib/chat";
import { auth } from "@/lib/firebase";
import {
  loadConversations,
  saveConversations,
  titleFromMessage,
  type Conversation,
} from "@/lib/conversations";
import { AI_MODELS, DEFAULT_MODEL, getModel, isModelId, type ModelId } from "@/lib/models";
import {
  deleteModelFromCache,
  isModelCached,
  isWebGPUSupported,
  loadWebLLMModel,
  stopWebLLMGeneration,
  streamWebLLMChat,
} from "@/lib/webllm";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ModelDownloadModal, { type DownloadStatus } from "./ModelDownloadModal";

const SUGGESTIONS = [
  { label: "Write", icon: PenLine },
  { label: "Learn", icon: GraduationCap },
  { label: "Code", icon: Code2 },
  { label: "Life stuff", icon: Home },
];

const LAST_MODEL_KEY = "webllm-last-model";

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [loadedModelId, setLoadedModelId] = useState<ModelId | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  function refreshUser() {
    // updateProfile() mutates auth.currentUser in place, so a plain re-set
    // wouldn't trigger a re-render — copy it into a fresh object instead.
    if (auth.currentUser) setUser({ ...auth.currentUser } as User);
  }

  const [downloadModel, setDownloadModel] = useState<ModelId | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadProgressText, setDownloadProgressText] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const stopRequestedRef = useRef(false);

  const [cachedModelIds, setCachedModelIds] = useState<Set<ModelId>>(new Set());
  const [isRestoring, setIsRestoring] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function checkCache() {
      setConversations(loadConversations());

      const results = await Promise.all(
        AI_MODELS.map(async (m) => [m.id, await isModelCached(m.id)] as const),
      );
      if (cancelled) return;

      const cached = new Set(results.filter(([, ok]) => ok).map(([id]) => id));
      setCachedModelIds(cached);

      const lastModel = localStorage.getItem(LAST_MODEL_KEY);
      if (isModelId(lastModel) && cached.has(lastModel)) {
        setModel(lastModel);
        setIsRestoring(true);
        try {
          await loadWebLLMModel(lastModel, () => {});
          if (!cancelled) setLoadedModelId(lastModel);
        } catch (err) {
          console.error("Failed to restore last WebLLM model:", err);
        } finally {
          if (!cancelled) setIsRestoring(false);
        }
      }
    }

    checkCache();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectModel(id: ModelId) {
    setModel(id);
    if (id === loadedModelId) return;

    setDownloadModel(id);
    setDownloadProgress(0);
    setDownloadProgressText("");
    setDownloadError(null);

    if (cachedModelIds.has(id)) {
      // Already on this device — load it straight away, no "Download" click needed.
      startLoad(id);
    } else {
      setDownloadStatus("idle");
    }
  }

  async function startLoad(id: ModelId) {
    setDownloadStatus("downloading");
    setDownloadError(null);

    try {
      await loadWebLLMModel(id, (report) => {
        setDownloadProgress(Math.min(100, Math.round(report.progress * 100)));
        setDownloadProgressText(report.text);
      });
      setLoadedModelId(id);
      setCachedModelIds((prev) => new Set(prev).add(id));
      localStorage.setItem(LAST_MODEL_KEY, id);
      setDownloadStatus("done");
    } catch (err) {
      console.error("Failed to load WebLLM model:", err);
      setDownloadError(
        err instanceof Error ? err.message : "Failed to download the model",
      );
      setDownloadStatus("error");
    }
  }

  function handleDownload() {
    if (!downloadModel) return;
    startLoad(downloadModel);
  }

  function upsertConversation(update: (conversations: Conversation[]) => Conversation[]) {
    setConversations((prev) => {
      const next = update(prev);
      saveConversations(next);
      return next;
    });
  }

  async function generateReply(
    assistantId: string,
    history: ChatMessage[],
    conversationId: string,
  ) {
    let full = "";
    stopRequestedRef.current = false;
    try {
      for await (const delta of streamWebLLMChat(
        history.map(({ role, content }) => ({ role, content })),
      )) {
        full += delta;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
        );
      }
    } catch (err) {
      console.error("WebLLM generation failed:", err);
      if (!full) full = "Sorry, something went wrong generating a reply.";
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
      );
    } finally {
      setStreamingMessageId(null);
      // Stopped before any text arrived: drop the empty reply instead of
      // leaving a blank bubble (and a blank assistant turn in the history).
      const stoppedEmpty = stopRequestedRef.current && !full;
      if (stoppedEmpty) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
      const finalMessages = stoppedEmpty
        ? history
        : [
            ...history,
            { id: assistantId, role: "assistant" as const, content: full },
          ];
      const now = Date.now();
      upsertConversation((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: finalMessages, updatedAt: now }
            : c,
        ),
      );
    }
  }

  function handleSend(content: string) {
    if (loadedModelId !== model) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMessage];
    const fullMessages = [
      ...history,
      { id: assistantId, role: "assistant" as const, content: "" },
    ];

    setMessages(fullMessages);
    setStreamingMessageId(assistantId);

    const conversationId = currentConversationId ?? crypto.randomUUID();
    if (!currentConversationId) setCurrentConversationId(conversationId);

    const now = Date.now();
    upsertConversation((prev) => {
      const existing = prev.find((c) => c.id === conversationId);
      const updated: Conversation = existing
        ? { ...existing, messages: fullMessages, updatedAt: now }
        : {
            id: conversationId,
            title: titleFromMessage(content),
            messages: fullMessages,
            pinned: false,
            archived: false,
            createdAt: now,
            updatedAt: now,
          };
      return existing
        ? prev.map((c) => (c.id === conversationId ? updated : c))
        : [updated, ...prev];
    });

    generateReply(assistantId, history, conversationId);
  }

  function handleStop() {
    stopRequestedRef.current = true;
    stopWebLLMGeneration().catch((err) => {
      console.error("Failed to stop generation:", err);
    });
  }

  function handleNewChat() {
    setMessages([]);
    setCurrentConversationId(null);
    setIsSidebarOpen(false);
  }

  function handleSelectConversation(id: string) {
    const conversation = conversations.find((c) => c.id === id);
    if (!conversation) return;
    setMessages(conversation.messages);
    setCurrentConversationId(id);
    setIsSidebarOpen(false);
  }

  function handleRenameConversation(id: string, title: string) {
    upsertConversation((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  }

  function handleTogglePin(id: string) {
    upsertConversation((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  }

  function handleToggleArchive(id: string) {
    upsertConversation((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    );
  }

  function handleDeleteConversation(id: string) {
    upsertConversation((prev) => prev.filter((c) => c.id !== id));
    if (id === currentConversationId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  }

  function handleClearConversations() {
    setConversations([]);
    saveConversations([]);
    setMessages([]);
    setCurrentConversationId(null);
  }

  async function handleDeleteModel(id: ModelId) {
    try {
      await deleteModelFromCache(id);
    } catch (err) {
      console.error("Failed to delete cached model:", err);
    }
    setCachedModelIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (loadedModelId === id) setLoadedModelId(null);
    if (localStorage.getItem(LAST_MODEL_KEY) === id) {
      localStorage.removeItem(LAST_MODEL_KEY);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-bg-0 text-text-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDeleteConversation={handleDeleteConversation}
        onClearConversations={handleClearConversations}
        loadedModelId={loadedModelId}
        cachedModelIds={cachedModelIds}
        isStreaming={streamingMessageId !== null}
        onSelectModel={handleSelectModel}
        onDeleteModel={handleDeleteModel}
        user={user}
        onProfileUpdated={refreshUser}
      />

      <header className="h-16 border-b border-bg-300 px-4 flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-text-300 hover:bg-bg-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <line x1="9.5" y1="4" x2="9.5" y2="20" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold">Chatbot</h1>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <p className="font-serif text-3xl font-light text-text-200 sm:text-4xl">
            {user ? `Hey there, ${user.displayName ?? user.email}` : "Ask me anything"}
          </p>
          <div className="w-full max-w-3xl">
            <MessageInput
              onSend={handleSend}
              onStop={handleStop}
              isLoading={streamingMessageId !== null}
              model={model}
              loadedModelId={loadedModelId}
              cachedModelIds={cachedModelIds}
              isRestoring={isRestoring}
              onSelectModel={handleSelectModel}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {SUGGESTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-bg-300 px-3 py-1.5 text-sm text-text-300 transition-colors hover:bg-bg-200 hover:text-text-200"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <section className="flex-1 overflow-y-auto">
            <MessageList messages={messages} streamingMessageId={streamingMessageId} />
          </section>

          <footer className="border-t border-bg-300 p-4">
            <MessageInput
              onSend={handleSend}
              onStop={handleStop}
              isLoading={streamingMessageId !== null}
              model={model}
              loadedModelId={loadedModelId}
              cachedModelIds={cachedModelIds}
              isRestoring={isRestoring}
              onSelectModel={handleSelectModel}
            />
          </footer>
        </>
      )}

      {downloadModel && (
        <ModelDownloadModal
          model={getModel(downloadModel)}
          status={downloadStatus}
          progress={downloadProgress}
          progressText={downloadProgressText}
          error={downloadError}
          isCached={cachedModelIds.has(downloadModel)}
          webGpuSupported={isWebGPUSupported()}
          onDownload={handleDownload}
          onClose={() => setDownloadModel(null)}
        />
      )}
    </main>
  );
}
