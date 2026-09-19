"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, type User } from "firebase/auth";
import { SquarePen } from "lucide-react";
import { auth } from "@/lib/firebase";
import type { Conversation } from "@/lib/conversations";
import type { ModelId } from "@/lib/models";
import AccountMenu from "./AccountMenu";
import ConversationItem from "./ConversationItem";
import LoginModal from "./LoginModal";
import SettingsModal, { type SettingsTab } from "./SettingsModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onClearConversations: () => void;
  loadedModelId: ModelId | null;
  cachedModelIds: Set<ModelId>;
  isStreaming: boolean;
  onSelectModel: (id: ModelId) => void;
  onDeleteModel: (id: ModelId) => Promise<void> | void;
  user: User | null;
  onProfileUpdated: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  return initials.toUpperCase();
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onTogglePin,
  onToggleArchive,
  onDeleteConversation,
  onClearConversations,
  loadedModelId,
  cachedModelIds,
  isStreaming,
  onSelectModel,
  onDeleteModel,
  user,
  onProfileUpdated,
}: SidebarProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  const visible = conversations.filter((c) => !c.archived);
  const pinned = [...visible.filter((c) => c.pinned)].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  const others = [...visible.filter((c) => !c.pinned)].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  const archived = [...conversations.filter((c) => c.archived)].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  function renderItem(conversation: Conversation) {
    return (
      <ConversationItem
        key={conversation.id}
        conversation={conversation}
        isActive={conversation.id === currentConversationId}
        onSelect={() => onSelectConversation(conversation.id)}
        onRename={(title) => onRenameConversation(conversation.id, title)}
        onTogglePin={() => onTogglePin(conversation.id)}
        onToggleArchive={() => onToggleArchive(conversation.id)}
        onRequestDelete={() => setDeletingId(conversation.id)}
      />
    );
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-bg-300 bg-bg-sidebar transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-text-300 hover:bg-bg-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9.5" y1="4" x2="9.5" y2="20" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <button
            onClick={onNewChat}
            className="mb-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-200 hover:bg-bg-200"
          >
            <SquarePen className="h-4 w-4" />
            New chat
          </button>

          {pinned.length === 0 && others.length === 0 && archived.length === 0 && (
            <p className="px-3 py-2 text-sm text-text-500">No conversations yet</p>
          )}

          {pinned.length > 0 && (
            <div className="mb-2">
              <p className="px-3 pb-1 text-xs font-medium text-text-500">Pinned</p>
              {pinned.map(renderItem)}
            </div>
          )}

          {others.length > 0 && (
            <div className="mb-2">
              {pinned.length > 0 && (
                <p className="px-3 pb-1 text-xs font-medium text-text-500">Chats</p>
              )}
              {others.map(renderItem)}
            </div>
          )}

          {archived.length > 0 && (
            <div>
              <p className="px-3 pb-1 text-xs font-medium text-text-500">Archived</p>
              {archived.map(renderItem)}
            </div>
          )}
        </div>

        <div className="border-t border-bg-300 p-4">
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              {accountMenuOpen && (
                <AccountMenu
                  user={user}
                  onOpenSettings={(tab) => {
                    setAccountMenuOpen(false);
                    setSettingsTab(tab);
                  }}
                  onLogout={() => {
                    setAccountMenuOpen(false);
                    signOut(auth);
                  }}
                />
              )}

              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-bg-200"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "Account"}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 shrink-0 rounded-full"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-300 text-sm font-semibold text-text-100">
                    {getInitials(user.displayName ?? user.email ?? "?")}
                  </div>
                )}

                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-text-100">
                    {user.displayName ?? user.email}
                  </p>
                  <p className="truncate text-xs text-text-400">
                    {user.email}
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-bg-300 bg-bg-100 p-4">
              <p className="font-semibold text-text-100">
                Get responses tailored to you
              </p>
              <p className="mt-2 text-sm text-text-400">
                Log in to get answers based on saved chats, plus create
                images and upload files.
              </p>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="mt-4 w-full rounded-full bg-accent py-3 font-medium text-bg-0 hover:bg-accent-hover"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </aside>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {settingsTab && user && (
        <SettingsModal
          initialTab={settingsTab}
          user={user}
          loadedModelId={loadedModelId}
          cachedModelIds={cachedModelIds}
          isStreaming={isStreaming}
          onSelectModel={(id) => {
            onSelectModel(id);
            setSettingsTab(null);
          }}
          onDeleteModel={onDeleteModel}
          onClearConversations={onClearConversations}
          onProfileUpdated={onProfileUpdated}
          onLogout={() => {
            setSettingsTab(null);
            signOut(auth);
          }}
          onClose={() => setSettingsTab(null)}
        />
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <div
            onClick={() => setDeletingId(null)}
            className="fixed inset-0 bg-black/70"
          />

          <div className="relative w-full max-w-sm rounded-2xl bg-bg-100 p-6">
            <h2 className="text-lg font-semibold text-text-100">Delete chat?</h2>
            <p className="mt-2 text-sm text-text-400">
              Are you sure you want to delete this chat?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-200 hover:bg-bg-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteConversation(deletingId);
                  setDeletingId(null);
                }}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
