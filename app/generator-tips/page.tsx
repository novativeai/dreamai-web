"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Image from "next/image";
import { GENERATOR_TIPS_DATA, BRAND_COLOR } from "@/constants";
import { updateGeneratorTipsSeen } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function GeneratorTipsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // Inject custom styles for Swiper pagination
  useEffect(() => {
    const styleId = "generator-tips-custom-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background-color: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background-color: ${BRAND_COLOR};
          width: 24px;
          border-radius: 4px;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handleClose = async () => {
    if (user) {
      try {
        await updateGeneratorTipsSeen(user.uid, true);
      } catch (error) {
        console.error("Failed to update generator tips status:", error);
      }
    }
    router.replace("/generator");
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const handleGotIt = async () => {
    await handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 mx-4">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet",
            bulletActiveClass: "swiper-pagination-bullet-active",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          className="pb-16"
        >
          {GENERATOR_TIPS_DATA.map((tip, index) => (
            <SwiperSlide key={tip.id}>
              <div className={`flex flex-col ${index === 0 ? 'items-start text-left' : 'items-center text-center'} min-h-[500px]`}>
                {/* Image */}
                {tip.image && (
                  <div className="mb-6">
                    <Image
                      src={tip.image}
                      alt={tip.title}
                      width={400}
                      height={400}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl font-bold mb-4 text-black">{tip.title}</h2>

                {/* Text Content */}
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {tip.text}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          {activeIndex < GENERATOR_TIPS_DATA.length - 1 ? (
            <button
              onClick={handleNext}
              className="w-full rounded-full py-4 text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGotIt}
              className="w-full rounded-full py-4 text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Got it
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-full py-3 text-black font-medium transition-all hover:opacity-70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
