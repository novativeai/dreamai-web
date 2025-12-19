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
 * Create a Paddle checkout session.
 * AUTHENTICATION REQUIRED: Sends Firebase ID token in Authorization header.
 */
export const createCheckout = async (priceId: string) => {
  const token = await getAuthToken();

  const response = await apiClient.post(
    "/create-checkout",
    { priceId },
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  return response.data;
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
 * No authentication required (uses userId in path).
 */
export const getSubscriptionStatus = async (userId: string) => {
  const response = await apiClient.get(`/subscription-status/${userId}`);
  return response.data;
};

export default apiClient;
