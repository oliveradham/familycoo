import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { bookingCategories } from "@/lib/family-data";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Bookings — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Booking layer"
        title="Book what the family actually needs."
        subtitle="Not a marketplace. Only services that solve something on your plate right now — prefilled from what I already know."
      />
      <section className="px-6 grid grid-cols-2 gap-2 pb-8">
        {bookingCategories.map((b) => (
          <div key={b.id} className="rounded-2xl border border-hairline bg-surface p-4">
            <p className="font-serif text-[16px] italic leading-tight">{b.label}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{b.note}</p>
            <button className="mt-3 rounded-full border border-hairline px-3 py-1.5 text-[10px] uppercase tracking-widest">
              Book
            </button>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
