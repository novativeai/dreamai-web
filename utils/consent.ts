/**
 * Calculate SHA256 hash of a file
 */
export async function calculateImageHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Fetch user's IP address
 */
export async function getUserIpAddress(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip || "not_available";
  } catch (error) {
    console.warn("Failed to fetch IP address:", error);
    return "not_available";
  }
}

/**
 * Get or create device ID for browser
 * Uses localStorage to persist device ID across sessions
 */
export function getDeviceId(): string {
  const STORAGE_KEY = "dreamai_device_id";

  // Try to get existing device ID
  if (typeof window !== "undefined") {
    const existingId = localStorage.getItem(STORAGE_KEY);
    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const newId = `web_${generateUUID()}`;
    localStorage.setItem(STORAGE_KEY, newId);
    return newId;
  }

  return "unknown_device_id";
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
