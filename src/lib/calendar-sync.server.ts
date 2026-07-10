// Google Calendar sync — pulls the next 30 days of events for each connected
// account and upserts them into `calendar_events` keyed by (household_id,
// source='google', external_id). Server-only.

import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptField, encryptField } from "./field-crypto.server";
import { refreshAccessToken } from "./google-oauth.server";

type Sb = SupabaseClient;

type CalendarIntegration = {
  id: string;
  user_id: string;
  household_id: string;
  provider: string;
  provider_account_email: string | null;
  access_token_ciphertext: string | null;
  refresh_token_ciphertext: string | null;
  token_expires_at: string | null;
  calendar_ids: string[];
};

/** Ensure we have a fresh access token; refresh if within 60s of expiry. */
async function ensureAccessToken(
  sb: Sb,
  integ: CalendarIntegration,
): Promise<string | null> {
  const refresh = await decryptField(integ.household_id, integ.refresh_token_ciphertext);
  const currentAccess = await decryptField(integ.household_id, integ.access_token_ciphertext);
  const exp = integ.token_expires_at ? new Date(integ.token_expires_at).getTime() : 0;
  const stillValid = currentAccess && exp > Date.now() + 60_000;
  if (stillValid) return currentAccess;
  if (!refresh) return null;

  const tok = await refreshAccessToken(refresh);
  const newAccessEnc = await encryptField(integ.household_id, tok.access_token);
  const newExpires = new Date(Date.now() + (tok.expires_in - 30) * 1000).toISOString();
  const newRefreshEnc = tok.refresh_token
    ? await encryptField(integ.household_id, tok.refresh_token)
    : integ.refresh_token_ciphertext;
  await sb
    .from("calendar_integrations")
    .update({
      access_token_ciphertext: newAccessEnc,
      refresh_token_ciphertext: newRefreshEnc,
      token_expires_at: newExpires,
    })
    .eq("id", integ.id);
  return tok.access_token;
}

type GEvent = {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

async function fetchCalendarList(accessToken: string): Promise<string[]> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Google calendarList ${res.status}`);
  const json = (await res.json()) as { items?: { id: string; primary?: boolean; selected?: boolean }[] };
  return (json.items ?? [])
    .filter((c) => c.primary || c.selected !== false)
    .map((c) => c.id);
}

async function fetchEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
): Promise<GEvent[]> {
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google events ${calendarId} ${res.status}`);
  const json = (await res.json()) as { items?: GEvent[] };
  return json.items ?? [];
}

/** Sync one integration. Returns count of upserted events. */
export async function syncIntegration(sb: Sb, integrationId: string): Promise<{ synced: number; error?: string }> {
  const { data: integ, error } = await sb
    .from("calendar_integrations")
    .select(
      "id, user_id, household_id, provider, provider_account_email, access_token_ciphertext, refresh_token_ciphertext, token_expires_at, calendar_ids",
    )
    .eq("id", integrationId)
    .maybeSingle();
  if (error || !integ) return { synced: 0, error: error?.message ?? "not found" };

  try {
    const accessToken = await ensureAccessToken(sb, integ as CalendarIntegration);
    if (!accessToken) throw new Error("No refresh token — reconnect required.");

    const calendars =
      integ.calendar_ids && integ.calendar_ids.length > 0
        ? integ.calendar_ids
        : await fetchCalendarList(accessToken);

    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 30 * 24 * 3600_000).toISOString();

    let synced = 0;
    for (const calId of calendars) {
      const events = await fetchEvents(accessToken, calId, timeMin, timeMax);
      const rows = events
        .filter((e) => e.status !== "cancelled")
        .map((e) => {
          const startsAt = e.start?.dateTime ?? (e.start?.date ? `${e.start.date}T00:00:00Z` : null);
          const endsAt = e.end?.dateTime ?? (e.end?.date ? `${e.end.date}T00:00:00Z` : null);
          if (!startsAt) return null;
          return {
            household_id: integ.household_id,
            title: (e.summary ?? "(no title)").slice(0, 200),
            location: e.location?.slice(0, 200) ?? null,
            starts_at: startsAt,
            ends_at: endsAt,
            source: "google",
            external_id: e.id,
            external_calendar_id: calId,
            synced_at: new Date().toISOString(),
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (rows.length === 0) continue;
      const { error: upErr } = await sb
        .from("calendar_events")
        .upsert(rows, { onConflict: "household_id,source,external_id" });
      if (upErr) throw new Error(upErr.message);
      synced += rows.length;
    }

    await sb
      .from("calendar_integrations")
      .update({
        last_synced_at: new Date().toISOString(),
        sync_status: "ok",
        last_error: null,
        calendar_ids: calendars,
      })
      .eq("id", integ.id);
    return { synced };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb
      .from("calendar_integrations")
      .update({ sync_status: "error", last_error: msg })
      .eq("id", integ.id);
    return { synced: 0, error: msg };
  }
}

/** Sync every integration in the system (called by cron). */
export async function syncAllIntegrations(sb: Sb): Promise<{
  results: { id: string; synced: number; error?: string }[];
}> {
  const { data: integrations } = await sb
    .from("calendar_integrations")
    .select("id")
    .eq("provider", "google");
  const results: { id: string; synced: number; error?: string }[] = [];
  for (const row of integrations ?? []) {
    results.push({ id: row.id, ...(await syncIntegration(sb, row.id)) });
  }
  return { results };
}
