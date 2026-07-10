import { Link, useRouterState } from "@tanstack/react-router";
import { Inbox, Home as HomeIcon, MessageCircle, CalendarCheck, Calendar, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";

const nav: { to: string; key: string; icon: LucideIcon }[] = [
  { to: "/", key: "nav.today", icon: HomeIcon },
  { to: "/inbox", key: "nav.inbox", icon: Inbox },
  { to: "/concierge", key: "nav.ask", icon: MessageCircle },
  { to: "/calendar", key: "nav.week", icon: Calendar },
  { to: "/review", key: "nav.review", icon: CalendarCheck },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[520px] pb-32">{children}</main>

      <nav className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2">
        <div className="flex items-center justify-between rounded-full bg-zinc-900/95 px-3 py-2.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-xl">
          {nav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            const isCenter = item.to === "/concierge";
            if (isCenter) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="-my-3 flex size-12 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg ring-1 ring-white/40 transition-transform active:scale-95"
                  aria-label={t("nav.ask")}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </Link>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-opacity ${
                  active ? "text-white opacity-100" : "text-white/90 hover:opacity-100"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  back,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <header className="px-6 pt-10 pb-6">
      {back && (
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← {t("common.back")}
        </Link>
      )}
      {eyebrow && (
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl italic leading-[1.05] tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between px-1">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {children}
      </h2>
      {action && (
        <span className="text-[11px] text-muted-foreground underline underline-offset-4">
          {action}
        </span>
      )}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-hairline bg-surface p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] ${className}`}
    >
      {children}
    </div>
  );
}
