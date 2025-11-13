"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { useCredits } from "@/contexts/CreditContext";
import { initPaddle } from "@/lib/paddle";
import { createCheckout } from "@/lib/api";
import { ROUTES } from "@/utils/routes";
import { PREMIUM_FEATURES, PREMIUM_DISCLAIMER, PREMIUM_ICON } from "@/constants";
import toast from "react-hot-toast";
import { MdOutlineCollections, MdBlock, MdWorkspacePremium } from "react-icons/md";
import { IoInfiniteOutline, IoRocketOutline } from "react-icons/io5";

// Icon mapping based on iconName
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "image-multiple-outline": MdOutlineCollections,
    "infinite-outline": IoInfiniteOutline,
    "rocket-outline": IoRocketOutline,
    "advertisements-off": MdBlock,
    "crown-outline": MdWorkspacePremium,
  };
  return iconMap[iconName] || MdOutlineCollections;
};

export default function PremiumScreen() {
  const router = useRouter();
  const { subscriptions, isPremium, premiumStatus, isLoading: contextLoading } = useCredits();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<"Premium" | "Premium+">("Premium");
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  const currentPlans = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];

    if (activeSegment === "Premium") {
      return subscriptions.filter((s) => s.name.includes("Premium") && !s.name.includes("Premium +"));
    }
    return subscriptions.filter((s) => s.name.includes("Premium +"));
  }, [activeSegment, subscriptions]);

  useEffect(() => {
    const recommendedPlan = currentPlans.find((p) => p.isRecommended);
    setSelectedPlanId(recommendedPlan ? recommendedPlan.id : currentPlans[0]?.id || null);
  }, [currentPlans]);

  const selectedPlan = useMemo(() => {
    return currentPlans.find((plan) => plan.id === selectedPlanId);
  }, [selectedPlanId, currentPlans]);

  const handlePurchase = async () => {
    if (!selectedPlanId || !selectedPlan) {
      toast.error("Please select a plan first.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to subscribe");
      router.replace(ROUTES.LOGIN);
      return;
    }

    setIsPurchasing(true);

    try {
      // Initialize Paddle
      const paddle = await initPaddle();
      if (!paddle) {
        toast.error("Payment system unavailable. Please try again later.");
        setIsPurchasing(false);
        return;
      }

      // Create checkout with backend
      const checkoutData = await createCheckout(selectedPlanId, user.uid);

      // Open Paddle checkout
      paddle.Checkout.open({
        items: [
          {
            priceId: checkoutData.priceId,
            quantity: 1,
          },
        ],
        customData: {
          firebase_uid: user.uid,
        },
        customer: {
          email: user.email || undefined,
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });

      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => router.back();

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Close Button Row */}
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Segmented Control - Full Width */}
          <div className="flex w-full border-b-2 border-gray-200">
            <button
              onClick={() => setActiveSegment("Premium")}
              className={`flex-1 py-3 text-base font-medium border-b-2 transition-colors ${
                activeSegment === "Premium"
                  ? "border-[#FF5069] text-[#FF5069]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              DreamAI Premium
            </button>
            <button
              onClick={() => setActiveSegment("Premium+")}
              className={`flex-1 py-3 text-base font-medium border-b-2 transition-colors ${
                activeSegment === "Premium+"
                  ? "border-[#FF5069] text-[#FF5069]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              DreamAI Premium +
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {isPremium ? (
          <div className="max-w-2xl mx-auto px-6 py-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-[#FF5069] text-white px-6 py-3 rounded-full mb-4">
                <Image src={PREMIUM_ICON} alt="Premium" width={20} height={20} />
                <span className="font-bold">You're Premium!</span>
              </div>
              <p className="text-gray-600">
                Status: <span className="text-black font-medium capitalize">{premiumStatus || "Active"}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {contextLoading && (!subscriptions || subscriptions.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069] mb-4"></div>
                <p className="text-gray-600">Loading plans...</p>
              </div>
            ) : (
              <>
                {/* Plan Cards */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
                  {currentPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`flex-shrink-0 w-40 min-h-[140px] p-4 border-2 rounded-2xl transition-all relative ${
                        selectedPlanId === plan.id
                          ? "border-[#FF5069] bg-white shadow-lg"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-semibold mb-2 ${selectedPlanId === plan.id ? "text-[#FF5069]" : "text-gray-800"}`}>
                          {plan.name}
                        </p>
                        <p className={`text-xs mb-1 ${selectedPlanId === plan.id ? "text-[#FF5069]" : "text-gray-600"}`}>
                          {plan.price}
                          {plan.interval ? `/${plan.interval}` : '/month'}
                        </p>
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      </div>
                      {plan.isRecommended && (
                        <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-semibold ${
                          selectedPlanId === plan.id ? "bg-[#FF5069] text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          Recommended
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {currentPlans.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No plans available at the moment. Please try again later.</p>
                  </div>
                )}

                {/* Features */}
                {PREMIUM_FEATURES.map((feature) => {
                  const IconComponent = getIconComponent(feature.iconName);
                  return (
                    <div key={feature.id} className="flex items-center gap-4 mb-6">
                      <div className="flex-shrink-0 w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-gray-800" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-black mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}

                <p className="text-xs text-gray-500 text-center mt-8 px-4">{PREMIUM_DISCLAIMER}</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Purchase Button */}
      {!isPremium && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {/* Credits Link */}
            <div className="text-center mb-3">
              <button
                onClick={() => router.push(ROUTES.BUY_CREDITS)}
                className="text-sm text-[#FF5069] hover:underline font-medium"
              >
                Buy some credits?
              </button>
            </div>

            <button
              onClick={handlePurchase}
              disabled={!selectedPlan || contextLoading || isPurchasing}
              className="w-full bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <span>{selectedPlan ? `Continue with ${selectedPlan.name}` : "Select a Plan"}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
