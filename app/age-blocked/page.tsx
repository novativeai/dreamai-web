"use client";

import Image from "next/image";
import { AGE_BLOCKED_TITLE, AGE_BLOCKED_TEXT, AGE_BLOCKED_SUBSCRIPTION_NOTE, AGE_BLOCKED_IMAGE } from "@/constants";

export default function AgeBlockedScreen() {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center px-8 pt-10 pb-10">
      <div className="w-full max-w-lg">
        {/* Robot Image */}
        <div className="w-full mb-8">
          <Image
            src={AGE_BLOCKED_IMAGE}
            alt="Age Restricted"
            width={400}
            height={400}
            className="w-[90%] mx-auto"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-left w-full">
          {AGE_BLOCKED_TITLE}
        </h1>

        {/* Description */}
        <p className="text-[15px] text-gray-600 leading-[22px] mb-32 text-left">
          {AGE_BLOCKED_TEXT}
        </p>

        {/* Subscription Note */}
        <p className="text-xs text-gray-500 leading-[18px] text-left">
          {AGE_BLOCKED_SUBSCRIPTION_NOTE}
        </p>
      </div>
    </div>
  );
}
