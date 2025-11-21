"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendSignInLinkToEmail,
  ActionCodeSettings,
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

type AuthMode = "signin" | "signup";
type ViewState = "auth" | "verify" | "magic-sent";

export function SignupSigninModal({ isOpen, onClose, onSuccess }: SignupSigninModalProps) {
  const [view, setView] = useState<ViewState>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setView("auth");
      setAuthMode("signin");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  // Get action code settings for email verification
  const getActionCodeSettings = (): ActionCodeSettings => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      url: `${origin}/auth/action`,
      handleCodeInApp: true,
    };
  };

  // Handle email/password sign up
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send email verification with action code settings
      await sendEmailVerification(userCredential.user, getActionCodeSettings());

      toast.success("Account created! Please check your email to verify.");
      setView("verify");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email/password sign in
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        // Email not verified - offer to resend
        setError("Please verify your email before signing in.");
        const resend = confirm("Your email is not verified. Would you like to resend the verification email?");
        if (resend) {
          await sendEmailVerification(userCredential.user, getActionCodeSettings());
          toast.success("Verification email sent! Please check your inbox.");
        }
        // Sign out the unverified user
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      toast.success("Successfully signed in!");
      onSuccess();
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle magic link (passwordless) sign in
  const handleMagicLink = async () => {
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

  // Resend verification email
  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Try to sign in again to resend
      if (!email || !password) {
        setError("Please sign in again to resend verification.");
        setView("auth");
        return;
      }

      setIsLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user, getActionCodeSettings());
        await auth.signOut();
        toast.success("Verification email resent!");
      } catch (err) {
        const errorMessage = handleFirebaseError(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    try {
      await sendEmailVerification(user, getActionCodeSettings());
      toast.success("Verification email resent!");
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

  // Render the main auth form
  const renderAuthForm = () => (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-2xl font-medium text-gray-700 mb-5 text-center">
        {authMode === "signin" ? "Sign In" : "Create Account"}
      </h2>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="input-field mb-4 w-full"
        autoComplete="email"
        autoFocus
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="input-field mb-4 w-full"
        autoComplete={authMode === "signin" ? "current-password" : "new-password"}
      />

      {authMode === "signup" && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="input-field mb-4 w-full"
          autoComplete="new-password"
        />
      )}

      <button
        onClick={authMode === "signin" ? handleSignIn : handleSignUp}
        disabled={isLoading}
        className="button-primary w-full mb-3"
      >
        {isLoading ? "Processing..." : authMode === "signin" ? "Sign In" : "Create Account"}
      </button>

      {/* Magic Link Option */}
      {authMode === "signin" && (
        <button
          onClick={handleMagicLink}
          disabled={isLoading || !email}
          className="w-full py-3 text-[#FF5069] hover:bg-pink-50 rounded-full transition-colors text-sm font-medium text-center"
        >
          Sign in with Magic Link (no password)
        </button>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={toggleAuthMode}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <span className="text-[#FF5069] font-semibold">
            {authMode === "signin" ? "Sign Up" : "Sign In"}
          </span>
        </button>
      </div>
    </div>
  );

  // Render verification pending view
  const renderVerifyView = () => (
    <div className="w-full text-center flex flex-col items-center">
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

      <h2 className="text-2xl font-medium text-gray-700 mb-3">Verify Your Email</h2>

      <p className="text-gray-500 mb-2">
        We sent a verification link to
      </p>
      <p className="text-gray-700 font-semibold mb-4">{email}</p>

      <p className="text-gray-400 text-sm mb-6">
        Click the link in the email to verify your account. Once verified, you can sign in.
      </p>

      <button
        onClick={handleResendVerification}
        disabled={isLoading}
        className="text-[#FF5069] font-semibold hover:underline transition-colors mb-4"
      >
        {isLoading ? "Sending..." : "Resend Verification Email"}
      </button>

      <div className="mt-4">
        <button
          onClick={() => setView("auth")}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );

  // Render magic link sent view
  const renderMagicSentView = () => (
    <div className="w-full text-center flex flex-col items-center">
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

      <h2 className="text-2xl font-medium text-gray-700 mb-3">Check Your Email</h2>

      <p className="text-gray-500 mb-2">
        We sent a sign-in link to
      </p>
      <p className="text-gray-700 font-semibold mb-4">{email}</p>

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

      <div className="mt-2">
        <button
          onClick={() => setView("auth")}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          Use a different email or sign in with password
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="w-full max-w-sm flex flex-col items-center">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm w-full text-center">
            {error}
          </div>
        )}

        {view === "auth" && renderAuthForm()}
        {view === "verify" && renderVerifyView()}
        {view === "magic-sent" && renderMagicSentView()}
      </div>
    </Modal>
  );
}

// Export the key for use in other files
export { EMAIL_FOR_SIGN_IN_KEY };
