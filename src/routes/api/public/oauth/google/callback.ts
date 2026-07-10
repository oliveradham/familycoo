import { createFileRoute } from "@tanstack/react-router";

/**
 * Google OAuth callback. Verifies signed `state`, exchanges the code, encrypts
 * the tokens with the household's field key, and stores them in
 * `calendar_integrations`. Kicks off an initial sync in the background.
 */
export const Route = createFileRoute("/api/public/oauth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        const bounce = (msg: string) =>
          new Response(null, {
            status: 302,
            headers: {
              Location: `/integrations?connect=${encodeURIComponent(msg)}`,
            },
          });

        if (errorParam) return bounce(`google_denied:${errorParam}`);
        if (!code || !state) return bounce("missing_code_or_state");

        const { verifyState, exchangeCode, emailFromIdToken } = await import(
          "@/lib/google-oauth.server"
        );
        const payload = await verifyState(state);
        if (!payload) return bounce("invalid_state");

        let tok;
        try {
          tok = await exchangeCode(code, url.origin);
        } catch (e) {
          return bounce(`token_exchange_failed:${e instanceof Error ? e.message : "unknown"}`);
        }

        const { encryptField } = await import("@/lib/field-crypto.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const accessEnc = await encryptField(payload.household_id, tok.access_token);
        const refreshEnc = tok.refresh_token
          ? await encryptField(payload.household_id, tok.refresh_token)
          : null;
        const expires = new Date(Date.now() + (tok.expires_in - 30) * 1000).toISOString();
        const email = emailFromIdToken(tok.id_token);

        const query = supabaseAdmin
          .from("calendar_integrations")
          .select("id, refresh_token_ciphertext")
          .eq("user_id", payload.user_id)
          .eq("provider", "google");
        const { data: existing } = await (email
          ? query.eq("provider_account_email", email)
          : query.is("provider_account_email", null)
        ).maybeSingle();

        if (existing) {
          await supabaseAdmin
            .from("calendar_integrations")
            .update({
              access_token_ciphertext: accessEnc,
              refresh_token_ciphertext: refreshEnc ?? existing.refresh_token_ciphertext,
              token_expires_at: expires,
              scopes: tok.scope ?? null,
              sync_status: "pending",
              last_error: null,
            })
            .eq("id", existing.id);
        } else {
          await supabaseAdmin.from("calendar_integrations").insert({
            user_id: payload.user_id,
            household_id: payload.household_id,
            provider: "google",
            provider_account_email: email,
            access_token_ciphertext: accessEnc,
            refresh_token_ciphertext: refreshEnc,
            token_expires_at: expires,
            scopes: tok.scope ?? null,
            sync_status: "pending",
          });
        }

        // Fire-and-forget initial sync; failures land in sync_status/last_error.
        (async () => {
          try {
            const q2 = supabaseAdmin
              .from("calendar_integrations")
              .select("id")
              .eq("user_id", payload.user_id)
              .eq("provider", "google");
            const { data: row } = await (email
              ? q2.eq("provider_account_email", email)
              : q2.is("provider_account_email", null)
            ).maybeSingle();
            if (row) {
              const { syncIntegration } = await import("@/lib/calendar-sync.server");
              await syncIntegration(supabaseAdmin, row.id);
            }
          } catch {
            // logged via sync_status
          }
        })();

        return new Response(null, {
          status: 302,
          headers: { Location: "/integrations?connect=ok" },
        });
      },
    },
  },
});
