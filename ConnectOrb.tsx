import { Power, Loader2 } from "lucide-react";
import { useVpn } from "../store/useVpn";
import { cn } from "../utils/cn";

export function ConnectOrb() {
  const status = useVpn((s) => s.status);
  const toggle = useVpn((s) => s.toggle);

  const connected = status === "connected";
  const connecting = status === "connecting" || status === "disconnecting";

  return (
    <div className="relative h-[236px] w-[236px]">
      {/* ambient floor glow */}
      <div
        className={cn(
          "absolute -bottom-6 left-1/2 h-10 w-40 -translate-x-1/2 rounded-[100%] blur-xl transition-opacity duration-700",
          connected ? "bg-cyanx-400/30 opacity-100" : "bg-ilia-500/10 opacity-60"
        )}
      />

      {/* pulse rings while connected */}
      {connected && (
        <>
          <span className="pulse-ring absolute inset-2 rounded-full border border-cyanx-400/40" />
          <span
            className="pulse-ring absolute inset-2 rounded-full border border-ilia-400/30"
            style={{ animationDelay: "1.3s" }}
          />
        </>
      )}

      {/* decorative rotating rings */}
      <span
        className={cn(
          "anim-spin-slow absolute -inset-2 rounded-full border border-dashed transition-colors duration-700",
          connected ? "border-cyanx-400/40" : "border-ilia-400/20"
        )}
      />
      <span className="anim-spin-slower absolute -inset-6 rounded-full border border-dashed border-mist-500/15" />
      {/* orbit dot */}
      <span
        className={cn(
          "anim-spin-slow absolute -inset-2",
          connected ? "" : "opacity-40"
        )}
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyanx-300 shadow-[0_0_10px_#6ef3e8]" />
      </span>

      <button
        onClick={toggle}
        disabled={connecting}
        aria-label="اتصال"
        className="absolute inset-0 rounded-full transition-transform duration-200 active:scale-[0.96] disabled:active:scale-100"
      >
        {/* spinning loader ring while connecting */}
        {connecting && (
          <span className="absolute -inset-3 animate-spin rounded-full border-[3px] border-transparent border-t-cyanx-400 [animation-duration:0.9s]" />
        )}

        <span
          className={cn(
            "absolute inset-0 rounded-full border transition-all duration-700",
            connected
              ? "border-cyanx-300/50"
              : connecting
                ? "border-ilia-400/50"
                : "border-ink-500/80"
          )}
          style={{
            background: connected
              ? "radial-gradient(circle at 32% 22%, #5ff7ea 0%, #19b8e6 42%, #1f63e0 100%)"
              : connecting
                ? "radial-gradient(circle at 32% 22%, #16314f 0%, #0d1826 55%, #0a111b 100%)"
                : "radial-gradient(circle at 32% 22%, #1b2636 0%, #0e1622 55%, #090e16 100%)",
            boxShadow: connected
              ? "0 0 70px rgba(25,184,230,0.45), 0 18px 50px rgba(0,0,0,0.6), inset 0 2px 12px rgba(255,255,255,0.25), inset 0 -14px 30px rgba(9,40,90,0.55)"
              : "0 18px 50px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.06), inset 0 -12px 26px rgba(0,0,0,0.55)",
          }}
        />

        {/* glassy top highlight */}
        <span className="pointer-events-none absolute inset-x-6 top-3 h-1/3 rounded-[100%] bg-white/10 blur-md" />

        <span
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 transition-transform",
            connected && "anim-breathe"
          )}
        >
          {connecting ? (
            <Loader2 className="h-14 w-14 animate-spin text-ilia-300 [animation-duration:1.1s]" strokeWidth={2} />
          ) : (
            <Power
              className={cn(
                "h-16 w-16 transition-colors duration-500",
                connected ? "text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.6)]" : "text-mist-300"
              )}
              strokeWidth={2.1}
            />
          )}
          <span
            className={cn(
              "font-display text-[11px] font-semibold uppercase tracking-[0.35em]",
              connected ? "text-white/90" : "text-mist-500"
            )}
          >
            {connected ? "ILIA" : connecting ? "···" : "POWER"}
          </span>
        </span>
      </button>
    </div>
  );
}
