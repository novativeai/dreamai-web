"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  User,
} from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface SignupSigninModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignupSigninModal({ isOpen, onClose, onSuccess }: SignupSigninModalProps) {
  const [view, setView] = useState<"auth" | "verify">("auth");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userForVerification, setUserForVerification] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView("auth");
      setAuthMode("signin");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setIsLoading(false);
      setUserForVerification(null);
    }
  }, [isOpen]);

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleAuthentication = async () => {
    if (!email || !password || (authMode === "signup" && !confirmPassword)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (authMode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (authMode === "signup") {
      await handleSignUp();
    } else {
      await handleSignIn();
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setUserForVerification(userCredential.user);
      setIsLoading(false);
      setView("verify");
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError("Your email is not verified.");
        const resend = confirm("Please check your inbox for the verification link. Would you like to resend it?");
        if (resend) {
          await sendEmailVerification(userCredential.user);
          toast.success("Verification email sent!");
        }
        setIsLoading(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = handleFirebaseError(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleVerificationCheck = async () => {
    setIsLoading(true);
    setError(null);

    if (!userForVerification) {
      setError("An unexpected error occurred. Please try signing up again.");
      setIsLoading(false);
      return;
    }

    await userForVerification.reload();

    if (userForVerification.emailVerified) {
      toast.success("Your account has been verified. You are now logged in.");
      onSuccess();
    } else {
      setError("Your email is still not verified. Please click the link in your email.");
      const resend = confirm("Please check your inbox (and spam folder) for the verification link. Resend it?");
      if (resend) {
        await sendEmailVerification(userForVerification);
        toast.success("Verification email sent!");
      }
      setIsLoading(false);
    }
  };

  const renderAuthForm = () => (
    <div className="w-full">
      <h2 className="text-2xl font-medium text-gray-800 mb-5 text-center">
        {authMode === "signin" ? "Sign In" : "Create Account"}
      </h2>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="input-field mb-4"
        autoComplete="email"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="input-field mb-4"
        autoComplete={authMode === "signin" ? "current-password" : "new-password"}
      />

      {authMode === "signup" && (
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          className="input-field mb-4"
          autoComplete="new-password"
        />
      )}

      <button
        onClick={handleAuthentication}
        disabled={isLoading}
        className="button-primary w-full"
      >
        {isLoading ? "Processing..." : authMode === "signin" ? "Sign In" : "Create Account"}
      </button>

      <button
        onClick={toggleAuthMode}
        disabled={isLoading}
        className="mt-4 text-gray-600 hover:text-gray-800 transition-colors"
      >
        {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <span className="text-brand font-semibold">
          {authMode === "signin" ? "Sign Up" : "Sign In"}
        </span>
      </button>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="w-full">
      <h2 className="text-2xl font-medium text-gray-800 mb-5 text-center">Check Your Email</h2>

      <p className="text-gray-600 mb-4 text-center">
        We sent a verification link to <span className="font-bold">{email}</span>. Please click the link to
        activate your account.
      </p>

      <p className="text-gray-600 mb-6 text-center">
        Once verified, click the button below to continue.
      </p>

      <button
        onClick={handleVerificationCheck}
        disabled={isLoading}
        className="button-primary w-full mb-4"
      >
        {isLoading ? "Checking..." : "I've Verified My Email"}
      </button>

      <button
        onClick={() => setView("auth")}
        disabled={isLoading}
        className="text-brand font-semibold hover:text-brand-dark transition-colors"
      >
        Back to Sign In
      </button>
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

        {view === "auth" ? renderAuthForm() : renderVerificationForm()}
      </div>
    </Modal>
  );
}
