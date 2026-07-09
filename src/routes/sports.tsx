import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { sports } from "@/lib/family-data";
import { CloudRain } from "lucide-react";

export const Route = createFileRoute("/sports")({
  head: () => ({ meta: [{ title: "Sports — Family COO" }] }),
  component: SportsPage,
});

function SportsPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Season"
        title="Practices, games, weather."
        subtitle="Departure times adjust for weather. Tournament logistics tracked end-to-end."
      />

      <section className="px-6 space-y-4">
        {sports.map((s) => (
          <Card key={s.id}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.child}
                </p>
                <p className="mt-0.5 font-serif text-2xl italic leading-tight">{s.sport}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] uppercase tracking-widest">
                {s.ranking}
              </span>
            </div>

            <div className="space-y-3">
              <Row label="Next">{s.next}</Row>
              <Row label="Weather" icon={<CloudRain className="size-3" />}>
                {s.weather}
              </Row>
              <Row label="Upcoming">{s.upcoming}</Row>
              <Row label="Equipment">{s.equipment}</Row>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}

function Row({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 border-t border-hairline pt-3 first:border-0 first:pt-0">
      <p className="w-20 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="flex-1 text-sm text-foreground/90 inline-flex items-center gap-1.5">
        {icon}
        {children}
      </p>
    </div>
  );
}
