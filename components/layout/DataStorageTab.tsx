"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Conversation } from "@/lib/conversations";
import { AI_MODELS, type ModelId } from "@/lib/models";

interface DataStorageTabProps {
  conversations: Conversation[];
  cachedModelIds: Set<ModelId>;
  onDeleteConversation: (id: string) => void;
  onClearConversations: () => void;
  onOpenModelStore: () => void;
}

interface StorageEstimate {
  usage: number;
  quota: number;
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`;
}

function formatPercent(fraction: number): string {
  const pct = fraction * 100;
  if (pct === 0) return "0%";
  if (pct < 0.1) return "<0.1%";
  return `${pct.toFixed(pct < 10 ? 1 : 0)}%`;
}

export default function DataStorageTab({
  conversations,
  cachedModelIds,
  onDeleteConversation,
  onClearConversations,
  onOpenModelStore,
}: DataStorageTabProps) {
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [estimateUnavailable, setEstimateUnavailable] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStorageInfo() {
      if (!navigator.storage?.estimate) {
        setEstimateUnavailable(true);
        return;
      }
      try {
        const result = await navigator.storage.estimate();
        if (!cancelled) {
          setEstimate({ usage: result.usage ?? 0, quota: result.quota ?? 0 });
        }
      } catch (err) {
        console.error("Failed to read storage estimate:", err);
        if (!cancelled) setEstimateUnavailable(true);
      }
    }

    loadStorageInfo();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [...conversations]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((conversation) => ({
      conversation,
      bytes: byteSize(JSON.stringify(conversation)),
    }));
  const chatBytes =
    conversations.length === 0 ? 0 : byteSize(JSON.stringify(conversations));
  const messageCount = conversations.reduce(
    (total, c) => total + c.messages.length,
    0,
  );
  const downloadedModels = AI_MODELS.filter((m) => cachedModelIds.has(m.id));
  const usedFraction =
    estimate && estimate.quota > 0 ? estimate.usage / estimate.quota : 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-100">Data &amp; Storage</h2>
      <p className="mt-1 text-sm text-text-400">
        Everything is stored in this browser — nothing is uploaded anywhere.
      </p>

      <div className="mt-6 rounded-xl border border-bg-300 p-4">
        <p className="text-sm font-medium text-text-100">Site storage</p>
        {estimate ? (
          <>
            <p className="mt-1 text-sm text-text-400">
              {formatBytes(estimate.usage)} of {formatBytes(estimate.quota)} used
              ({formatPercent(usedFraction)})
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bg-300">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${
                    estimate.usage > 0 ? Math.max(usedFraction * 100, 1) : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-text-500">
              Includes downloaded models. Reported by your browser, so treat it
              as an estimate.
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-text-400">
            {estimateUnavailable
              ? "Your browser doesn't report storage usage."
              : "Checking…"}
          </p>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-bg-300 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-text-100">Downloaded models</p>
          <button
            type="button"
            onClick={onOpenModelStore}
            className="text-xs font-medium text-accent hover:underline"
          >
            Manage in Model Store
          </button>
        </div>
        {downloadedModels.length === 0 ? (
          <p className="mt-1 text-sm text-text-400">
            No models downloaded yet.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {downloadedModels.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text-200">{m.label}</span>
                <span className="text-text-400">{m.size}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-bg-300 p-4">
        <p className="text-sm font-medium text-text-100">Conversations</p>
        <p className="mt-1 text-sm text-text-400">
          {conversations.length}{" "}
          {conversations.length === 1 ? "conversation" : "conversations"} ·{" "}
          {messageCount} {messageCount === 1 ? "message" : "messages"} ·{" "}
          {formatBytes(chatBytes)}
        </p>

        {rows.length > 0 && (
          <ul className="mt-3 max-h-56 divide-y divide-bg-300 overflow-y-auto rounded-lg border border-bg-300">
            {rows.map(({ conversation, bytes }) => (
              <li key={conversation.id} className="px-3 py-2">
                {confirmingId === conversation.id ? (
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-text-200">
                      Delete this conversation?
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="rounded-lg px-2.5 py-1 text-xs text-text-200 hover:bg-bg-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteConversation(conversation.id);
                          setConfirmingId(null);
                        }}
                        className="rounded-lg bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-100">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-text-400">
                        {conversation.messages.length}{" "}
                        {conversation.messages.length === 1
                          ? "message"
                          : "messages"}{" "}
                        · {formatBytes(bytes)} ·{" "}
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(conversation.id)}
                      aria-label={`Delete ${conversation.title}`}
                      className="shrink-0 rounded-lg p-1.5 text-text-400 hover:bg-bg-200 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {conversations.length > 0 &&
          (confirmingAll ? (
            <div className="mt-3 flex gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmingAll(false)}
                className="flex-1 rounded-lg px-3 py-1.5 text-sm text-text-200 hover:bg-bg-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearConversations();
                  setConfirmingAll(false);
                }}
                className="flex-1 rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete all
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingAll(true)}
              className="mt-3 rounded-lg border border-bg-300 px-3 py-1.5 text-sm text-text-200 hover:bg-bg-200"
            >
              Delete all conversations
            </button>
          ))}
      </div>
    </div>
  );
}
