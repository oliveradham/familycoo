import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-hairline bg-surface/60 px-6 py-10 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-full bg-secondary">
        <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <p className="mt-4 font-serif text-xl italic">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-[34ch] text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <section className="px-6">
      <div className="rounded-3xl border border-hairline bg-surface p-8 text-center">
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Coming soon
        </span>
        <p className="mt-5 font-serif text-2xl italic">{title}</p>
        <p className="mx-auto mt-2 max-w-[36ch] text-[13px] text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm outline-none focus:border-foreground/40";
export const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-medium uppercase tracking-widest text-primary-foreground disabled:opacity-50";
export const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest text-foreground/80 hover:bg-secondary/60";
