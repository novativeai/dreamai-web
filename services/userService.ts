import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { UserProfile } from "@/types";
import { checkDeletedAccount, registerDevice } from "@/lib/api";
import toast from "react-hot-toast";

export interface UserVerificationStatus {
  ageVerified: boolean;
  termsAccepted: boolean;
  emailVerified: boolean;
  hasSeenGeneratorTips: boolean;
  hasSeenFirstTimePopup: boolean;
  dateOfBirth: string | null;
}

/**
 * Get user's verification status from Firestore
 */
export async function getUserVerificationStatus(userId: string): Promise<UserVerificationStatus> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        ageVerified: false,
        termsAccepted: false,
        emailVerified: false,
        hasSeenGeneratorTips: false,
        hasSeenFirstTimePopup: false,
        dateOfBirth: null,
      };
    }

    const data = userSnap.data();
    return {
      ageVerified: data.ageVerified || false,
      termsAccepted: data.termsAccepted || false,
      emailVerified: data.emailVerified || false,
      hasSeenGeneratorTips: data.hasSeenGeneratorTips || false,
      hasSeenFirstTimePopup: data.hasSeenFirstTimePopup || false,
      dateOfBirth: data.dateOfBirth || null,
    };
  } catch (error) {
    console.error("Error fetching user verification status:", error);
    throw error;
  }
}

/**
 * Determine the next route for user based on their verification status
 */
export function getNextRoute(user: User | null, verificationStatus: UserVerificationStatus): string {
  if (!user) {
    return "login";
  }

  const isEmailPasswordUser = user.providerData.some((p) => p.providerId === "password");

  // If email/password user and email not verified, go to login
  if (isEmailPasswordUser && !user.emailVerified) {
    return "login";
  }

  // Check verification flow
  if (!verificationStatus.ageVerified) {
    return "age";
  }

  if (!verificationStatus.termsAccepted) {
    return "terms-service";
  }

  // All verified, go to main app
  return "generator";
}

/**
 * Create or update user profile in Firestore
 */
export async function createUserProfile(userId: string, email: string, displayName?: string | null) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user profile with 5 free credits
      // If user had a previous account, restoration will SET (not add) their archived credits
      const newProfile: Partial<UserProfile> = {
        uid: userId,
        email,
        displayName: displayName || null,
        credits: 5, // Default 5 free credits for new users
        isPremium: false,
        premium_status: null,
        subscription_id: null,
        subscription_status: null,
        paddle_customer_id: null,
        ageVerified: false,
        termsAccepted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(userRef, newProfile);

      // Register device for trial abuse prevention
      try {
        const deviceResult = await registerDevice();
        console.log("Device registered:", deviceResult);
      } catch (deviceError) {
        // Don't fail profile creation if device registration fails
        console.error("Error registering device:", deviceError);
      }

      // Check if this user previously had an account and restore their credits/trial status
      // IMPORTANT: Restoration uses SET (not increment) to prevent credit exploitation
      try {
        const restorationResult = await checkDeletedAccount();
        if (restorationResult.found && restorationResult.restored) {
          console.log("Previous account data restored:", restorationResult);
        }
      } catch (restoreError) {
        // Don't fail profile creation if restoration fails, but warn user
        console.error("Error checking for deleted account:", restoreError);
        // Only show warning if this might be a returning user (network error, etc.)
        toast.error("Could not check for previous account data. If you had credits before, please contact support.", {
          duration: 6000,
        });
      }

      return newProfile;
    } else {
      // Existing user - still register device for trial prevention
      try {
        await registerDevice();
      } catch (deviceError) {
        console.error("Error registering device for existing user:", deviceError);
      }

      // Update existing profile
      await updateDoc(userRef, {
        updatedAt: new Date(),
      });
      return userSnap.data();
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    throw error;
  }
}

/**
 * Update user's age verification status
 * SECURITY: Profile must already exist - this prevents credit bypass exploits
 */
export async function updateAgeVerification(userId: string, verified: boolean, dateOfBirth: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // SECURITY: Profile must exist before age verification
    // This prevents bypassing the proper profile creation flow that handles credits
    if (!userSnap.exists()) {
      throw new Error("User profile must exist before age verification. Please refresh and try again.");
    }

    // Update existing document
    await setDoc(
      userRef,
      {
        ageVerified: verified,
        dateOfBirth,
        ageVerifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating age verification:", error);
    throw error;
  }
}

/**
 * Update user's terms acceptance status
 * SECURITY: Profile must already exist - this prevents credit bypass exploits
 */
export async function updateTermsAcceptance(userId: string, accepted: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // SECURITY: Profile must exist before terms acceptance
    // This prevents bypassing the proper profile creation flow that handles credits
    if (!userSnap.exists()) {
      throw new Error("User profile must exist before accepting terms. Please refresh and try again.");
    }

    // Update existing document
    await setDoc(
      userRef,
      {
        termsAccepted: accepted,
        termsAcceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating terms acceptance:", error);
    throw error;
  }
}

/**
 * Update generator tips seen status
 */
export async function updateGeneratorTipsSeen(userId: string, seen: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        hasSeenGeneratorTips: seen,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating generator tips status:", error);
    throw error;
  }
}

/**
 * Update first-time popup seen status
 */
export async function updateFirstTimePopupSeen(userId: string, seen: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        hasSeenFirstTimePopup: seen,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating first-time popup status:", error);
    throw error;
  }
}

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return 0;
    }

    return userSnap.data().credits || 0;
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return 0;
  }
}

/**
 * Delete user account and all associated data
 */
export async function deleteUserAccount(userId: string) {
  try {
    // Delete user document from Firestore
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);

    // Delete user from Firebase Auth
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await currentUser.delete();
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
}
