import { FirebaseError } from "firebase/app";

/**
 * Handle Firebase authentication errors and return user-friendly messages
 */
export function handleFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please try again.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before completing.";
      case "auth/cancelled-popup-request":
        return "Only one popup request is allowed at a time.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked by the browser.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later.";
      default:
        console.error("Firebase error:", error.code, error.message);
        return "An error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

/**
 * Log errors with context
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
  if (error instanceof Error) {
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("404")) {
      return "Service not found. Please try again later.";
    }
    if (error.message.includes("500")) {
      return "Server error. Please try again later.";
    }
    if (error.message.includes("Network Error")) {
      return "Network error. Please check your connection.";
    }
    return error.message;
  }
  return "An unexpected error occurred.";
}
