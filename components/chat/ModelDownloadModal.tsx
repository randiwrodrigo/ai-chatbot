"use client";

import { Check, Download, Loader2, X } from "lucide-react";
import type { AiModel } from "@/lib/models";

export type DownloadStatus = "idle" | "downloading" | "done" | "error";

interface ModelDownloadModalProps {
  model: AiModel;
  status: DownloadStatus;
  progress: number;
  progressText: string;
  error: string | null;
  isCached: boolean;
  webGpuSupported: boolean;
  onDownload: () => void;
  onClose: () => void;
}

export default function ModelDownloadModal({
  model,
  status,
  progress,
  progressText,
  error,
  isCached,
  webGpuSupported,
  onDownload,
  onClose,
}: ModelDownloadModalProps) {
  const canClose = status !== "downloading";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        onClick={() => canClose && onClose()}
        className="fixed inset-0 bg-black/70"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-bg-100 p-8">
        <button
          onClick={onClose}
          disabled={!canClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-text-400 hover:bg-bg-200 hover:text-text-100 disabled:pointer-events-none disabled:opacity-30"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-center text-xl font-semibold text-text-100">
          {model.label}
        </h2>
        <p className="mt-1 text-center text-sm text-text-400">
          {model.description}
        </p>

        <div className="mt-6 rounded-xl border border-bg-300 bg-bg-0 px-4 py-3 text-sm text-text-300">
          <div className="flex items-center justify-between">
            <span>{isCached ? "Size on disk" : "Download size"}</span>
            <span className="font-medium text-text-100">{model.size}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>GPU memory needed</span>
            <span className="font-medium text-text-100">{model.vram}</span>
          </div>
        </div>

        {!webGpuSupported ? (
          <p className="mt-6 text-center text-sm text-red-400">
            Your browser doesn&apos;t support WebGPU, so this model can&apos;t
            run here. Try a recent version of Chrome or Edge.
          </p>
        ) : status === "idle" ? (
          <>
            <p className="mt-4 text-center text-xs text-text-500">
              This model runs entirely in your browser — nothing is sent to a
              server. It downloads once and is cached for next time.
            </p>
            <button
              onClick={onDownload}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-medium text-bg-0 hover:bg-accent-hover"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </>
        ) : status === "downloading" ? (
          <div className="mt-6">
            {isCached && (
              <p className="mb-3 text-center text-xs text-text-500">
                Already on this device — loading it into memory, no download
                needed.
              </p>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-bg-300">
              <div
                className="h-full rounded-full bg-accent transition-all duration-200"
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-text-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              {progressText || "Preparing..."}
            </p>
          </div>
        ) : status === "done" ? (
          <>
            <div className="mt-6 flex items-center justify-center gap-2 text-accent">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                {isCached ? "Ready to go" : "Download complete"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-accent py-3 font-medium text-bg-0 hover:bg-accent-hover"
            >
              Start chatting
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-center text-sm text-red-400">
              {error ?? "Something went wrong while loading this model."}
            </p>
            <button
              onClick={onDownload}
              className="mt-6 w-full rounded-full bg-accent py-3 font-medium text-bg-0 hover:bg-accent-hover"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
