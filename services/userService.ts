import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { User } from "firebase/auth";
import { UserProfile } from "@/types";
import { checkDeletedAccount } from "@/lib/api";

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
      // Create new user profile
      const newProfile: Partial<UserProfile> = {
        uid: userId,
        email,
        displayName: displayName || null,
        credits: 5, // Free credits for new users
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

      // Check if this user previously had an account and restore their credits/trial status
      try {
        const restorationResult = await checkDeletedAccount();
        if (restorationResult.restored) {
          console.log("Previous account data restored:", restorationResult);
        }
      } catch (restoreError) {
        // Don't fail profile creation if restoration fails
        console.error("Error checking for deleted account:", restoreError);
      }

      return newProfile;
    } else {
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
 */
export async function updateAgeVerification(userId: string, verified: boolean, dateOfBirth: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // If user document doesn't exist, create it first
    if (!userSnap.exists()) {
      const user = auth.currentUser;
      await setDoc(userRef, {
        uid: userId,
        email: user?.email || null,
        displayName: user?.displayName || null,
        credits: 5, // Free credits for new users
        isPremium: false,
        premium_status: null,
        subscription_id: null,
        subscription_status: null,
        paddle_customer_id: null,
        ageVerified: verified,
        termsAccepted: false,
        dateOfBirth,
        ageVerifiedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
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
    }
  } catch (error) {
    console.error("Error updating age verification:", error);
    throw error;
  }
}

/**
 * Update user's terms acceptance status
 */
export async function updateTermsAcceptance(userId: string, accepted: boolean): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    // If user document doesn't exist, create it first
    if (!userSnap.exists()) {
      const user = auth.currentUser;
      await setDoc(userRef, {
        uid: userId,
        email: user?.email || null,
        displayName: user?.displayName || null,
        credits: 5, // Free credits for new users
        isPremium: false,
        premium_status: null,
        subscription_id: null,
        subscription_status: null,
        paddle_customer_id: null,
        ageVerified: false,
        termsAccepted: accepted,
        termsAcceptedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
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
    }
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
