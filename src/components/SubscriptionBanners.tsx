import { useSubscription } from "@/hooks/useSubscription";
import { useServerFn } from "@tanstack/react-start";
import { createBillingPortalSession } from "@/lib/billing.functions";
import { AlertTriangle, Clock } from "lucide-react";
import { useState } from "react";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function SubscriptionBanners() {
  const { isTrialing, isPastDue, trialEndsAt } = useSubscription();
  const openPortal = useServerFn(createBillingPortalSession);
  const [busy, setBusy] = useState(false);

  async function handleUpdatePayment() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await openPortal();
      const first = res.subscriptionUrls?.[0] as { updatePaymentMethod?: string; update_payment_method?: string; cancel?: string } | undefined;
      const url = first?.updatePaymentMethod ?? first?.update_payment_method ?? res.overviewUrl;
      if (url) window.open(url, "_blank", "noopener");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  if (isPastDue) {
    return (
      <div className="w-full bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-[13px] text-red-900">
        <div className="mx-auto flex max-w-[520px] items-center justify-center gap-2">
          <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2} />
          <span>Payment failed. We're retrying — update your card to keep access.</span>
          <button
            onClick={handleUpdatePayment}
            disabled={busy}
            className="ml-1 underline underline-offset-2 font-medium disabled:opacity-60"
          >
            Update
          </button>
        </div>
      </div>
    );
  }

  if (isTrialing) {
    const days = daysUntil(trialEndsAt);
    return (
      <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-[12px] text-amber-900">
        <div className="mx-auto flex max-w-[520px] items-center justify-center gap-2">
          <Clock className="size-3.5 shrink-0" strokeWidth={2} />
          <span>
            {days === 0
              ? "Trial ends today."
              : `Trial ends in ${days} day${days === 1 ? "" : "s"}.`}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
