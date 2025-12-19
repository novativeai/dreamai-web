import { collection, addDoc, serverTimestamp, FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface DeletionFeedback {
  userId: string;
  reasonId: string;
  reasonText: string;
  feedbackText?: string;
  photoUrls?: string[];
  timestamp: FieldValue;
}

/**
 * Upload a photo to R2 storage via API route
 */
export async function uploadFeedbackPhoto(
  file: File,
  userId: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);

  const response = await fetch('/api/upload-feedback-photo', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload photo');
  }

  const result = await response.json();
  return result.url;
}

/**
 * Submit deletion feedback to Firestore
 */
export async function submitDeletionFeedback(
  userId: string,
  reasonId: string,
  reasonText: string,
  feedbackText?: string,
  photoUrls?: string[]
): Promise<void> {
  try {
    const feedbackRef = collection(db, "feedback");

    const feedbackData: DeletionFeedback = {
      userId,
      reasonId,
      reasonText,
      feedbackText: feedbackText || "",
      photoUrls: photoUrls || [],
      timestamp: serverTimestamp(),
    };

    await addDoc(feedbackRef, feedbackData);
    console.log("Deletion feedback submitted successfully");
  } catch (error) {
    console.error("Error submitting deletion feedback:", error);
    throw error;
  }
}
