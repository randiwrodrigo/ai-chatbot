"use client";

import { useEffect, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Share,
  Trash2,
} from "lucide-react";
import type { Conversation } from "@/lib/conversations";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onRequestDelete: () => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onTogglePin,
  onToggleArchive,
  onRequestDelete,
}: ConversationItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const [shared, setShared] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function commitRename() {
    const trimmed = draftTitle.trim();
    onRename(trimmed || conversation.title);
    setIsEditing(false);
  }

  async function handleShare() {
    const transcript = conversation.messages
      .map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(transcript);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch (err) {
      console.error("Failed to copy conversation:", err);
    }
  }

  return (
    <div
      className={`group relative flex items-center gap-1 rounded-xl px-3 py-2 ${
        isActive ? "bg-bg-200" : "hover:bg-bg-200"
      }`}
    >
      {isEditing ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraftTitle(conversation.title);
              setIsEditing(false);
            }
          }}
          className="flex-1 rounded-md bg-bg-0 px-2 py-1 text-sm text-text-100 outline-none ring-1 ring-accent"
        />
      ) : (
        <button
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm text-text-200"
        >
          {conversation.pinned && (
            <Pin className="h-3 w-3 shrink-0 text-text-400" />
          )}
          <span className="truncate">{conversation.title}</span>
        </button>
      )}

      {!isEditing && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            aria-label="Conversation options"
            className={`rounded-lg p-1.5 text-text-400 hover:bg-bg-300 hover:text-text-100 ${
              menuOpen ? "bg-bg-300 text-text-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-bg-300 bg-bg-100 p-1.5 shadow-2xl animate-fade-in">
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
              >
                {shared ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Share className="h-4 w-4" />
                )}
                {shared ? "Copied" : "Share"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(conversation.title);
                  setIsEditing(true);
                  closeMenu();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
              >
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => {
                  onTogglePin();
                  closeMenu();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
              >
                {conversation.pinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
                {conversation.pinned ? "Unpin chat" : "Pin chat"}
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleArchive();
                  closeMenu();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
              >
                {conversation.archived ? (
                  <ArchiveRestore className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {conversation.archived ? "Unarchive" : "Archive"}
              </button>
              <div className="my-1 h-px bg-bg-300" />
              <button
                type="button"
                onClick={() => {
                  onRequestDelete();
                  closeMenu();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-red-400 hover:bg-bg-200"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
