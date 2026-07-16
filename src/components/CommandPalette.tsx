import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Calendar,
  CheckSquare,
  Home,
  Inbox,
  MessageCircle,
  Settings,
  Users,
  ShoppingCart,
  Plane,
  GraduationCap,
  Trophy,
  Stethoscope,
  Wrench,
  FileLock2,
  DollarSign,
  Bell,
  Sparkles,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

type Item = { to: string; label: string; icon: LucideIcon; group: string };

const items: Item[] = [
  { to: "/", label: "Today", icon: Home, group: "Navigate" },
  { to: "/inbox", label: "Inbox", icon: Inbox, group: "Navigate" },
  { to: "/calendar", label: "Calendar", icon: Calendar, group: "Navigate" },
  { to: "/concierge", label: "AI Concierge", icon: MessageCircle, group: "Navigate" },
  { to: "/review", label: "Weekly Review", icon: ClipboardList, group: "Navigate" },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, group: "Manage" },
  { to: "/family", label: "Family", icon: Users, group: "Manage" },
  { to: "/groceries", label: "Groceries", icon: ShoppingCart, group: "Manage" },
  { to: "/travel", label: "Travel", icon: Plane, group: "Manage" },
  { to: "/school", label: "School", icon: GraduationCap, group: "Manage" },
  { to: "/sports", label: "Sports", icon: Trophy, group: "Manage" },
  { to: "/medical", label: "Medical", icon: Stethoscope, group: "Manage" },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, group: "Manage" },
  { to: "/vault", label: "Document Vault", icon: FileLock2, group: "Manage" },
  { to: "/expenses", label: "Expenses", icon: DollarSign, group: "Manage" },
  { to: "/notifications", label: "Notifications", icon: Bell, group: "Account" },
  { to: "/plans", label: "Plans & billing", icon: Sparkles, group: "Account" },
  { to: "/settings", label: "Settings", icon: Settings, group: "Account" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = Array.from(new Set(items.map((i) => i.group)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {groups.map((g, idx) => (
          <div key={g}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={g}>
              {items
                .filter((i) => i.group === g)
                .map((i) => {
                  const Icon = i.icon;
                  return (
                    <CommandItem
                      key={i.to}
                      value={`${i.label} ${i.to}`}
                      onSelect={() => {
                        setOpen(false);
                        navigate({ to: i.to });
                      }}
                    >
                      <Icon className="size-4" strokeWidth={1.75} />
                      <span>{i.label}</span>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
