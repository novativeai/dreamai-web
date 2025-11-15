import { logEvent, setUserId, setUserProperties, Analytics } from "firebase/analytics";
import { analytics } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Analytics preference storage
const ANALYTICS_PREFERENCE_KEY = "dreamai_analytics_enabled";

// User analytics preferences interface
export interface AnalyticsPreferences {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  lastUpdated: Date;
}

/**
 * Get user's analytics consent from Firestore
 */
export async function getAnalyticsConsent(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Default to true if not set (opt-out model for existing users)
      return data.analyticsEnabled !== false;
    }
    return true; // Default enabled for new users
  } catch (error) {
    console.error("Error getting analytics consent:", error);
    return false;
  }
}

/**
 * Update user's analytics consent in Firestore
 */
export async function setAnalyticsConsent(userId: string, enabled: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      analyticsEnabled: enabled,
      analyticsConsentUpdated: new Date(),
    });

    // Store in localStorage for quick access
    if (typeof window !== "undefined") {
      localStorage.setItem(ANALYTICS_PREFERENCE_KEY, JSON.stringify(enabled));
    }

    console.log(`Analytics ${enabled ? "enabled" : "disabled"} for user ${userId}`);
  } catch (error) {
    console.error("Error updating analytics consent:", error);
    throw error;
  }
}

/**
 * Get crash reporting consent from Firestore
 */
export async function getCrashReportingConsent(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.crashReportingEnabled !== false;
    }
    return true;
  } catch (error) {
    console.error("Error getting crash reporting consent:", error);
    return false;
  }
}

/**
 * Update crash reporting consent in Firestore
 */
export async function setCrashReportingConsent(userId: string, enabled: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      crashReportingEnabled: enabled,
      crashReportingConsentUpdated: new Date(),
    });

    console.log(`Crash reporting ${enabled ? "enabled" : "disabled"} for user ${userId}`);
  } catch (error) {
    console.error("Error updating crash reporting consent:", error);
    throw error;
  }
}

/**
 * Initialize analytics for a user
 */
export async function initializeAnalyticsForUser(userId: string): Promise<void> {
  if (!analytics) {
    console.warn("Analytics not initialized");
    return;
  }

  try {
    const consentGranted = await getAnalyticsConsent(userId);

    if (consentGranted) {
      setUserId(analytics, userId);
      console.log("Analytics user ID set:", userId);
    } else {
      console.log("Analytics disabled by user preference");
    }
  } catch (error) {
    console.error("Error initializing analytics:", error);
  }
}

/**
 * Track a custom event (only if user has consented)
 */
export async function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>,
  userId?: string
): Promise<void> {
  if (!analytics) return;

  try {
    // Check consent if userId provided
    if (userId) {
      const consentGranted = await getAnalyticsConsent(userId);
      if (!consentGranted) {
        console.log(`Event ${eventName} not tracked - analytics disabled`);
        return;
      }
    }

    logEvent(analytics, eventName, eventParams);
    console.log(`Event tracked: ${eventName}`, eventParams);
  } catch (error) {
    console.error(`Error tracking event ${eventName}:`, error);
  }
}

/**
 * Set user properties
 */
export async function setAnalyticsUserProperties(
  userId: string,
  properties: Record<string, any>
): Promise<void> {
  if (!analytics) return;

  try {
    const consentGranted = await getAnalyticsConsent(userId);
    if (!consentGranted) return;

    setUserProperties(analytics, properties);
    console.log("User properties set:", properties);
  } catch (error) {
    console.error("Error setting user properties:", error);
  }
}

// =============================================================================
// INDUSTRY-STANDARD EVENT TRACKING FUNCTIONS
// =============================================================================

/**
 * Track user sign up
 */
export async function trackSignUp(method: string, userId: string): Promise<void> {
  await trackEvent("sign_up", { method }, userId);
}

/**
 * Track user login
 */
export async function trackLogin(method: string, userId: string): Promise<void> {
  await trackEvent("login", { method }, userId);
}

/**
 * Track image generation
 */
export async function trackImageGeneration(
  userId: string,
  styleKey: string,
  isPremium: boolean
): Promise<void> {
  await trackEvent("generate_image", {
    style: styleKey,
    user_type: isPremium ? "premium" : "free",
  }, userId);
}

/**
 * Track image download
 */
export async function trackImageDownload(userId: string): Promise<void> {
  await trackEvent("download_image", {}, userId);
}

/**
 * Track image share
 */
export async function trackImageShare(userId: string, method: string): Promise<void> {
  await trackEvent("share", { method, content_type: "image" }, userId);
}

/**
 * Track premium subscription purchase
 */
export async function trackPurchase(
  userId: string,
  transactionId: string,
  value: number,
  currency: string,
  items: Array<{ item_id: string; item_name: string; price: number }>
): Promise<void> {
  await trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency,
    items,
  }, userId);
}

/**
 * Track subscription start
 */
export async function trackSubscriptionStart(
  userId: string,
  planName: string,
  value: number,
  currency: string
): Promise<void> {
  await trackEvent("begin_checkout", {
    items: [{ item_name: planName }],
    value,
    currency,
  }, userId);
}

/**
 * Track credit purchase
 */
export async function trackCreditPurchase(
  userId: string,
  credits: number,
  value: number,
  currency: string
): Promise<void> {
  await trackEvent("purchase", {
    items: [{ item_name: `${credits} Credits`, quantity: credits }],
    value,
    currency,
  }, userId);
}

/**
 * Track page view
 */
export async function trackPageView(
  userId: string | undefined,
  pagePath: string,
  pageTitle: string
): Promise<void> {
  if (!userId) {
    // Anonymous page view tracking
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
    return;
  }

  await trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
  }, userId);
}

/**
 * Track settings change
 */
export async function trackSettingsChange(
  userId: string,
  settingName: string,
  settingValue: any
): Promise<void> {
  await trackEvent("settings_change", {
    setting_name: settingName,
    setting_value: String(settingValue),
  }, userId);
}

/**
 * Track account deletion
 */
export async function trackAccountDeletion(
  userId: string,
  reason: string
): Promise<void> {
  await trackEvent("account_deletion", {
    reason,
  }, userId);
}

/**
 * Track error occurrence
 */
export async function trackError(
  userId: string | undefined,
  errorName: string,
  errorMessage: string,
  errorStack?: string
): Promise<void> {
  // Only track if crash reporting is enabled
  if (userId) {
    const crashReportingEnabled = await getCrashReportingConsent(userId);
    if (!crashReportingEnabled) return;
  }

  if (analytics) {
    logEvent(analytics, "exception", {
      description: `${errorName}: ${errorMessage}`,
      fatal: false,
    });
  }
}

/**
 * Track search
 */
export async function trackSearch(
  userId: string,
  searchTerm: string
): Promise<void> {
  await trackEvent("search", {
    search_term: searchTerm,
  }, userId);
}

/**
 * Track consent given
 */
export async function trackConsentGiven(
  userId: string,
  consentType: string
): Promise<void> {
  await trackEvent("consent_given", {
    consent_type: consentType,
  }, userId);
}
