import axios from "axios";
import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dreamai-production.up.railway.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for image generation
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get Firebase ID token for authenticated requests.
 * Throws error if user is not authenticated.
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated. Please sign in.");
  }
  return user.getIdToken();
}

/**
 * Generate a unique device fingerprint for trial abuse prevention.
 * Uses browser properties to create a stable identifier.
 * Stored in localStorage for persistence across sessions.
 */
export function getDeviceId(): string {
  const DEVICE_ID_KEY = 'dreamai_device_id';

  // Check if we already have a device ID stored
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedId = localStorage.getItem(DEVICE_ID_KEY);
    if (storedId) {
      return storedId;
    }
  }

  // Generate a new device fingerprint
  const components: string[] = [];

  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    // Browser and platform info
    components.push(navigator.userAgent || '');
    components.push(navigator.language || '');
    components.push(String(navigator.hardwareConcurrency || ''));
    components.push(String(screen?.width || '') + 'x' + String(screen?.height || ''));
    components.push(String(screen?.colorDepth || ''));
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');

    // Canvas fingerprint (simple version)
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('DreamAI', 2, 2);
        components.push(canvas.toDataURL().slice(-50));
      }
    } catch {
      // Canvas fingerprinting blocked
    }
  }

  // Create hash from components
  const fingerprint = components.join('|');
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Add random component for uniqueness and convert to string
  const deviceId = 'dev_' + Math.abs(hash).toString(36) + '_' + Math.random().toString(36).substring(2, 8);

  // Store for future use
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch {
      // localStorage might be blocked
    }
  }

  return deviceId;
}

/**
 * Generate an AI image with the backend.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const generateImage = async (formData: FormData): Promise<Blob> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/generate/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.blob();
};

/**
 * Fetch available products from backend.
 * No authentication required (public endpoint).
 */
export const fetchProducts = async () => {
  const response = await apiClient.get("/products");
  return response.data;
};

/**
 * Error response for trial not available.
 */
export interface TrialBlockedError {
  message: string;
  code: 'TRIAL_NOT_AVAILABLE';
  reason: 'device' | 'email';
}

/**
 * Create a Paddle checkout session.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 * Includes deviceId for trial abuse prevention.
 */
export const createCheckout = async (priceId: string) => {
  const token = await getAuthToken();
  const deviceId = getDeviceId();

  try {
    const response = await apiClient.post(
      "/create-checkout",
      { priceId, deviceId },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    // Extract trial blocked error details from FastAPI HTTPException
    interface AxiosErrorResponse {
      response?: {
        status?: number;
        data?: {
          detail?: {
            code?: string;
            reason?: string;
            message?: string;
          } | string;
        };
      };
    }
    const axiosError = error as AxiosErrorResponse;

    // Check for 403 Forbidden (trial blocked)
    if (axiosError.response?.status === 403) {
      const detail = axiosError.response.data?.detail;

      // FastAPI returns { detail: { code, reason, message } } for trial blocked
      if (typeof detail === 'object' && detail && detail.code === 'TRIAL_NOT_AVAILABLE') {
        const trialError = new Error(detail.message || 'Trial not available') as Error & { code: string; reason: string };
        trialError.code = detail.code;
        trialError.reason = detail.reason || 'unknown';
        throw trialError;
      }

      // Handle string error message
      if (typeof detail === 'string') {
        throw new Error(detail);
      }
    }

    throw error;
  }
};

/**
 * Create a Paddle customer portal link.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const createCustomerPortal = async () => {
  const token = await getAuthToken();

  const response = await apiClient.post(
    "/create-customer-portal",
    {},
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Cancel user's subscription.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const cancelSubscription = async () => {
  const token = await getAuthToken();

  try {
    const response = await apiClient.post(
      "/cancel-subscription",
      {},
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    // Re-throw with response data if available for better error messages
    const axiosError = error as { response?: { data?: unknown }; message?: string };
    if (axiosError.response?.data) {
      throw { ...axiosError, responseData: axiosError.response.data };
    }
    throw error;
  }
};

/**
 * Get user's subscription status.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const getSubscriptionStatus = async () => {
  const token = await getAuthToken();

  const response = await apiClient.get("/subscription-status", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Archive user data before account deletion.
 * Saves credits and trial status for potential restoration.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const archiveDeletedUser = async () => {
  const token = await getAuthToken();

  const response = await apiClient.post(
    "/archive-deleted-user",
    {},
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Check if user has a deleted account with credits to restore.
 * Called after account creation to restore previous credits.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const checkDeletedAccount = async () => {
  const token = await getAuthToken();

  const response = await apiClient.post(
    "/check-deleted-account",
    {},
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Register device ID with the current user.
 * Called on login/app launch for trial abuse prevention.
 * Returns whether this device/email is blocked from trials.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const registerDevice = async (): Promise<{
  success: boolean;
  deviceId: string;
  trialBlocked: boolean;
  blockReason: 'device' | 'email' | null;
}> => {
  const token = await getAuthToken();
  const deviceId = getDeviceId();

  const response = await apiClient.post(
    "/register-device",
    { deviceId },
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default apiClient;
