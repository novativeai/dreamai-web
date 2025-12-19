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
 * Send feedback email via API route
 */
async function sendFeedbackEmail(
  userId: string,
  reasonText: string,
  feedbackText: string,
  photoUrls: string[]
): Promise<void> {
  const response = await fetch('/api/send-feedback-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      reasonText,
      feedbackText,
      photoUrls,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send feedback email');
  }
}

/**
 * Submit deletion feedback to Firestore and send email notification
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

    // Submit to Firestore and send email in parallel
    await Promise.all([
      addDoc(feedbackRef, feedbackData),
      sendFeedbackEmail(
        userId,
        reasonText,
        feedbackText || "",
        photoUrls || []
      ).catch((err) => {
        // Don't fail the whole operation if email fails
        console.error("Failed to send feedback email:", err);
      }),
    ]);

    console.log("Deletion feedback submitted successfully");
  } catch (error) {
    console.error("Error submitting deletion feedback:", error);
    throw error;
  }
}
