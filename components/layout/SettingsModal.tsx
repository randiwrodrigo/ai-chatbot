"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import {
  CircleUserRound,
  Database,
  Monitor,
  Moon,
  Settings,
  Store,
  Sun,
  X,
} from "lucide-react";
import ModelStoreTab from "@/components/chat/ModelStoreTab";
import type { Conversation } from "@/lib/conversations";
import { getFontPreference, setFontPreference, type FontPreference } from "@/lib/font";
import type { ModelId } from "@/lib/models";
import { getThemePreference, setThemePreference, type ThemePreference } from "@/lib/theme";
import DataStorageTab from "./DataStorageTab";
import ProfileTab from "./ProfileTab";

export type SettingsTab = "general" | "profile" | "model-store" | "data-storage";

interface SettingsModalProps {
  initialTab: SettingsTab;
  user: User;
  conversations: Conversation[];
  loadedModelId: ModelId | null;
  cachedModelIds: Set<ModelId>;
  isStreaming: boolean;
  onSelectModel: (id: ModelId) => void;
  onDeleteModel: (id: ModelId) => Promise<void> | void;
  onDeleteConversation: (id: string) => void;
  onClearConversations: () => void;
  onProfileUpdated: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "model-store", label: "Model Store", icon: Store },
  { id: "data-storage", label: "Data & Storage", icon: Database },
];

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: "dark", label: "Dark", icon: Moon },
  { id: "light", label: "Light", icon: Sun },
  { id: "system", label: "System", icon: Monitor },
];

const FONT_OPTIONS: { id: FontPreference; label: string; fontFamily: string }[] = [
  { id: "sans", label: "Default", fontFamily: "var(--font-geist-sans)" },
  { id: "serif", label: "Serif", fontFamily: "var(--font-source-serif)" },
  {
    id: "system",
    label: "System",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
];

export default function SettingsModal({
  initialTab,
  user,
  conversations,
  loadedModelId,
  cachedModelIds,
  isStreaming,
  onSelectModel,
  onDeleteModel,
  onDeleteConversation,
  onClearConversations,
  onProfileUpdated,
  onLogout,
  onClose,
}: SettingsModalProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [themePref, setThemePref] = useState<ThemePreference>(() =>
    getThemePreference(),
  );
  const [fontPref, setFontPref] = useState<FontPreference>(() =>
    getFontPreference(),
  );

  function handleThemeChange(pref: ThemePreference) {
    setThemePreference(pref);
    setThemePref(pref);
  }

  function handleFontChange(pref: FontPreference) {
    setFontPreference(pref);
    setFontPref(pref);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/70" />

      <div className="relative flex h-[32rem] w-full max-w-2xl overflow-hidden rounded-2xl bg-bg-100 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="absolute left-4 top-4 z-10 rounded-lg bg-bg-200 p-1.5 text-text-300 hover:bg-bg-300 hover:text-text-100"
        >
          <X className="h-4 w-4" />
        </button>

        <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-bg-300 bg-bg-0 p-2 pt-16">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                tab === id
                  ? "bg-bg-200 font-medium text-text-100"
                  : "text-text-300 hover:bg-bg-200 hover:text-text-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-6 pt-16">
          {tab === "general" && (
            <div>
              <h2 className="text-lg font-semibold text-text-100">General</h2>
              <p className="mt-1 text-sm text-text-400">
                This chatbot runs entirely in your browser using WebLLM —
                there&apos;s no server involved in generating replies.
              </p>

              <div className="mt-6 rounded-xl border border-bg-300 p-4">
                <p className="text-sm font-medium text-text-100">Appearance</p>
                <p className="mt-1 text-sm text-text-400">
                  Choose how the interface looks.
                </p>
                <div className="mt-3 flex gap-1.5">
                  {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleThemeChange(id)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium ${
                        themePref === id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-bg-300 text-text-300 hover:bg-bg-200 hover:text-text-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-bg-300 p-4">
                <p className="text-sm font-medium text-text-100">Font</p>
                <p className="mt-1 text-sm text-text-400">
                  Choose the typeface used across the app.
                </p>
                <div className="mt-3 flex gap-1.5">
                  {FONT_OPTIONS.map(({ id, label, fontFamily }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleFontChange(id)}
                      className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-3 py-2.5 ${
                        fontPref === id
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-bg-300 text-text-300 hover:bg-bg-200 hover:text-text-100"
                      }`}
                    >
                      <span className="text-base" style={{ fontFamily }}>
                        Aa
                      </span>
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {tab === "profile" && (
            <ProfileTab
              user={user}
              onProfileUpdated={onProfileUpdated}
              onLogout={onLogout}
            />
          )}

          {tab === "model-store" && (
            <ModelStoreTab
              loadedModelId={loadedModelId}
              cachedModelIds={cachedModelIds}
              isStreaming={isStreaming}
              onSelect={onSelectModel}
              onDelete={onDeleteModel}
            />
          )}

          {tab === "data-storage" && (
            <DataStorageTab
              conversations={conversations}
              cachedModelIds={cachedModelIds}
              onDeleteConversation={onDeleteConversation}
              onClearConversations={onClearConversations}
              onOpenModelStore={() => setTab("model-store")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
