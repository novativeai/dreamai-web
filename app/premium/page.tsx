"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { useCredits } from "@/contexts/CreditContext";
import { initPaddle, setCheckoutContext } from "@/lib/paddle";
import { createCheckout } from "@/lib/api";
import { ROUTES } from "@/utils/routes";
import { PREMIUM_FEATURES, PREMIUM_DISCLAIMER, PREMIUM_ICON } from "@/constants";
import { cancelSubscription } from "@/lib/api";
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
  const { subscriptions, isPremium, premiumStatus, subscriptionPriceId, isLoading: contextLoading, refreshCredits } = useCredits();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeSegment, setActiveSegment] = useState<"Premium" | "Premium+">("Premium");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  const currentPlans = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) return [];

    if (activeSegment === "Premium") {
      // Filter by productName (or name as fallback) to group subscription types
      const filtered = subscriptions.filter((s) => {
        const filterName = s.productName || s.name;
        return filterName.includes("Premium") && !filterName.includes("Premium +");
      });
      console.log("[Premium Screen] Premium plans:", filtered.map(p => ({ name: p.name, isRecommended: p.isRecommended })));
      return filtered;
    }
    // Premium+ subscriptions
    const filtered = subscriptions.filter((s) => {
      const filterName = s.productName || s.name;
      return filterName.includes("Premium +");
    });
    console.log("[Premium Screen] Premium+ plans:", filtered.map(p => ({ name: p.name, isRecommended: p.isRecommended })));
    return filtered;
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

      // Create checkout with backend (auth token sent automatically)
      const checkoutData = await createCheckout(selectedPlanId);

      // Validate response
      if (!checkoutData.transaction_id) {
        toast.error("Failed to create checkout. Please try again.");
        setIsPurchasing(false);
        return;
      }

      // Set checkout context for global event handler
      setCheckoutContext({
        type: 'subscription',
        onSuccess: () => {
          // Refresh user data from Firestore (backend webhook has already updated isPremium)
          refreshCredits();

          // Navigate to generator screen after brief delay
          setTimeout(() => {
            router.push(ROUTES.GENERATOR);
          }, 1500);
        },
      });

      // Open Paddle checkout with the pre-created transaction
      paddle.Checkout.open({
        transactionId: checkoutData.transaction_id,
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });

      toast.success("Redirecting to checkout...");
    } catch (error: unknown) {
      console.error("Purchase error:", error);

      // Handle trial blocked error with specific message
      const trialError = error as { code?: string; reason?: string; message?: string };
      if (trialError.code === 'TRIAL_NOT_AVAILABLE') {
        const message = trialError.reason === 'device'
          ? "Free trial not available. This device has already been used for a free trial."
          : "Free trial not available. This email has already been used for a free trial.";
        toast.error(message, { duration: 5000 });
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => router.back();

  const handleCancelSubscription = async () => {
    if (isCancelling) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period."
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const result = await cancelSubscription();

      if (result.success === false) {
        toast.error(result.error || "Failed to cancel subscription. Please try again.");
        return;
      }

      toast.success("Subscription cancelled successfully. You will retain access until the end of your billing period.");
      refreshCredits();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription. Please try again or contact support.");
    } finally {
      setIsCancelling(false);
    }
  };

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
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Premium Status Banner - Show when subscribed */}
          {isPremium && (
            <div className="bg-gradient-to-r from-[#FF5069] to-[#FF3050] rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image src={PREMIUM_ICON} alt="Premium" width={24} height={24} />
                  <div>
                    <p className="font-bold text-lg">You're Premium!</p>
                    <p className="text-sm opacity-90">
                      Status: <span className="font-medium capitalize">{premiumStatus || "Active"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {contextLoading && (!subscriptions || subscriptions.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069] mb-4"></div>
              <p className="text-gray-600">Loading plans...</p>
            </div>
          ) : (
            <>
              {/* Plan Cards */}
              <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
                {currentPlans.map((plan) => {
                  const isActivePlan = isPremium && subscriptionPriceId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => !isActivePlan && setSelectedPlanId(plan.id)}
                      disabled={isActivePlan}
                      className={`flex-shrink-0 w-40 min-h-[140px] p-4 border-2 rounded-2xl transition-all relative ${
                        isActivePlan
                          ? "border-[#10b981] bg-gradient-to-br from-emerald-50 to-green-50"
                          : selectedPlanId === plan.id
                          ? "border-[#FF5069] bg-white shadow-lg"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      } ${isActivePlan ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <div className="text-center">
                        <p className={`text-sm font-semibold mb-2 ${
                          isActivePlan
                            ? "text-emerald-700"
                            : selectedPlanId === plan.id
                            ? "text-[#FF5069]"
                            : "text-gray-800"
                        }`}>
                          {plan.name}
                        </p>
                        <p className={`text-xs mb-1 ${
                          isActivePlan
                            ? "text-emerald-600"
                            : selectedPlanId === plan.id
                            ? "text-[#FF5069]"
                            : "text-gray-600"
                        }`}>
                          {plan.price}
                          {plan.interval ? `/${plan.interval}` : '/month'}
                        </p>
                        <p className="text-xs text-gray-500">{plan.description}</p>
                      </div>

                      {/* Active Badge */}
                      {isActivePlan && (
                        <div className="absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-bold rounded-b-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm">
                          Active
                        </div>
                      )}

                      {/* Recommended Badge - Only show if not active */}
                      {!isActivePlan && plan.isRecommended && (
                        <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-center text-xs font-semibold rounded-b-2xl ${
                          selectedPlanId === plan.id ? "bg-[#FF5069] text-white" : "bg-gray-200 text-gray-600"
                        }`}>
                          Recommended
                        </div>
                      )}
                    </button>
                  );
                })}
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
      </main>

      {/* Bottom Purchase/Change Plan Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Credits Link - Only show for non-premium users */}
          {!isPremium && (
            <div className="text-center mb-3">
              <button
                onClick={() => router.push(ROUTES.BUY_CREDITS)}
                className="text-sm text-[#FF5069] hover:underline font-medium"
              >
                Buy some credits?
              </button>
            </div>
          )}

          {/* Show different button based on premium status */}
          {isPremium ? (
            <button
              onClick={handlePurchase}
              disabled={!selectedPlan || contextLoading || isPurchasing || (subscriptionPriceId === selectedPlanId)}
              className="w-full bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              {isPurchasing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : subscriptionPriceId === selectedPlanId ? (
                <span>Current Plan</span>
              ) : (
                <span>{selectedPlan ? `Change to ${selectedPlan.name}` : "Select a Plan"}</span>
              )}
            </button>
          ) : (
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
          )}

          {/* Cancel Subscription - Only show for premium users */}
          {isPremium && premiumStatus === "active" && (
            <div className="text-center mt-3">
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Cancel subscription"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
