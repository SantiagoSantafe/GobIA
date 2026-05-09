import { useEffect, useState } from "react";

// VIGÍA color scale: 0-20 bajo / 21-45 medio / 46-70 alto / 71-100 crítico
const SCORE_CONFIG = {
  critical: { stroke: "#EF4444", glow: "rgba(239,68,68,0.35)",  label: "RIESGO CRÍTICO", bg: "#fef2f2" },
  high:     { stroke: "#F97316", glow: "rgba(249,115,22,0.3)",  label: "RIESGO ALTO",    bg: "#fff7ed" },
  medium:   { stroke: "#EAB308", glow: "rgba(234,179,8,0.3)",   label: "RIESGO MEDIO",   bg: "#fefce8" },
  low:      { stroke: "#22C55E", glow: "rgba(34,197,94,0.25)",  label: "RIESGO BAJO",    bg: "#f0fdf4" },
};

function getLevel(score) {
  if (score >= 71) return "critical";
  if (score >= 46) return "high";
  if (score >= 21) return "medium";
  return "low";
}

export function ScoreGauge({ score = 92, size = 200 }) {
  const [animated, setAnimated] = useState(0);
  const level = getLevel(score);
  const { stroke, glow, label } = SCORE_CONFIG[level];

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const dashOffset = circumference * (1 - animated / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Track */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={11} />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)",
              filter: `drop-shadow(0 0 6px ${glow})`,
            }}
          />
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
          <span
            className="font-display font-bold leading-none"
            style={{ fontSize: size * 0.28, color: stroke }}
          >
            {Math.round(animated)}
          </span>
          <span className="text-slate-400 font-mono text-xs tracking-widest">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display font-semibold text-sm tracking-wide" style={{ color: stroke }}>
          {label}
        </p>
      </div>
    </div>
  );
}
