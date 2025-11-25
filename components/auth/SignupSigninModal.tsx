"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { sendSignInLinkToEmail, ActionCodeSettings } from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import toast from "react-hot-toast";

// Key for storing email in localStorage for email link sign-in
const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";

interface SignupSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ViewState = "email-input" | "magic-sent";

export function SignupSigninModal({ isOpen, onClose, onSuccess }: SignupSigninModalProps) {
  const [view, setView] = useState<ViewState>("email-input");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("email-input");
      setEmail("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle magic link (passwordless) sign in
  const handleSendMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const actionCodeSettings: ActionCodeSettings = {
        url: `${origin}/auth/email-link`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save email for completion
      if (typeof window !== "undefined") {
        window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
      }

      toast.success("Magic link sent! Check your email.");
      setView("magic-sent");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend magic link
  const handleResendMagicLink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const actionCodeSettings: ActionCodeSettings = {
        url: `${origin}/auth/email-link`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      toast.success("Magic link resent!");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {view === "email-input" && (
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Sign In
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email and we'll send you a magic link to sign in instantly.
            </p>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5069] focus:border-transparent text-gray-800 placeholder-gray-400"
              autoComplete="email"
              autoFocus
            />

            <button
              onClick={handleSendMagicLink}
              disabled={isLoading || !email}
              className="w-full bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 text-white font-semibold py-3 rounded-full transition-colors"
            >
              {isLoading ? "Sending..." : "Send Magic Link"}
            </button>

            <button
              onClick={handleClose}
              disabled={isLoading}
              className="mt-4 text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {view === "magic-sent" && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-[#FF5069]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Check Your Email</h2>

            <p className="text-gray-500 mb-1">
              We sent a sign-in link to
            </p>
            <p className="text-gray-800 font-semibold mb-4">{email}</p>

            <p className="text-gray-400 text-sm mb-6">
              Click the link in the email to sign in instantly. The link expires in 1 hour.
            </p>

            <button
              onClick={handleResendMagicLink}
              disabled={isLoading}
              className="text-[#FF5069] font-semibold hover:underline transition-colors mb-4"
            >
              {isLoading ? "Sending..." : "Resend Magic Link"}
            </button>

            <button
              onClick={() => setView("email-input")}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the key for use in other files
export { EMAIL_FOR_SIGN_IN_KEY };
