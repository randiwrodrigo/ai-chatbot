"use client";

import { useState } from "react";
import { Code2, GraduationCap, Home, PenLine } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import type { ChatMessage } from "@/lib/chat";
import { DEFAULT_MODEL, getModel, type ModelId } from "@/lib/models";
import { isWebGPUSupported, loadWebLLMModel, streamWebLLMChat } from "@/lib/webllm";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ModelDownloadModal, { type DownloadStatus } from "./ModelDownloadModal";

const SUGGESTIONS = [
  { label: "Write", icon: PenLine },
  { label: "Learn", icon: GraduationCap },
  { label: "Code", icon: Code2 },
  { label: "Life stuff", icon: Home },
];

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const [loadedModelId, setLoadedModelId] = useState<ModelId | null>(null);
  const [isReplying, setIsReplying] = useState(false);

  const [downloadModel, setDownloadModel] = useState<ModelId | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadProgressText, setDownloadProgressText] = useState("");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  function handleSelectModel(id: ModelId) {
    setModel(id);
    if (id === loadedModelId) return;

    setDownloadModel(id);
    setDownloadStatus("idle");
    setDownloadProgress(0);
    setDownloadProgressText("");
    setDownloadError(null);
  }

  async function handleDownload() {
    if (!downloadModel) return;

    setDownloadStatus("downloading");
    setDownloadError(null);

    try {
      await loadWebLLMModel(downloadModel, (report) => {
        setDownloadProgress(Math.min(100, Math.round(report.progress * 100)));
        setDownloadProgressText(report.text);
      });
      setLoadedModelId(downloadModel);
      setDownloadStatus("done");
    } catch (err) {
      console.error("Failed to load WebLLM model:", err);
      setDownloadError(
        err instanceof Error ? err.message : "Failed to download the model",
      );
      setDownloadStatus("error");
    }
  }

  async function handleSend(content: string) {
    if (loadedModelId !== model) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMessage];

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setIsReplying(true);

    try {
      let full = "";
      await streamWebLLMChat(
        history.map(({ role, content }) => ({ role, content })),
        (delta) => {
          full += delta;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
          );
        },
      );
    } catch (err) {
      console.error("WebLLM generation failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong generating a reply." }
            : m,
        ),
      );
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-bg-0 text-text-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

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
          <p className="text-2xl font-medium text-text-200">Ask me anything</p>
          <div className="w-full max-w-3xl">
            <MessageInput
              onSend={handleSend}
              isLoading={isReplying}
              model={model}
              loadedModelId={loadedModelId}
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
            <MessageList messages={messages} />
          </section>

          <footer className="border-t border-bg-300 p-4">
            <MessageInput
              onSend={handleSend}
              isLoading={isReplying}
              model={model}
              loadedModelId={loadedModelId}
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
          webGpuSupported={isWebGPUSupported()}
          onDownload={handleDownload}
          onClose={() => setDownloadModel(null)}
        />
      )}
    </main>
  );
}
