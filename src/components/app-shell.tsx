import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Inbox, Home as HomeIcon, MessageCircle, CalendarCheck, Calendar, type LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { unreadCount } from "@/lib/notifications.functions";
import { SubscriptionBanners } from "@/components/SubscriptionBanners";

const nav: { to: string; key: string; icon: LucideIcon }[] = [
  { to: "/", key: "nav.today", icon: HomeIcon },
  { to: "/inbox", key: "nav.inbox", icon: Inbox },
  { to: "/concierge", key: "nav.ask", icon: MessageCircle },
  { to: "/calendar", key: "nav.week", icon: Calendar },
  { to: "/review", key: "nav.review", icon: CalendarCheck },
];

function NotificationBell() {
  const fn = useServerFn(unreadCount);
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => fn(),
    enabled: !!user,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const count = data?.count ?? 0;
  return (
    <Link
      to="/notifications"
      aria-label="Notifications"
      className="fixed right-4 top-4 z-50 grid size-10 place-items-center rounded-full border border-hairline bg-background/90 shadow-sm backdrop-blur-md hover:bg-background"
    >
      <Bell className="size-4" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-red-500 px-1 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useLanguage();
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Loading…</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <SubscriptionBanners />
      <NotificationBell />
      <main id="main-content" className="mx-auto max-w-[520px] pb-32">{children}</main>


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
