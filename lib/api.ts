import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dreamai-production.up.railway.app";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for image generation
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Generate an AI image with the backend
 */
export const generateImage = async (formData: FormData): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/generate/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.blob();
};

/**
 * Fetch available products from backend
 */
export const fetchProducts = async () => {
  const response = await apiClient.get("/products");
  return response.data;
};

/**
 * Create a Paddle checkout session
 */
export const createCheckout = async (priceId: string, userId: string) => {
  const response = await apiClient.post("/create-checkout", {
    priceId,
    userId,
  });
  return response.data;
};

/**
 * Get user's subscription status
 */
export const getSubscriptionStatus = async (userId: string) => {
  const response = await apiClient.get(`/subscription-status/${userId}`);
  return response.data;
};

export default apiClient;
