
"use client";

import { useState } from "react";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import { Message } from "@/types/chat";


export default function Chat() {

  try {
    const [messages, setMessages] = useState<Message[]>([]);

    async function handleSend(content: string) {
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

      const data = await response.json();
      const botMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, botMessage]);
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
          <MessageInput onSend={handleSend} />
        </footer>
      </main>
    );
  }

  catch (error) {
    console.error("Error in Chat component:", error);
    return (
      <main className="flex h-screen flex-col bg-black text-white">
        <header className="h-16 border-b border-zinc-800 px-6 flex items-center">
          <h1 className="text-2xl font-semibold">Chabot</h1>
        </header>
        <section className="flex-1 overflow-y-auto p-6">
          <p className="text-red-500">An error occurred while initializing the chat.</p>
        </section>
      </main>
    );
  }
}
