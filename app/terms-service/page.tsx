"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { getUserVerificationStatus, updateTermsAcceptance } from "@/services/userService";
import { ROUTES } from "@/utils/routes";
import {
  APP_NAME,
  TERMS_SCREEN_TAGLINE,
  TERMS_SCREEN_TITLE,
  DISCLAIMER_BULLET_POINTS,
  CHECKBOX_1_TEXT,
  CHECKBOX_2_TEXT,
  TERMS_BACKGROUND_IMAGE,
} from "@/constants";
import toast from "react-hot-toast";

const CustomCheckbox = ({ isChecked, onPress }: { isChecked: boolean; onPress: () => void }) => (
  <button
    onClick={onPress}
    className="w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors shrink-0"
  >
    {isChecked && <div className="w-[10px] h-[10px] rounded-full bg-white"></div>}
  </button>
);

export default function TermsServiceScreen() {
  const router = useRouter();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [ageConsentAccepted, setAgeConsentAccepted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTermsStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      try {
        const verificationStatus = await getUserVerificationStatus(user.uid);

        if (!verificationStatus.ageVerified) {
          router.replace(ROUTES.AGE);
          return;
        }

        if (verificationStatus.termsAccepted) {
          router.replace(ROUTES.GENERATOR);
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Failed to check terms acceptance status", error);
        toast.error("Failed to load verification status. Please try again.");
        setIsChecking(false);
      }
    };

    checkTermsStatus();
  }, [router]);

  // Prevent browser back button navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.pathname);
      toast.error("Please accept the terms to continue");
    };

    // Push a new state to prevent back navigation
    window.history.pushState(null, "", window.location.pathname);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const canProceed = termsAccepted && ageConsentAccepted && !isSaving;

  const handleNavigateNext = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user is signed in. Please log in again.");
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (!canProceed) return;

    setIsSaving(true);
    try {
      await updateTermsAcceptance(user.uid, true);
      router.replace(ROUTES.GENERATOR);
    } catch (error) {
      console.error("Failed to save terms acceptance status.", error);
      toast.error("Could not save your acceptance. Please try again.");
      setIsSaving(false);
    }
  };

  const navigateToDoc = (contentKey: string) => {
    router.push(`${ROUTES.DOCS}/${contentKey}`);
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={TERMS_BACKGROUND_IMAGE}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto px-5 pt-10 pb-32">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-[30px]">
              <h1 className="text-[36px] font-bold text-white mb-2 w-full text-left">{APP_NAME}</h1>
              <p className="text-base text-white w-full text-left">{TERMS_SCREEN_TAGLINE}</p>
            </div>

            {/* Disclaimer Box */}
            <div className="p-[18px] mb-[30px]">
              <h2 className="text-base font-bold text-white mb-[15px] text-left ml-[14px]">{TERMS_SCREEN_TITLE}</h2>
              {DISCLAIMER_BULLET_POINTS.map((point, index) => (
                <div key={index} className="flex mb-3 items-start">
                  <span className="text-white text-sm mr-[10px] mt-[1px] leading-[21px]">•</span>
                  <p className="flex-1 text-[#E8E8E8] text-[13.5px] leading-[21px]">
                    {point.includes("Privacy Policy") ? (
                      <>
                        {point.split("Privacy Policy")[0]}
                        <button
                          onClick={() => navigateToDoc("privacy")}
                          className="text-white underline hover:opacity-80 transition-opacity"
                        >
                          Privacy Policy
                        </button>
                        {point.split("Privacy Policy")[1]}
                      </>
                    ) : point.includes("Terms of Use") ? (
                      <>
                        {point.split("Terms of Use")[0]}
                        <button
                          onClick={() => navigateToDoc("agb")}
                          className="text-white underline hover:opacity-80 transition-opacity"
                        >
                          Terms of Use
                        </button>
                        {point.split("Terms of Use")[1]}
                      </>
                    ) : (
                      point
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Checkboxes */}
            <div className="mt-[10px] pl-[5px]">
              <div className="flex items-start mb-[25px]">
                <CustomCheckbox
                  isChecked={termsAccepted}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                />
                <p className="flex-1 text-white text-[13px] leading-[19px] ml-[10px]">
                  {CHECKBOX_1_TEXT.prefix}
                  <button
                    onClick={() => navigateToDoc("agb")}
                    className="underline hover:opacity-80 transition-opacity"
                  >
                    {CHECKBOX_1_TEXT.termsLink}
                  </button>
                  {CHECKBOX_1_TEXT.midfix}
                  <button
                    onClick={() => navigateToDoc("privacy")}
                    className="underline hover:opacity-80 transition-opacity"
                  >
                    {CHECKBOX_1_TEXT.privacyLink}
                  </button>
                  {CHECKBOX_1_TEXT.suffix.includes("Cookie Policy") ? (
                    <>
                      {CHECKBOX_1_TEXT.suffix.split("Cookie Policy")[0]}
                      <button
                        onClick={() => navigateToDoc("cookiePolicy")}
                        className="underline hover:opacity-80 transition-opacity"
                      >
                        Cookie Policy
                      </button>
                      {CHECKBOX_1_TEXT.suffix.split("Cookie Policy")[1] || ""}
                    </>
                  ) : (
                    CHECKBOX_1_TEXT.suffix
                  )}
                </p>
              </div>

              <div className="flex items-start mb-[25px]">
                <CustomCheckbox
                  isChecked={ageConsentAccepted}
                  onPress={() => setAgeConsentAccepted(!ageConsentAccepted)}
                />
                <p className="flex-1 text-white text-[13px] leading-[19px] ml-[10px]">{CHECKBOX_2_TEXT}</p>
              </div>
            </div>

            <div className="h-10"></div>
          </div>
        </div>

        {/* FAB Button */}
        <button
          onClick={handleNavigateNext}
          disabled={!canProceed}
          className={`fixed bottom-10 right-[30px] w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all ${
            canProceed
              ? "bg-[#FF5069] hover:opacity-90 shadow-[0_3px_5px_rgba(0,0,0,0.3)]"
              : "bg-[#BDBDBD] cursor-not-allowed shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
          }`}
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-[50px] w-[50px] ${canProceed ? "text-black" : "text-[#555555]"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
