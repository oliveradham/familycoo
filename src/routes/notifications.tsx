import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader, SectionLabel, Card } from "@/components/app-shell";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications.functions";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Family COO" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const list = useServerFn(listNotifications);
  const markRead = useServerFn(markNotificationRead);
  const markAll = useServerFn(markAllNotificationsRead);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => list(),
  });

  const markOne = useMutation({
    mutationFn: (id: string) => markRead({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMut = useMutation({
    mutationFn: () => markAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = data?.items ?? [];
  const unread = items.filter((i) => !i.read_at).length;

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Family COO · Notifications"
        title="Notifications"
        subtitle={
          unread > 0
            ? `${unread} unread · briefings, agent nudges, and weekly reviews.`
            : "You're all caught up."
        }
      />
      <div className="space-y-4 px-6 pb-10">
        {unread > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-background px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-accent"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        )}

        <Card>
          <SectionLabel>Recent</SectionLabel>
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-[13px] text-muted-foreground">
              <Bell className="size-5 opacity-40" />
              <p>No notifications yet. Your morning briefing will show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-hairline">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-3">
                  <div
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      n.read_at ? "bg-muted-foreground/30" : "bg-primary"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className={`truncate text-[14px] ${
                          n.read_at ? "text-muted-foreground" : "font-medium text-foreground"
                        }`}
                      >
                        {n.subject ?? n.kind}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {n.body && (
                      <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded-full bg-muted px-1.5 py-0.5">{n.kind}</span>
                      {!n.read_at && (
                        <button
                          onClick={() => markOne.mutate(n.id)}
                          className="text-primary hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
