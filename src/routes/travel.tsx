import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { trips } from "@/lib/family-data";

export const Route = createFileRoute("/travel")({
  head: () => ({ meta: [{ title: "Travel — Family COO" }] }),
  component: TravelPage,
});

function TravelPage() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Travel assistant"
        title="Trips, orchestrated."
        subtitle="Flights, hotels, passports, packing — with daily itineraries and delay handling."
      />

      <section className="px-6 space-y-4">
        {trips.map((t) => (
          <Card key={t.id}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t.countdown}
                </p>
                <p className="mt-0.5 font-serif text-2xl italic leading-tight">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.dates}</p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-hairline bg-secondary/50 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="mt-1 text-sm">{t.status}</p>
            </div>

            <ul className="space-y-2">
              {t.items.map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-foreground" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
