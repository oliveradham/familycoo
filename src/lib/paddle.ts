import { resolvePaddlePrice } from "@/lib/payments.functions";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window {
    Paddle: any;
  }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;
let initializedForCustomer: string | null = null;

/**
 * Initialize Paddle.js. Pass `paddleCustomerId` (a `ctm_...` id, NOT an
 * email or internal user id) to enable Paddle Retain — Paddle re-inits
 * when the customer id changes so a fresh-signed-in user picks it up.
 */
export async function initializePaddle(paddleCustomerId?: string | null) {
  if (!clientToken) throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
  const wantsCustomer = paddleCustomerId ?? null;

  if (paddleInitialized && initializedForCustomer === wantsCustomer) return;

  const doInit = () => {
    const env = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
    window.Paddle.Environment.set(env);
    const initOptions: Record<string, unknown> = { token: clientToken };
    if (wantsCustomer && wantsCustomer.startsWith("ctm_")) {
      initOptions.pwCustomer = { id: wantsCustomer };
    }
    window.Paddle.Initialize(initOptions);
    paddleInitialized = true;
    initializedForCustomer = wantsCustomer;
  };

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://cdn.paddle.com/paddle/v2/paddle.js"]',
    );
    if (existing && window.Paddle) {
      doInit();
      return resolve();
    }
    const script = existing ?? document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      doInit();
      resolve();
    };
    script.onerror = reject;
    if (!existing) document.head.appendChild(script);
  });
}

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const environment = getPaddleEnvironment();
  return resolvePaddlePrice({ data: { priceId, environment } });
}
