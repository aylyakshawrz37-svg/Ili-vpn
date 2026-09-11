import { useEffect, useState, type ReactNode } from "react";
import {
  House,
  Server,
  Route,
  TerminalSquare,
  Signal,
  Wifi,
  BatteryFull,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { Screen } from "../store/useVpn";
import { useVpn } from "../store/useVpn";
import { clockTime, fa } from "../lib/format";
import { cn } from "../utils/cn";

/* ---------------- Android status bar ---------------- */
export function StatusBar() {
  const status = useVpn((s) => s.status);
  return (
    <div className="relative z-30 flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-mist-200">
      <div className="w-16 text-start font-display text-[13px] font-semibold tracking-wide">
        <LiveClock />
      </div>
      <div className="pointer-events-none absolute start-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-black ring-1 ring-ink-600" />
      <div className="flex w-16 items-center justify-end gap-1.5">
        <Signal
          className={cn("h-[15px] w-[15px]", status === "connected" ? "text-good-400" : "")}
          strokeWidth={2.4}
        />
        <Wifi className="h-[15px] w-[15px]" strokeWidth={2.4} />
        <span className="font-display text-[10px] font-semibold text-mist-300">
          {fa(87)}%
        </span>
        <BatteryFull className="h-[18px] w-[18px]" strokeWidth={2} />
      </div>
    </div>
  );
}

function LiveClock() {
  const [t, setT] = useState(clockTime());
  useEffect(() => {
    setT(clockTime());
    const i = setInterval(() => setT(clockTime()), 10_000);
    return () => clearInterval(i);
  }, []);
  return <span>{t}</span>;
}

/* ---------------- Bottom navigation ---------------- */
const NAV: { id: Screen; label: string; icon: typeof House }[] = [
  { id: "home", label: "خانه", icon: House },
  { id: "servers", label: "سرورها", icon: Server },
  { id: "routing", label: "مسیریابی", icon: Route },
  { id: "logs", label: "لاگ", icon: TerminalSquare },
];

export function BottomNav() {
  const screen = useVpn((s) => s.screen);
  const setScreen = useVpn((s) => s.setScreen);
  const status = useVpn((s) => s.status);

  return (
    <div className="relative z-30 shrink-0 px-3 pb-4 pt-1">
      <div className="flex items-center justify-between rounded-3xl border border-ink-600/70 bg-ink-850/90 px-1.5 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition"
            >
              <span
                className={cn(
                  "flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300",
                  active && "bg-ilia-500/20 ring-1 ring-ilia-400/40"
                )}
              >
                <Icon
                  className={cn(
                    "h-[19px] w-[19px] transition-colors",
                    active ? "text-cyanx-300" : "text-mist-400"
                  )}
                  strokeWidth={active ? 2.4 : 2}
                />
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-mist-100" : "text-mist-500"
                )}
              >
                {label}
              </span>
              {id === "home" && status === "connected" && (
                <span className="absolute top-0 h-1.5 w-1.5 rounded-full bg-good-400 shadow-[0_0_8px_#35ecaa]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Switch ---------------- */
export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-ilia-500" : "bg-ink-600"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",
          checked ? "start-6" : "start-1"
        )}
      />
    </button>
  );
}

/* ---------------- Bottom sheet ---------------- */
export function Sheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="anim-fade absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-sheet relative max-h-[86%] overflow-hidden rounded-t-[2rem] border-t border-ink-600/80 bg-ink-850 shadow-2xl">
        <div className="flex justify-center pb-2 pt-3">
          <span className="h-1.5 w-12 rounded-full bg-ink-500" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-6 pb-2 pt-1">
            <h3 className="max-w-[72%] truncate text-[15px] font-bold text-mist-100">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-mist-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="scroll-area max-h-[72vh] px-6 pb-8">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Protocol badge ---------------- */
const PROTO_STYLES: Record<string, string> = {
  VLESS: "bg-cyanx-500/15 text-cyanx-300 ring-cyanx-400/30",
  VMESS: "bg-ilia-500/15 text-ilia-300 ring-ilia-400/30",
  TROJAN: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  SS: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  HY2: "bg-pink-500/15 text-pink-300 ring-pink-400/30",
  SOCKS: "bg-mist-500/15 text-mist-300 ring-mist-400/30",
  HTTP: "bg-mist-500/15 text-mist-300 ring-mist-400/30",
  AUTO: "bg-mist-500/15 text-mist-300 ring-mist-400/30",
};

export function ProtocolBadge({ label, size = "sm" }: { label: string; size?: "sm" | "xs" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-mono font-semibold ring-1",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-1 py-px text-[8px]",
        PROTO_STYLES[label] ?? PROTO_STYLES.AUTO
      )}
    >
      {label}
    </span>
  );
}

/* ---------------- Toasts ---------------- */
export function Toasts() {
  const toasts = useVpn((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-12 z-[60] flex flex-col items-center gap-2 px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="anim-toast flex items-center gap-2 rounded-2xl border border-ink-600/80 bg-ink-750/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl"
        >
          {t.kind === "ok" && <CheckCircle2 className="h-4 w-4 text-good-400" />}
          {t.kind === "err" && <AlertTriangle className="h-4 w-4 text-bad-400" />}
          {t.kind === "info" && <Info className="h-4 w-4 text-ilia-300" />}
          <span className="text-[12px] font-medium text-mist-100">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Section title ---------------- */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-5 px-1 text-[11px] font-semibold tracking-wider text-mist-500">
      {children}
    </p>
  );
}
