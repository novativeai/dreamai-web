"use client";

import { useEffect } from "react";
import Image from "next/image";
import { POPUP_IMAGE } from "@/constants";
import { IoClose } from "react-icons/io5";

interface FirstTimePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FirstTimePopup({ isOpen, onClose }: FirstTimePopupProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full h-[90%] bg-white rounded-t-[20px] p-5 flex items-center justify-center animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <IoClose className="w-7 h-7 text-black" />
        </button>

        {/* Popup Image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={POPUP_IMAGE}
            alt="Welcome"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
