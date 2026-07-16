import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-20 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-hairline bg-zinc-900/95 px-4 py-2 text-[12px] font-medium text-white shadow-lg backdrop-blur"
    >
      <WifiOff className="size-3.5" strokeWidth={2} />
      <span>You're offline — changes will sync when reconnected</span>
    </div>
  );
}
