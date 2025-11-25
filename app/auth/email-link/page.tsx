"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import { getUserVerificationStatus, getNextRoute, createUserProfile } from "@/services/userService";
import { ROUTES } from "@/utils/routes";
import toast from "react-hot-toast";

// Key for storing email in localStorage for email link sign-in
const EMAIL_FOR_SIGN_IN_KEY = "emailForSignIn";

export default function EmailLinkAuthPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "email-prompt" | "success" | "error">("loading");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (typeof window === "undefined") return;

      const currentUrl = window.location.href;

      // Check if the URL is a valid sign-in link
      if (!isSignInWithEmailLink(auth, currentUrl)) {
        setErrorMessage("Invalid or expired sign-in link. Please request a new one.");
        setStatus("error");
        return;
      }

      // Try to get the email from localStorage
      const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);

      if (storedEmail) {
        // We have the email, complete sign-in automatically
        await completeSignIn(storedEmail, currentUrl);
      } else {
        // User opened on different device/browser, need to prompt for email
        setStatus("email-prompt");
      }
    };

    handleEmailLinkSignIn();
  }, []);

  const completeSignIn = async (emailToUse: string, url: string) => {
    try {
      setIsSubmitting(true);
      const result = await signInWithEmailLink(auth, emailToUse, url);

      // Clear the stored email
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
      }

      setStatus("success");
      toast.success("Successfully signed in!");

      // Navigate to the appropriate screen
      const user = result.user;

      // Create or update user profile in Firestore (ensures credits are initialized)
      await createUserProfile(user.uid, user.email || emailToUse, user.displayName);

      const verificationStatus = await getUserVerificationStatus(user.uid);
      const nextRoute = getNextRoute(user, verificationStatus);

      const routeMap: { [key: string]: string } = {
        login: ROUTES.LOGIN,
        age: ROUTES.AGE,
        "terms-service": ROUTES.TERMS_SERVICE,
        generator: ROUTES.GENERATOR,
      };

      // Small delay for the success message to show
      setTimeout(() => {
        router.replace(routeMap[nextRoute] || ROUTES.GENERATOR);
      }, 500);
    } catch (err) {
      const errorMsg = handleFirebaseError(err);
      setErrorMessage(errorMsg);
      setStatus("error");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    const currentUrl = window.location.href;
    await completeSignIn(email, currentUrl);
  };

  const handleRetry = () => {
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069] mx-auto mb-4"></div>
            <p className="text-gray-600">Signing you in...</p>
          </div>
        )}

        {status === "email-prompt" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Email</h1>
            <p className="text-gray-600 mb-6">
              It looks like you opened this link on a different device or browser.
              Please enter your email address to complete sign-in.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF5069] focus:border-transparent"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 text-white font-semibold py-3 rounded-full transition-colors"
              >
                {isSubmitting ? "Signing in..." : "Continue"}
              </button>
            </form>
          </div>
        )}

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600">Redirecting you to DreamAI...</p>
          </div>
        )}

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign-in Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="bg-[#FF5069] hover:bg-[#FF3050] text-white font-semibold py-3 px-8 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
