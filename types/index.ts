/**
 * Type definitions for DreamAI Next.js app
 */

// User types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  credits: number;
  isPremium: boolean;
  premium_status: "active" | "paused" | null;
  subscription_id: string | null;
  subscription_status: string | null;
  paddle_customer_id: string | null;
  ageVerified: boolean;
  termsAccepted: boolean;
  emailVerified: boolean;
  hasSeenGeneratorTips: boolean;
  hasSeenFirstTimePopup: boolean;
  dateOfBirth: string | null;
  ageVerifiedAt: Date | null;
  termsAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Style options for image generation
export interface StyleOption {
  key: string;
  title: string;
  prompt: string;
  isPremium?: boolean;
}

export interface StyleCategory {
  label: string;
  options: StyleOption[];
}

// Paddle types
export interface PaddleProduct {
  id: string;
  name: string;
  description: string;
  price: {
    amount: string;
    currency: string;
  };
  priceId: string;
  credits?: number;
  isPremium?: boolean;
}

export interface PaddleCheckoutOptions {
  priceId: string;
  userId: string;
  customData?: Record<string, unknown>;
}

// API types
export interface GenerateImageRequest {
  image: File;
  style: string;
  userId: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  credits: number;
}

// Paddle subscription types (matching Expo)
export interface PaddleSubscription {
  id: string;
  name: string;
  productName?: string;  // The Stripe product name for filtering
  description: string;
  price: string;
  interval?: string;
  isRecommended?: boolean;
}

export interface PaddleCreditPackage {
  id: string;
  name: string;
  credits: number;
  price: string;
  isPopular?: boolean;
}

// Credit context types
// Note: Credit deduction is handled by backend only - frontend cannot modify credits
export interface CreditContextValue {
  credits: number;
  isPremium: boolean;
  premiumStatus: "active" | "paused" | null;
  subscriptionId: string | null;
  subscriptionPriceId: string | null;
  subscriptions: PaddleSubscription[];
  creditPackages: PaddleCreditPackage[];
  isLoading: boolean;
  refreshCredits: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

// Deletion flow types
export type DeletionFlowView =
  | "reasonSelection"
  | "feedback"
  | "technicalHelp"
  | "paymentHelp"
  | "dataProtection"
  | "premiumUpsell"
  | "finalConfirmation"
  | "success"
  | "noLongerUse"
  | "feedbackWithPhotos"
  | "feedbackSwitching";

export interface DeletionReason {
  key: string;
  label: string;
  nextView: DeletionFlowView;
}

// Legal document types
export type LegalDocSlug = "agb" | "privacy" | "cookie-policy" | "data-protection-settings";

export interface LegalDocument {
  slug: LegalDocSlug;
  title: string;
  content: string;
}
