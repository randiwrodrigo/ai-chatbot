"use client";

import { useState } from "react";
import { Check, Download, Trash2 } from "lucide-react";
import { AI_MODELS, type ModelId } from "@/lib/models";

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

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-100">Model Store</h2>
      <p className="mt-1 text-sm text-text-400">
        Every model runs locally in your browser. Download one to use it, or
        remove a downloaded model to free up space.
      </p>

      <div className="mt-4 flex flex-col gap-1.5">
        {AI_MODELS.map((m) => {
          const isCached = cachedModelIds.has(m.id);
          const isActive = loadedModelId === m.id;
          const isConfirming = confirmingId === m.id;
          const deleteDisabled = isActive && isStreaming;

          return (
            <div key={m.id} className="rounded-xl border border-bg-300 px-3 py-2.5">
              {isConfirming ? (
                <div>
                  <p className="text-sm text-text-200">
                    Delete <span className="font-medium text-text-100">{m.label}</span>?
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
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(m.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-100">
                        {m.label}
                      </span>
                      {isActive ? (
                        <span className="rounded-full bg-accent/15 px-1.5 py-[1px] text-[10px] font-medium text-accent">
                          Ready
                        </span>
                      ) : (
                        isCached && (
                          <span className="rounded-full bg-bg-300 px-1.5 py-[1px] text-[10px] font-medium text-text-300">
                            Cached
                          </span>
                        )
                      )}
                    </div>
                    <span className="text-xs text-text-400">
                      {m.description} · {m.size}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-1 pt-0.5">
                    {isActive && <Check className="h-4 w-4 text-accent" />}
                    {isCached ? (
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
                        className="rounded-lg p-1.5 text-text-400 hover:bg-bg-200 hover:text-red-400 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelect(m.id)}
                        aria-label={`Download ${m.label}`}
                        title="Download this model"
                        className="rounded-lg p-1.5 text-text-400 hover:bg-bg-200 hover:text-accent"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
