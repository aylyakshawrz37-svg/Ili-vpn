export const fa = (n: number | string): string =>
  String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export function formatBytes(bytes: number, perSec = false): string {
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت", "ترابایت"];
  const short = ["B", "KB", "MB", "GB", "TB"];
  if (bytes <= 0) return perSec ? "۰ " + short[1] + "/s" : "۰ " + short[0];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / Math.pow(1024, i);
  const digits = val >= 100 ? fa(val.toFixed(0)) : fa(val.toFixed(1));
  return `${digits} ${short[i]}${perSec ? "/s" : ""}`;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return fa(h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function nowTime(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function clockTime(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return fa(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
}

/** stable pseudo-random in range from a string seed */
export function seededRand(seed: string, min: number, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Math.floor(min + (h % 1000) / 1000 * (max - min));
}
