"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { useCredits } from "@/contexts/CreditContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { generateImage } from "@/lib/api";
import { ROUTES } from "@/utils/routes";
import { STYLE_CATEGORIES, PLACEHOLDER_IMAGE, APP_LOGO, PREMIUM_ICON } from "@/constants";
import { getUserVerificationStatus, updateFirstTimePopupSeen } from "@/services/userService";
import { saveConsentRecord } from "@/services/consentService";
import FirstTimePopup from "@/components/FirstTimePopup";
import ConsentModal from "@/components/ConsentModal";
import toast from "react-hot-toast";

export default function GeneratorScreen() {
  const router = useRouter();
  const { credits, isPremium, isLoading: creditsLoading } = useCredits();
  const { selectedImage, imagePreview, handleImageSelect, clearImage, isValidImage } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isFirstTimePopupVisible, setIsFirstTimePopupVisible] = useState(false);
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdown && !target.closest('.relative')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Check if should show first-time popup
  useEffect(() => {
    const checkFirstTimePopup = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const verificationStatus = await getUserVerificationStatus(user.uid);

        // Show popup only if tips have been seen but popup hasn't
        if (verificationStatus.hasSeenGeneratorTips && !verificationStatus.hasSeenFirstTimePopup) {
          // Mark as seen first to prevent duplicate displays
          await updateFirstTimePopupSeen(user.uid, true);
          // Show popup after a delay
          setTimeout(() => {
            setIsFirstTimePopupVisible(true);
          }, 500);
        }
      } catch (error) {
        console.error("Error checking first time popup status:", error);
      }
    };

    checkFirstTimePopup();
  }, []);

  // Reset consent when image changes (consent is per-image)
  useEffect(() => {
    setHasConsented(false);
  }, [selectedImage]);

  const getSelectedStyleInfo = () => {
    if (!selectedStyle) return null;

    for (const category of Object.values(STYLE_CATEGORIES)) {
      const style = category.options.find((s) => s.key === selectedStyle);
      if (style) return style;
    }
    return null;
  };

  const executeGeneration = async () => {
    const user = auth.currentUser;
    if (!user || !selectedImage) return;

    const styleInfo = getSelectedStyleInfo();
    if (!styleInfo) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const formData = new FormData();
      formData.append("image1", selectedImage);
      formData.append("prompt", styleInfo.prompt);
      formData.append("userId", user.uid);

      const imageBlob = await generateImage(formData);

      // Backend already handles credit deduction
      // Convert blob to URL and display on same page
      const imageUrl = URL.createObjectURL(imageBlob);
      setGeneratedImageUrl(imageUrl);

      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConsent = async () => {
    const user = auth.currentUser;
    if (!user || !selectedImage) {
      toast.error("Missing user or image data");
      return;
    }

    try {
      // Save consent record to Firestore
      await saveConsentRecord(user.uid, selectedImage, true, true);
      setHasConsented(true);
      setIsConsentModalVisible(false);

      // Proceed with generation
      await executeGeneration();
    } catch (error) {
      console.error("Consent error:", error);
      toast.error("Failed to save consent. Please try again.");
      throw error;
    }
  };

  const handleGenerate = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to generate images", {
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px',
        },
      });
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (!selectedImage || !selectedStyle) {
      toast.error("Please upload a photo and select a style to continue", {
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
          padding: '16px',
        },
      });
      return;
    }

    const styleInfo = getSelectedStyleInfo();
    if (!styleInfo) {
      toast.error("Invalid style selected");
      return;
    }

    // Check if style is premium
    if (styleInfo.isPremium && !isPremium) {
      toast.error("This style requires Premium. Upgrade to unlock!");
      router.push(ROUTES.PREMIUM);
      return;
    }

    // Check credits
    if (!isPremium && credits < 1) {
      toast.error("No credits remaining. Purchase more or upgrade to Premium!");
      router.push(ROUTES.PREMIUM);
      return;
    }

    // Check if user has consented for this image
    if (!hasConsented) {
      setIsConsentModalVisible(true);
    } else {
      await executeGeneration();
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;

    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `dreamai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const handleShare = async () => {
    if (!generatedImageUrl) return;

    try {
      // Convert blob URL to blob
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "dreamai-image.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "DreamAI Generated Image",
          text: "Check out this image I created with DreamAI!",
        });
        toast.success("Image shared!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        toast.success("Image copied to clipboard!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share image");
    }
  };

  if (creditsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-[family-name:var(--font-montserrat)]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Goes to Settings */}
            <button
              onClick={() => router.push(ROUTES.SETTINGS)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-bold">DreamAI</h1>
          </div>

          <div className="flex items-center gap-3">
            {!isPremium && (
              <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-sm font-semibold">{credits}</span>
              </div>
            )}

            <motion.button
              onClick={() => router.push(ROUTES.PREMIUM)}
              className="bg-[#FF5069] text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-[#FF3050] transition-colors"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            >
              <Image src={PREMIUM_ICON} alt="Pro" width={16} height={16} />
              <span className="text-sm font-semibold">PRO</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Image Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-lg font-semibold">Face Photo</h2>
              <button
                onClick={() => router.push(ROUTES.GENERATOR_TIPS)}
                className="ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: 'rgba(255, 80, 105, 0.15)' }}
                aria-label="Tips"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  style={{ color: '#FF5069' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <div
                onClick={() => {
                  if (!imagePreview && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !imagePreview && fileInputRef.current) {
                    e.preventDefault();
                    fileInputRef.current.click();
                  }
                }}
                className="block w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#FF5069] transition-colors overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-2 right-2 bg-black/60 p-2 rounded-full hover:bg-black/80"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full px-8">
                    <div className="flex flex-col items-center gap-2">
                      <Image src={PLACEHOLDER_IMAGE} alt="Upload" width={30} height={30} className="opacity-50" />
                      <p className="text-gray-400 text-sm">Tap to upload your photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Style Selection - Custom Dropdowns in 2 Columns */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose Your Style</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(STYLE_CATEGORIES).map(([key, category]) => {
                const isOpen = openDropdown === key;
                const selectedOption = category.options.find((s) => s.key === selectedStyle);

                // Get first 3 options for placeholder
                const first3Titles = category.options.slice(0, 3).map(s => s.title).join(", ");
                const placeholder = first3Titles.length > 30 ? first3Titles.substring(0, 30) + "..." : first3Titles;

                return (
                  <div key={key} className="relative">
                    {/* Category Label */}
                    <div className="text-sm font-bold text-black mb-2">{category.label}</div>

                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : key)}
                      className="w-full bg-[#F8F8F8] rounded-2xl px-3 py-3 text-left text-sm flex items-center justify-between gap-2 hover:bg-[#F0F0F0] transition-colors"
                    >
                      <span className={`truncate ${selectedOption ? "text-black" : "text-[#6B7280]"}`}>
                        {selectedOption ? selectedOption.title : placeholder}
                      </span>
                      <div className="flex-shrink-0 bg-black rounded-full p-1.5">
                        <svg
                          className={`h-4 w-4 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto">
                        {category.options.map((style) => (
                          <button
                            key={style.key}
                            onClick={() => {
                              setSelectedStyle(style.key);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors flex items-center justify-between gap-2 ${
                              selectedStyle === style.key ? "bg-gray-50 font-medium" : ""
                            }`}
                          >
                            <span>{style.title}</span>
                            {style.isPremium && (
                              <div className="flex-shrink-0 bg-[#FF5069] rounded-full p-1">
                                <svg
                                  className="h-3 w-3 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!isValidImage || !selectedStyle || isGenerating}
            whileTap={{ scale: isValidImage && selectedStyle && !isGenerating ? 0.95 : 1 }}
            className={`w-full font-semibold px-8 py-4 rounded-full transition-all flex items-center justify-center gap-3 text-base text-white shadow-lg ${
              !isValidImage || !selectedStyle || isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              paddingTop: '20px',
              paddingBottom: '20px',
              background: 'linear-gradient(120deg, #FF5069 0%, #FF5069 80%, #87CEEB 100%)'
            }}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </motion.button>

          {/* Generated Image Display */}
          {generatedImageUrl && (
            <div className="mt-8 space-y-4">
              <h2 className="text-lg font-semibold">Result</h2>

              {/* Not satisfied link */}
              <div className="text-center">
                <button
                  onClick={() => router.push(ROUTES.PREMIUM)}
                  className="text-[#007AFF] text-sm underline hover:text-[#0051D5] transition-colors"
                >
                  Not satisfied with the result?
                </button>
              </div>

              <div className="relative w-full aspect-square max-w-md mx-auto bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                  src={generatedImageUrl}
                  alt="Generated"
                  fill
                  className="object-cover"
                />

                {/* Download and Share Icons - Bottom Left */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="bg-white/90 hover:bg-white p-2.5 rounded-full transition-all shadow-lg"
                    aria-label="Download"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-black"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-white/90 hover:bg-white p-2.5 rounded-full transition-all shadow-lg"
                    aria-label="Share"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-black"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* First-Time Welcome Popup */}
      <FirstTimePopup
        isOpen={isFirstTimePopupVisible}
        onClose={() => setIsFirstTimePopupVisible(false)}
      />

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalVisible}
        onClose={() => setIsConsentModalVisible(false)}
        onConsent={handleConsent}
      />
    </div>
  );
}
