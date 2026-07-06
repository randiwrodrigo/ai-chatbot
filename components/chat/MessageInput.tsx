"use client";

export default function MessageInput() {
  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3">
      <input
        type="text"
        placeholder="Ask anything..."
        className="flex-1 bg-transparent text-white placeholder:text-zinc-500 outline-none"
      />

      <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200">
        Send
      </button>
    </div>
  );
}