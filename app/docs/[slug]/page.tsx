"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { TEXT_DOCUMENTS } from "@/constants";
import { useEffect, useState } from "react";

export default function TextDocScreen() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [document, setDocument] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    if (slug && TEXT_DOCUMENTS[slug]) {
      setDocument(TEXT_DOCUMENTS[slug]);
    } else {
      setDocument(null);
    }
  }, [slug]);

  const handleBack = () => {
    router.back();
  };

  if (!document) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <button
            onClick={handleBack}
            className="text-[#FF5069] hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10">
        <div className="px-4 py-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-4"
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

          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/LOGO_BLACK.png"
              alt="DreamAI"
              width={45}
              height={15}
              className="object-contain m-0 p-0"
            />
            <h1 className="text-lg font-semibold">{document.title}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="py-4 px-4">
        <div className="max-w-4xl pl-2">
          <div className="prose prose-gray max-w-none">
            {document.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
