import {
  Globe,
  Route as RouteIcon,
  ArrowRightToLine,
  ShieldCheck,
  Zap,
  Radar,
  BrickWall,
  Network,
  Cpu,
  Power,
  Activity,
  Smartphone,
  Check,
  RotateCcw,
  Code2,
  Heart,
  Sparkles,
} from "lucide-react";
import { useVpn, DEFAULT_SETTINGS } from "../store/useVpn";
import { SectionTitle, Switch } from "../components/ui";
import { cn } from "../utils/cn";
import type { ReactNode } from "react";

const ROUTES = [
  {
    id: "global" as const,
    icon: Globe,
    title: "سراسری",
    desc: "تمام ترافیک دستگاه از تونل عبور می‌کند",
  },
  {
    id: "rules" as const,
    icon: RouteIcon,
    title: "قانون‌محور",
    desc: "سایت‌های ایرانی مستقیم · بقیه تونل · تبلیغات بلاک",
    badge: "پیشنهادی",
  },
  {
    id: "direct" as const,
    icon: ArrowRightToLine,
    title: "مستقیم",
    desc: "تونل خاموش؛ فقط برای تست اتصال",
  },
];

const DNS_REMOTE = [
  { id: "https://1.1.1.1/dns-query", label: "Cloudflare", hint: "1.1.1.1 · سریع و خصوصی" },
  { id: "https://dns.google/dns-query", label: "Google", hint: "dns.google · پایدار" },
  { id: "https://free.shecan.ir/dns-query", label: "شکن", hint: "تحریم‌کش · داخلی" },
  { id: "https://dns.arvancloud.ir/dns-query", label: "ابر آروان", hint: "سریع برای ایران" },
];

const DNS_LOCAL = [
  { id: "system", label: "سیستم" },
  { id: "shecan", label: "شکن" },
  { id: "google", label: "گوگل" },
];

export function SettingsScreen() {
  const settings = useVpn((s) => s.settings);
  const update = useVpn((s) => s.updateSettings);
  const toast = useVpn((s) => s.toast);

  return (
    <div className="scroll-area h-full px-5 pb-10">
      <header className="py-3">
        <h1 className="text-[19px] font-extrabold text-mist-100">مسیریابی و تنظیمات</h1>
        <p className="mt-0.5 text-[11px] text-mist-500">پیکربندی تونل، DNS و حفاظت</p>
      </header>

      {/* routing mode */}
      <SectionTitle>حالت اتصال</SectionTitle>
      <div className="flex flex-col gap-2">
        {ROUTES.map((r) => {
          const active = settings.routing === r.id;
          return (
            <button
              key={r.id}
              onClick={() => update({ routing: r.id })}
              className={cn(
                "flex items-center gap-3.5 rounded-3xl border p-4 text-right transition",
                active
                  ? "border-ilia-400/45 bg-ilia-500/10"
                  : "border-transparent bg-ink-800/60 hover:bg-ink-750"
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-2xl",
                  active ? "bg-gradient-to-br from-ilia-500 to-cyanx-500 text-white" : "bg-ink-750 text-mist-300 ring-1 ring-ink-600"
                )}
              >
                <r.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[13.5px] font-bold text-mist-100">{r.title}</span>
                  {r.badge && (
                    <span className="rounded-md bg-good-500/15 px-1.5 py-0.5 text-[9px] font-bold text-good-400 ring-1 ring-good-400/25">
                      {r.badge}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-mist-400">{r.desc}</span>
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                  active ? "border-cyanx-400 bg-cyanx-400 text-ink-950" : "border-ink-500"
                )}
              >
                {active && <Check className="h-3 w-3" strokeWidth={3.5} />}
              </span>
            </button>
          );
        })}
      </div>

      {/* DNS */}
      <SectionTitle>DNS ریموت (داخل تونل)</SectionTitle>
      <div className="glass overflow-hidden rounded-3xl">
        {DNS_REMOTE.map((d, i) => {
          const active = settings.remoteDns === d.id;
          return (
            <button
              key={d.id}
              onClick={() => update({ remoteDns: d.id })}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-right transition hover:bg-ink-750/60",
                i !== 0 && "border-t border-ink-700/60"
              )}
            >
              <Network className={cn("h-4 w-4", active ? "text-cyanx-300" : "text-mist-500")} />
              <span className="flex-1">
                <span className="block text-[12.5px] font-bold text-mist-100">{d.label}</span>
                <span dir="ltr" className="mt-0.5 block text-start font-mono text-[9.5px] text-mist-500">
                  {d.id}
                </span>
              </span>
              <span className="text-[10px] text-mist-500">{d.hint}</span>
              {active && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-cyanx-400 text-ink-950">
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <SectionTitle>DNS لوکال</SectionTitle>
      <div className="flex gap-1.5">
        {DNS_LOCAL.map((d) => (
          <button
            key={d.id}
            onClick={() => update({ localDns: d.id })}
            className={cn(
              "flex-1 rounded-2xl py-2.5 text-[12px] font-semibold transition ring-1",
              settings.localDns === d.id
                ? "bg-ilia-500/15 text-cyanx-300 ring-ilia-400/40"
                : "bg-ink-800 text-mist-400 ring-ink-600"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* tunnel toggles */}
      <SectionTitle>تونل و دور زدن</SectionTitle>
      <div className="glass divide-y divide-ink-700/60 overflow-hidden rounded-3xl">
        <ToggleRow
          icon={<Zap className="h-4 w-4" />}
          tint="text-cyanx-300 bg-cyanx-500/10"
          title="مالتی‌پلکس (Mux)"
          desc="کاهش دست‌دهی · سرعت بالاتر اتصال"
          checked={settings.mux}
          onChange={(v) => update({ mux: v })}
        />
        <ToggleRow
          icon={<Radar className="h-4 w-4" />}
          tint="text-ilia-300 bg-ilia-500/10"
          title="Sniffing"
          desc="تشخیص خودکار دامنه و SNI"
          checked={settings.sniffing}
          onChange={(v) => update({ sniffing: v })}
        />
        <ToggleRow
          icon={<BrickWall className="h-4 w-4" />}
          tint="text-warn-400 bg-warn-500/10"
          title="Fragment"
          desc="تکه‌تکه‌سازی بسته‌ها برای عبور از فیلتر"
          badge="جدید"
          checked={settings.fragment}
          onChange={(v) => update({ fragment: v })}
        />
        <ToggleRow
          icon={<Globe className="h-4 w-4" />}
          tint="text-good-400 bg-good-500/10"
          title="IPv6"
          desc="استفاده از شبکه نسخه شش"
          checked={settings.ipv6}
          onChange={(v) => update({ ipv6: v })}
        />
        <ToggleRow
          icon={<Network className="h-4 w-4" />}
          tint="text-mist-300 bg-mist-500/10"
          title="دسترسی شبکه محلی (LAN)"
          desc="192.168.x مستقیم باقی بماند"
          checked={settings.lan}
          onChange={(v) => update({ lan: v })}
        />
      </div>

      {/* protection */}
      <SectionTitle>حفاظت و پیشرفته</SectionTitle>
      <div className="glass divide-y divide-ink-700/60 overflow-hidden rounded-3xl">
        <ToggleRow
          icon={<ShieldCheck className="h-4 w-4" />}
          tint="text-good-400 bg-good-500/10"
          title="Kill Switch"
          desc="قطع کامل اینترنت هنگام افت تونل"
          checked={settings.killSwitch}
          onChange={(v) => update({ killSwitch: v })}
        />
        <ToggleRow
          icon={<Power className="h-4 w-4" />}
          tint="text-cyanx-300 bg-cyanx-500/10"
          title="اتصال خودکار"
          desc="به‌محض باز شدن اپ، تونل برقرار شود"
          checked={settings.autoConnect}
          onChange={(v) => update({ autoConnect: v })}
        />
        <ToggleRow
          icon={<Activity className="h-4 w-4" />}
          tint="text-warn-400 bg-warn-500/10"
          title="پینگ خودکار"
          desc="تست دوره‌ای سرعت سرورها"
          checked={settings.autoPing}
          onChange={(v) => update({ autoPing: v })}
        />
        <ToggleRow
          icon={<Smartphone className="h-4 w-4" />}
          tint="text-ilia-300 bg-ilia-500/10"
          title="پروکسی برنامه‌به‌برنامه"
          desc="انتخاب اپ‌هایی که از تونل رد می‌شوند"
          checked={settings.perApp}
          onChange={(v) => {
            update({ perApp: v });
            if (v) toast("لیست برنامه‌ها شبیه‌سازی شده است", "info");
          }}
        />
      </div>

      {/* about */}
      <SectionTitle>درباره ایلیا</SectionTitle>
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ilia-500 to-cyanx-500 shadow-lg shadow-ilia-500/25">
            <Sparkles className="h-6 w-6 text-white" />
          </span>
          <div className="flex-1">
            <p className="font-display text-[15px] font-bold text-mist-100">ILIA VPN</p>
            <p className="text-[10.5px] text-mist-500">نسخه ۱٫۰٫۰ · بیلد ۲۴ (arm64-v8a)</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10.5px]">
          <InfoPill icon={<Cpu className="h-3.5 w-3.5" />} label="هسته: Xray-core 1.8.16" />
          <InfoPill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Sing-box P1 سازگار" />
          <InfoPill icon={<Code2 className="h-3.5 w-3.5" />} label="سورس: github/ilia" />
          <InfoPill icon={<Heart className="h-3.5 w-3.5" />} label="ساخته‌شده برای ایران" />
        </div>
        <button
          onClick={() => {
            update(DEFAULT_SETTINGS);
            toast("تنظیمات به حالت پیش‌فرض برگشت", "ok");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-600 bg-ink-800 py-3 text-[12px] font-bold text-mist-200 transition active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          بازگردانی تنظیمات پیش‌فرض
        </button>
      </div>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-xl bg-ink-800 px-2.5 py-2 text-mist-300 ring-1 ring-ink-700">
      <span className="text-mist-500">{icon}</span>
      {label}
    </span>
  );
}

function ToggleRow({
  icon,
  tint,
  title,
  desc,
  badge,
  checked,
  onChange,
}: {
  icon: ReactNode;
  tint: string;
  title: string;
  desc: string;
  badge?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tint)}>
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[12.5px] font-bold text-mist-100">{title}</span>
          {badge && (
            <span className="rounded-md bg-warn-500/15 px-1.5 py-0.5 text-[8.5px] font-bold text-warn-400 ring-1 ring-warn-400/25">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10.5px] text-mist-500">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}
