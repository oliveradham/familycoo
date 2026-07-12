import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { emergency } from "@/lib/family-data";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency — Family COO" },
      { name: "description", content: "One-tap access to emergency contacts, medical info, allergies, and insurance — encrypted, role-gated, with temporary caregiver passes." },
      { property: "og:title", content: "Emergency Mode — Family COO" },
      { property: "og:description", content: "Essential family info, one tap away. Encrypted, role-gated, and shareable via temporary caregiver access." },
      { property: "og:url", content: "https://family-coo.com/emergency" },
    ],
    links: [{ rel: "canonical", href: "https://family-coo.com/emergency" }],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Emergency mode"
        title="One-tap essentials."
        subtitle="Sensitive information is encrypted and gated by role. You can create a temporary access pass for a caregiver."
      />

      <section className="px-6 mb-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-white">
          <ShieldAlert className="size-4" />
          <span className="text-sm font-medium">Share temporary emergency pass</span>
        </button>
      </section>

      <Group title="Contacts" items={emergency.contacts} />

      <section className="px-6 mb-6">
        <SectionLabel>Allergies</SectionLabel>
        <Card>
          {emergency.allergies.map((a, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{a.who}</p>
              <p className="text-[14px]">{a.detail}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Medications</SectionLabel>
        <Card>
          {emergency.medications.map((m, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.who}</p>
              <p className="text-[14px]">{m.detail}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Insurance</SectionLabel>
        <Card><p className="text-[14px]">{emergency.insurance}</p></Card>
      </section>

      <section className="px-6 mb-6">
        <SectionLabel>Authorized for pickup</SectionLabel>
        <Card>
          <div className="flex flex-wrap gap-1.5">
            {emergency.authorizedPickup.map((p) => (
              <span key={p} className="rounded-full bg-secondary/70 px-3 py-1 text-[12px]">{p}</span>
            ))}
          </div>
        </Card>
      </section>

      <Group title="Schools" items={emergency.schools} />
    </AppShell>
  );
}

function Group({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <section className="px-6 mb-6">
      <SectionLabel>{title}</SectionLabel>
      <Card>
        {items.map((it, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{it.label}</p>
            <p className="text-[14px]">{it.value}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}
