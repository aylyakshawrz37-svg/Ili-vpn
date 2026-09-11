import { useMemo } from "react";

const W = 320;
const H = 84;

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function SpeedChart({ data, active }: { data: number[]; active: boolean }) {
  const { line, area } = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };
    const max = Math.max(...data, 200_000) * 1.15;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - 6 - (v / max) * (H - 14),
    }));
    const l = smoothPath(pts);
    const a = `${l} L ${W} ${H} L 0 ${H} Z`;
    return { line: l, area: a };
  }, [data]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-[78px] w-full"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2de1d6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2de1d6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2f7cff" />
          <stop offset="100%" stopColor="#2de1d6" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((r) => (
        <line
          key={r}
          x1="0"
          x2={W}
          y1={H * r}
          y2={H * r}
          stroke="#243144"
          strokeOpacity="0.35"
          strokeDasharray="3 5"
          strokeWidth="1"
        />
      ))}

      {area && <path d={area} fill="url(#chartFill)" />}
      {line && (
        <>
          <path d={line} fill="none" stroke="url(#chartLine)" strokeWidth="5" strokeLinecap="round" opacity="0.18" />
          <path
            d={line}
            fill="none"
            stroke="url(#chartLine)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}

      {!active && data.length === 0 && (
        <line x1="0" x2={W} y1={H - 6} y2={H - 6} stroke="#243144" strokeWidth="1.5" strokeDasharray="2 6" />
      )}
    </svg>
  );
}
