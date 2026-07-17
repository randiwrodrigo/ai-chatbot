"use client";

import { useState } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({
  onSend,
  isLoading,
}: MessageInputProps)  {
  const [message, setMessage] = useState("");

  function handleSend() {
      if (!message.trim() || isLoading) return;

      onSend(message);

      setMessage("");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3">
      <input
        type="text"
        placeholder="Ask anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="flex-1 bg-transparent text-white placeholder:text-zinc-500 outline-none"
        disabled={isLoading}
      />

      <button
        onClick={handleSend}
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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