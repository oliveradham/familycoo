# Replace hardcoded demo with real per-user data

## Goal
New accounts see their own household — empty at first, filling in as they add events, kids, tasks, groceries, etc. The Thompson mock family disappears from the app. A reviewer/demo path still exists via a one-click "Load sample data" button.

## Scope
37 route files currently import from `src/lib/family-data.ts`. Nine of those pages already have real backing tables (family_members, calendar_events, tasks, grocery_items, school_items, sport_events/teams, medical_records, trips, documents, expenses, maintenance_tasks, family_memory, inbox_items). The other ~24 pages (autopilot, twin, scenarios, predictions, etc.) are speculative surfaces with no backing schema; those will render clean empty states or be hidden from the nav until schema is designed.

## Rollout — 4 phases

### Phase 1 — Core data-backed screens (this turn)
Wire the nine pages that already have tables + server functions:

| Route | Table(s) | Server fn |
|---|---|---|
| `/` (index) | calendar_events, tasks, inbox_items | briefing.functions |
| `/calendar` | calendar_events | events.functions |
| `/tasks` | tasks | tasks.functions |
| `/family` | family_members | family.functions |
| `/school` | school_items | school.functions |
| `/sports` | sport_events, sport_teams | sports.functions |
| `/medical` | medical_records | medical.functions |
| `/travel` | trips | trips.functions |
| `/groceries` | grocery_items | groceries.functions |
| `/maintenance` | maintenance_tasks | maintenance.functions |
| `/vault` | documents | vault.functions |
| `/expenses` | expenses | expenses.functions |
| `/inbox` | inbox_items | inbox.functions |

For each: replace `import { … } from "@/lib/family-data"` with a `useSuspenseQuery` against the existing server function, and render an empty-state card ("Add your first X") when the list is empty.

### Phase 2 — Delete demo file from app code
- Move `src/lib/family-data.ts` → `src/lib/demo-family-data.ts`, only imported by the public marketing landing (signed-out `/`).
- Signed-in `/` renders real briefing / calendar / tasks.

### Phase 3 — "Load sample data" button (reviewer path)
- Add a button in `/settings` → "Load sample family data" → calls `loadSampleFamily` server fn (already exists, idempotent).
- Also expose it inside `/onboarding` so App Review testers can populate demo content in one tap without a fake account.

### Phase 4 — Hide speculative pages
The ~24 unbacked routes (autopilot, twin, scenarios, predictions, workflows, decisions, waiting, gifts, comms, creators, compare, capture, followups, developers, departure, conflicts, checklists, calm, rules, handoff, health-prep, plans, readiness, responsibilities, purchases, providers, returns, search, agents, subscriptions, history, emergency) either:
- (a) get removed from the sidebar/nav, kept as routes but marked "Coming soon", OR
- (b) get real schema + wiring in a follow-up plan.

Default = (a) for this pass, since designing schema for 24 concepts is its own project.

## Technical notes

- All new queries use the canonical loader shape: `context.queryClient.ensureQueryData(...)` in `loader`, `useSuspenseQuery(...)` in component. No `useEffect + fetch`.
- Empty states use a consistent shared `<EmptyState icon title description action />` component (added under `src/components/`).
- The onboarding flow already exists at `/onboarding` — updated to (1) skip / (2) load sample data / (3) start empty.
- No new migrations needed — every Phase 1 table already exists.
- Sign-up trigger `handle_new_user` continues to create the household + membership, but will NOT auto-seed demo rows (kept opt-in via button).

## Out of scope for this pass
- Schema for the 24 speculative pages (Phase 4b).
- Redesigning empty states beyond the shared component.
- Any change to auth, billing, notifications, or native builds.

## Ship order
1. Add shared `EmptyState` component.
2. Rewire the 13 Phase 1 routes (large batch of file edits).
3. Rename `family-data.ts` → `demo-family-data.ts`; update marketing landing only.
4. Add "Load sample data" button to `/settings` and `/onboarding`.
5. Hide the 24 speculative routes from the primary nav; leave the files.

Expect this to take ~3–5 build cycles depending on how many route edits succeed cleanly per pass. I'll ship Phase 1 first and report back before Phase 2.