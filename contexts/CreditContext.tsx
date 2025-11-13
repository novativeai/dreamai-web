"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, increment as firestoreIncrement } from "firebase/firestore";
import { User } from "firebase/auth";
import { CreditContextValue, PaddleSubscription, PaddleCreditPackage } from "@/types";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dreamai-production.up.railway.app";

const CreditContext = createContext<CreditContextValue | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumStatus, setPremiumStatus] = useState<"active" | "paused" | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<PaddleSubscription[]>([]);
  const [creditPackages, setCreditPackages] = useState<PaddleCreditPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      console.log("[CreditContext] Fetching products from", `${API_BASE_URL}/products`);

      const response = await fetch(`${API_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`Failed to fetch products: HTTP ${response.status} ${response.statusText}`);
      }

      const { success, data } = await response.json();

      if (!success || !data || !Array.isArray(data)) {
        throw new Error("Invalid response format from server");
      }

      const fetchedSubs: PaddleSubscription[] = [];
      const fetchedCredits: PaddleCreditPackage[] = [];

      // Type-safe item processing
      interface PaddleItem {
        type: string;
        id: string;
        name: string;
        description?: string;
        price: string;
        interval?: string;
        isRecommended?: boolean;
        credits?: number;
        isPopular?: boolean;
      }

      data.forEach((item: PaddleItem) => {
        if (item.type === "subscription") {
          // Handle interval - convert to string if it's an object
          let intervalStr: string | undefined;
          if (item.interval) {
            if (typeof item.interval === 'string') {
              intervalStr = item.interval;
            } else if (typeof item.interval === 'object' && 'name' in item.interval) {
              intervalStr = (item.interval as any).name;
            }
          }

          fetchedSubs.push({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: item.price,
            interval: intervalStr,
            isRecommended: item.isRecommended || false,
          });
        } else if (item.type === "credits") {
          fetchedCredits.push({
            id: item.id,
            name: item.name,
            credits: item.credits || 0,
            price: item.price,
            isPopular: item.isPopular || false,
          });
        }
      });

      setSubscriptions(fetchedSubs);
      setCreditPackages(fetchedCredits);

      console.log(
        `[CreditContext] Loaded ${fetchedSubs.length} subscriptions and ${fetchedCredits.length} credit packages`
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("[CreditContext] Failed to fetch products:", errorMessage);
      toast.error("Failed to load pricing. Please check your connection and try again.");
    }
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Reset state when user logs out
        setCredits(0);
        setIsPremium(false);
        setPremiumStatus(null);
        setSubscriptionId(null);
        setIsLoading(false);
        // Still fetch products for non-authenticated users
        fetchProducts();
      }
    });

    return () => unsubscribe();
  }, [fetchProducts]);

  // Subscribe to user document changes in Firestore
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCredits(data.credits || 0);
          setIsPremium(data.isPremium || false);
          setPremiumStatus(data.premium_status || null);
          setSubscriptionId(data.subscription_id || null);
        } else {
          // Document doesn't exist yet
          setCredits(0);
          setIsPremium(false);
          setPremiumStatus(null);
          setSubscriptionId(null);
        }
        setIsLoading(false);

        // Fetch products after user data is loaded
        fetchProducts();
      },
      (error) => {
        console.error("[CreditContext] Error listening to user document:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, fetchProducts]);

  const refreshCredits = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setCredits(data.credits || 0);
          setIsPremium(data.isPremium || false);
          setPremiumStatus(data.premium_status || null);
          setSubscriptionId(data.subscription_id || null);
        }
      });
    } catch (error) {
      console.error("Error refreshing credits:", error);
    }
  }, [user]);

  const decrementCredits = useCallback(
    async (amount: number = 1) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          credits: firestoreIncrement(-amount),
        });

        // Optimistically update local state
        setCredits((prev) => Math.max(0, prev - amount));
      } catch (error) {
        console.error("Error decrementing credits:", error);
        throw error;
      }
    },
    [user]
  );

  const value: CreditContextValue = {
    credits,
    isPremium,
    premiumStatus,
    subscriptionId,
    subscriptions,
    creditPackages,
    isLoading,
    refreshCredits,
    decrementCredits,
    refreshProducts: fetchProducts,
  };

  return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>;
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
