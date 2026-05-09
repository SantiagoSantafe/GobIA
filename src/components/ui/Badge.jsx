const VARIANT_CLASSES = {
  critical: "risk-badge-critical",
  high:     "risk-badge-high",
  medium:   "risk-badge-medium",
  info:     "risk-badge-info",
  ocds:     "risk-badge-ocds",
  neutral:  "bg-slate-100 text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-mono",
};

const LABELS = {
  critical: "CRÍTICO",
  high:     "ALTO",
  medium:   "MEDIO",
  info:     "INFO",
  ocds:     "OCDS",
  neutral:  "N/A",
};

export function Badge({ variant = "info", children, className = "" }) {
  return (
    <span className={`${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.neutral} ${className}`}>
      {children ?? LABELS[variant] ?? variant.toUpperCase()}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  return <Badge variant={severity}>{LABELS[severity] ?? severity}</Badge>;
}
