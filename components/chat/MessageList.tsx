"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/chat";
import Message from "./Message";

interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
