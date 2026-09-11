import {
  ChevronLeft,
  Download,
  Upload,
  Timer,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  ScanLine,
  Settings2,
  Zap,
  ArrowLeftRight,
} from "lucide-react";
import { useVpn } from "../store/useVpn";
import { useUI } from "../components/AddConfig";
import { ConnectOrb } from "../components/ConnectOrb";
import { SpeedChart } from "../components/SpeedChart";
import { ProtocolBadge } from "../components/ui";
import { PROTOCOL_LABEL } from "../lib/parser";
import { formatBytes, formatDuration, fa, seededRand } from "../lib/format";
import { cn } from "../utils/cn";

const STATUS_META = {
  disconnected: { text: "قطع", sub: "برای اتصال، دکمه را لمس کنید", dot: "bg-mist-500", color: "text-mist-400" },
  connecting: { text: "در حال اتصال", sub: "برقراری تونل امن…", dot: "bg-warn-400 animate-pulse", color: "text-warn-400" },
  connected: { text: "متصل و محافظت‌شده", sub: "ترافیک شما رمزنگاری شده است", dot: "bg-good-400 shadow-[0_0_10px_#35ecaa]", color: "text-good-400" },
  disconnecting: { text: "در حال قطع اتصال", sub: "لطفاً صبر کنید…", dot: "bg-warn-400 animate-pulse", color: "text-warn-400" },
} as const;

export function HomeScreen() {
  const status = useVpn((s) => s.status);
  const configs = useVpn((s) => s.configs);
  const activeId = useVpn((s) => s.activeId);
  const setScreen = useVpn((s) => s.setScreen);
  const latencies = useVpn((s) => s.latencies);
  const stats = useVpn((s) => s.stats);
  const settings = useVpn((s) => s.settings);
  const openPanel = useUI((s) => s.open);

  const active = configs.find((c) => c.id === activeId) ?? null;
  const connected = status === "connected";
  const meta = STATUS_META[status];
  const ping = active ? latencies[active.id] : undefined;

  const fakeIp = active
    ? `${seededRand(active.address, 20, 210)}.${seededRand(active.remark, 12, 240)}.${seededRand(active.address + "x", 2, 250)}.${seededRand(active.remark + "y", 100, 220)}`
    : "";

  return (
    <div className="scroll-area flex h-full flex-col px-5 pb-6">
      {/* app bar */}
      <header className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ilia-500 to-cyanx-500 shadow-lg shadow-ilia-500/30">
            <Zap className="h-5 w-5 text-white" fill="white" fillOpacity={0.25} />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-bold tracking-wide text-mist-100">
              ILIA
            </span>
            <span className="block text-[10px] font-medium text-mist-500">ایلیا وی‌پی‌ان</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn onClick={() => openPanel("scan")}>
            <ScanLine className="h-[18px] w-[18px]" />
          </IconBtn>
          <IconBtn onClick={() => setScreen("routing")}>
            <Settings2 className="h-[18px] w-[18px]" />
          </IconBtn>
        </div>
      </header>

      {/* orb */}
      <div className="flex flex-col items-center pt-5">
        <ConnectOrb />
        <div className="mt-7 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
            <span className={cn("text-[15px] font-bold", meta.color)}>{meta.text}</span>
          </div>
          <span className="text-[11px] text-mist-500">{meta.sub}</span>
        </div>
      </div>

      {/* active config */}
      <button
        onClick={() => setScreen("servers")}
        className={cn(
          "mt-6 flex w-full items-center gap-3 rounded-3xl p-4 text-right transition active:scale-[0.99]",
          connected ? "glass-lit" : "glass"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-800 text-2xl ring-1 ring-ink-600">
          {active ? active.flag : "🛰️"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13.5px] font-bold text-mist-100">
              {active ? active.remark : "سروری انتخاب نشده"}
            </span>
            {active && <ProtocolBadge label={PROTOCOL_LABEL[active.protocol]} size="xs" />}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-mist-400">
            {active ? (
              <span dir="ltr" className="font-mono">
                {active.address}:{fa(active.port)}
              </span>
            ) : (
              "برای انتخاب لمس کنید"
            )}
            {active?.transport && active.transport !== "tcp" && (
              <span className="text-mist-500">· {active.transport.toUpperCase()}</span>
            )}
            {active?.security === "reality" && <span className="text-cyanx-400">· REALITY</span>}
          </span>
        </span>
        {active && (
          <span className="flex flex-col items-end gap-1">
            <PingValue ping={ping} />
            <ChevronLeft className="h-4 w-4 text-mist-500" />
          </span>
        )}
      </button>

      {/* stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <StatCard
          icon={<Download className="h-4 w-4" />}
          tint="text-cyanx-300 bg-cyanx-500/10"
          label="دانلود"
          value={connected ? formatBytes(stats.downSpeed, true) : "—"}
          foot={`کل: ${formatBytes(stats.downTotal)}`}
          live={connected}
        />
        <StatCard
          icon={<Upload className="h-4 w-4" />}
          tint="text-ilia-300 bg-ilia-500/10"
          label="آپلود"
          value={connected ? formatBytes(stats.upSpeed, true) : "—"}
          foot={`کل: ${formatBytes(stats.upTotal)}`}
          live={connected}
        />
        <StatCard
          icon={<Timer className="h-4 w-4" />}
          tint="text-good-400 bg-good-500/10"
          label="مدت اتصال"
          value={connected || stats.duration > 0 ? formatDuration(stats.duration) : "—"}
          mono
          foot="زمان جلسه"
        />
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          tint="text-warn-400 bg-warn-500/10"
          label="پینگ"
          value={connected && stats.ping ? `${fa(stats.ping)} ms` : "—"}
          foot={
            settings.routing === "rules"
              ? "حالت: قانون‌محور"
              : settings.routing === "global"
                ? "حالت: سراسری"
                : "حالت: مستقیم"
          }
        />
      </div>

      {/* live chart */}
      <div className="glass mt-3 rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-cyanx-300" />
            <span className="text-[12.5px] font-bold text-mist-100">سرعت لحظه‌ای</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10.5px] text-mist-400">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                connected ? "anim-glow bg-good-400" : "bg-mist-500"
              )}
            />
            {connected ? "زنده" : "متوقف"}
          </span>
        </div>
        <div className="mt-2">
          <SpeedChart data={stats.chart} active={connected} />
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-ink-600/50 pt-2.5 text-[10.5px] text-mist-400">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-full bg-gradient-to-l from-ilia-500 to-cyanx-500" />
            دانلود
          </span>
          <span>
            مجموع مصرف:{" "}
            <span className="font-mono text-mist-200">{formatBytes(stats.downTotal + stats.upTotal)}</span>
          </span>
        </div>
      </div>

      {/* protection / IP card */}
      <div
        className={cn(
          "mt-3 flex items-center gap-3 rounded-3xl p-4",
          connected
            ? "bg-good-500/8 ring-1 ring-good-400/20"
            : "bg-bad-500/8 ring-1 ring-bad-400/15"
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            connected ? "bg-good-500/15 text-good-400" : "bg-bad-500/15 text-bad-400"
          )}
        >
          {connected ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
        </span>
        <span className="flex-1 leading-tight">
          <span className={cn("block text-[12.5px] font-bold", connected ? "text-good-400" : "text-bad-400")}>
            {connected ? "آی‌پی شما پنهان شده است" : "حفاظتی فعال نیست"}
          </span>
          <span className="mt-0.5 block text-[11px] text-mist-400" dir="ltr">
            {connected ? (
              <>
                IP: <span className="font-mono text-mist-200">{fakeIp}</span>
                <span className="ms-1">{active?.flag}</span>
              </>
            ) : (
              "آی‌پی واقعی شما در معرض دید است"
            )}
          </span>
        </span>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-750 text-mist-300 ring-1 ring-ink-600/70 transition active:scale-90"
    >
      {children}
    </button>
  );
}

function PingValue({ ping }: { ping: number | "loading" | "timeout" | undefined }) {
  if (!ping) return <span className="text-[10px] text-mist-500">—</span>;
  if (ping === "loading")
    return <Gauge className="h-4 w-4 animate-pulse text-mist-400" />;
  if (ping === "timeout") return <span className="text-[10px] font-bold text-bad-400">timeout</span>;
  return (
    <span
      className={cn(
        "font-mono text-[11px] font-bold",
        ping < 120 ? "text-good-400" : ping < 240 ? "text-warn-400" : "text-bad-400"
      )}
    >
      {fa(ping)}
      <span className="ms-0.5 text-[9px] font-normal">ms</span>
    </span>
  );
}

function StatCard({
  icon,
  tint,
  label,
  value,
  foot,
  mono,
  live,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: string;
  foot: string;
  mono?: boolean;
  live?: boolean;
}) {
  return (
    <div className="glass rounded-3xl p-3.5">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tint)}>{icon}</span>
        <span className="text-[11px] font-medium text-mist-400">{label}</span>
        {live && <span className="anim-glow ms-auto h-1.5 w-1.5 rounded-full bg-cyanx-400" />}
      </div>
      <div
        className={cn(
          "mt-2.5 font-display text-[18px] font-bold text-mist-100",
          mono && "font-mono text-[17px]"
        )}
        dir="ltr"
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] text-mist-500">{foot}</div>
    </div>
  );
}
