"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Code2, GraduationCap, Home, PenLine } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { DEFAULT_MODEL, type ModelId } from "@/lib/models";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

const SUGGESTIONS = [
  { label: "Write", icon: PenLine },
  { label: "Learn", icon: GraduationCap },
  { label: "Code", icon: Code2 },
  { label: "Life stuff", icon: Home },
];

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const isLoading = status === "submitted" || status === "streaming";

  function handleSend(content: string) {
    sendMessage({ text: content }, { body: { model } });
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
              isLoading={isLoading}
              model={model}
              onModelChange={setModel}
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
              isLoading={isLoading}
              model={model}
              onModelChange={setModel}
            />
          </footer>
        </>
      )}
    </main>
  );
}
