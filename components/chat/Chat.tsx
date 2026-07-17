
"use client";

import { useState } from "react";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import { Message } from "@/types/chat";


export default function Chat() {


  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(content: string) {
    try {
      setIsLoading(true);
      const newMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, newMessage]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  
    return (
      <main className="flex h-screen flex-col bg-black text-white">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 px-6 flex items-center">
          <h1 className="text-2xl font-semibold">Chabot</h1>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto">
          <MessageList messages={messages} />
        </section>

        {/* Input */}
        <footer className="border-t border-zinc-800 p-4">
          <MessageInput
            onSend={handleSend}
            isLoading={isLoading}
          />
        </footer>
      </main>
    ); 

}
