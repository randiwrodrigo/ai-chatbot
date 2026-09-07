"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Loader2, Plus } from "lucide-react";
import type { ModelId } from "@/lib/models";
import ModelSelector from "./ModelSelector";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  model: ModelId;
  loadedModelId: ModelId | null;
  cachedModelIds: Set<ModelId>;
  isRestoring: boolean;
  onSelectModel: (id: ModelId) => void;
}

export default function MessageInput({
  onSend,
  isLoading,
  model,
  loadedModelId,
  cachedModelIds,
  isRestoring,
  onSelectModel,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelReady = loadedModelId === model;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [message]);

  function handleSend() {
    if (!message.trim() || isLoading || !modelReady) return;

    onSend(message);

    setMessage("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const hasContent = message.trim().length > 0;
  const canSend = hasContent && !isLoading && modelReady;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
      <div className="flex flex-col gap-2 rounded-3xl border border-bg-300 bg-bg-100 px-4 pb-3 pt-4 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-shadow focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={
            modelReady
              ? "How can I help you today?"
              : isRestoring
                ? "Loading your last model from cache..."
                : "Pick a model below to get started"
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-60 w-full resize-none bg-transparent text-[16px] leading-relaxed text-text-100 outline-none placeholder:text-text-400"
          disabled={isLoading || !modelReady}
        />

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            title="Attachments coming soon"
            aria-label="Add attachment"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-400 transition-colors hover:bg-bg-200 hover:text-text-200"
          >
            <Plus className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <ModelSelector
              value={model}
              loadedModelId={loadedModelId}
              cachedModelIds={cachedModelIds}
              onSelect={onSelectModel}
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                canSend
                  ? "bg-accent text-bg-0 hover:bg-accent-hover"
                  : "bg-accent/30 text-bg-0/60"
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-text-500">
        AI can make mistakes. Please check important information.
      </p>
    </div>
  );
}
