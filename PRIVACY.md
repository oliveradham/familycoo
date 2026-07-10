# Privacy Policy — Family COO

_Last updated: July 10, 2026_

Family COO ("we", "us") builds an AI operations assistant for households. This policy explains what we collect, why, and your rights.

## Data we collect

- **Account data**: email, display name, authentication tokens.
- **Household data you enter**: family members, calendar events, tasks, school items, sports teams and events, medical records, documents, expenses, grocery items, maintenance schedules, trips.
- **Device data**: platform, app version, crash logs (aggregated, no PII).

## Sensitive categories

- **Health data** (Medical Hub): stored encrypted at rest with per-household AES-256-GCM. Only revealed on explicit user action. Never sent to AI providers.
- **Financial data** (Expenses): amounts and categories only. No card numbers, no bank credentials.
- **Documents** (Vault): stored in a private, household-scoped bucket. Signed URLs expire in 60 seconds.

## AI processing

The AI Concierge and Morning Briefing use Google Gemini via the Lovable AI Gateway. Before any prompt is sent, we run a redaction pass (`src/lib/ai-redact.ts`) that strips names, phone numbers, addresses, policy numbers, and any field marked encrypted. AI providers do not receive medical records, document contents, or vault files.

## Third parties

- **Lovable Cloud** (hosting, database, auth) — data processor.
- **Paddle** (web payments) — receives email + billing address at checkout only.
- **RevenueCat + Apple/Google** (native in-app purchases) — receives store user ID only.

We do not sell data. We do not run advertising SDKs.

## Your rights

- Export your household data: Settings → Export.
- Delete your account and all household data: Settings → Delete Account. Deletion is permanent within 30 days.
- Contact: privacy@familycoo.app

## Children

Family COO is intended for adult account holders managing their households. We do not knowingly create accounts for children under 13. Household members added by an adult are entries in the account holder's data, not separate accounts.

## Changes

Material changes are announced in-app 30 days before taking effect.
