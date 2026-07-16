import { useAllFeatureFlags } from "@/lib/feature-flags";
import { Card, SectionLabel } from "@/components/app-shell";
import { Sparkles, Lock, Check } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function PreviewFeatures() {
  const features = useAllFeatureFlags();

  return (
    <section className="px-6 mb-6">
      <SectionLabel>Preview features</SectionLabel>
      <Card>
        <div className="mb-4 flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground" />
          <div>
            <p className="text-[13px] text-foreground">Upcoming features</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Pro Max members get early access on August 1, 2026. Everyone else on August 30, 2026.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {features.map(({ flag, status }) => (
            <div
              key={flag.key}
              className="flex items-start justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0"
            >
              <div className="min-w-0">
                <p className="text-[13px] text-foreground">{flag.name}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{flag.description}</p>
              </div>
              <div className="shrink-0">
                {status.enabled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground">
                    <Check className="h-3 w-3" />
                    {status.reason === "owner"
                      ? "Owner"
                      : status.reason === "early-tier"
                        ? "Early access"
                        : "Available"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    {status.availableAt ? formatDate(status.availableAt) : "Soon"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
