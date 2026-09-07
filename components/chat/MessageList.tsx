"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat";
import Message from "./Message";

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessageId?: string | null;
}

export default function MessageList({
  messages,
  streamingMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
