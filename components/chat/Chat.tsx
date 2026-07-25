"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import Sidebar from "@/components/layout/Sidebar";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

export default function Chat() {
  const { messages, sendMessage, status } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoading = status === "submitted" || status === "streaming";

  function handleSend(content: string) {
    sendMessage({ text: content });
  }

  return (
    <main className="flex h-screen flex-col bg-black text-white">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <header className="h-16 border-b border-zinc-800 px-4 flex items-center gap-2">
        <button
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
          className="rounded-lg p-2 text-zinc-300 hover:bg-zinc-800"
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
        <h1 className="text-2xl font-semibold">Chabot</h1>
      </header>

      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <p className="text-2xl font-medium">Ask me anything</p>
          <div className="w-full max-w-4xl">
            <MessageInput onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <>
          <section className="flex-1 overflow-y-auto">
            <MessageList messages={messages} />
          </section>

          <footer className="border-t border-zinc-800 p-4">
            <MessageInput onSend={handleSend} isLoading={isLoading} />
          </footer>
        </>
      )}
    </main>
  );
}
