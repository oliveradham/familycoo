import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type OcrKind = "receipt" | "medical" | "school";

const SCHEMAS: Record<OcrKind, { schema: object; hint: string }> = {
  receipt: {
    hint: "Extract merchant, total amount, currency, transaction date, and a suggested category from this receipt image.",
    schema: {
      type: "object",
      properties: {
        merchant: { type: "string" },
        amount: { type: "number" },
        currency: { type: "string" },
        date: { type: "string", description: "ISO date" },
        category: { type: "string" },
        notes: { type: "string" },
      },
      required: ["merchant", "amount"],
      additionalProperties: false,
    },
  },
  medical: {
    hint: "Extract provider, patient name, visit/document date, and a short summary from this medical letter or record.",
    schema: {
      type: "object",
      properties: {
        provider: { type: "string" },
        patient: { type: "string" },
        date: { type: "string" },
        summary: { type: "string" },
      },
      required: ["provider", "summary"],
      additionalProperties: false,
    },
  },
  school: {
    hint: "Extract the form/notice title, due date, and which child it concerns from this school document.",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        due_date: { type: "string" },
        child: { type: "string" },
        notes: { type: "string" },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },
};

export const ocrExtract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { kind: OcrKind; image_data_url: string }) => {
    if (!input?.kind || !SCHEMAS[input.kind]) throw new Error("Invalid kind");
    if (!input?.image_data_url?.startsWith("data:image/")) throw new Error("image_data_url required");
    return input;
  })
  .handler(async ({ data, context }) => {
    // OCR / document AI is a Pro+ feature.
    const { assertPaidTier } = await import("./entitlement.server");
    await assertPaidTier(context.userId, "pro");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
    const { schema, hint } = SCHEMAS[data.kind];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You extract structured data from document images. Return ONLY JSON matching the schema. Use empty strings when unsure — never invent." },
          {
            role: "user",
            content: [
              { type: "text", text: hint },
              { type: "image_url", image_url: { url: data.image_data_url } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: `${data.kind}_extract`, strict: true, schema },
        },
      }),
    });

    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits required.");
    if (!res.ok) throw new Error(`OCR failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  });
