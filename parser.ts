import { uid } from "./format";

export type Protocol =
  | "vmess"
  | "vless"
  | "trojan"
  | "shadowsocks"
  | "hysteria2"
  | "socks"
  | "http"
  | "unknown";

export interface VpnConfig {
  id: string;
  protocol: Protocol;
  remark: string;
  address: string;
  port: number;
  transport: string; // tcp / ws / grpc / quic / h2
  security: string; // none / tls / reality / xtls
  flag: string;
  raw: string;
  group: string;
}

export const PROTOCOL_LABEL: Record<Protocol, string> = {
  vmess: "VMESS",
  vless: "VLESS",
  trojan: "TROJAN",
  shadowsocks: "SS",
  hysteria2: "HY2",
  socks: "SOCKS",
  http: "HTTP",
  unknown: "AUTO",
};

const FLAGS: [string, string][] = [
  ["آلمان", "🇩🇪"], ["germany", "🇩🇪"], ["de1", "🇩🇪"], ["de2", "🇩🇪"], [" frankfurt", "🇩🇪"],
  ["فنلاند", "🇫🇮"], ["finland", "🇫🇮"], ["helsinki", "🇫🇮"],
  ["هلند", "🇳🇱"], ["netherlands", "🇳🇱"], ["holland", "🇳🇱"], ["amsterdam", "🇳🇱"], ["nl1", "🇳🇱"],
  ["آمریکا", "🇺🇸"], ["america", "🇺🇸"], ["united states", "🇺🇸"], [" usa", "🇺🇸"], ["us-", "🇺🇸"],
  ["new york", "🇺🇸"], ["los angeles", "🇺🇸"], ["seattle", "🇺🇸"], ["dallas", "🇺🇸"], ["chicago", "🇺🇸"],
  ["انگلیس", "🇬🇧"], ["england", "🇬🇧"], ["britain", "🇬🇧"], ["london", "🇬🇧"], [" uk", "🇬🇧"],
  ["فرانسه", "🇫🇷"], ["france", "🇫🇷"], ["paris", "🇫🇷"],
  ["سنگاپور", "🇸🇬"], ["singapore", "🇸🇬"], ["sgp", "🇸🇬"], [" sg", "🇸🇬"],
  ["ترکیه", "🇹🇷"], ["turkey", "🇹🇷"], ["istanbul", "🇹🇷"], [" tr", "🇹🇷"],
  ["امارات", "🇦🇪"], ["dubai", "🇦🇪"], ["uae", "🇦🇪"],
  ["روسیه", "🇷🇺"], ["russia", "🇷🇺"], ["moscow", "🇷🇺"],
  ["کانادا", "🇨🇦"], ["canada", "🇨🇦"], ["toronto", "🇨🇦"],
  ["ژاپن", "🇯🇵"], ["japan", "🇯🇵"], ["tokyo", "🇯🇵"], [" jp", "🇯🇵"],
  ["سوئد", "🇸🇪"], ["sweden", "🇸🇪"],
  ["سوئیس", "🇨🇭"], ["switzerland", "🇨🇭"], ["zurich", "🇨🇭"],
  ["اتریش", "🇦🇹"], ["austria", "🇦🇹"], ["vienna", "🇦🇹"],
  ["اسپانیا", "🇪🇸"], ["spain", "🇪🇸"], ["madrid", "🇪🇸"],
  ["ایتالیا", "🇮🇹"], ["italy", "🇮🇹"], ["milan", "🇮🇹"],
  ["استرالیا", "🇦🇺"], ["australia", "🇦🇺"],
  ["لهستان", "🇵🇱"], ["poland", "🇵🇱"], ["warsaw", "🇵🇱"],
  ["چک", "🇨🇿"], ["czech", "🇨🇿"], ["prague", "🇨🇿"],
  ["رومانی", "🇷🇴"], ["romania", "🇷🇴"],
  ["بلژیک", "🇧🇪"], ["belgium", "🇧🇪"],
  ["دانمارک", "🇩🇰"], ["denmark", "🇩🇰"],
  ["ایرلند", "🇮🇪"], ["ireland", "🇮🇪"],
  ["نروژ", "🇳🇴"], ["norway", "🇳🇴"],
  ["هنگ", "🇭🇰"], ["hong", "🇭🇰"], [" hk", "🇭🇰"],
  ["کره", "🇰🇷"], ["korea", "🇰🇷"], ["seoul", "🇰🇷"],
  ["هند", "🇮🇳"], ["india", "🇮🇳"],
  ["برزیل", "🇧🇷"], ["brazil", "🇧🇷"],
  ["اوکراین", "🇺🇦"], ["ukraine", "🇺🇦"],
  ["قبرس", "🇨🇾"], ["cyprus", "🇨🇾"],
  ["بلغارستان", "🇧🇬"], ["bulgaria", "🇧🇬"],
  ["مجارستان", "🇭🇺"], ["hungary", "🇭🇺"],
  ["یونان", "🇬🇷"], ["greece", "🇬🇷"],
  ["پرتغال", "🇵🇹"], ["portugal", "🇵🇹"],
  ["استونی", "🇪🇪"], ["estonia", "🇪🇪"],
  ["لیتوانی", "🇱🇹"], ["lithuania", "🇱🇹"],
  ["مولداوی", "🇲🇩"], ["moldova", "🇲🇩"],
  ["هلند", "🇳🇱"],
];

export function detectFlag(text: string): string {
  const t = " " + text.toLowerCase() + " ";
  for (const [key, flag] of FLAGS) {
    if (t.includes(key)) return flag;
  }
  return "🌐";
}

function b64decode(input: string): string {
  let s = input.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  while (s.length % 4) s += "=";
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return "";
  }
}

function b64encode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeURI(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function base(): Omit<VpnConfig, "id" | "raw" | "group"> {
  return {
    protocol: "unknown",
    remark: "بدون نام",
    address: "",
    port: 0,
    transport: "tcp",
    security: "none",
    flag: "🌐",
  };
}

function parseVmess(link: string): VpnConfig {
  const json = b64decode(link.slice(8));
  const b = base();
  try {
    const v = JSON.parse(json);
    b.protocol = "vmess";
    b.remark = v.ps || v.remarks || "VMess Server";
    b.address = v.add || v.address || "";
    b.port = Number(v.port) || 0;
    b.transport = v.net || "tcp";
    b.security = v.tls === "tls" || v.tls === "reality" ? v.tls : "none";
    b.flag = detectFlag(`${v.ps || ""} ${v.add || ""}`);
  } catch {
    b.remark = "کانفیگ نامعتبر";
  }
  return { ...b, id: uid(), raw: link.trim(), group: "وارد شده" };
}

function parseVlessLike(link: string, protocol: Protocol): VpnConfig {
  const b = base();
  b.protocol = protocol;
  try {
    const u = new URL(link);
    b.address = u.hostname.replace(/^\[|\]$/g, "");
    b.port = Number(u.port) || (u.protocol === "https:" ? 443 : 0);
    b.transport = u.searchParams.get("type") || "tcp";
    const sec = u.searchParams.get("security") || (protocol === "trojan" ? "tls" : "none");
    b.security = sec;
    b.remark = u.hash ? decodeURI(u.hash.slice(1)) : `${b.address}:${b.port}`;
    b.flag = detectFlag(`${b.remark} ${b.address}`);
  } catch {
    b.remark = "کانفیگ نامعتبر";
  }
  return { ...b, id: uid(), raw: link.trim(), group: "وارد شده" };
}

function parseSS(link: string): VpnConfig {
  const b = base();
  b.protocol = "shadowsocks";
  try {
    const noPrefix = link.slice(5);
    const [main, hash = ""] = noPrefix.split("#");
    const remark = hash ? decodeURI(hash) : "";
    let host = "";
    let port = 0;
    let method = "";
    if (main.includes("@")) {
      const [userInfo, hostPart] = main.split("@");
      const decoded = b64decode(userInfo + "==") || decodeURI(userInfo);
      method = decoded.split(":")[0];
      const lastColon = hostPart.lastIndexOf(":");
      host = hostPart.slice(0, lastColon).replace(/^\[|\]$/g, "");
      port = Number(hostPart.slice(lastColon + 1).split("/")[0]);
    } else {
      const decoded = b64decode(main.split("?")[0]);
      const at = decoded.lastIndexOf("@");
      const m = decoded.slice(0, at);
      const hp = decoded.slice(at + 1);
      method = m.split(":")[0];
      const c = hp.lastIndexOf(":");
      host = hp.slice(0, c);
      port = Number(hp.slice(c + 1));
    }
    b.address = host;
    b.port = port;
    b.transport = "tcp";
    b.security = method.includes("chacha") || method.includes("2022") ? "aead" : "none";
    b.remark = remark || `SS · ${host}`;
    b.flag = detectFlag(`${remark} ${host}`);
  } catch {
    b.remark = "کانفیگ نامعتبر";
  }
  return { ...b, id: uid(), raw: link.trim(), group: "وارد شده" };
}

function parseHysteria2(link: string): VpnConfig {
  const b = base();
  b.protocol = "hysteria2";
  try {
    const u = new URL(link.replace("hy2://", "https://"));
    b.address = u.hostname;
    b.port = Number(u.port) || 443;
    b.transport = "quic";
    b.security = "tls";
    b.remark = u.hash ? decodeURI(u.hash.slice(1)) : `Hysteria2 · ${b.address}`;
    b.flag = detectFlag(`${b.remark} ${b.address}`);
  } catch {
    b.remark = "کانفیگ نامعتبر";
  }
  return { ...b, id: uid(), raw: link.trim(), group: "وارد شده" };
}

function parseSocks(link: string, protocol: Protocol): VpnConfig {
  const b = base();
  b.protocol = protocol;
  try {
    const u = new URL(link);
    b.address = u.hostname;
    b.port = Number(u.port) || 1080;
    b.transport = "tcp";
    b.security = "none";
    b.remark = u.hash ? decodeURI(u.hash.slice(1)) : `${protocol.toUpperCase()} · ${b.address}`;
    b.flag = detectFlag(`${b.remark} ${b.address}`);
  } catch {
    b.remark = "کانفیگ نامعتبر";
  }
  return { ...b, id: uid(), raw: link.trim(), group: "وارد شده" };
}

export function parseConfig(link: string, group = "وارد شده"): VpnConfig | null {
  const l = link.trim();
  if (!l) return null;
  let c: VpnConfig | null = null;
  if (l.startsWith("vmess://")) c = parseVmess(l);
  else if (l.startsWith("vless://")) c = parseVlessLike(l, "vless");
  else if (l.startsWith("trojan://")) c = parseVlessLike(l, "trojan");
  else if (l.startsWith("ss://")) c = parseSS(l);
  else if (l.startsWith("hy2://") || l.startsWith("hysteria2://")) c = parseHysteria2(l);
  else if (l.startsWith("socks://")) c = parseSocks(l, "socks");
  else if (l.startsWith("http://") && /@.*:\d+/.test(l)) c = parseSocks(l, "http");
  if (c) c.group = group;
  return c;
}

/** Parse a bulk paste: either several links or a base64 subscription */
export function parseBulk(text: string, group = "وارد شده"): VpnConfig[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const out: VpnConfig[] = [];

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // single or multiple plain links
  const links = lines.filter((l) => /^[a-z0-9]+:\/\//i.test(l));
  if (links.length >= 1) {
    links.forEach((l) => {
      const c = parseConfig(l, group);
      if (c && c.remark !== "کانفیگ نامعتبر") out.push(c);
    });
  }
  if (out.length) return out;

  // maybe a base64 subscription blob
  const decoded = b64decode(trimmed);
  if (decoded && /:\/\//.test(decoded)) {
    decoded
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((l) => {
        const c = parseConfig(l, group);
        if (c && c.remark !== "کانفیگ نامعتبر") out.push(c);
      });
  }
  return out;
}

export function buildVmess(opts: {
  remark: string;
  address: string;
  port: number;
  id: string;
  network?: string;
  tls?: boolean;
  path?: string;
}): string {
  const obj = {
    v: "2",
    ps: opts.remark,
    add: opts.address,
    port: String(opts.port),
    id: opts.id,
    aid: "0",
    scy: "auto",
    net: opts.network || "tcp",
    type: "none",
    host: opts.address,
    path: opts.path || "/",
    tls: opts.tls ? "tls" : "",
  };
  return "vmess://" + b64encode(JSON.stringify(obj));
}
