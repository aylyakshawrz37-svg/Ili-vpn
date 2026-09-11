import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Activity,
  Gauge,
  Zap,
  CopyPlus,
  Trash2,
  Link2,
  ServerOff,
  Check,
} from "lucide-react";
import { useVpn, type VpnStatus } from "../store/useVpn";
import { useUI } from "../components/AddConfig";
import { ProtocolBadge, Sheet } from "../components/ui";
import { PROTOCOL_LABEL, type VpnConfig } from "../lib/parser";
import { fa } from "../lib/format";
import { cn } from "../utils/cn";

export function ServersScreen() {
  const configs = useVpn((s) => s.configs);
  const activeId = useVpn((s) => s.activeId);
  const selectConfig = useVpn((s) => s.selectConfig);
  const ping = useVpn((s) => s.ping);
  const pingAll = useVpn((s) => s.pingAll);
  const latencies = useVpn((s) => s.latencies);
  const status = useVpn((s) => s.status);
  const openPanel = useUI((s) => s.open);

  const [query, setQuery] = useState("");
  const [actionCfg, setActionCfg] = useState<VpnConfig | null>(null);
  const initialPing = useRef(false);

  useEffect(() => {
    if (initialPing.current) return;
    initialPing.current = true;
    if (!useVpn.getState().settings.autoPing) return;
    const list = useVpn.getState().configs;
    list.forEach((c, i) => setTimeout(() => useVpn.getState().ping(c.id), 350 + i * 220));
  }, []);

  const connectTo = (id: string) => {
    const st = useVpn.getState();
    const same = st.activeId === id;
    if (same) {
      st.toggle();
      return;
    }
    const live = st.status === "connected" || st.status === "connecting";
    st.selectConfig(id);
    if (!live) setTimeout(() => useVpn.getState().toggle(), 90);
  };

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = configs.filter(
      (c) =>
        !q ||
        c.remark.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.protocol.includes(q)
    );
    const map = new Map<string, VpnConfig[]>();
    filtered.forEach((c) => {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    });
    return [...map.entries()];
  }, [configs, query]);

  return (
    <div className="relative flex h-full flex-col">
      {/* header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-3">
        <div>
          <h1 className="text-[19px] font-extrabold text-mist-100">سرورها</h1>
          <p className="mt-0.5 text-[11px] text-mist-500">{fa(configs.length)} کانفیگ آماده</p>
        </div>
        <button
          onClick={pingAll}
          className="flex h-10 items-center gap-2 rounded-2xl bg-ink-750 px-3.5 text-[11.5px] font-semibold text-mist-200 ring-1 ring-ink-600/70 transition active:scale-95"
        >
          <Activity className="h-4 w-4 text-cyanx-300" />
          تست همه
        </button>
      </header>

      {/* search */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 rounded-2xl bg-ink-800 px-3.5 py-2.5 ring-1 ring-ink-600/60 focus-within:ring-ilia-400/50">
          <Search className="h-4 w-4 text-mist-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی سرور، کشور یا پروتکل…"
            className="w-full bg-transparent text-[12.5px] text-mist-100 outline-none placeholder:text-mist-500"
          />
        </div>
      </div>

      {/* list */}
      <div className="scroll-area flex-1 px-4 pb-24">
        {configs.length === 0 && <EmptyState onAdd={() => openPanel("menu")} />}

        {groups.map(([group, items]) => (
          <div key={group} className="mt-3">
            <div className="mb-1.5 flex items-center gap-2 px-1.5">
              <span className="text-[10.5px] font-semibold tracking-wide text-mist-500">{group}</span>
              <span className="h-px flex-1 bg-ink-700" />
              <span className="text-[10px] text-mist-500">{fa(items.length)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {items.map((c) => (
                <ServerRow
                  key={c.id}
                  cfg={c}
                  selected={c.id === activeId}
                  status={status}
                  pingValue={latencies[c.id]}
                  onSelect={() => {
                    if (c.id !== activeId) selectConfig(c.id);
                  }}
                  onPing={() => ping(c.id)}
                  onMenu={() => setActionCfg(c)}
                  onConnect={() => connectTo(c.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => openPanel("menu")}
        className="absolute bottom-5 left-5 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ilia-500 to-cyanx-500 text-white shadow-[0_10px_30px_rgba(47,124,255,0.45)] transition active:scale-90"
      >
        <Plus className="h-6 w-6" strokeWidth={2.6} />
      </button>

      <ActionSheet
        cfg={actionCfg}
        onClose={() => setActionCfg(null)}
        onPing={() => {
          if (actionCfg) ping(actionCfg.id);
          setActionCfg(null);
        }}
        onToggle={() => {
          if (actionCfg) connectTo(actionCfg.id);
          setActionCfg(null);
        }}
      />
    </div>
  );
}

function Ping({ value }: { value: number | "loading" | "timeout" | undefined }) {
  if (!value) return <span className="font-mono text-[10px] text-mist-600">--</span>;
  if (value === "loading") return <Gauge className="h-3.5 w-3.5 animate-spin text-mist-400" />;
  if (value === "timeout")
    return <span className="font-mono text-[9.5px] font-bold text-bad-400">TIME</span>;
  return (
    <span
      className={cn(
        "font-mono text-[10.5px] font-bold",
        value < 120 ? "text-good-400" : value < 240 ? "text-warn-400" : "text-bad-400"
      )}
    >
      {fa(value)}
    </span>
  );
}

function ServerRow({
  cfg,
  selected,
  status,
  pingValue,
  onSelect,
  onPing,
  onMenu,
  onConnect,
}: {
  cfg: VpnConfig;
  selected: boolean;
  status: VpnStatus;
  pingValue: number | "loading" | "timeout" | undefined;
  onSelect: () => void;
  onPing: () => void;
  onMenu: () => void;
  onConnect: () => void;
}) {
  const connectedHere = selected && status === "connected";
  const connectingHere = selected && (status === "connecting" || status === "disconnecting");

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition cursor-pointer",
        selected
          ? "border-ilia-400/40 bg-ilia-500/10 shadow-[inset_0_0_24px_rgba(47,124,255,0.08)]"
          : "border-transparent bg-ink-800/60 hover:bg-ink-750"
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
          selected ? "bg-ink-800 ring-1 ring-ilia-400/40" : "bg-ink-800 ring-1 ring-ink-600"
        )}
      >
        {cfg.flag}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("truncate text-[12.5px] font-bold", selected ? "text-mist-100" : "text-mist-200")}>
            {cfg.remark}
          </span>
          {connectedHere && (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-good-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-good-400 shadow-[0_0_6px_#35ecaa]" />
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <ProtocolBadge label={PROTOCOL_LABEL[cfg.protocol]} size="xs" />
          <span dir="ltr" className="truncate font-mono text-[9.5px] text-mist-500">
            {cfg.address}:{fa(cfg.port)}
          </span>
          {cfg.security === "reality" && (
            <span className="rounded bg-cyanx-500/10 px-1 font-mono text-[8px] font-bold text-cyanx-300">
              REALITY
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPing();
        }}
        className="flex h-8 w-10 shrink-0 items-center justify-center rounded-lg"
        title="تست پینگ"
      >
        <Ping value={pingValue} />
      </button>

      {selected ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConnect();
          }}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition active:scale-90",
            connectedHere
              ? "bg-good-500/20 text-good-400"
              : connectingHere
                ? "bg-warn-500/20 text-warn-400"
                : "bg-gradient-to-br from-ilia-500 to-cyanx-500 text-white"
          )}
        >
          {connectingHere ? (
            <Activity className="h-4 w-4 animate-pulse" />
          ) : connectedHere ? (
            <Check className="h-4.5 w-4.5" strokeWidth={2.8} />
          ) : (
            <Zap className="h-4 w-4" fill="currentColor" />
          )}
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-mist-500 transition hover:bg-ink-700"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
            <circle cx="12" cy="5" r="1.7" />
            <circle cx="12" cy="12" r="1.7" />
            <circle cx="12" cy="19" r="1.7" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ActionSheet({
  cfg,
  onClose,
  onPing,
  onToggle,
}: {
  cfg: VpnConfig | null;
  onClose: () => void;
  onPing: () => void;
  onToggle: () => void;
}) {
  const deleteConfig = useVpn((s) => s.deleteConfig);
  const duplicateConfig = useVpn((s) => s.duplicateConfig);
  const toast = useVpn((s) => s.toast);
  const status = useVpn((s) => s.status);
  const isActive = cfg && useVpn.getState().activeId === cfg.id;
  const connected = isActive && status === "connected";

  const items = [
    {
      icon: Zap,
      label: connected ? "قطع اتصال" : "اتصال به این سرور",
      tint: "text-cyanx-300",
      onClick: onToggle,
    },
    { icon: Gauge, label: "تست پینگ", tint: "text-warn-400", onClick: onPing },
    {
      icon: Link2,
      label: "کپی لینک کانفیگ",
      tint: "text-ilia-300",
      onClick: () => {
        if (cfg) {
          navigator.clipboard?.writeText(cfg.raw).catch(() => {});
          toast("لینک کانفیگ کپی شد", "ok");
        }
        onClose();
      },
    },
    {
      icon: CopyPlus,
      label: "تکثیر کانفیگ",
      tint: "text-mist-300",
      onClick: () => {
        if (cfg) duplicateConfig(cfg.id);
        onClose();
      },
    },
    {
      icon: Trash2,
      label: "حذف کانفیگ",
      tint: "text-bad-400",
      onClick: () => {
        if (cfg) deleteConfig(cfg.id);
        onClose();
      },
    },
  ];

  return (
    <Sheet open={!!cfg} onClose={onClose} title={cfg?.remark}>
      <div className="flex flex-col gap-1 pb-2">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={it.onClick}
            className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-right transition hover:bg-ink-750 active:scale-[0.99]"
          >
            <it.icon className={cn("h-4.5 w-4.5", it.tint)} />
            <span className={cn("flex-1 text-[13px] font-medium", it.tint === "text-bad-400" ? "text-bad-400" : "text-mist-200")}>
              {it.label}
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-800 ring-1 ring-ink-600">
        <ServerOff className="h-9 w-9 text-mist-500" />
      </span>
      <h3 className="mt-5 text-[14px] font-bold text-mist-200">هنوز کانفیگی نداری</h3>
      <p className="mt-1.5 text-[11.5px] leading-5 text-mist-500">
        لینک vmess، vless، trojan، shadowsocks یا اشتراکت رو اضافه کن تا ایلیا وصلت کنه.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-2xl bg-gradient-to-l from-ilia-500 to-cyanx-500 px-5 py-3 text-[12.5px] font-bold text-white shadow-lg shadow-ilia-500/25"
      >
        <Plus className="h-4 w-4" />
        افزودن اولین کانفیگ
      </button>
    </div>
  );
}
