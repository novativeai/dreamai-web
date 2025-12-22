"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { DELETION_REASONS, SUPPORT_EMAIL, APP_NAME, BRAND_COLOR } from "@/constants";
import { submitDeletionFeedback, uploadFeedbackPhoto } from "@/services/feedbackService";
import { archiveDeletedUser, cancelSubscription } from "@/lib/api";
import { DeletionFlowView } from "@/types";
import { ROUTES } from "@/utils/routes";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";

interface AttachedPhoto {
  file: File;
  preview: string;
}

type LoadingOperation = "submit" | "deleteOnly" | null;
const MAX_PHOTOS = 2;

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [view, setView] = useState<DeletionFlowView>("reasonSelection");
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState<AttachedPhoto[]>([]);
  const [loadingOperation, setLoadingOperation] = useState<LoadingOperation>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [showRequiresRecentLoginMessage, setShowRequiresRecentLoginMessage] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<{ submitFeedback: boolean } | null>(null);

  const handleGoBack = () => {
    if (loadingOperation) return;
    if (view === "success") {
      // After account deletion, go to login screen
      router.replace(ROUTES.LOGIN);
    } else if (view === "reasonSelection") {
      router.back();
    } else {
      setView("reasonSelection");
    }
  };

  const handleNextStep = () => {
    const reason = DELETION_REASONS.find((r) => r.id === selectedReasonId);
    if (reason) {
      setView(reason.nextView);
    } else {
      toast.error("Please select a reason to continue");
    }
  };

  const handleAttachPhotos = () => {
    if (loadingOperation) return;
    if (attachedPhotos.length >= MAX_PHOTOS) {
      toast.error(`You can attach a maximum of ${MAX_PHOTOS} photos`);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const preview = URL.createObjectURL(file);
        setAttachedPhotos((prev) => [...prev, { file, preview }]);
      }
    };
    input.click();
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };

  const handleProceedToLoginAfterError = async () => {
    setLoadingOperation("deleteOnly");
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error signing out during re-auth flow:", e);
    } finally {
      router.replace(ROUTES.LOGIN);
      setLoadingOperation(null);
      setShowRequiresRecentLoginMessage(false);
    }
  };

  const requestDeletion = (submitFeedback: boolean) => {
    setPendingDeletion({ submitFeedback });
    setShowConfirmationModal(true);
  };

  const confirmDeletion = async () => {
    if (!pendingDeletion) return;

    setShowConfirmationModal(false);
    const { submitFeedback } = pendingDeletion;
    setPendingDeletion(null);

    setLoadingOperation(submitFeedback ? "submit" : "deleteOnly");
    setLoadingStep("Preparing...");
    const user = auth.currentUser;
    if (!user) {
      toast.error("No user is currently signed in. Please log in again.");
      setLoadingOperation(null);
      setLoadingStep("");
      return;
    }

    try {
      if (submitFeedback && selectedReasonId) {
        const selectedReason = DELETION_REASONS.find((r) => r.id === selectedReasonId);

        // Upload photos to R2 if any are attached
        let photoUrls: string[] = [];
        if (attachedPhotos.length > 0) {
          setLoadingStep("Uploading photos...");
          try {
            const uploadPromises = attachedPhotos.map((photo) =>
              uploadFeedbackPhoto(photo.file, user.uid)
            );
            photoUrls = await Promise.all(uploadPromises);
            console.log("Photos uploaded successfully:", photoUrls);
          } catch (uploadError) {
            console.error("Error uploading photos:", uploadError);
            // Continue with feedback submission even if photo upload fails
            toast.error("Could not upload photos, but your feedback will still be submitted.");
          }
        }

        setLoadingStep("Submitting feedback...");
        await submitDeletionFeedback(
          user.uid,
          selectedReasonId,
          selectedReason?.text || "",
          feedbackText,
          photoUrls
        );
      }

      // Step 1: Check for active subscription and cancel it
      setLoadingStep("Checking subscription...");
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const subscriptionId = userData.subscription_id;

        // Cancel Paddle subscription if one exists (must succeed before account deletion)
        if (subscriptionId) {
          setLoadingStep("Canceling subscription...");
          try {
            console.log("Attempting to cancel subscription:", subscriptionId);
            const result = await cancelSubscription();
            console.log("Cancel subscription response:", JSON.stringify(result, null, 2));

            // Block deletion if subscription cancellation failed
            if (result.success === false) {
              const errorMsg = result.error || result.message || "Failed to cancel subscription";
              console.error("Subscription cancellation failed:", errorMsg, result);
              toast.error(`Unable to cancel subscription: ${errorMsg}`);
              setLoadingOperation(null);
              setLoadingStep("");
              return;
            }

            console.log("Subscription cancelled successfully");
          } catch (subError: unknown) {
            // Extract error details from axios error response
            const axiosError = subError as { response?: { data?: { error?: string; message?: string } }; message?: string };
            const errorDetail = axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || "Unknown error";
            console.error("Error cancelling subscription:", errorDetail, subError);
            toast.error(`Could not cancel subscription: ${errorDetail}`);
            setLoadingOperation(null);
            setLoadingStep("");
            return;
          }
        }

        // Step 2: Archive user data (credits, trial status) before deletion
        // Only archive if not already archived (prevents exploit during failed deletions)
        const alreadyArchived = userData.deletionArchived === true;

        if (!alreadyArchived) {
          setLoadingStep("Archiving account data...");
          try {
            await archiveDeletedUser();
            console.log("User data archived successfully");

            // Mark as archived to prevent re-archiving if Auth deletion fails
            await updateDoc(userRef, {
              deletionArchived: true,
              deletionArchivedAt: new Date(),
            });
          } catch (archiveError) {
            // Log but don't block deletion - this is a nice-to-have feature
            console.error("Error archiving user data:", archiveError);
          }
        } else {
          console.log("User data already archived, skipping re-archive");
        }
      }

      // Step 3: Delete Firestore document FIRST (while still authenticated)
      // Must happen before Auth deletion because Firestore rules require valid auth token
      // Data is already archived, so it's safe to delete
      if (userSnap.exists()) {
        setLoadingStep("Removing account data...");
        await deleteDoc(userRef);
        console.log("Firestore document deleted");
      }

      // Step 4: Delete Firebase Auth user LAST
      // This step can fail with "requires-recent-login" error
      // Done after Firestore deletion because it invalidates the auth token
      setLoadingStep("Deleting account...");
      await deleteUser(user);

      setView("success");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/requires-recent-login") {
        setShowRequiresRecentLoginMessage(true);
        toast.error("Recent login is required");
      } else {
        toast.error(firebaseError.message || "An unknown error occurred. Please try again.");
      }
    } finally {
      setLoadingOperation(null);
      setLoadingStep("");
    }
  };

  const cancelDeletion = () => {
    setShowConfirmationModal(false);
    setPendingDeletion(null);
  };

  const renderHeader = (title: string) => {
    return (
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-4"
            disabled={!!loadingOperation}
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

          <h2 className="text-base font-bold text-black">{title}</h2>
        </div>
      </header>
    );
  };

  const renderReasonSelection = () => (
    <>
      {renderHeader("Please let us know why you want to delete your account.")}
      <div className="px-4 py-5 pb-40">
        {DELETION_REASONS.map((reason) => (
          <button
            key={reason.id}
            onClick={() => setSelectedReasonId(reason.id)}
            className="w-full flex items-center justify-between py-[18px] border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <span className="text-base text-black">{reason.text}</span>
            <div className="flex-shrink-0">
              {selectedReasonId === reason.id ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-black"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
      {/* FAB */}
      <div className="fixed bottom-10 right-8">
        <button
          onClick={handleNextStep}
          disabled={!selectedReasonId}
          className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg transition-all ${
            selectedReasonId ? "bg-[#FF5069] hover:bg-[#FF3050]" : "bg-gray-300"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 ${selectedReasonId ? "text-white" : "text-gray-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );

  const renderGenericFeedback = () => {
    const selectedReason = DELETION_REASONS.find((r) => r.id === selectedReasonId);
    return (
      <>
        {renderHeader(selectedReason?.text || "Give us feedback")}
        <div className="px-4 py-5 pb-40">
        <p className="text-base text-gray-600 leading-6 mb-8">
          We want to understand what went wrong. Please let us know your concerns so that we can
          improve and possibly offer you a specific solution that meets your needs.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 text-base min-h-[140px] focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          placeholder="Enter your message here ..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          disabled={!!loadingOperation}
        />
        <button
          onClick={handleAttachPhotos}
          disabled={!!loadingOperation}
          className="mx-auto block mt-5 mb-5 text-base font-medium text-black hover:underline"
        >
          Attach photos (optional)
        </button>
        {attachedPhotos.length > 0 && (
          <p className="text-sm text-gray-600 text-center mb-8">
            {attachedPhotos.length}/{MAX_PHOTOS} photo(s) attached.
          </p>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => requestDeletion(true)}
          disabled={!!loadingOperation}
          className="w-full bg-black text-white font-bold text-base py-4 rounded-full mb-4 hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loadingOperation === "submit" ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              {loadingStep && <span className="text-sm">{loadingStep}</span>}
            </div>
          ) : (
            "Submit & delete account"
          )}
        </button>
        <button
          onClick={() => requestDeletion(false)}
          disabled={!!loadingOperation}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          No thanks, just delete
        </button>
      </div>
    </>
    );
  };

  const renderRetentionScreen = (
    title: string,
    description: string,
    primaryBtnText: string,
    onPrimaryPress: () => void
  ) => {
    const selectedReason = DELETION_REASONS.find((r) => r.id === selectedReasonId);
    return (
      <>
        {renderHeader(selectedReason?.text || title)}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6">{description}</p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={onPrimaryPress}
          className="w-full bg-black text-white font-bold text-base py-4 rounded-full mb-4 hover:bg-gray-800 transition-colors"
        >
          {primaryBtnText}
        </button>
        <button
          onClick={() => setView("finalConfirmation")}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          Continue account deletion
        </button>
      </div>
    </>
    );
  };

  const renderDataProtectionInfo = () => {
    const selectedReason = DELETION_REASONS.find((r) => r.id === selectedReasonId);
    return (
      <>
        {renderHeader(selectedReason?.text || "Data protection is important to us")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6 mb-10">
          Data protection is very important to us. We respect your privacy and treat your data with
          the utmost care. At the same time, we protect your images with technical security
          measures to prevent misuse. You can rest assured that your content will be treated
          securely and responsibly.
        </p>
        <div className="flex justify-center my-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-32 w-32 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => router.push(ROUTES.DATA_PROTECTION_SETTINGS)}
          className="w-full bg-black text-white font-bold text-base py-4 rounded-full mb-4 hover:bg-gray-800 transition-colors"
        >
          Customize data protection settings
        </button>
        <button
          onClick={() => setView("finalConfirmation")}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          Continue account deletion
        </button>
      </div>
    </>
    );
  };

  // Screen 1: I no longer use the app
  const renderNoLongerUse = () => (
    <>
      {renderHeader("We can help you!")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6">
          Are you having difficulties with the payment? Our customer service is ready to help you find a solution. Or would you like to know more about alternative payment methods? Simply contact us by e-mail at: {SUPPORT_EMAIL}
        </p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleSendEmail}
          className="w-full text-white font-bold text-base py-4 rounded-full mb-4 transition-colors"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Send us an Email
        </button>
        <button
          onClick={() => setView("finalConfirmation")}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          Continue account deletion
        </button>
      </div>
    </>
  );

  // Screen 2: I'm not satisfied with the generated images
  const renderFeedbackWithPhotos = () => (
    <>
      {renderHeader("")}
      <div className="px-4 py-5 pb-40">
        <p className="text-base text-gray-600 leading-6 mb-8">
          We are sorry that you are not satisfied with our service. Please let us know your feedback so that we can improve it. Maybe we can make it right.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 text-base min-h-[140px] focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          placeholder="Enter your message here ..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          disabled={!!loadingOperation}
        />
        <button
          onClick={handleAttachPhotos}
          disabled={!!loadingOperation}
          className="mx-auto block mt-5 mb-5 text-base font-medium text-black hover:underline"
        >
          Attach photos (optional)
        </button>
        {attachedPhotos.length > 0 && (
          <p className="text-sm text-gray-600 text-center mb-8">
            {attachedPhotos.length}/{MAX_PHOTOS} photo(s) attached.
          </p>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => requestDeletion(true)}
          disabled={!!loadingOperation}
          className="w-full text-white font-bold text-base py-4 rounded-full mb-4 transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {loadingOperation === "submit" ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              {loadingStep && <span className="text-sm">{loadingStep}</span>}
            </div>
          ) : (
            "Submit & delete account"
          )}
        </button>
        <button
          onClick={() => requestDeletion(false)}
          disabled={!!loadingOperation}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          No thanks, just delete
        </button>
      </div>
    </>
  );

  // Screen 3: Too many features require payment (Updated Premium Upsell)
  const renderPremiumUpsellUpdated = () => (
    <>
      {renderHeader("Why Premium Is Worth It")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6 mb-4">
          {APP_NAME} is more than just an app – it's the result of countless hours of development, testing, and fine-tuning. Behind every image is a complex AI system that requires constant maintenance, powerful servers, and ongoing improvements to deliver the best possible experience.
        </p>
        <p className="text-base font-semibold text-gray-800 mb-2">Premium helps cover the real costs:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li className="text-base text-gray-600">High server usage for fast, high-quality generation</li>
          <li className="text-base text-gray-600">Continuous development to improve styles and realism</li>
          <li className="text-base text-gray-600">Secure infrastructure to protect your data</li>
          <li className="text-base text-gray-600">Ongoing content updates, moderation, and support</li>
        </ul>
        <p className="text-base text-gray-600 leading-6">
          Your Premium subscription directly supports the work that goes into making {APP_NAME} better – every single day. Without it, this level of quality and creativity wouldn't be possible.
        </p>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => router.push(ROUTES.PREMIUM)}
          className="w-full text-white font-bold text-base py-4 rounded-full mb-4 transition-colors"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Try Premium
        </button>
        <button
          onClick={() => setView("finalConfirmation")}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          No thanks, just delete
        </button>
      </div>
    </>
  );

  // Screen 4: Data protection concerns (Updated)
  const renderDataProtectionUpdated = () => (
    <>
      {renderHeader("Data protection is important to us")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6 mb-10">
          Data protection is very important to us. We respect your privacy and treat your data with the utmost care. At the same time, we protect your images with technical security measures to prevent misuse. You can rest assured that your content will be treated securely and responsibly.
        </p>
        <div className="flex justify-center my-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-32 w-32 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => router.push(ROUTES.DATA_PROTECTION_SETTINGS)}
          className="w-full text-white font-bold text-base py-4 rounded-full mb-4 transition-colors"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Edit Data Protection settings
        </button>
        <button
          onClick={() => setView("finalConfirmation")}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors"
        >
          Continue account deletion
        </button>
      </div>
    </>
  );

  // Screen 5: I'm switching to a different app
  const renderFeedbackSwitching = () => (
    <>
      {renderHeader("Which tool do you use?")}
      <div className="px-4 py-5 pb-40">
        <p className="text-base text-gray-600 leading-6 mb-8">
          We want to understand what we can improve to enhance your experience.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 text-base min-h-[140px] focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          placeholder="Enter your message here ..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          disabled={!!loadingOperation}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => requestDeletion(true)}
          disabled={!!loadingOperation}
          className="w-full text-white font-bold text-base py-4 rounded-full mb-4 transition-colors disabled:opacity-50"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          {loadingOperation === "submit" ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              {loadingStep && <span className="text-sm">{loadingStep}</span>}
            </div>
          ) : (
            "Submit & delete account"
          )}
        </button>
        <button
          onClick={() => requestDeletion(false)}
          disabled={!!loadingOperation}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          No thanks, just delete
        </button>
      </div>
    </>
  );

  const renderFinalConfirmation = () => (
    <>
      {renderHeader("Do you really want to delete your account?")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6 mb-5">
          If you select "Delete my account", your access to your profile, your created pictures and
          your credit will be lost immediately. Your account will be deleted immediately and
          irrevocably.
        </p>
        <p className="text-base text-gray-600 leading-6 mb-10">
          Remember: You can always come back and create a new profile.
        </p>
        <div className="flex justify-center my-10">
          <div className="text-6xl">😢</div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={() => setView("reasonSelection")}
          className="w-full bg-black text-white font-bold text-base py-4 rounded-full mb-4 hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => requestDeletion(false)}
          disabled={!!loadingOperation}
          className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {loadingOperation ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-800"></div>
              {loadingStep && <span className="text-sm">{loadingStep}</span>}
            </div>
          ) : (
            "Delete my account"
          )}
        </button>
      </div>
    </>
  );

  const renderSuccessScreen = () => (
    <>
      {renderHeader("Your account has been successfully deleted")}
      <div className="px-4 py-5">
        <p className="text-base text-gray-600 leading-6 mb-10">
          We are very sorry that you are leaving us, but we respect your decision. Should you be
          interested in our service again in the future, please do not hesitate to contact us.
          Thank you for being part of our community. Share your feedback with us so that we can
          make the app the way you would like it to be.
        </p>
        <div className="flex justify-center my-10">
          <div className="text-6xl">😢</div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
        <button
          onClick={handleSendEmail}
          className="w-full bg-black text-white font-bold text-base py-4 rounded-full hover:bg-gray-800 transition-colors"
        >
          Share feedback
        </button>
      </div>
    </>
  );

  const renderCurrentView = () => {
    switch (view) {
      case "reasonSelection":
        return renderReasonSelection();
      case "noLongerUse":
        return renderNoLongerUse();
      case "feedbackWithPhotos":
        return renderFeedbackWithPhotos();
      case "feedbackSwitching":
        return renderFeedbackSwitching();
      case "premiumUpsell":
        return renderPremiumUpsellUpdated();
      case "dataProtection":
        return renderDataProtectionUpdated();
      case "feedback":
        return renderGenericFeedback();
      case "technicalHelp":
        return renderRetentionScreen(
          "We can help you!",
          `We're sorry to hear you're experiencing technical issues. Please let us know what went wrong – your feedback helps us improve. Don't let technical problems stop you. Our support team is ready to help and will respond as soon as possible.\n\nContact us via email at: ${SUPPORT_EMAIL}`,
          "Send us an Email",
          handleSendEmail
        );
      case "paymentHelp":
        return renderRetentionScreen(
          "We can help you!",
          `Are you having difficulties with the payment? Our customer service is ready to help you find a solution. Or would you like to know more about alternative payment methods? Simply contact us by e-mail at: ${SUPPORT_EMAIL}`,
          "Send us an Email",
          handleSendEmail
        );
      case "finalConfirmation":
        return renderFinalConfirmation();
      case "success":
        return renderSuccessScreen();
      default:
        return renderReasonSelection();
    }
  };

  if (showRequiresRecentLoginMessage) {
    return (
      <div className="min-h-screen bg-white text-black">
        {renderHeader("Action Required")}
        <div className="flex flex-col items-center justify-center px-8 py-12">
          <h2 className="text-2xl font-bold text-black mb-2">Re-authentication Required</h2>
          <p className="text-base text-gray-600 text-center leading-6">
            For security, please sign in again to delete your account. You will be redirected to
            the login page.
          </p>
        </div>
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-5 border-t border-gray-100 bg-white">
          <button
            onClick={handleProceedToLoginAfterError}
            disabled={!!loadingOperation}
            className="w-full bg-black text-white font-bold text-base py-4 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loadingOperation ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : (
              "OK, Go to Login"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {renderCurrentView()}

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmationModal}
        onClose={cancelDeletion}
        title="Confirm Account Deletion"
        maxWidth="sm"
      >
        <div className="text-center">
          <p className="text-base text-gray-600 mb-6">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={confirmDeletion}
              disabled={!!loadingOperation}
              className="w-full text-white font-bold text-base py-4 rounded-full transition-colors disabled:opacity-50"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {loadingOperation ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  {loadingStep && <span className="text-sm">{loadingStep}</span>}
                </div>
              ) : (
                "Yes, Delete My Account"
              )}
            </button>
            <button
              onClick={cancelDeletion}
              disabled={!!loadingOperation}
              className="w-full bg-gray-200 text-gray-800 font-bold text-base py-4 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
