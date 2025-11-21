"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

// Key for storing email in localStorage for email link sign-in
const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";

interface SignupSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignupSigninModal({ isOpen, onClose, onSuccess }: SignupSigninModalProps) {
  const [view, setView] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView("email");
      setEmail("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Check if user arrived via email link on mount
  useEffect(() => {
    const handleEmailLink = async () => {
      if (typeof window === "undefined") return;

      const currentUrl = window.location.href;

      if (isSignInWithEmailLink(auth, currentUrl)) {
        // Get the email from localStorage
        let emailFromStorage = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);

        if (!emailFromStorage) {
          // User opened on different device, prompt for email
          emailFromStorage = window.prompt("Please provide your email for confirmation");
        }

        if (emailFromStorage) {
          try {
            await signInWithEmailLink(auth, emailFromStorage, currentUrl);
            // Clear the stored email
            window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
            // Clean up the URL
            window.history.replaceState(null, "", window.location.pathname);
            toast.success("Successfully signed in!");
            onSuccess();
          } catch (err) {
            const errorMessage = handleFirebaseError(err);
            toast.error(errorMessage);
          }
        }
      }
    };

    handleEmailLink();
  }, [onSuccess]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSendEmailLink = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the current origin for the redirect URL
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const actionCodeSettings = {
        // URL to redirect back to after email link click
        url: `${origin}/auth/email-link`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);

      // Save the email locally to complete sign-in on return
      if (typeof window !== "undefined") {
        window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
      }

      setView("sent");
      toast.success("Sign-in link sent! Check your email.");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const actionCodeSettings = {
        url: `${origin}/auth/email-link`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      toast.success("Sign-in link resent! Check your email.");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailForm = () => (
    <div className="w-full">
      <h2 className="text-2xl font-medium text-gray-800 mb-2 text-center">
        Sign In with Email
      </h2>
      <p className="text-gray-500 text-sm mb-5 text-center">
        We'll send you a magic link to sign in instantly
      </p>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendEmailLink()}
        disabled={isLoading}
        className="input-field mb-4"
        autoComplete="email"
        autoFocus
      />

      <button
        onClick={handleSendEmailLink}
        disabled={isLoading || !email}
        className="button-primary w-full"
      >
        {isLoading ? "Sending..." : "Send Magic Link"}
      </button>
    </div>
  );

  const renderSentConfirmation = () => (
    <div className="w-full text-center">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-[#FF5069]"
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

      <h2 className="text-2xl font-medium text-gray-800 mb-3">Check Your Email</h2>

      <p className="text-gray-600 mb-2">
        We sent a sign-in link to
      </p>
      <p className="text-gray-800 font-semibold mb-4">{email}</p>

      <p className="text-gray-500 text-sm mb-6">
        Click the link in the email to sign in instantly. The link will expire in 1 hour.
      </p>

      <button
        onClick={handleResendLink}
        disabled={isLoading}
        className="text-[#FF5069] font-semibold hover:underline transition-colors mb-4"
      >
        {isLoading ? "Sending..." : "Resend Link"}
      </button>

      <div className="mt-2">
        <button
          onClick={() => setView("email")}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
        >
          Use a different email
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="w-full max-w-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {view === "email" ? renderEmailForm() : renderSentConfirmation()}
      </div>
    </Modal>
  );
}

// Export the key for use in other files
export { EMAIL_FOR_SIGN_IN_KEY };
