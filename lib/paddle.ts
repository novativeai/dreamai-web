import { initializePaddle, Paddle } from "@paddle/paddle-js";

let paddleInstance: Paddle | null = null;

export async function initPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance;

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production" || "sandbox";

  if (!clientToken) {
    console.error("Paddle client token not found");
    return null;
  }

  try {
    paddleInstance = await initializePaddle({
      token: clientToken,
      environment,
      eventCallback: (event) => {
        console.log("Paddle event:", event);
      },
    });
    return paddleInstance;
  } catch (error) {
    console.error("Failed to initialize Paddle:", error);
    return null;
  }
}

export function getPaddle(): Paddle | null {
  return paddleInstance;
}
