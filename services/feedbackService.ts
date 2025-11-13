import { collection, addDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DeletionFeedback {
  userId: string;
  reasonId: string;
  reasonText: string;
  feedbackText?: string;
  timestamp: FieldValue;
}

/**
 * Submit deletion feedback to Firestore
 * Note: Photos are not uploaded to storage yet as it's not enabled
 */
export async function submitDeletionFeedback(
  userId: string,
  reasonId: string,
  reasonText: string,
  feedbackText?: string
): Promise<void> {
  try {
    const feedbackRef = collection(db, "feedback");

    const feedbackData: DeletionFeedback = {
      userId,
      reasonId,
      reasonText,
      feedbackText: feedbackText || "",
      timestamp: serverTimestamp(),
    };

    await addDoc(feedbackRef, feedbackData);
    console.log("Deletion feedback submitted successfully");
  } catch (error) {
    console.error("Error submitting deletion feedback:", error);
    throw error;
  }
}
