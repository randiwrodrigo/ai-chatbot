"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoginModal from "./LoginModal";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  return initials.toUpperCase();
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-bg-300 bg-bg-0 transition-transform duration-200 ease-in-out ${
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

        <div className="flex-1 overflow-y-auto px-4 py-2 text-sm text-text-500">
          No conversations yet
        </div>

        <div className="border-t border-bg-300 p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-bg-200">
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-100">
                  {user.displayName ?? user.email}
                </p>
                <p className="truncate text-xs text-text-400">
                  {user.email}
                </p>
              </div>

              <button
                onClick={() => signOut(auth)}
                aria-label="Log out"
                className="shrink-0 rounded-lg p-2 text-text-400 hover:bg-bg-300 hover:text-text-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
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
    </>
  );
}
