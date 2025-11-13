"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserVerificationStatus, getNextRoute } from "@/services/userService";
import { ROUTES } from "@/utils/routes";
import Image from "next/image";

/**
 * Splash Screen / Root Page
 * Checks authentication and redirects to appropriate screen
 */
export default function SplashScreen() {
  const router = useRouter();
  const [showImage, setShowImage] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const isNavigatingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let imageTimer: NodeJS.Timeout;
    let authUnsubscribe: (() => void) | null = null;
    let isMounted = true;

    // Safety timeout - if stuck for more than 10 seconds, go to login
    timeoutRef.current = setTimeout(() => {
      if (isMounted && !isNavigatingRef.current) {
        console.warn("Splash screen timeout - forcing navigation to login");
        isNavigatingRef.current = true;
        router.replace(ROUTES.LOGIN);
      }
    }, 10000);

    // Show splash image for 2 seconds
    imageTimer = setTimeout(() => {
      if (isMounted) {
        setShowImage(false);
        setIsCheckingAuth(true);
      }

      // Start checking authentication after splash image
      authUnsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted || isNavigatingRef.current) return;

        try {
          if (!user) {
            // No user logged in, go to login screen
            if (isMounted && !isNavigatingRef.current) {
              isNavigatingRef.current = true;
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              router.replace(ROUTES.LOGIN);
            }
            return;
          }

          // User is logged in, fetch their verification status
          try {
            const verificationStatus = await getUserVerificationStatus(user.uid);

            // Determine the correct route based on verification status
            const nextRoute = getNextRoute(user, verificationStatus);

            // Navigate to the appropriate screen
            if (isMounted && !isNavigatingRef.current) {
              isNavigatingRef.current = true;
              if (timeoutRef.current) clearTimeout(timeoutRef.current);

              // Map route name to actual route path
              const routeMap: { [key: string]: string } = {
                login: ROUTES.LOGIN,
                age: ROUTES.AGE,
                "terms-service": ROUTES.TERMS_SERVICE,
                generator: ROUTES.GENERATOR,
              };

              router.replace(routeMap[nextRoute] || ROUTES.LOGIN);
            }
          } catch (firestoreError) {
            console.error("Error fetching verification status:", firestoreError);

            // If Firestore fails, check email verification only
            const isEmailPasswordUser = user.providerData.some(
              (p) => p.providerId === "password"
            );

            if (isEmailPasswordUser && !user.emailVerified) {
              if (isMounted && !isNavigatingRef.current) {
                isNavigatingRef.current = true;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                router.replace(ROUTES.LOGIN);
              }
            } else {
              // Start from age verification to be safe
              if (isMounted && !isNavigatingRef.current) {
                isNavigatingRef.current = true;
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                router.replace(ROUTES.AGE);
              }
            }
          }
        } catch (error) {
          console.error("Authentication error:", error);
          // On error, default to login screen
          if (isMounted && !isNavigatingRef.current) {
            isNavigatingRef.current = true;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            router.replace(ROUTES.LOGIN);
          }
        }
      });
    }, 2000);

    // Cleanup function
    return () => {
      isMounted = false;
      if (imageTimer) clearTimeout(imageTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [router]);

  if (showImage) {
    // First splash screen - black background with image
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative w-full max-w-md" style={{ aspectRatio: "1/2" }}>
          <Image
            src="/assets/images/splash-icon.jpg"
            alt="DreamAI"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
    );
  }

  // Loading state while checking authentication
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
    </div>
  );
}
