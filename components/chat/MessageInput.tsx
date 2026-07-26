"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ModelId } from "@/lib/models";
import ModelSelector from "./ModelSelector";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  model: ModelId;
  onModelChange: (id: ModelId) => void;
}

export default function MessageInput({
  onSend,
  isLoading,
  model,
  onModelChange,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [message]);

  function handleSend() {
    if (!message.trim() || isLoading) return;

    onSend(message);

    setMessage("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl items-end gap-3 rounded-3xl border border-zinc-700 bg-zinc-900 px-4 py-3">
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Ask anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="max-h-40 flex-1 resize-none bg-transparent text-white placeholder:text-zinc-500 outline-none"
        disabled={isLoading}
      />

      <ModelSelector value={model} onChange={onModelChange} />

      <button
        onClick={handleSend}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
          isLoading
            ? "bg-zinc-600 text-zinc-300 cursor-not-allowed"
            : "bg-white text-black hover:bg-zinc-200"
        }`}
        disabled={isLoading}
      >
        {isLoading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}
