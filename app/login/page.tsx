"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { handleFirebaseError } from "@/utils/errors";
import { getUserVerificationStatus, getNextRoute, createUserProfile } from "@/services/userService";
import { ROUTES } from "@/utils/routes";
import { LOGIN_BACKGROUND_IMAGE, MAIL_ICON, GOOGLE_ICON } from "@/constants";
import { SignupSigninModal } from "@/components/auth/SignupSigninModal";
import toast from "react-hot-toast";

export default function LoginScreen() {
  const router = useRouter();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const isNavigatingRef = useRef(false);

  /**
   * Navigate user to the appropriate screen based on their verification status
   */
  const navigateUser = async (user: User) => {
    if (isNavigatingRef.current) return;

    try {
      isNavigatingRef.current = true;

      // Create or update user profile in Firestore (ensures credits are initialized)
      await createUserProfile(user.uid, user.email || "", user.displayName);

      const verificationStatus = await getUserVerificationStatus(user.uid);
      const nextRoute = getNextRoute(user, verificationStatus);

      const routeMap: { [key: string]: string } = {
        login: ROUTES.LOGIN,
        age: ROUTES.AGE,
        "terms-service": ROUTES.TERMS_SERVICE,
        generator: ROUTES.GENERATOR,
      };

      router.replace(routeMap[nextRoute] || ROUTES.LOGIN);
    } catch (error) {
      console.error("Error navigating user:", error);
      toast.error("Failed to load user data. Please try again.");
      isNavigatingRef.current = false;
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, navigate to the appropriate screen
        await navigateUser(user);
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  /**
   * Handle Google Sign-In
   */
  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Import analytics tracking dynamically
      const { trackLogin } = await import("@/services/analyticsService");
      await trackLogin("google", user.uid);

      // Keep loading state active - onAuthStateChanged will handle navigation
      // Loading indicator will stay visible until navigation completes
    } catch (error: unknown) {
      // Silently handle user-initiated cancellations (not an error)
      const firebaseError = error as { code?: string };
      if (
        firebaseError.code === "auth/popup-closed-by-user" ||
        firebaseError.code === "auth/cancelled-popup-request"
      ) {
        // User closed the popup intentionally - no error toast needed
        console.log("Google sign-in cancelled by user");
      } else {
        const errorMessage = handleFirebaseError(error);
        toast.error(errorMessage);
      }
      // Only reset loading on error/cancellation, not on success
      setIsLoadingGoogle(false);
    }
  };

  /**
   * Navigate to legal documents
   */
  const navigateToDoc = (slug: string) => {
    router.push(`${ROUTES.DOCS}/${slug}`);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={LOGIN_BACKGROUND_IMAGE}
          alt="Background"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between items-center w-full min-h-screen px-5 py-10">
        {/* Top Section */}
        <div className="flex flex-col items-center mt-[25%]">
          <h1 className="text-5xl font-semibold text-white">DreamAI</h1>
          <p className="text-xl text-white mt-2">Make it real</p>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center w-full max-w-md mb-10">
          <p className="text-xs text-white text-center mb-6 leading-relaxed">
            By continuing, you agree to our{" "}
            <button
              onClick={() => navigateToDoc("agb")}
              className="underline hover:text-brand transition-colors"
            >
              Terms and Conditions
            </button>{" "}
            and{" "}
            <button
              onClick={() => navigateToDoc("privacy")}
              className="underline hover:text-brand transition-colors"
            >
              Privacy Policy
            </button>
            .
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="relative flex items-center justify-center w-full h-[56px] bg-white text-gray-800 border border-gray-300 rounded-full px-6 font-medium mb-3 hover:bg-gray-50 transition-colors duration-200 active:scale-95 disabled:opacity-60"
          >
            <div className="absolute left-6 flex items-center">
              <Image src={GOOGLE_ICON} alt="Google" width={20} height={20} />
            </div>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => setIsModalVisible(true)}
            className="relative flex items-center justify-center w-full h-[56px] bg-brand text-white rounded-full px-6 font-semibold hover:bg-brand-dark transition-colors duration-200 active:scale-95"
          >
            <div className="absolute left-6 flex items-center">
              <Image src={MAIL_ICON} alt="Email" width={20} height={20} />
            </div>
            <span>Sign in with Email</span>
          </button>

        </div>
      </div>

      {/* Full-screen loading overlay for Google sign-in */}
      {isLoadingGoogle && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand mb-4"></div>
          <p className="text-white text-sm">Signing in...</p>
        </div>
      )}

      <SignupSigninModal
        isOpen={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={() => setIsModalVisible(false)}
      />
    </div>
  );
}
