# Phase H — External Integrations

Bring the outside world into the COO. Until now the household lives inside our DB. Phase H lets real-life events flow in (calendars, inboxes) and lets the COO reach out (SMS/email nudges), so briefings and agents work off ground truth instead of only what's typed in.

## 1. Google Calendar (read-only sync, per user)

- Per-user OAuth (not a workspace connector — each family member connects their own Google account).
- New table `calendar_integrations`: `user_id, provider, access_token (encrypted), refresh_token (encrypted), expires_at, calendar_ids[], last_synced_at, sync_status`.
- Server fn `connectGoogleCalendar()` starts OAuth; callback route `/api/public/oauth/google/callback` exchanges the code and stores tokens using our existing field-crypto.
- Sync worker (`src/lib/calendar-sync.server.ts`): pulls next 30 days of events, upserts into `calendar_events` with `source='google'` and `external_id` (new columns) so we don't duplicate.
- Cron `/api/public/hooks/sync-calendars` every 30 min.
- Conflict Detector and Prep agents now see real work meetings → useful nudges immediately.
- Settings → new "Connected accounts" section with connect/disconnect + last-synced timestamp.

## 2. Inbound email → Inbox (forwarding address)

- Each household gets a stable forward address like `h-<short_id>@in.familycoo.app` (stored on `households.inbound_email`).
- Public route `/api/public/hooks/inbound-email` accepts a Postmark / SendGrid Inbound webhook (whichever the user prefers — we'll pick Postmark by default; needs one API key + inbound domain the user configures).
- Handler verifies signature, redacts, runs Gemini classifier ("school notice / bill / appointment / receipt / other"), and inserts into `inbox_items` with the parsed structure. Attachments go into the `vault` bucket.
- User forwards school emails, bills, invites — they appear in Inbox with a suggested approval (RSVP, add to grocery, schedule maintenance).

## 3. Outbound SMS nudges (opt-in, quiet-hours-aware)

- Use existing GatewayAPI connector (already documented in knowledge) — user links a connection.
- New table `phone_numbers`: `user_id, e164, verified_at, sms_opt_in`. Verification via 6-digit code.
- `src/lib/sms.server.ts` with `sendSms(user_id, body)` — respects quiet hours from `profiles`, dedupes within 10 min, logs to `notification_log` with `channel='sms'`.
- Hook into `notifyHousehold`: SMS added as an additional channel when `sms_opt_in=true` and the notification is high-signal (agent approvals, conflict alerts) — briefings stay push/in-app only.

## 4. Outbound transactional email

- Use Resend connector (gateway-backed, already in knowledge).
- Weekly Review + morning briefing get an email delivery option (Settings toggle).
- Same dedupe + quiet-hours logic; logged to `notification_log` with `channel='email'`.

## 5. Trust & Observability

- New `/integrations` route (already exists as placeholder) becomes real: list connected calendars, phone numbers, inbound email address, connector health, last-synced timestamps, disconnect buttons.
- Every external write/read is logged to `agent_runs` so users can audit.

## Technical notes

- New columns:
  - `calendar_events`: `source text default 'manual'`, `external_id text`, `external_calendar_id text`, unique `(household_id, source, external_id)` where external_id is not null.
  - `households`: `inbound_email text unique`.
  - `profiles`: `email_notifications_enabled bool default false`.
- New tables: `calendar_integrations`, `phone_numbers`.
- All tokens encrypted via `src/lib/field-crypto.server.ts` (already used for medical/vault).
- Secrets required from the user this phase:
  - Google OAuth client id + secret (per-user OAuth, they set it up in Google Cloud — I'll walk them through it).
  - Postmark server token (or SendGrid) for inbound email.
  - GatewayAPI + Resend connectors (linked via `standard_connectors--connect`, no manual secret).
- Order of build: (1) DB migration for all new tables/columns/GRANTs → (2) Google Calendar OAuth + sync + cron → (3) Integrations UI → (4) Inbound email pipeline → (5) SMS/email outbound → (6) Wire notifyHousehold to new channels.

## Out of scope (intentionally)

- Two-way calendar write-back (we only read this phase; approvals still create events in our DB).
- iCloud / Outlook calendars (Google first; Outlook is a fast follow if you want it).
- Full email thread rendering (Inbox shows the parsed summary + link to raw body).

Say **go** and I'll start with the migration + Google Calendar OAuth. If you'd rather swap Postmark for SendGrid, or skip SMS this phase, tell me before I begin.
