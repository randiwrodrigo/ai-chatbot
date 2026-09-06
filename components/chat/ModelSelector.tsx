"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { AI_MODELS, type ModelId } from "@/lib/models";

interface ModelSelectorProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
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
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-2xl border border-bg-300 bg-bg-100 p-1.5 shadow-2xl animate-fade-in">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
            >
              {m.label}
              {m.id === value && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
