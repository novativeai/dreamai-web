"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useCredits } from "@/contexts/CreditContext";
import { initPaddle, setCheckoutContext } from "@/lib/paddle";
import { createCheckout } from "@/lib/api";
import { ROUTES } from "@/utils/routes";
import toast from "react-hot-toast";

export default function BuyCreditsScreen() {
  const router = useRouter();
  const { creditPackages, isLoading: contextLoading, refreshCredits } = useCredits();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [router]);

  // Auto-select popular package or first package
  useEffect(() => {
    if (creditPackages.length > 0 && !selectedPackageId) {
      const popularPkg = creditPackages.find((p) => p.isPopular);
      setSelectedPackageId(popularPkg?.id || creditPackages[0].id);
    }
  }, [creditPackages, selectedPackageId]);

  const selectedPackage = useMemo(
    () => creditPackages.find((p) => p.id === selectedPackageId),
    [selectedPackageId, creditPackages]
  );

  const handlePurchase = async () => {
    if (!selectedPackageId || !selectedPackage) {
      toast.error("Please select a package to continue.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please log in to purchase credits");
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
      const checkoutData = await createCheckout(selectedPackageId);

      // Validate response
      if (!checkoutData.transaction_id) {
        toast.error("Failed to create checkout. Please try again.");
        setIsPurchasing(false);
        return;
      }

      // Set checkout context for global event handler
      setCheckoutContext({
        type: 'credit',
        onSuccess: () => {
          // Refresh credits from Firestore (backend webhook has already updated them)
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
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

            <h1 className="text-lg font-medium">AI Images</h1>

            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {contextLoading && creditPackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5069] mb-4"></div>
              <p className="text-gray-600">Loading packages...</p>
            </div>
          ) : (
            <>
              {/* Star Icon */}
              <div className="flex justify-center mb-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-4">Create more AI images</h2>

              {/* Description */}
              <p className="text-center text-gray-600 leading-relaxed mb-8 max-w-md mx-auto">
                Have you used up your quota? No problem - with these additional packages you can immediately
                generate new AI images in your desired style and effect. No waiting time. No limits. Just you and
                your next vision.
              </p>

              {creditPackages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No credit packages available at the moment. Please try again later.</p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide mb-8">
                  <div className="flex gap-4 px-6 py-2 min-w-max">
                    {creditPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`relative w-[120px] h-[160px] border rounded-2xl transition-all overflow-hidden flex-shrink-0 ${
                          selectedPackageId === pkg.id
                            ? "border-[#FF5069] border-2 bg-white shadow-lg"
                            : "border-gray-300 border-[1.5px] bg-gray-50"
                        }`}
                      >
                        {/* Popular Banner */}
                        {pkg.isPopular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#FF5069] text-white text-xs font-bold px-3 py-1 rounded-xl z-10">
                            Most popular
                          </div>
                        )}

                        {/* Package Content */}
                        <div className="flex flex-col items-center justify-center h-full pt-5 pb-10">
                          <div className="text-4xl font-bold text-black mb-1">{pkg.credits}</div>
                          <div className="text-base text-gray-800 mb-2">Pictures</div>
                          <div className="text-sm text-gray-600">{pkg.price}</div>
                        </div>

                        {/* Bottom highlight for selected */}
                        {selectedPackageId === pkg.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#FF5069]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Purchase Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <button
          onClick={handlePurchase}
          disabled={!selectedPackage || contextLoading || isPurchasing}
          className="w-full max-w-4xl mx-auto bg-[#FF5069] hover:bg-[#FF3050] disabled:bg-gray-300 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2"
        >
          {isPurchasing ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : selectedPackage ? (
            `Buy ${selectedPackage.credits} pictures for ${selectedPackage.price}`
          ) : (
            "Select a package"
          )}
        </button>
      </div>
    </div>
  );
}
