import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
import { supabase } from "@/integrations/supabase/client";

async function lookupPaddleCustomerId(userId?: string): Promise<string | null> {
  if (!userId) return null;
  const { data } = await supabase
    .from("subscriptions")
    .select("paddle_customer_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const id = data?.paddle_customer_id;
  return typeof id === "string" && id.startsWith("ctm_") ? id : null;
}

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    priceId: string;
    userId?: string;
    customerEmail?: string;
    successUrl?: string;
  }) => {
    setLoading(true);
    try {
      // Pass Paddle customer id to Init so Paddle Retain can attach.
      const paddleCustomerId = await lookupPaddleCustomerId(options.userId);
      await initializePaddle(paddleCustomerId);
      const paddlePriceId = await getPaddlePriceId(options.priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: options.customerEmail ? { email: options.customerEmail } : undefined,
        customData: options.userId ? { userId: options.userId } : undefined,
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/checkout/success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
