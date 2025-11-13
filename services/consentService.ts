import { collection, addDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateImageHash, getUserIpAddress, getDeviceId } from "@/utils/consent";

const CONSENT_VERSION = "1.0";

export interface ConsentData {
  userId: string;
  imageHash: string;
  consentToProcessing: boolean;
  consentToResponsibility: boolean;
  consentTimestamp: ReturnType<typeof serverTimestamp>;
  consentVersion: string;
  ipAddress: string;
  deviceId: string;
}

/**
 * Save consent record to Firestore
 */
export async function saveConsentRecord(
  userId: string,
  imageFile: File,
  consentToProcessing: boolean,
  consentToResponsibility: boolean
): Promise<void> {
  try {
    // Calculate image hash
    const imageHash = await calculateImageHash(imageFile);

    // Get IP address
    const ipAddress = await getUserIpAddress();

    // Get device ID
    const deviceId = getDeviceId();

    // Create consent record
    const consentData: Omit<ConsentData, "consentTimestamp"> & { consentTimestamp: FieldValue } = {
      userId,
      imageHash,
      consentToProcessing,
      consentToResponsibility,
      consentTimestamp: serverTimestamp(),
      consentVersion: CONSENT_VERSION,
      ipAddress,
      deviceId,
    };

    // Save to Firestore
    await addDoc(collection(db, "consents"), consentData);
  } catch (error) {
    console.error("Error saving consent record:", error);
    throw new Error("Failed to save consent record");
  }
}
