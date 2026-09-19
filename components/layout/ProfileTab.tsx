"use client";

import { useRef, useState } from "react";
import { updateProfile, type User } from "firebase/auth";
import { Camera, Check, LogOut, Pencil, X } from "lucide-react";
import { auth } from "@/lib/firebase";

interface ProfileTabProps {
  user: User;
  onProfileUpdated: () => void;
  onLogout: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  return initials.toUpperCase();
}

function resizeImageToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas is not supported in this browser"));
        return;
      }
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load that image"));
    };
    img.src = objectUrl;
  });
}

export default function ProfileTab({
  user,
  onProfileUpdated,
  onLogout,
}: ProfileTabProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(user.displayName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = user.displayName ?? user.email ?? "Account";

  async function commitNameChange() {
    if (!auth.currentUser) return;
    const trimmed = draftName.trim();

    setSavingName(true);
    setError(null);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed || null });
      onProfileUpdated();
      setIsEditingName(false);
    } catch (err) {
      console.error("Failed to update display name:", err);
      setError("Couldn't save your name. Try again.");
    } finally {
      setSavingName(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !auth.currentUser) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setSavingPhoto(true);
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await updateProfile(auth.currentUser, { photoURL: dataUrl });
      onProfileUpdated();
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      setError("Couldn't update your photo. Try again.");
    } finally {
      setSavingPhoto(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-text-100">Profile</h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative shrink-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-300 text-lg font-semibold text-text-100">
              {getInitials(displayName)}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={savingPhoto}
            aria-label="Change profile picture"
            title="Change profile picture"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-100 bg-bg-300 text-text-100 hover:bg-bg-200 disabled:pointer-events-none disabled:opacity-60"
          >
            {savingPhoto ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-text-100 border-t-transparent" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Your name"
                disabled={savingName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitNameChange();
                  if (e.key === "Escape") {
                    setDraftName(user.displayName ?? "");
                    setIsEditingName(false);
                  }
                }}
                className="min-w-0 flex-1 rounded-md border border-bg-300 bg-bg-0 px-2 py-1 text-sm text-text-100 outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={commitNameChange}
                disabled={savingName}
                aria-label="Save name"
                className="rounded-lg p-1.5 text-accent hover:bg-bg-200 disabled:pointer-events-none disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftName(user.displayName ?? "");
                  setIsEditingName(false);
                }}
                disabled={savingName}
                aria-label="Cancel"
                className="rounded-lg p-1.5 text-text-400 hover:bg-bg-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="truncate font-medium text-text-100">{displayName}</p>
              <button
                type="button"
                onClick={() => {
                  setDraftName(user.displayName ?? "");
                  setIsEditingName(true);
                }}
                aria-label="Edit name"
                className="rounded-lg p-1 text-text-400 hover:bg-bg-200 hover:text-text-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {user.email && (
            <p className="truncate text-sm text-text-400">{user.email}</p>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex items-center gap-2 rounded-lg border border-bg-300 px-3 py-1.5 text-sm text-text-200 hover:bg-bg-200"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
