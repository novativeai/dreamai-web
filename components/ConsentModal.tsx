"use client";

import { useState } from "react";
import { IoCheckbox, IoSquareOutline } from "react-icons/io5";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => Promise<void>;
}

export default function ConsentModal({ isOpen, onClose, onConsent }: ConsentModalProps) {
  const [consent1Checked, setConsent1Checked] = useState(false);
  const [consent2Checked, setConsent2Checked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!consent1Checked || !consent2Checked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConsent();
      // Reset state after successful consent
      setConsent1Checked(false);
      setConsent2Checked(false);
    } catch (error) {
      console.error("Consent submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bothChecked = consent1Checked && consent2Checked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[90%] max-w-[500px] max-h-[80vh] bg-white rounded-[20px] p-6 shadow-lg overflow-hidden flex flex-col">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-900">
            Consent to Image Processing
          </h2>

          <p className="text-[15px] leading-[22px] text-gray-700 mb-4">
            You're uploading an image that may contain biometrics (such as your face).
            For us to create an AI-generated image for you, we need your explicit consent:
          </p>

          <div className="mb-5">
            <p className="text-sm leading-5 text-gray-600 mb-2">
              • Your image is processed with AI – the result is purely artificial.
            </p>
            <p className="text-sm leading-5 text-gray-600 mb-2">
              • You may only use images for which you have the rights.
            </p>
            <p className="text-sm leading-5 text-gray-600 mb-2">
              • You are solely responsible for the use of the generated image.
            </p>
            <p className="text-sm leading-5 text-gray-600 mb-2">
              • Misuse or deception are strictly prohibited.
            </p>
          </div>

          {/* Checkbox 1 */}
          <button
            type="button"
            onClick={() => setConsent1Checked(!consent1Checked)}
            className="flex items-start gap-3 mb-5 w-full text-left group"
          >
            {consent1Checked ? (
              <IoCheckbox className="w-6 h-6 text-[#FF5069] flex-shrink-0 mt-0.5" />
            ) : (
              <IoSquareOutline className="w-6 h-6 text-[#FF5069] flex-shrink-0 mt-0.5 group-hover:opacity-70" />
            )}
            <span className="flex-1 text-sm leading-5 text-gray-900">
              I expressly consent to my image including face (biometric data) being processed with AI.
            </span>
          </button>

          {/* Checkbox 2 */}
          <button
            type="button"
            onClick={() => setConsent2Checked(!consent2Checked)}
            className="flex items-start gap-3 mb-5 w-full text-left group"
          >
            {consent2Checked ? (
              <IoCheckbox className="w-6 h-6 text-[#FF5069] flex-shrink-0 mt-0.5" />
            ) : (
              <IoSquareOutline className="w-6 h-6 text-[#FF5069] flex-shrink-0 mt-0.5 group-hover:opacity-70" />
            )}
            <span className="flex-1 text-sm leading-5 text-gray-900">
              I understand the generated image is not real and I am responsible for its use.
            </span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!bothChecked || isSubmitting}
          className={`w-full py-3.5 rounded-full font-bold text-white text-base mt-2.5 transition-colors ${
            bothChecked && !isSubmitting
              ? "bg-[#FF5069] hover:bg-[#FF3050] active:scale-95"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Processing...</span>
            </div>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </div>
  );
}
