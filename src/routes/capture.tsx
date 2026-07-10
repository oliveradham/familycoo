import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, PageHeader } from "@/components/app-shell";
import { captured } from "@/lib/family-data";
import { Camera, ImagePlus, FileText } from "lucide-react";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Capture — Family COO" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Screenshot & share capture"
        title="Send me anything — I'll figure it out."
        subtitle="Screenshot, photo, PDF, forwarded message. I'll extract the details and ask before doing anything."
      />

      <section className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Camera, label: "Photo" },
            { icon: ImagePlus, label: "Screenshot" },
            { icon: FileText, label: "PDF" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-surface py-5">
              <Icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 space-y-3">
        {captured.map((c) => (
          <Card key={c.id}>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.kind} · {c.from}</p>
            <p className="mt-1 font-serif text-[17px] italic leading-snug">{c.interpretation}</p>
            <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-[13px]">
              {c.proposal}
            </div>
            <div className="mt-3 flex gap-2">
              <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white">
                Confirm
              </button>
              <button className="rounded-full border border-hairline px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Skip
              </button>
            </div>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
