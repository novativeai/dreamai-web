"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useCredits } from "@/contexts/CreditContext";
import { ROUTES } from "@/utils/routes";
import { APP_VERSION, FOOTER_TEXT, SUPPORT_EMAIL, APP_NAME } from "@/constants";
import toast from "react-hot-toast";

interface SettingItem {
  label: string;
  action: () => void;
  isHighlight?: boolean;
  isDestructive?: boolean;
  showChevron?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium } = useCredits();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace(ROUTES.LOGIN);
    } else {
      setUser(auth.currentUser);
    }
  }, [router]);

  const handleNavigateToDoc = (key: string) => {
    router.push(`${ROUTES.DOCS}/${key}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${APP_NAME} App`,
          text: `Check out ${APP_NAME} - Create amazing AI images!`,
          url: window.location.origin,
        });
        toast.success("Thanks for sharing!");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Link copied to clipboard!");
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Could not share the app");
      }
    }
  };

  const handleContact = () => {
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${APP_NAME} Support Request`;
    window.location.href = mailtoUrl;
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      router.replace(ROUTES.LOGIN);
    } catch (error: any) {
      console.error("Sign out error:", error);

      // Check if error requires recent login
      if (error?.code === "auth/requires-recent-login") {
        toast.error("Please sign in again to continue");
        router.replace(ROUTES.LOGIN);
        return;
      }

      toast.error("Failed to sign out. Please try again.");
    }
  };

  const settingItems: SettingItem[] = [
    ...(isPremium ? [] : [{
      label: "Become a premium member now",
      action: () => router.push(ROUTES.PREMIUM),
      isHighlight: true,
      showChevron: false,
    }]),
    {
      label: "Share the app",
      action: handleShare,
      showChevron: false,
    },
    {
      label: "Contact",
      action: handleContact,
      showChevron: false,
    },
    {
      label: "About us",
      action: () => handleNavigateToDoc("aboutUs"),
      showChevron: true,
    },
    {
      label: "Legal",
      action: () => handleNavigateToDoc("legal"),
      showChevron: true,
    },
    {
      label: "Licenses",
      action: () => handleNavigateToDoc("licenses"),
      showChevron: true,
    },
    {
      label: "Terms of Use",
      action: () => handleNavigateToDoc("termOfUse"),
      showChevron: true,
    },
    {
      label: "AGB",
      action: () => handleNavigateToDoc("agb"),
      showChevron: true,
    },
    {
      label: "Cookie Policy",
      action: () => handleNavigateToDoc("cookiePolicy"),
      showChevron: true,
    },
    {
      label: "Data protection",
      action: () => handleNavigateToDoc("dataProtection"),
      showChevron: true,
    },
    {
      label: "Data Protection Settings",
      action: () => router.push(ROUTES.DATA_PROTECTION_SETTINGS),
      showChevron: true,
    },
    {
      label: "Delete or pause account",
      action: () => router.push(ROUTES.DELETE_ACCOUNT),
      isDestructive: true,
      showChevron: false,
    },
    {
      label: "Sign out",
      action: handleSignOut,
      isDestructive: true,
      showChevron: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1 className="text-lg font-medium">Settings</h1>

          <div className="w-10"></div>
        </div>
      </header>

      {/* Settings List */}
      <main className="pb-20">
        {settingItems.map((item, index) => {
          const showThickSeparatorBefore =
            item.label === "Share the app" ||
            item.label === "About us" ||
            item.label === "Delete or pause account";

          const showThickSeparatorAfter =
            item.isHighlight ||
            item.label === "Contact" ||
            item.label === "Data Protection Settings";

          return (
            <div key={item.label}>
              {/* Thick Separator Before */}
              {showThickSeparatorBefore && <div className="h-2 bg-gray-50" />}

              {/* Setting Item */}
              <button
                onClick={item.action}
                className={`w-full flex items-center justify-between px-4 py-4 transition-colors border-b border-gray-100 ${
                  item.isHighlight
                    ? "bg-gray-50"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-base ${
                    item.isDestructive ? "text-black" : "text-black"
                  }`}
                >
                  {item.label}
                </span>

                {item.showChevron && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>

              {/* Thick Separator After */}
              {showThickSeparatorAfter && index < settingItems.length - 1 && (
                <div className="h-2 bg-gray-50" />
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="flex flex-col items-center pt-12 pb-8 opacity-40">
          <div className="mb-2">
            <Image
              src="/images/LOGO_BLACK.png"
              alt="DreamAI"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Version {APP_VERSION}</p>
          <p className="text-xs text-gray-500 mt-1">{FOOTER_TEXT}</p>
        </div>
      </main>
    </div>
  );
}
