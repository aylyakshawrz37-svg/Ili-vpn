import { useEffect, useRef } from "react";
import { Pause, Play, Trash2, Copy, Share2, Terminal } from "lucide-react";
import { useVpn, type LogLevel } from "../store/useVpn";
import { cn } from "../utils/cn";

const LEVEL_STYLE: Record<LogLevel, { text: string; label: string }> = {
  info: { text: "text-ilia-300", label: "Info" },
  success: { text: "text-good-400", label: " OK " },
  warning: { text: "text-warn-400", label: "Warn" },
  error: { text: "text-bad-400", label: "Err " },
};

export function LogsScreen() {
  const logs = useVpn((s) => s.logs);
  const paused = useVpn((s) => s.logPaused);
  const setPaused = useVpn((s) => s.setLogPaused);
  const clearLogs = useVpn((s) => s.clearLogs);
  const toast = useVpn((s) => s.toast);
  const status = useVpn((s) => s.status);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paused && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const exportText = () =>
    logs.map((l) => `[${l.time}] ${LEVEL_STYLE[l.level].label} ${l.tag}: ${l.msg}`).join("\n");

  return (
    <div className="flex h-full flex-col px-5">
      <header className="flex items-center justify-between py-3">
        <div>
          <h1 className="flex items-center gap-2 text-[19px] font-extrabold text-mist-100">
            لاگ هسته
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "connected" ? "anim-glow bg-good-400" : paused ? "bg-warn-400" : "bg-mist-500"
              )}
            />
          </h1>
          <p className="mt-0.5 text-[11px] text-mist-500">
            {paused ? "دنبال‌کردن لاگ متوقف است" : "خروجی زنده Xray-core"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <LogBtn
            onClick={() => setPaused(!paused)}
            label={paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          />
          <LogBtn
            onClick={() => {
              navigator.clipboard?.writeText(exportText()).catch(() => {});
              toast("لاگ‌ها کپی شد", "ok");
            }}
            label={<Copy className="h-4 w-4" />}
          />
          <LogBtn
            onClick={() => {
              if (navigator.share) {
                navigator.share({ text: exportText() }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(exportText()).catch(() => {});
                toast("لاگ‌ها برای اشتراک‌گذاری کپی شد", "ok");
              }
            }}
            label={<Share2 className="h-4 w-4" />}
          />
          <LogBtn onClick={clearLogs} label={<Trash2 className="h-4 w-4 text-bad-400" />} />
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden rounded-3xl border border-ink-700 bg-[#04070c]">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-ink-700/70 bg-ink-850/80 px-4 py-2.5">
          <Terminal className="h-3.5 w-3.5 text-mist-500" />
          <span className="font-mono text-[10px] font-semibold text-mist-400">ilia-core · tty0</span>
          <span className="ms-auto flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-bad-500/70" />
            <span className="h-2 w-2 rounded-full bg-warn-500/70" />
            <span className="h-2 w-2 rounded-full bg-good-500/70" />
          </span>
        </div>

        <div
          ref={boxRef}
          dir="ltr"
          className="scroll-area h-[calc(100%-38px)] space-y-1 overflow-y-auto px-3.5 py-3 text-left font-mono text-[10px] leading-[1.55]"
        >
          {logs.map((l) => (
            <div key={l.id} className="flex gap-1.5">
              <span className="shrink-0 text-mist-600">{l.time}</span>
              <span className={cn("shrink-0 font-semibold", LEVEL_STYLE[l.level].text)}>
                [{LEVEL_STYLE[l.level].label}]
              </span>
              <span className="shrink-0 text-violet-300/80">{l.tag}:</span>
              <span className="break-all text-mist-300/90">{l.msg}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 pt-1 text-cyanx-300">
            <span>$</span>
            <span className="anim-blink">▌</span>
          </div>
        </div>
      </div>

      <p className="py-3 text-center text-[10px] text-mist-600">
        ILIA Core v1.0.0 · based on Xray-core 1.8.16
      </p>
    </div>
  );
}

function LogBtn({ onClick, label }: { onClick: () => void; label: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-750 text-mist-300 ring-1 ring-ink-600/70 transition active:scale-90"
    >
      {label}
    </button>
  );
}
