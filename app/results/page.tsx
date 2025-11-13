"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "@/utils/routes";
import { Button } from "@/components/ui/Button";
import { SHARE_ICON, DOWNLOAD_ICON } from "@/constants";
import toast from "react-hot-toast";

export default function ResultsScreen() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get generated image from session storage
    const generatedImage = sessionStorage.getItem("generatedImage");
    if (generatedImage) {
      setImageUrl(generatedImage);
      setIsLoading(false);
    } else {
      toast.error("No image found. Please generate one first.");
      router.replace(ROUTES.GENERATOR);
    }
  }, [router]);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dreamai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "dreamai-image.png", { type: "image/png" });

        await navigator.share({
          files: [file],
          title: "DreamAI Generated Image",
          text: "Check out my AI-generated image from DreamAI!",
        });

        toast.success("Shared successfully!");
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share error:", error);
          toast.error("Failed to share image");
        }
      }
    } else {
      // Fallback: copy to clipboard
      toast("Sharing not supported. Use download button instead.");
    }
  };

  const handleGenerateAgain = () => {
    // Clear the generated image
    sessionStorage.removeItem("generatedImage");
    router.push(ROUTES.GENERATOR);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-neutral-gray-900 border-b border-neutral-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-brand transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-xl font-bold">Your Result</h1>

          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {imageUrl && (
            <div className="generated-image-container mb-8">
              <Image
                src={imageUrl}
                alt="Generated"
                width={800}
                height={800}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleDownload} variant="primary" className="flex items-center gap-2">
              <Image src={DOWNLOAD_ICON} alt="Download" width={20} height={20} />
              Download
            </Button>

            <Button onClick={handleShare} variant="secondary" className="flex items-center gap-2">
              <Image src={SHARE_ICON} alt="Share" width={20} height={20} />
              Share
            </Button>

            <Button onClick={handleGenerateAgain} variant="outline">
              Generate Again
            </Button>
          </div>

          <p className="text-center text-sm text-neutral-gray-400 mt-6">
            Loved your creation? Share it with friends!
          </p>
        </div>
      </main>
    </div>
  );
}
