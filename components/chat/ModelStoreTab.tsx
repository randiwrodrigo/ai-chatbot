"use client";

import { useState } from "react";
import { Check, Download, Trash2 } from "lucide-react";
import {
  AI_MODELS,
  MODEL_CATEGORY_LABELS,
  type ModelCategory,
  type ModelId,
} from "@/lib/models";

type Filter = "all" | ModelCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...(Object.keys(MODEL_CATEGORY_LABELS) as ModelCategory[])
    .filter((category) => AI_MODELS.some((m) => m.category === category))
    .map((category) => ({
      id: category,
      label: MODEL_CATEGORY_LABELS[category],
    })),
];

interface ModelStoreTabProps {
  loadedModelId: ModelId | null;
  cachedModelIds: Set<ModelId>;
  isStreaming: boolean;
  onSelect: (id: ModelId) => void;
  onDelete: (id: ModelId) => Promise<void> | void;
}

export default function ModelStoreTab({
  loadedModelId,
  cachedModelIds,
  isStreaming,
  onSelect,
  onDelete,
}: ModelStoreTabProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmingId, setConfirmingId] = useState<ModelId | null>(null);
  const [deletingId, setDeletingId] = useState<ModelId | null>(null);

  async function handleConfirmDelete(id: ModelId) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  const visibleModels = AI_MODELS.filter(
    (m) => filter === "all" || m.category === filter,
  );

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-100">Model Store</h2>
      <p className="mt-1 text-sm text-text-400">
        On-device models run entirely in your browser — no server, no API key
        involved. Bigger models are more capable but need a stronger GPU;
        install what your laptop can handle.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === id
                ? "bg-text-100 text-bg-0"
                : "border border-bg-300 text-text-300 hover:bg-bg-200 hover:text-text-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {visibleModels.map((m) => {
          const isCached = cachedModelIds.has(m.id);
          const isActive = loadedModelId === m.id;
          const isConfirming = confirmingId === m.id;
          const deleteDisabled = isActive && isStreaming;

          return (
            <div key={m.id} className="rounded-xl border border-bg-300 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-text-100">
                      {m.label}
                    </span>
                    <span className="rounded-full border border-bg-300 px-2 py-0.5 text-[10px] font-medium text-text-300">
                      {MODEL_CATEGORY_LABELS[m.category]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-400">{m.description}</p>
                  <p className="mt-0.5 text-xs text-text-500">
                    Needs {m.vram} of GPU memory
                  </p>
                </div>
                <span className="shrink-0 text-xs text-text-400">{m.size}</span>
              </div>

              {isConfirming ? (
                <div className="mt-3">
                  <p className="text-sm text-text-200">
                    Delete{" "}
                    <span className="font-medium text-text-100">{m.label}</span>?
                    You&apos;ll need to download it again to use it.
                  </p>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="flex-1 rounded-lg px-2.5 py-1.5 text-sm text-text-200 hover:bg-bg-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="flex-1 rounded-lg bg-red-500/90 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
                    >
                      {deletingId === m.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  {!isCached ? (
                    <button
                      type="button"
                      onClick={() => onSelect(m.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-text-100 py-2 text-sm font-medium text-bg-0 hover:bg-text-200"
                    >
                      <Download className="h-4 w-4" />
                      Install
                    </button>
                  ) : isActive ? (
                    <div className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent/10 py-2 text-sm font-medium text-accent">
                      <Check className="h-4 w-4" />
                      In use
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(m.id)}
                      className="flex-1 rounded-lg bg-text-100 py-2 text-sm font-medium text-bg-0 hover:bg-text-200"
                    >
                      Use model
                    </button>
                  )}

                  {isCached && (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(m.id)}
                      disabled={deleteDisabled}
                      aria-label={`Delete ${m.label}`}
                      title={
                        deleteDisabled
                          ? "Can't delete while it's generating a reply"
                          : "Delete downloaded model"
                      }
                      className="rounded-lg border border-bg-300 px-3 text-text-400 hover:bg-bg-200 hover:text-red-400 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
