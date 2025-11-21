"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
} from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import { ROUTES } from "@/utils/routes";
import toast from "react-hot-toast";

type ActionMode = "verifyEmail" | "resetPassword" | "recoverEmail" | null;
type Status = "loading" | "success" | "error" | "reset-form";

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<Status>("loading");
  const [mode, setMode] = useState<ActionMode>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");

  // Password reset form state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionCode, setActionCode] = useState("");

  useEffect(() => {
    const handleAction = async () => {
      // Get the action code and mode from URL params
      const oobCode = searchParams.get("oobCode");
      const modeParam = searchParams.get("mode") as ActionMode;

      if (!oobCode) {
        setErrorMessage("Invalid or missing action code.");
        setStatus("error");
        return;
      }

      setMode(modeParam);
      setActionCode(oobCode);

      try {
        switch (modeParam) {
          case "verifyEmail":
            await handleVerifyEmail(oobCode);
            break;
          case "resetPassword":
            await handleResetPasswordInit(oobCode);
            break;
          case "recoverEmail":
            await handleRecoverEmail(oobCode);
            break;
          default:
            setErrorMessage("Unknown action type.");
            setStatus("error");
        }
      } catch (err) {
        const errorMsg = handleFirebaseError(err);
        setErrorMessage(errorMsg);
        setStatus("error");
      }
    };

    handleAction();
  }, [searchParams]);

  // Handle email verification
  const handleVerifyEmail = async (oobCode: string) => {
    await applyActionCode(auth, oobCode);
    setStatus("success");
    toast.success("Email verified successfully!");

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 2000);
  };

  // Handle password reset - initial verification
  const handleResetPasswordInit = async (oobCode: string) => {
    const emailFromCode = await verifyPasswordResetCode(auth, oobCode);
    setEmail(emailFromCode);
    setStatus("reset-form");
  };

  // Handle password reset - form submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setStatus("success");
      toast.success("Password reset successfully!");

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 2000);
    } catch (err) {
      const errorMsg = handleFirebaseError(err);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email recovery
  const handleRecoverEmail = async (oobCode: string) => {
    const info = await checkActionCode(auth, oobCode);
    const restoredEmail = info.data.email;

    await applyActionCode(auth, oobCode);

    if (restoredEmail) {
      setEmail(restoredEmail);
    }

    setStatus("success");
    toast.success("Email recovered successfully!");

    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 2000);
  };

  const handleRetry = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069] mx-auto mb-4"></div>
            <p className="text-gray-600">
              {mode === "verifyEmail" && "Verifying your email..."}
              {mode === "resetPassword" && "Validating reset link..."}
              {mode === "recoverEmail" && "Recovering your email..."}
              {!mode && "Processing..."}
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === "verifyEmail" && "Email Verified!"}
              {mode === "resetPassword" && "Password Reset!"}
              {mode === "recoverEmail" && "Email Recovered!"}
            </h1>
            <p className="text-gray-600 mb-4">
              {mode === "verifyEmail" && "Your email has been verified. You can now sign in."}
              {mode === "resetPassword" && "Your password has been reset. You can now sign in."}
              {mode === "recoverEmail" && `Your email has been restored to ${email}.`}
            </p>
            <p className="text-gray-500 text-sm">Redirecting to sign in...</p>
          </div>
        )}

        {/* Password Reset Form */}
        {status === "reset-form" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 mb-6">
              Enter a new password for <span className="font-semibold">{email}</span>
            </p>

            <form onSubmit={handleResetPasswordSubmit}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5069] focus:border-transparent"
                autoFocus
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5069] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 text-white font-semibold py-3 rounded-full transition-colors"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === "verifyEmail" && "Verification Failed"}
              {mode === "resetPassword" && "Reset Failed"}
              {mode === "recoverEmail" && "Recovery Failed"}
              {!mode && "Action Failed"}
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="bg-[#FF5069] hover:bg-[#FF3050] text-white font-semibold py-3 px-8 rounded-full transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069]"></div>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
