import { create } from "zustand";
import { parseBulk, parseConfig, type VpnConfig } from "../lib/parser";
import { SAMPLE_LINKS } from "../lib/samples";
import { nowTime, seededRand, uid } from "../lib/format";

export type VpnStatus = "disconnected" | "connecting" | "connected" | "disconnecting";
export type Screen = "home" | "servers" | "routing" | "logs";
export type LogLevel = "info" | "success" | "warning" | "error";

export interface LogLine {
  id: string;
  time: string;
  level: LogLevel;
  tag: string;
  msg: string;
}

export interface Settings {
  routing: "global" | "rules" | "direct";
  remoteDns: string;
  localDns: string;
  mux: boolean;
  sniffing: boolean;
  fragment: boolean;
  ipv6: boolean;
  lan: boolean;
  killSwitch: boolean;
  autoConnect: boolean;
  autoPing: boolean;
  perApp: boolean;
}

export interface Stats {
  duration: number;
  downSpeed: number;
  upSpeed: number;
  downTotal: number;
  upTotal: number;
  ping: number;
  chart: number[];
}

interface Toast {
  id: string;
  text: string;
  kind: "ok" | "err" | "info";
}

const emptyStats: Stats = {
  duration: 0,
  downSpeed: 0,
  upSpeed: 0,
  downTotal: 0,
  upTotal: 0,
  ping: 0,
  chart: [],
};

export const DEFAULT_SETTINGS: Settings = {
  routing: "rules",
  remoteDns: "https://1.1.1.1/dns-query",
  localDns: "system",
  mux: true,
  sniffing: true,
  fragment: false,
  ipv6: false,
  lan: true,
  killSwitch: true,
  autoConnect: false,
  autoPing: true,
  perApp: false,
};

const DOMAINS = [
  "api.github.com:443",
  "www.google.com:443",
  "telegram.org:443",
  "www.youtube.com:443",
  "api.spotify.com:443",
  "cdn.discordapp.com:443",
  "chat.openai.com:443",
  "x.com:443",
  "www.wikipedia.org:443",
  "store.steampowered.com:443",
  "netflix.com:443",
  "cloudflare.com:443",
];

function loadSamples(): VpnConfig[] {
  return SAMPLE_LINKS.map((l) => {
    const c = parseConfig(l, "اشتراک ILIA");
    if (c) c.group = "اشتراک ILIA";
    return c!;
  }).filter(Boolean);
}

function loadPersisted(): { configs: VpnConfig[]; activeId: string | null; settings: Settings } {
  try {
    const raw = localStorage.getItem("ilia-state-v1");
    if (raw) {
      const p = JSON.parse(raw);
      return {
        configs: p.configs ?? loadSamples(),
        activeId: p.activeId ?? null,
        settings: { ...DEFAULT_SETTINGS, ...p.settings },
      };
    }
  } catch {
    /* ignore */
  }
  const configs = loadSamples();
  return { configs, activeId: configs[0]?.id ?? null, settings: DEFAULT_SETTINGS };
}

const persisted = loadPersisted();

let statsTimer: ReturnType<typeof setInterval> | null = null;
let logTimer: ReturnType<typeof setInterval> | null = null;
let connectToken = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface VpnState {
  screen: Screen;
  status: VpnStatus;
  configs: VpnConfig[];
  activeId: string | null;
  latencies: Record<string, number | "loading" | "timeout">;
  logs: LogLine[];
  logPaused: boolean;
  stats: Stats;
  settings: Settings;
  toasts: Toast[];

  setScreen: (s: Screen) => void;
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: string) => void;
  addLog: (level: LogLevel, tag: string, msg: string) => void;
  clearLogs: () => void;
  setLogPaused: (v: boolean) => void;

  selectConfig: (id: string) => void;
  deleteConfig: (id: string) => void;
  duplicateConfig: (id: string) => void;
  addConfigs: (configs: VpnConfig[]) => number;
  importText: (text: string, group?: string) => number;
  addSubscription: (name: string, url: string) => Promise<number>;

  ping: (id: string) => void;
  pingAll: () => void;

  toggle: () => void;
  disconnect: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

export const useVpn = create<VpnState>((set, get) => {
  const persist = () => {
    const { configs, activeId, settings } = get();
    localStorage.setItem(
      "ilia-state-v1",
      JSON.stringify({ configs, activeId, settings })
    );
  };

  const activeConfig = (): VpnConfig | null =>
    get().configs.find((c) => c.id === get().activeId) ?? null;

  const stopTimers = () => {
    if (statsTimer) clearInterval(statsTimer);
    if (logTimer) clearInterval(logTimer);
    statsTimer = null;
    logTimer = null;
  };

  const startStatsLoop = () => {
    stopTimers();
    let speed = 120_000;
    statsTimer = setInterval(() => {
      const st = get().stats;
      const target =
        Math.random() < 0.18
          ? 2_500_000 + Math.random() * 4_200_000
          : 40_000 + Math.random() * 750_000;
      speed = speed * 0.62 + target * 0.38;
      const up = speed * (0.06 + Math.random() * 0.14);
      const chart = [...st.chart, Math.round(speed)].slice(-46);
      set({
        stats: {
          ...st,
          duration: st.duration + 1,
          downSpeed: Math.round(speed),
          upSpeed: Math.round(up),
          downTotal: st.downTotal + Math.round(speed),
          upTotal: st.upTotal + Math.round(up),
          ping:
            st.duration % 5 === 0
              ? Math.max(18, get().latencies[get().activeId!] as number) -
                seededRand(String(Math.random()), 0, 12) +
                Math.floor(Math.random() * 18)
              : st.ping,
          chart,
        },
      });
    }, 1000);

    logTimer = setInterval(() => {
      if (get().logPaused) return;
      const c = activeConfig();
      if (!c) return;
      const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
      get().addLog(
        "info",
        `proxy/${c.protocol}/outbound`,
        `tunneling request to tcp:${domain} via ${c.address}:${c.port}`
      );
    }, 3400);
  };

  return {
    screen: "home",
    status: "disconnected",
    configs: persisted.configs,
    activeId: persisted.activeId,
    latencies: {},
    logs: [
      { id: uid(), time: nowTime(), level: "info", tag: "ilia/core", msg: "ILIA v1.0.0 initialized" },
      { id: uid(), time: nowTime(), level: "info", tag: "ilia/core", msg: "Xray-core 1.8.16 loaded · arm64-v8a" },
      { id: uid(), time: nowTime(), level: "success", tag: "ilia/ui", msg: "آماده اتصال · ۸ کانفیگ شناسایی شد" },
    ],
    logPaused: false,
    stats: emptyStats,
    settings: persisted.settings,
    toasts: [],

    setScreen: (s) => set({ screen: s }),

    toast: (text, kind = "info") => {
      const t = { id: uid(), text, kind };
      set((st) => ({ toasts: [...st.toasts, t] }));
      setTimeout(() => get().dismissToast(t.id), 2800);
    },
    dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),

    addLog: (level, tag, msg) =>
      set((st) => ({
        logs: [...st.logs.slice(-180), { id: uid(), time: nowTime(), level, tag, msg }],
      })),
    clearLogs: () =>
      set({
        logs: [
          { id: uid(), time: nowTime(), level: "info", tag: "ilia/ui", msg: "logs cleared by user" },
        ],
      }),
    setLogPaused: (v) => set({ logPaused: v }),

    selectConfig: (id) => {
      if (get().activeId === id) return;
      const wasLive = get().status === "connected" || get().status === "connecting";
      set({ activeId: id });
      persist();
      const c = get().configs.find((x) => x.id === id);
      if (c) get().toast(`سرور «${c.remark.split("•")[0].trim()}» انتخاب شد`, "ok");
      if (wasLive) {
        get().disconnect();
        setTimeout(() => {
          if (get().activeId === id) get().toggle();
        }, 1250);
      }
    },

    deleteConfig: (id) => {
      const c = get().configs.find((x) => x.id === id);
      const wasActive = get().activeId === id;
      if (wasActive && (get().status === "connected" || get().status === "connecting")) {
        get().disconnect();
      }
      set((st) => ({
        configs: st.configs.filter((x) => x.id !== id),
        activeId: wasActive
          ? get().configs.find((x) => x.id !== id)?.id ?? null
          : st.activeId,
      }));
      persist();
      if (c) get().toast(`کانفیگ «${c.remark}» حذف شد`, "info");
    },

    duplicateConfig: (id) => {
      const c = get().configs.find((x) => x.id === id);
      if (!c) return;
      const copy: VpnConfig = { ...c, id: uid(), remark: c.remark + " (کپی)", group: "وارد شده" };
      set((st) => ({ configs: [...st.configs, copy] }));
      persist();
      get().toast("کانفیگ تکثیر شد", "ok");
    },

    addConfigs: (configs) => {
      set((st) => ({ configs: [...st.configs, ...configs], activeId: st.activeId ?? configs[0]?.id }));
      persist();
      return configs.length;
    },

    importText: (text, group = "وارد شده") => {
      const parsed = parseBulk(text, group);
      if (!parsed.length) {
        get().toast("کانفیگ پشتیبانی‌نشده یا نامعتبر است", "err");
        return 0;
      }
      const n = get().addConfigs(parsed);
      get().toast(`${n} کانفیگ با موفقیت وارد شد`, "ok");
      return n;
    },

    addSubscription: async (name, url) => {
      await sleep(1500);
      const cities = ["Germany DE", "Finland FI", "Netherlands NL", "France FR", "Sweden SE"];
      const links = cities
        .slice(0, 3 + Math.floor(Math.random() * 2))
        .map((city, i) => {
          const host = `${name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "sub"}${i + 1}.sub.ilia-net.work`;
          return `vless://6e9f1a2c-3b4d-4e5f-8a9b-0c1d2e3f4a5b@${host}:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&pbk=${PBK}&sid=6a&type=grpc&serviceName=ilia-grpc#${encodeURIComponent(
            `${name} | ${city}-0${i + 1}`
          )}`;
        });
      const parsed = links
        .map((l) => parseConfig(l, name))
        .filter(Boolean) as VpnConfig[];
      const n = get().addConfigs(parsed);
      get().addLog("success", "app/subscription", `subscription "${name}" updated: ${n} nodes from ${url}`);
      get().toast(`اشتراک «${name}» با ${n} سرور به‌روزرسانی شد`, "ok");
      return n;
    },

    ping: (id) => {
      if (get().latencies[id] === "loading") return;
      set((st) => ({ latencies: { ...st.latencies, [id]: "loading" } }));
      const c = get().configs.find((x) => x.id === id);
      if (!c) return;
      const ms = seededRand(c.address + c.remark, 26, 340);
      setTimeout(() => {
        const result = ms > 330 ? "timeout" : ms;
        set((st) => ({ latencies: { ...st.latencies, [id]: result } }));
      }, 650 + Math.random() * 900);
    },

    pingAll: () => {
      get().toast("تست پینگ همه سرورها…", "info");
      get().configs.forEach((c, i) => setTimeout(() => get().ping(c.id), i * 180));
    },

    toggle: () => {
      const state = get();
      if (state.status === "connected" || state.status === "connecting") {
        get().disconnect();
        return;
      }
      const c = activeConfig();
      if (!c) {
        get().toast("اول یک کانفیگ انتخاب کنید", "err");
        set({ screen: "servers" });
        return;
      }
      void (async () => {
        const token = ++connectToken;
        set({ status: "connecting", stats: { ...emptyStats } });
        const s = get().settings;
        const log = (level: LogLevel, tag: string, msg: string, ms: number) =>
          sleep(ms).then(() => get().addLog(level, tag, msg));

        get().addLog("info", "ilia/core", `starting core · routing=${s.routing} · mux=${s.mux}`);
        await log("info", "app/dns", `resolving ${c.address} …`, 320);
        await log(
          "info",
          `transport/internet/${c.transport === "ws" ? "websocket" : c.transport}`,
          `dialing ${c.address}:${c.port}`,
          340
        );
        if (c.security === "reality") {
          await log("info", "transport/internet/tls", `REALITY handshake · sni=${new URL(c.raw.replace(/^[a-z0-9]+:\/\//, "https://")).searchParams.get("sni") || c.address} · uTLS chrome`, 420);
          await log("info", "transport/internet/tls", "REALITY verified · short-id accepted", 300);
        } else if (c.security === "tls") {
          await log("info", "transport/internet/tls", `TLS 1.3 handshake · sni=${c.address}`, 420);
          await log("success", "transport/internet/tls", "certificate verified", 260);
        }
        await log("info", `proxy/${c.protocol}/outbound`, `${c.protocol.toUpperCase()} authenticated · ${c.address}:${c.port}`, 380);
        await log("info", "app/tun", 'tun device "ilia-tun0" created · mtu=1500', 300);
        await log("info", "app/router", s.routing === "rules" ? "geosite:category-ads → block · iran → direct · proxy → tunnel" : `routing mode: ${s.routing}`, 280);
        const ms = 900 + Math.floor(Math.random() * 700);
        await log("success", "app/connector", `tunnel established in ${ms}ms`, 240);

        if (token !== connectToken) return; // switched or cancelled
        const pingMs = seededRand(c.address + c.remark, 26, 200);
        set((st) => ({
          status: "connected",
          latencies: { ...st.latencies, [c.id]: pingMs },
          stats: { ...get().stats, ping: pingMs },
        }));
        get().toast("اتصال برقرار شد", "ok");
        startStatsLoop();
      })();
    },

    disconnect: () => {
      if (get().status === "disconnected") return;
      connectToken++;
      stopTimers();
      set({ status: "disconnecting" });
      get().addLog("info", "app/connector", "stopping core…");
      sleep(450).then(() => {
        get().addLog("info", "app/tun", "tun device closed · routes removed");
        get().addLog("success", "ilia/core", "core stopped gracefully");
        set({ status: "disconnected", stats: emptyStats });
        get().toast("اتصال قطع شد", "info");
      });
    },

    updateSettings: (patch) => {
      set((st) => ({ settings: { ...st.settings, ...patch } }));
      persist();
      const key = Object.keys(patch)[0];
      get().addLog("info", "ilia/settings", `${key} = ${String(Object.values(patch)[0])}`);
    },
  };
});

const PBK = "2uX7DvQz8YkMnWp4sHbN9cLfT6gRjE3vAz1oKyP7xWq";
