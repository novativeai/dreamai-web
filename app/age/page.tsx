"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUserVerificationStatus, updateAgeVerification } from "@/services/userService";
import { ROUTES } from "@/utils/routes";
import { AGE_SCREEN_TITLE, AGE_INPUT_PLACEHOLDER, AGE_CONFIRM_TEXT } from "@/constants";
import toast from "react-hot-toast";

const INVALID_DATE_ERROR_MESSAGE =
  "Invalid date of birth – please enter a valid date in the format DD.MM.YYYY. Dates before 1900 or in the future are not accepted.";

export default function AgeScreen() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState("");
  const [isOver18, setIsOver18] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkAgeVerification = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      try {
        const verificationStatus = await getUserVerificationStatus(user.uid);

        if (verificationStatus.ageVerified) {
          router.replace(ROUTES.TERMS_SERVICE);
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Failed to check age verification status", error);
        toast.error("Failed to load verification status. Please try again.");
        setIsChecking(false);
      }
    };

    checkAgeVerification();
  }, [router]);

  const validateAndCheckAge = useCallback((value: string) => {
    // Remove non-numeric characters except dots
    const cleaned = value.replace(/[^\d.]/g, "");

    // Auto-format with dots
    let formatted = cleaned;
    if (cleaned.length >= 2 && !cleaned.includes(".")) {
      formatted = cleaned.slice(0, 2) + "." + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.split(".").length === 2) {
      const parts = cleaned.split(".");
      formatted = parts[0] + "." + parts[1].slice(0, 2) + "." + parts[1].slice(2);
    }

    setBirthDate(formatted);
    setIsOver18(null);
    setFeedback(null);

    if (formatted.length !== 10) return;

    const parts = formatted.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!parts) {
      setFeedback({ message: INVALID_DATE_ERROR_MESSAGE, type: "error" });
      return;
    }

    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);

    if (year < 1900 || year > 2025) {
      setFeedback({ message: INVALID_DATE_ERROR_MESSAGE, type: "error" });
      return;
    }

    const dob = new Date(year, month - 1, day);
    if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
      setFeedback({ message: INVALID_DATE_ERROR_MESSAGE, type: "error" });
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    setIsOver18(age >= 18);
    if (age >= 18) {
      setFeedback({ message: AGE_CONFIRM_TEXT, type: "success" });
    }
  }, []);

  const handleProceed = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("No signed-in user found. Please log in again.");
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (isOver18 === true) {
      setIsSaving(true);
      try {
        await updateAgeVerification(user.uid, true, birthDate);
        router.replace(ROUTES.TERMS_SERVICE);
      } catch (error) {
        console.error("Failed to save age verification:", error);
        toast.error("Could not save your verification. Please try again.");
        setIsSaving(false);
      }
    } else if (isOver18 === false) {
      router.replace(ROUTES.AGE_BLOCKED);
    } else {
      toast.error("Please enter a valid date of birth to continue.");
    }
  };

  const canProceed = isOver18 !== null && !isSaving;

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 px-6 py-5 pb-32">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mt-24">{AGE_SCREEN_TITLE}</h1>

        <input
          type="text"
          value={birthDate}
          onChange={(e) => validateAndCheckAge(e.target.value)}
          placeholder={AGE_INPUT_PLACEHOLDER}
          className="w-full text-xl mt-48 pb-3 border-b-2 border-gray-300 focus:border-[#FF5069] outline-none transition-colors tracking-wider"
          maxLength={10}
        />

        {feedback && (
          <p
            className={`mt-20 text-base font-medium ${
              feedback.type === "error" ? "text-red-500" : "text-[#FF5069]"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      <button
        onClick={handleProceed}
        disabled={!canProceed}
        className={`fixed bottom-10 right-8 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg transition-all ${
          canProceed
            ? "bg-[#FF5069] hover:bg-[#FF3050]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        style={{
          boxShadow: canProceed ? "0 4px 12px rgba(255, 80, 105, 0.4)" : "none",
        }}
      >
        {isSaving ? (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
