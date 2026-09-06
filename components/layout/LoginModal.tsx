"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/70" />

      <div className="relative w-full max-w-md rounded-2xl bg-bg-100 p-8">
        <button
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 rounded-lg p-1 text-text-400 hover:bg-bg-200 hover:text-text-100"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-center text-2xl font-semibold text-text-100">
          Log in or sign up
        </h2>
        <p className="mt-3 text-center text-sm text-text-400">
          You&apos;ll get smarter responses and can upload files, images, and
          more.
        </p>

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-bg-300 py-3 font-medium text-text-100 hover:bg-bg-200"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.26a12 12 0 0 0 0 10.78l4.01-3.1Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
