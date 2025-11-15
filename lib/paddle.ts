import { initializePaddle, Paddle } from "@paddle/paddle-js";
import toast from "react-hot-toast";

let paddleInstance: Paddle | null = null;

// Store checkout context for event handling
interface CheckoutContext {
  type: 'credit' | 'subscription';
  onSuccess?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}

let checkoutContext: CheckoutContext | null = null;

export function setCheckoutContext(context: CheckoutContext) {
  checkoutContext = context;
}

export function clearCheckoutContext() {
  checkoutContext = null;
}

export async function initPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance;

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production" || "sandbox";

  if (!clientToken) {
    console.error("Paddle client token not found");
    return null;
  }

  try {
    paddleInstance = (await initializePaddle({
      token: clientToken,
      environment,
      eventCallback: (event) => {
        console.log("Paddle event:", event);

        // Handle checkout events globally
        switch (event.name) {
          case "checkout.completed":
            console.log("✅ Checkout completed:", event);

            // Show success message based on checkout type
            if (checkoutContext?.type === 'credit') {
              toast.success("Purchase successful! Credits added to your account.");
            } else if (checkoutContext?.type === 'subscription') {
              toast.success("Subscription successful! Welcome to Premium.");
            } else {
              toast.success("Payment successful!");
            }

            // Call success callback if provided
            if (checkoutContext?.onSuccess) {
              checkoutContext.onSuccess();
            }

            // Clear context after handling
            clearCheckoutContext();
            break;

          case "checkout.closed":
            console.log("Checkout closed by user");

            // Call close callback if provided
            if (checkoutContext?.onClose) {
              checkoutContext.onClose();
            }

            // Clear context
            clearCheckoutContext();
            break;

          case "checkout.error":
            console.error("❌ Checkout error:", event);
            toast.error("Something went wrong with the checkout. Please try again.");

            // Call error callback if provided
            if (checkoutContext?.onError) {
              checkoutContext.onError(event);
            }

            // Clear context
            clearCheckoutContext();
            break;

          default:
            // Log other events for debugging
            console.log(`Paddle event (${event.name}):`, event);
        }
      },
    })) || null;
    return paddleInstance;
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    return null;
  }
}

export function getPaddle(): Paddle | null {
  return paddleInstance;
}
