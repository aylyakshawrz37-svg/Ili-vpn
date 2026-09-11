import { buildVmess } from "./parser";

const U1 = "6e9f1a2c-3b4d-4e5f-8a9b-0c1d2e3f4a5b";
const U2 = "a27d9c44-71e6-4b08-9d55-8f2a3c1e7b90";
const U3 = "c41b8e52-96f4-4d3a-b1e7-5a8f0d2c9e63";
const PBK = "2uX7DvQz8YkMnWp4sHbN9cLfT6gRjE3vAz1oKyP7xWq";

const tag = (s: string) => encodeURIComponent(s);

export const SAMPLE_LINKS: string[] = [
  // 1 — VLESS Reality / gRPC — Finland (flagship)
  `vless://${U1}@fi1.ilia-net.work:443?encryption=none&security=reality&sni=www.microsoft.com&fp=chrome&pbk=${PBK}&sid=6a&type=grpc&serviceName=ilia-grpc&flow=xtls-rprx-vision#${tag(
    "ILIA | Finland FI-01 • Reality"
  )}`,

  // 2 — VMess WebSocket + TLS — Germany
  buildVmess({
    remark: "ILIA | Germany DE-02 • WS",
    address: "de1.ilia-net.work",
    port: 443,
    id: U2,
    network: "ws",
    tls: true,
    path: "/ilia-ws",
  }),

  // 3 — Trojan TLS — Netherlands
  `trojan://ilia-tj-9f3a8d2b@nl1.ilia-net.work:443?sni=nl1.ilia-net.work&fp=firefox&type=tcp#${tag(
    "ILIA | Netherlands NL-03 • Trojan"
  )}`,

  // 4 — VLESS gRPC + TLS — USA
  `vless://${U3}@us1.ilia-net.work:443?encryption=none&security=tls&sni=us1.ilia-net.work&fp=chrome&type=grpc&serviceName=ilia&mode=gun#${tag(
    "ILIA | United States US-04"
  )}`,

  // 5 — Shadowsocks ChaCha20 — Singapore
  `ss://${btoa("chacha20-ietf-poly1305:ilia-ss-7721")}@sg1.ilia-net.work:8388#${tag(
    "ILIA | Singapore SG-05 • SS"
  )}`,

  // 6 — VMess TCP + TLS — Turkey
  buildVmess({
    remark: "ILIA | Turkey TR-06",
    address: "tr1.ilia-net.work",
    port: 8443,
    id: "d92e47ac-1f6b-4e8a-90c2-3d5f7a9b1e04",
    network: "tcp",
    tls: true,
  }),

  // 7 — Hysteria2 QUIC — France
  `hy2://${U1}@fr1.ilia-net.work:443?sni=fr1.ilia-net.work&insecure=0#${tag(
    "ILIA | France FR-07 • Hysteria2"
  )}`,

  // 8 — VLESS WS + TLS — England
  `vless://${U2}@uk1.ilia-net.work:2083?encryption=none&security=tls&sni=uk1.ilia-net.work&fp=chrome&type=ws&path=%2Filia%3Fed%3D2048&host=uk1.ilia-net.work#${tag(
    "ILIA | England UK-08 • WS"
  )}`,
];
