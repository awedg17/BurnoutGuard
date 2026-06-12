import type { RiskResult } from "@/lib/burnout-store";

const LEVEL_COLOR: Record<RiskResult["level"], string> = {
  low: "var(--calm)",
  medium: "var(--warning)",
  high: "var(--danger)",
};

export function RiskGauge({
  risk,
  size = 180,
}: {
  risk: RiskResult;
  size?: number;
}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (risk.score / 100) * circ;
  const color = LEVEL_COLOR[risk.level];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="font-display text-4xl font-bold text-foreground">
          {risk.score}
        </span>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          out of 100
        </span>
      </div>
    </div>
  );
}
