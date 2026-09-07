"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AI_MODELS, type ModelId } from "@/lib/models";

interface ModelSelectorProps {
  value: ModelId;
  loadedModelId: ModelId | null;
  cachedModelIds: Set<ModelId>;
  onSelect: (id: ModelId) => void;
}

export default function ModelSelector({
  value,
  loadedModelId,
  cachedModelIds,
  onSelect,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = AI_MODELS.find((m) => m.id === value) ?? AI_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "bg-bg-200 text-text-100"
            : "text-text-300 hover:bg-bg-200 hover:text-text-100"
        }`}
      >
        {selected.label}
        {loadedModelId === selected.id && (
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        )}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 overflow-hidden rounded-2xl border border-bg-300 bg-bg-100 p-1.5 shadow-2xl animate-fade-in">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onSelect(m.id);
                setIsOpen(false);
              }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-bg-200"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-100">
                    {m.label}
                  </span>
                  {loadedModelId === m.id ? (
                    <span className="rounded-full bg-accent/15 px-1.5 py-[1px] text-[10px] font-medium text-accent">
                      Ready
                    </span>
                  ) : (
                    cachedModelIds.has(m.id) && (
                      <span className="rounded-full bg-bg-300 px-1.5 py-[1px] text-[10px] font-medium text-text-300">
                        Cached
                      </span>
                    )
                  )}
                </div>
                <span className="text-xs text-text-400">
                  {m.description} · {m.size}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
