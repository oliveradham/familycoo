export const LANES = [
  "needs_signature",
  "needs_payment",
  "needs_response",
  "needs_scheduling",
  "waiting",
  "upcoming_travel",
  "renewals",
  "fyi",
] as const;

export type InboxLane = (typeof LANES)[number];