import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import {
  disconnectCalendarIntegration,
  getHouseholdInbound,
  listCalendarIntegrations,
  startGoogleCalendarConnect,
  syncCalendarNow,
} from "@/lib/integrations.functions";
import { Calendar, Check, Copy, Mail, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PremiumRoute } from "@/components/PremiumRoute";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Family COO" }] }),
  component: Page,
  validateSearch: (s: Record<string, unknown>) => ({
    connect: typeof s.connect === "string" ? s.connect : undefined,
  }),
});

function Page() {
  const { connect } = Route.useSearch();
  const list = useServerFn(listCalendarIntegrations);
  const inbound = useServerFn(getHouseholdInbound);
  const startConnect = useServerFn(startGoogleCalendarConnect);
  const disconnect = useServerFn(disconnectCalendarIntegration);
  const syncNow = useServerFn(syncCalendarNow);

  const qc = useQueryClient();
  const { data: intData } = useQuery({
    queryKey: ["calendar-integrations"],
    queryFn: () => list(),
  });
  const { data: inboundData } = useQuery({
    queryKey: ["inbound-email"],
    queryFn: () => inbound(),
  });

  const [banner, setBanner] = useState<string | null>(null);
  useEffect(() => {
    if (!connect) return;
    setBanner(connect === "ok" ? "Google Calendar connected." : `Connection issue: ${connect}`);
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [connect]);

  const connectMut = useMutation({
    mutationFn: async () => {
      const { url } = await startConnect({ data: { origin: window.location.origin } });
      window.location.href = url;
    },
  });
  const disconnectMut = useMutation({
    mutationFn: (id: string) => disconnect({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-integrations"] }),
  });
  const syncMut = useMutation({
    mutationFn: (id: string) => syncNow({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-integrations"] }),
  });

  const [copied, setCopied] = useState(false);
  const copyInbound = async () => {
    if (!inboundData?.inbound_email) return;
    await navigator.clipboard.writeText(inboundData.inbound_email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PremiumRoute min="pro" feature="External Integrations">
    <AppShell>
      <PageHeader
        back
        eyebrow="Connected accounts"
        title="Bring your real life in."
        subtitle="Sync your calendar, forward emails, and let the COO see what's actually on your plate — never surveillance, always revocable."
      />

      {banner && (
        <div className="mx-6 mb-4 rounded-2xl border border-hairline bg-secondary/50 px-4 py-3 text-[12px]">
          {banner}
        </div>
      )}

      <section className="px-6 pb-6">
        <SectionLabel>Calendars</SectionLabel>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Google Calendar</p>
              <p className="mt-1 font-serif text-[19px] italic leading-tight">
                Read-only sync of the next 30 days.
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Refreshes every 30 minutes. Events show up in the unified week and feed the Prep and Conflict agents.
              </p>
            </div>
            <Calendar className="mt-1 size-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <button
            onClick={() => connectMut.mutate()}
            disabled={connectMut.isPending}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-white disabled:opacity-50"
          >
            {connectMut.isPending ? "Redirecting…" : "Connect Google account"}
          </button>
        </Card>

        {(intData?.items ?? []).length > 0 && (
          <div className="mt-3 space-y-2">
            {intData!.items.map((i) => (
              <div key={i.id} className="rounded-2xl border border-hairline bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium">{i.provider_account_email ?? "Google account"}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {i.calendar_ids?.length ?? 0} calendar{(i.calendar_ids?.length ?? 0) === 1 ? "" : "s"} ·{" "}
                      {i.last_synced_at
                        ? `Synced ${new Date(i.last_synced_at).toLocaleString()}`
                        : "Waiting for first sync…"}
                    </p>
                    {i.sync_status === "error" && i.last_error && (
                      <p className="mt-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] text-red-700">
                        {i.last_error}
                      </p>
                    )}
                    {i.sync_status === "ok" && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700">
                        <Check className="size-3" /> Healthy
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => syncMut.mutate(i.id)}
                      disabled={syncMut.isPending}
                      className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest"
                      title="Sync now"
                    >
                      <RefreshCw className={`size-3 ${syncMut.isPending ? "animate-spin" : ""}`} />
                    </button>
                    <button
                      onClick={() => disconnectMut.mutate(i.id)}
                      disabled={disconnectMut.isPending}
                      className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-[11px] uppercase tracking-widest"
                      title="Disconnect"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="px-6 pb-6">
        <SectionLabel>Inbound email</SectionLabel>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Household forwarding address</p>
              <p className="mt-1 font-serif text-[19px] italic leading-tight">
                Forward school notices, bills, and invites.
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground">
                Anything sent here becomes a triaged inbox item with a suggested action.
              </p>
            </div>
            <Mail className="mt-1 size-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-hairline bg-secondary/40 px-3 py-2 font-mono text-[12px]">
            <span className="flex-1 truncate">{inboundData?.inbound_email ?? "—"}</span>
            <button
              onClick={copyInbound}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-background px-2 py-1 text-[10px] uppercase tracking-widest"
            >
              <Copy className="size-3" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </Card>
      </section>

      <section className="px-6 pb-8">
        <Card className="bg-zinc-900 text-white">
          <p className="text-[10px] uppercase tracking-widest text-white/60">Principle</p>
          <p className="mt-1 font-serif text-lg italic leading-snug">
            Every connection is scoped, revocable, and audited. The COO reads only what it needs to help — nothing more.
          </p>
        </Card>
      </section>
    </AppShell>
      </PremiumRoute>
  );
}
