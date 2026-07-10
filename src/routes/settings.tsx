import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PageHeader, SectionLabel } from "@/components/app-shell";
import { family } from "@/lib/family-data";
import {
  Bell,
  Clock,
  Globe,
  Lock,
  LogOut,
  Mic,
  Moon,
  Palette,
  Shield,
  Sparkles,
  Users,
  Volume2,
  Wallet,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Family COO" }] }),
  component: SettingsPage,
});

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

const LANGUAGES: { code: string; label: string }[] = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "es-ES", label: "Español (España)" },
  { code: "es-MX", label: "Español (México)" },
  { code: "es-AR", label: "Español (Argentina)" },
  { code: "fr-FR", label: "Français (France)" },
  { code: "fr-CA", label: "Français (Canada)" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "pt-PT", label: "Português (Portugal)" },
  { code: "nl-NL", label: "Nederlands" },
  { code: "sv-SE", label: "Svenska" },
  { code: "no-NO", label: "Norsk" },
  { code: "da-DK", label: "Dansk" },
  { code: "fi-FI", label: "Suomi" },
  { code: "pl-PL", label: "Polski" },
  { code: "cs-CZ", label: "Čeština" },
  { code: "ro-RO", label: "Română" },
  { code: "hu-HU", label: "Magyar" },
  { code: "el-GR", label: "Ελληνικά" },
  { code: "tr-TR", label: "Türkçe" },
  { code: "ru-RU", label: "Русский" },
  { code: "uk-UA", label: "Українська" },
  { code: "ar-SA", label: "العربية (السعودية)" },
  { code: "ar-EG", label: "العربية (مصر)" },
  { code: "he-IL", label: "עברית" },
  { code: "fa-IR", label: "فارسی" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "mr-IN", label: "मराठी" },
  { code: "gu-IN", label: "ગુજરાતી" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
  { code: "ur-PK", label: "اردو" },
  { code: "th-TH", label: "ไทย" },
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "id-ID", label: "Bahasa Indonesia" },
  { code: "ms-MY", label: "Bahasa Melayu" },
  { code: "tl-PH", label: "Filipino" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "sw-KE", label: "Kiswahili" },
  { code: "am-ET", label: "አማርኛ" },
  { code: "zu-ZA", label: "isiZulu" },
  { code: "af-ZA", label: "Afrikaans" },
];

function Row({
  icon: Icon,
  label,
  hint,
  right,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="grid size-9 place-items-center rounded-full bg-zinc-900/5 text-zinc-900">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        {hint && <p className="text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        on ? "bg-zinc-900 justify-end" : "bg-zinc-300 justify-start"
      }`}
      aria-pressed={on}
    >
      <span className="block size-5 rounded-full bg-white shadow ring-1 ring-black/5" />
    </button>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-foreground">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[13px] tabular-nums text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
      />
    </label>
  );
}

function SettingsPage() {
  const [tz, setTz] = useState("America/Los_Angeles");
  const [clock24, setClock24] = useState(false);
  const [weekStart, setWeekStart] = useState<"Sun" | "Mon">("Mon");
  const [morning, setMorning] = useState("06:30");
  const [afternoon, setAfternoon] = useState("14:30");
  const [evening, setEvening] = useState("20:30");
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("06:00");

  const [pushBriefings, setPushBriefings] = useState(true);
  const [pushApprovals, setPushApprovals] = useState(true);
  const [pushConflicts, setPushConflicts] = useState(true);
  const [pushMarketing, setPushMarketing] = useState(false);

  const [voice, setVoice] = useState(true);
  const [autopilot, setAutopilot] = useState(true);
  const [proactive, setProactive] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [haptics, setHaptics] = useState(true);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        subtitle="Adjust the times, tone, and permissions that shape how I run the household."
        back
      />

      {/* Household profile */}
      <section className="px-6 mb-6">
        <SectionLabel>Household</SectionLabel>
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-full bg-zinc-900 text-white text-sm font-medium">
              T
            </div>
            <div className="flex-1">
              <p className="font-serif italic text-lg leading-tight">The Thompsons</p>
              <p className="text-[12px] text-muted-foreground">
                {family.length} members · Palo Alto, CA
              </p>
            </div>
            <Link
              to="/family"
              className="text-[11px] uppercase tracking-widest text-muted-foreground underline underline-offset-4"
            >
              Manage
            </Link>
          </div>
        </Card>
      </section>

      {/* Time & Locale */}
      <section className="px-6 mb-6">
        <SectionLabel>Time & locale</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Globe}
              label="Timezone"
              hint="Used for briefings, reminders, and departure times"
              right={
                <select
                  value={tz}
                  onChange={(e) => setTz(e.target.value)}
                  className="rounded-lg border border-hairline bg-white px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                >
                  {TIMEZONES.map((z) => (
                    <option key={z} value={z}>
                      {z.replace("_", " ")}
                    </option>
                  ))}
                </select>
              }
            />
            <Row
              icon={Clock}
              label="24-hour clock"
              hint={clock24 ? "e.g. 20:30" : "e.g. 8:30 PM"}
              right={<Toggle on={clock24} onChange={setClock24} />}
            />
            <Row
              icon={Clock}
              label="Week starts on"
              right={
                <div className="flex rounded-full bg-zinc-100 p-0.5 text-[11px]">
                  {(["Sun", "Mon"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setWeekStart(d)}
                      className={`rounded-full px-3 py-1 font-medium ${
                        weekStart === d ? "bg-white text-foreground shadow" : "text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
            />
          </div>
        </Card>
      </section>

      {/* Briefing schedule */}
      <section className="px-6 mb-6">
        <SectionLabel>Briefing schedule</SectionLabel>
        <Card>
          <p className="mb-2 text-[12px] text-muted-foreground">
            When I deliver your three daily updates.
          </p>
          <div className="divide-y divide-hairline">
            <TimeField label="Morning briefing" value={morning} onChange={setMorning} />
            <TimeField label="Afternoon check-in" value={afternoon} onChange={setAfternoon} />
            <TimeField label="Evening wrap-up" value={evening} onChange={setEvening} />
          </div>
          <div className="mt-4 rounded-2xl bg-zinc-900/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quiet hours
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              I'll hold non-urgent nudges during this window.
            </p>
            <div className="mt-2 divide-y divide-hairline">
              <TimeField label="From" value={quietStart} onChange={setQuietStart} />
              <TimeField label="Until" value={quietEnd} onChange={setQuietEnd} />
            </div>
          </div>
        </Card>
      </section>

      {/* Notifications */}
      <section className="px-6 mb-6">
        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Bell}
              label="Daily briefings"
              hint="Morning, afternoon, evening"
              right={<Toggle on={pushBriefings} onChange={setPushBriefings} />}
            />
            <Row
              icon={Sparkles}
              label="Approvals ready"
              hint="When an agent has a draft for you"
              right={<Toggle on={pushApprovals} onChange={setPushApprovals} />}
            />
            <Row
              icon={Bell}
              label="Conflict alerts"
              hint="Overlaps, at-risk items, weather"
              right={<Toggle on={pushConflicts} onChange={setPushConflicts} />}
            />
            <Row
              icon={Bell}
              label="Product updates"
              hint="New workflows, tips"
              right={<Toggle on={pushMarketing} onChange={setPushMarketing} />}
            />
          </div>
        </Card>
      </section>

      {/* AI behavior */}
      <section className="px-6 mb-6">
        <SectionLabel>AI behavior</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Sparkles}
              label="Proactive suggestions"
              hint="Surface things before they become problems"
              right={<Toggle on={proactive} onChange={setProactive} />}
            />
            <Row
              icon={Sparkles}
              label="Autopilot"
              hint="Run approved rules automatically"
              right={<Toggle on={autopilot} onChange={setAutopilot} />}
            />
            <Row
              icon={Mic}
              label="Voice capture"
              right={<Toggle on={voice} onChange={setVoice} />}
            />
            <Row
              icon={Volume2}
              label="Haptics & sound"
              right={<Toggle on={haptics} onChange={setHaptics} />}
            />
          </div>
        </Card>
      </section>

      {/* Appearance */}
      <section className="px-6 mb-6">
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            <Row
              icon={Moon}
              label="Dark mode"
              hint="Follows briefing time by default"
              right={<Toggle on={darkMode} onChange={setDarkMode} />}
            />
            <Row icon={Palette} label="Accent" right={
              <div className="flex gap-2">
                {["bg-zinc-900", "bg-emerald-700", "bg-amber-700", "bg-blue-700"].map((c, i) => (
                  <button key={c} aria-label={`accent-${i}`} className={`size-5 rounded-full ${c} ring-2 ring-offset-2 ${i === 0 ? "ring-zinc-900" : "ring-transparent"}`} />
                ))}
              </div>
            } />
          </div>
        </Card>
      </section>

      {/* Privacy & data */}
      <section className="px-6 mb-6">
        <SectionLabel>Privacy & data</SectionLabel>
        <Card>
          <div className="divide-y divide-hairline">
            {[
              { icon: Shield, label: "Privacy center", hint: "See everything I read", to: "/privacy" },
              { icon: Lock, label: "Security & fraud watch", hint: "Alerts and controls", to: "/security" },
              { icon: Users, label: "Roles & access", hint: "Nannies, coaches, guests", to: "/providers" },
              { icon: Wallet, label: "Plan & billing", hint: "Free · upgrade anytime", to: "/plans" },
            ].map((r) => (
              <Link key={r.to} to={r.to} className="flex items-center">
                <Row
                  icon={r.icon}
                  label={r.label}
                  hint={r.hint}
                  right={<ChevronRight className="size-4 text-muted-foreground" />}
                />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* Account */}
      <section className="px-6 mb-10">
        <SectionLabel>Account</SectionLabel>
        <Card>
          <button className="flex w-full items-center gap-3 py-2 text-left text-[14px] text-red-700">
            <LogOut className="size-4" strokeWidth={1.75} />
            Sign out of demo profile
          </button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Version 1.0.0 · Demo build · Preferences save on this device.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}
