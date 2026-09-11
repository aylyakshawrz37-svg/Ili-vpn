import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  ClipboardPaste,
  ScanLine,
  Rss,
  SquarePen,
  ChevronLeft,
  Link2,
  Loader2,
  CheckCircle2,
  X,
  Flashlight,
} from "lucide-react";
import { Sheet } from "./ui";
import { useVpn } from "../store/useVpn";
import { buildVmess, parseConfig, type VpnConfig } from "../lib/parser";
import { uid } from "../lib/format";
import { cn } from "../utils/cn";

type Panel = "none" | "menu" | "paste" | "sub" | "manual" | "scan";

interface UIState {
  panel: Panel;
  open: (p: Panel) => void;
  close: () => void;
}

export const useUI = create<UIState>((set) => ({
  panel: "none",
  open: (panel) => set({ panel }),
  close: () => set({ panel: "none" }),
}));

const EXAMPLE =
  "vless://6e9f1a2c-3b4d-4e5f-8a9b-0c1d2e3f4a5b@de2.ilia-net.work:8443?encryption=none&security=tls&sni=de2.ilia-net.work&fp=chrome&type=ws&path=%2Filia-ws#ILIA%20%7C%20Germany%20DE-09%20%28manual%29";

const MENU_ITEMS = [
  {
    id: "clipboard" as const,
    icon: ClipboardPaste,
    title: "افزودن از کلیپ‌بورد",
    desc: "خواندن خودکار لینک کپی‌شده",
    tint: "text-cyanx-300 bg-cyanx-500/10 ring-cyanx-400/20",
  },
  {
    id: "scan" as const,
    icon: ScanLine,
    title: "اسکن QR Code",
    desc: "با دوربین کانفیگ اضافه کنید",
    tint: "text-ilia-300 bg-ilia-500/10 ring-ilia-400/20",
  },
  {
    id: "sub" as const,
    icon: Rss,
    title: "افزودن اشتراک",
    desc: "Subscription با به‌روزرسانی گروهی",
    tint: "text-good-400 bg-good-500/10 ring-good-400/20",
  },
  {
    id: "manual" as const,
    icon: SquarePen,
    title: "افزودن دستی",
    desc: "VMess · VLESS · Trojan · Shadowsocks",
    tint: "text-warn-400 bg-warn-500/10 ring-warn-400/20",
  },
];

export function AddConfigFlow() {
  const { panel, open, close } = useUI();
  const importText = useVpn((s) => s.importText);
  const addConfigs = useVpn((s) => s.addConfigs);
  const addSubscription = useVpn((s) => s.addSubscription);

  return (
    <>
      {/* ---------- main menu ---------- */}
      <Sheet open={panel === "menu"} onClose={close} title="افزودن کانفیگ">
        <div className="flex flex-col gap-2 py-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "clipboard") {
                  const p = navigator.clipboard?.readText?.();
                  if (p) {
                    p.then((txt) => {
                      if (txt && /:\/\//.test(txt) && importText(txt) > 0) {
                        close();
                      } else {
                        open("paste");
                      }
                    }).catch(() => open("paste"));
                  } else {
                    open("paste");
                  }
                } else {
                  open(item.id);
                }
              }}
              className="flex items-center gap-4 rounded-2xl border border-transparent bg-ink-800/70 p-4 text-right transition hover:border-ink-500/70 hover:bg-ink-750 active:scale-[0.98]"
            >
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", item.tint)}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-[13.5px] font-bold text-mist-100">{item.title}</span>
                <span className="mt-0.5 block text-[11px] text-mist-400">{item.desc}</span>
              </span>
              <ChevronLeft className="h-4.5 w-4.5 text-mist-500" />
            </button>
          ))}

          <div className="mt-2 rounded-2xl border border-ilia-400/15 bg-ilia-500/5 p-3.5">
            <p className="text-[11px] leading-5 text-mist-300">
              همه فرمت‌ها پشتیبانی می‌شود:
              <span className="font-mono text-cyanx-300"> vmess://, vless://, trojan://, ss://, hy2:// </span>
              و لینک اشتراک به‌صورت Base64.
            </p>
          </div>
        </div>
      </Sheet>

      {/* ---------- paste link ---------- */}
      <PastePanel
        open={panel === "paste"}
        onBack={() => open("menu")}
        onClose={close}
        onImport={(txt) => {
          const ok = importText(txt) > 0;
          if (ok) close();
          return ok;
        }}
      />

      {/* ---------- subscription ---------- */}
      <SubPanel
        open={panel === "sub"}
        onBack={() => open("menu")}
        onClose={close}
        onSubmit={async (name, url) => {
          await addSubscription(name, url);
          close();
        }}
      />

      {/* ---------- manual ---------- */}
      <ManualPanel
        open={panel === "manual"}
        onBack={() => open("menu")}
        onClose={close}
        onAdd={(c) => {
          addConfigs([c]);
          useVpn.getState().toast("کانفیگ دستی ساخته شد", "ok");
          close();
        }}
      />

      {/* ---------- QR scanner ---------- */}
      {panel === "scan" && <Scanner onClose={close} />}
    </>
  );
}

/* ================= sub-panels ================= */

function PanelHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 pt-1">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-mist-300"
      >
        <ChevronLeft className="h-5 w-5 rotate-180" />
      </button>
      <h3 className="flex-1 text-[14px] font-bold text-mist-100">{title}</h3>
    </div>
  );
}

const fieldCls =
  "w-full rounded-2xl border border-ink-600 bg-ink-800 px-4 py-3 text-[13px] text-mist-100 outline-none placeholder:text-mist-500 focus:border-ilia-400/60 focus:ring-2 focus:ring-ilia-500/20 transition";

function PastePanel({
  open,
  onBack,
  onClose,
  onImport,
}: {
  open: boolean;
  onBack: () => void;
  onClose: () => void;
  onImport: (txt: string) => boolean;
}) {
  const [txt, setTxt] = useState("");
  return (
    <Sheet open={open} onClose={onClose}>
      <PanelHeader onBack={onBack} title="چسباندن لینک کانفیگ" />
      <textarea
        dir="ltr"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="vmess:// ... یا vless:// ..."
        className={cn(fieldCls, "h-32 resize-none text-left font-mono text-[11.5px] leading-5")}
      />
      <button
        onClick={() => setTxt(EXAMPLE)}
        className="mt-2 flex items-center gap-1.5 text-[11px] text-ilia-300"
      >
        <Link2 className="h-3.5 w-3.5" />
        قراردادن یک نمونه برای تست
      </button>
      <button
        onClick={() => {
          if (onImport(txt)) setTxt("");
        }}
        disabled={!txt.trim()}
        className="mt-4 w-full rounded-2xl bg-gradient-to-l from-ilia-500 to-cyanx-500 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-ilia-500/25 transition active:scale-[0.98] disabled:opacity-40"
      >
        بررسی و افزودن کانفیگ
      </button>
    </Sheet>
  );
}

function SubPanel({
  open,
  onBack,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onBack: () => void;
  onClose: () => void;
  onSubmit: (name: string, url: string) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <Sheet open={open} onClose={onClose}>
      <PanelHeader onBack={onBack} title="اشتراک جدید (Subscription)" />
      <label className="mb-1.5 block text-[11.5px] text-mist-400">نام اشتراک</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="مثلاً: اشتراک شخصی ایلیا"
        className={fieldCls}
      />
      <label className="mb-1.5 mt-4 block text-[11.5px] text-mist-400">لینک اشتراک</label>
      <input
        dir="ltr"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/sub/xxxx"
        className={cn(fieldCls, "text-left font-mono text-[11.5px]")}
      />
      <button
        disabled={loading || !url.trim()}
        onClick={async () => {
          setLoading(true);
          await onSubmit(name.trim() || "اشتراک", url.trim());
          setLoading(false);
          setName("");
          setUrl("");
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-ilia-500 to-cyanx-500 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-ilia-500/25 transition active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
            در حال دریافت سرورها…
          </>
        ) : (
          <Rss className="h-4.5 w-4.5" />
        )}
        {!loading && "به‌روزرسانی اشتراک"}
      </button>
    </Sheet>
  );
}

function ManualPanel({
  open,
  onBack,
  onClose,
  onAdd,
}: {
  open: boolean;
  onBack: () => void;
  onClose: () => void;
  onAdd: (c: VpnConfig) => void;
}) {
  const [proto, setProto] = useState<"vmess" | "vless" | "trojan" | "ss">("vless");
  const [remark, setRemark] = useState("");
  const [address, setAddress] = useState("");
  const [port, setPort] = useState("443");
  const [uuid, setUuid] = useState("");

  const submit = () => {
    const tagName = remark.trim() || `${proto.toUpperCase()} · ${address}`;
    let link = "";
    const id = uuid.trim() || uid();
    if (proto === "vmess") {
      link = buildVmess({ remark: tagName, address: address.trim(), port: Number(port) || 443, id, tls: true, network: "ws" });
    } else if (proto === "vless") {
      link = `vless://${id}@${address.trim()}:${port || 443}?encryption=none&security=tls&fp=chrome&type=tcp#${encodeURIComponent(tagName)}`;
    } else if (proto === "trojan") {
      link = `trojan://${id}@${address.trim()}:${port || 443}?security=tls&sni=${address.trim()}#${encodeURIComponent(tagName)}`;
    } else {
      link = `ss://${btoa(`chacha20-ietf-poly1305:${id}`)}@${address.trim()}:${port || 8388}#${encodeURIComponent(tagName)}`;
    }
    const c = parseConfig(link, "ساخته دستی");
    if (c) {
      onAdd(c);
      setRemark("");
      setAddress("");
      setUuid("");
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <PanelHeader onBack={onBack} title="افزودن دستی کانفیگ" />

      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {(["vless", "vmess", "trojan", "ss"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setProto(p)}
            className={cn(
              "rounded-xl py-2 font-mono text-[10.5px] font-bold ring-1 transition",
              proto === p
                ? "bg-ilia-500/20 text-cyanx-300 ring-ilia-400/50"
                : "bg-ink-800 text-mist-400 ring-ink-600"
            )}
          >
            {p === "ss" ? "SS" : p.toUpperCase()}
          </button>
        ))}
      </div>

      <label className="mb-1.5 block text-[11.5px] text-mist-400">نام سرور</label>
      <input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="ILIA | My Server" className={fieldCls} />

      <label className="mb-1.5 mt-3 block text-[11.5px] text-mist-400">آدرس سرور</label>
      <input
        dir="ltr"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="example.com"
        className={cn(fieldCls, "text-left font-mono text-[12px]")}
      />

      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-[11.5px] text-mist-400">پورت</label>
          <input
            dir="ltr"
            inputMode="numeric"
            value={port}
            onChange={(e) => setPort(e.target.value.replace(/\D/g, ""))}
            className={cn(fieldCls, "text-left font-mono")}
          />
        </div>
        <div className="flex-[2]">
          <label className="mb-1.5 block text-[11.5px] text-mist-400">
            {proto === "ss" ? "رمز عبور" : "UUID / شناسه"}
          </label>
          <input
            dir="ltr"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            placeholder="به‌صورت خودکار"
            className={cn(fieldCls, "text-left font-mono text-[11px]")}
          />
        </div>
      </div>

      <button
        disabled={!address.trim()}
        onClick={submit}
        className="mt-5 w-full rounded-2xl bg-gradient-to-l from-ilia-500 to-cyanx-500 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-ilia-500/25 transition active:scale-[0.98] disabled:opacity-40"
      >
        ساخت و ذخیره کانفیگ
      </button>
    </Sheet>
  );
}

/* ================= QR scanner simulation ================= */

function Scanner({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"search" | "found">("search");
  const addConfigs = useVpn((s) => s.addConfigs);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("found"), 3200);
    const t2 = setTimeout(() => {
      const c = parseConfig(EXAMPLE.replace("DE-09%20%28manual%29", "DE-09%20%E2%80%A2%20QR"), "وارد شده");
      if (c) {
        addConfigs([c]);
        useVpn.getState().toast("کد QR خوانده شد", "ok");
      }
      onClose();
    }, 4300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [addConfigs, onClose]);

  return (
    <div className="anim-fade absolute inset-0 z-[70] flex flex-col bg-black">
      {/* faux camera backdrop */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, #10243a 0%, #050a12 58%, #000 100%)",
        }}
      />
      <div className="bg-grid absolute inset-0 opacity-40" />

      <div className="relative flex items-center justify-between px-6 pb-2 pt-14">
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
          <X className="h-5 w-5" />
        </button>
        <span className="text-[13px] font-semibold text-mist-200">اسکن QR Code</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur">
          <Flashlight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-10">
        <div className="relative h-64 w-64">
          {/* corner brackets */}
          {[
            "top-0 start-0 border-s-4 border-t-4 rounded-tl-3xl",
            "top-0 end-0 border-e-4 border-t-4 rounded-tr-3xl",
            "bottom-0 start-0 border-s-4 border-b-4 rounded-bl-3xl",
            "bottom-0 end-0 border-e-4 border-b-4 rounded-br-3xl",
          ].map((c) => (
            <span key={c} className={cn("absolute h-12 w-12 border-cyanx-400", c)} />
          ))}
          {/* scan line */}
          {stage === "search" && (
            <span className="anim-scan absolute inset-x-3 h-0.5 rounded-full bg-cyanx-400 shadow-[0_0_16px_#2de1d6]" />
          )}
          {stage === "found" && (
            <span className="anim-fade absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-good-400 drop-shadow-[0_0_18px_#35ecaa]" />
            </span>
          )}
        </div>

        <p className="mt-10 text-[13px] font-medium text-mist-200">
          {stage === "search" ? (
            <>
              بارکد را داخل کادر قرار دهید
              <span className="anim-blink text-cyanx-300"> …</span>
            </>
          ) : (
            <span className="text-good-400">کد شناسایی شد؛ در حال افزودن…</span>
          )}
        </p>
        <p className="mt-2 max-w-[240px] text-center text-[11px] leading-5 text-mist-500">
          دوربین به‌صورت محلی پردازش می‌شود و هیچ تصویری ارسال نمی‌گردد.
        </p>
      </div>
    </div>
  );
}
