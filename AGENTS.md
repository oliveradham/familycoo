<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Family-tool modules (meals, homework, packing, birthdays, chores) read/write through the generic whitelisted CRUD in `src/lib/family-tools.functions.ts` + `useFamilyRows` hook; RLS (`is_household_member`) is the security boundary. Why: one audited path instead of five near-identical server files.
- Signed-in screens never import demo data; `src/lib/demo-family-data.ts` only supplies pricing copy to `/plans`, and sample rows come from `loadSampleFamily`. Why: new accounts must only see their own household.
- Routes without a data model render `<ComingSoon>` and are left out of navigation. Why: avoid showing fabricated content.
- Birthday reminders are queued in-database by `queue_birthday_reminders()` via daily pg_cron into `notification_log` (deduped by `ref_id`). Why: no HTTP hop needed.
