"use client";

import type { User } from "firebase/auth";
import { CircleUserRound, HelpCircle, LogOut, Settings, Store } from "lucide-react";
import type { SettingsTab } from "./SettingsModal";

interface AccountMenuProps {
  user: User;
  onOpenSettings: (tab: SettingsTab) => void;
  onLogout: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  return initials.toUpperCase();
}

export default function AccountMenu({
  user,
  onOpenSettings,
  onLogout,
}: AccountMenuProps) {
  const name = user.displayName ?? user.email ?? "Account";

  return (
    <div className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-2xl border border-bg-300 bg-bg-100 p-1.5 shadow-2xl animate-fade-in">
      <div className="flex items-center gap-3 px-2.5 py-2.5">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={name}
            referrerPolicy="no-referrer"
            className="h-8 w-8 shrink-0 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-300 text-xs font-semibold text-text-100">
            {getInitials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-100">{name}</p>
          {user.email && user.displayName && (
            <p className="truncate text-xs text-text-400">{user.email}</p>
          )}
        </div>
      </div>

      <div className="my-1 h-px bg-bg-300" />

      <button
        type="button"
        onClick={() => onOpenSettings("model-store")}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
      >
        <Store className="h-4 w-4" />
        Model Store
      </button>
      <button
        type="button"
        onClick={() => onOpenSettings("profile")}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
      >
        <CircleUserRound className="h-4 w-4" />
        Profile
      </button>
      <button
        type="button"
        onClick={() => onOpenSettings("general")}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
      >
        <Settings className="h-4 w-4" />
        Settings
      </button>

      <div className="my-1 h-px bg-bg-300" />

      <button
        type="button"
        title="Coming soon"
        className="flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-400"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text-200 hover:bg-bg-200"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
