import { useEffect, useState } from "react";
import { useVpn } from "./store/useVpn";
import { StatusBar, BottomNav, Toasts } from "./components/ui";
import { AddConfigFlow } from "./components/AddConfig";
import { HomeScreen } from "./screens/HomeScreen";
import { ServersScreen } from "./screens/ServersScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { LogsScreen } from "./screens/LogsScreen";
import { ShieldCheck, Zap } from "lucide-react";

export default function App() {
  const screen = useVpn((s) => s.screen);
  const [splashGone, setSplashGone] = useState(false);
  const [splashFade, setSplashFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFade(true), 1250);
    const t2 = setTimeout(() => setSplashGone(true), 1750);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#04060a] sm:py-6">
      {/* ---------- desktop ambient backdrop ---------- */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
        <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ilia-500/12 blur-[140px]" />
        <div className="absolute bottom-0 start-[18%] h-[320px] w-[320px] rounded-full bg-cyanx-500/10 blur-[120px]" />
        <div className="absolute end-[14%] top-[12%] h-[260px] w-[260px] rounded-full bg-ilia-600/10 blur-[110px]" />
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[260px] font-bold tracking-[0.18em] text-white/[0.025]"
          aria-hidden
        >
          ILIA
        </span>
      </div>

      {/* side features, wide screens only */}
      <div className="pointer-events-none absolute start-10 top-1/2 hidden -translate-y-1/2 select-none flex-col gap-7 xl:flex">
        <Feature title="همه پروتکل‌ها" desc="VMess · VLESS Reality · Trojan · SS · Hysteria2" />
        <Feature title="مسیریابی هوشمند" desc="قانون‌محور، DNS ابری و Fragment" />
      </div>
      <div className="pointer-events-none absolute end-10 top-1/2 hidden -translate-y-1/2 select-none flex-col gap-7 xl:flex">
        <Feature title="اشتراک و QR" desc="وارد کردن گروهی کانفیگ و اسکن بارکد" />
        <Feature title="حداکثر سرعت" desc="Mux · gRPC · WebSocket · REALITY" />
      </div>

      {/* ---------- phone ---------- */}
      <div className="relative z-10 h-full w-full sm:h-auto">
        {/* physical buttons */}
        <span className="absolute -end-[14px] top-36 hidden h-16 w-[4px] rounded-e bg-[#1a2230] sm:block" />
        <span className="absolute -end-[14px] top-56 hidden h-10 w-[4px] rounded-e bg-[#1a2230] sm:block" />
        <span className="absolute -start-[14px] top-44 hidden h-20 w-[4px] rounded-s bg-[#1a2230] sm:block" />

        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-ink-900 sm:h-[852px] sm:max-h-[94vh] sm:w-[404px] sm:rounded-[2.9rem] sm:border-[9px] sm:border-[#0a0e15] sm:shadow-[0_40px_120px_rgba(0,0,0,0.85),0_0_0_1px_rgba(78,163,255,0.12),inset_0_0_0.5px_rgba(255,255,255,0.06)]">
          {/* screen texture */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(47,124,255,0.08),transparent_55%)]" />

          <StatusBar />

          <main className="relative z-10 flex-1 overflow-hidden">
            <div key={screen} className="anim-screen absolute inset-0">
              {screen === "home" && <HomeScreen />}
              {screen === "servers" && <ServersScreen />}
              {screen === "routing" && <SettingsScreen />}
              {screen === "logs" && <LogsScreen />}
            </div>
          </main>

          <BottomNav />

          {/* overlays */}
          <AddConfigFlow />
          <Toasts />

          {/* gesture pill */}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-40 h-1 w-28 -translate-x-1/2 rounded-full bg-mist-500/40" />

          {/* splash */}
          {!splashGone && (
            <div
              className={`absolute inset-0 z-[80] flex flex-col items-center justify-center bg-ink-950 transition-opacity duration-500 ${
                splashFade ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 42%, rgba(47,124,255,0.16), transparent 60%)",
                }}
              />
              <div className="anim-logo-pop relative flex flex-col items-center">
                <span className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-ilia-500 to-cyanx-500 shadow-[0_20px_60px_rgba(47,124,255,0.5)]">
                  <Zap className="h-12 w-12 text-white" fill="white" fillOpacity={0.3} strokeWidth={1.8} />
                </span>
                <span className="mt-6 font-display text-3xl font-bold tracking-[0.25em] text-mist-100">
                  ILIA
                </span>
                <span className="mt-1.5 text-[11px] tracking-[0.2em] text-mist-500">
                  ایلیا · فیلترشکن همه‌کاره
                </span>
              </div>
              <div className="absolute bottom-24 h-[3px] w-32 overflow-hidden rounded-full bg-ink-700">
                <span className="anim-bootbar block h-full w-full rounded-full bg-gradient-to-l from-ilia-500 to-cyanx-400" />
              </div>
              <span className="absolute bottom-16 font-mono text-[9px] text-mist-600">
                Xray-core 1.8.16 · arm64-v8a
              </span>
            </div>
          )}
        </div>
      </div>

      {/* bottom caption */}
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] text-mist-500 sm:flex">
        <ShieldCheck className="h-3.5 w-3.5 text-cyanx-400" />
        <span className="font-display font-semibold tracking-wide text-mist-400">ILIA VPN</span>
        <span>·</span>
        <span>پیش‌نمایش رابط اندروید · نسخه ۱٫۰٫۰</span>
      </div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="max-w-[230px]">
      <h3 className="mb-1 text-[15px] font-bold text-mist-200">{title}</h3>
      <p className="text-[11.5px] leading-5 text-mist-500">{desc}</p>
    </div>
  );
}
