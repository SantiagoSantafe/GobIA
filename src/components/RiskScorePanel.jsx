import { useState } from "react";
import {
  AlertTriangle, Building2, UserX, FileText, TrendingUp,
  Clock, MapPin, ChevronDown, ChevronUp, Info, ExternalLink,
  GitBranch, PieChart, Shield, Brain, BookOpen, X,
} from "lucide-react";
import { ScoreGauge } from "./ui/ScoreGauge";
import { SeverityBadge } from "./ui/Badge";
import { Card, CardHeader, CardBody } from "./ui/Card";

const ICON_MAP = {
  "building2":      Building2,
  "user-x":         UserX,
  "file-text":      FileText,
  "trending-up":    TrendingUp,
  "alert-triangle": AlertTriangle,
  "clock":          Clock,
  "map-pin":        MapPin,
  "pie-chart":      PieChart,
  "git-branch":     GitBranch,
};

// ── Methodology tooltip ──────────────────────────────────────────────────────
function MethodologyTooltip({ onClose }) {
  return (
    <div className="mt-3 mx-1 rounded-xl border border-action-border bg-action-light p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-action-primary shrink-0" />
          <span className="font-display font-semibold text-sm text-action-primary">
            Metodología de Ponderación VIGÍA
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
          <X size={14} />
        </button>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        El Score de Riesgo es calculado mediante la fórmula probabilística de la{" "}
        <strong>Open Contracting Partnership</strong>:
      </p>
      <div className="bg-white rounded-lg border border-action-border px-3 py-2 mb-3 font-mono text-xs text-slate-700 text-center">
        Score = 100 × (1 − ∏(1 − wᵢ × cᵢ / 100))
      </div>
      <ul className="space-y-1.5 text-xs text-slate-600">
        {[
          ["wᵢ", "Peso de cada bandera según su gravedad (10–30 pts)"],
          ["cᵢ", "Nivel de confianza de la detección (0–100%)"],
          ["INAC", "Índice Nacional de Anticorrupción — pondera contexto institucional"],
          ["TI Index", "Índice de Percepción de Corrupción (Transparencia Internacional)"],
          ["OCDS", "Banderas estándar de la Open Contracting Data Standard"],
        ].map(([key, val]) => (
          <li key={key} className="flex gap-2">
            <span className="font-mono font-bold text-action-primary shrink-0 w-14">{key}</span>
            <span>{val}</span>
          </li>
        ))}
      </ul>
      <a
        href="https://www.anticorrupcion.co/metodologia"
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center gap-1 text-xs font-mono text-action-primary hover:underline"
      >
        Ver metodología completa <ExternalLink size={10} />
      </a>
    </div>
  );
}

// ── Individual flag row ──────────────────────────────────────────────────────
function FlagRow({ flag, index, isOcds }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = ICON_MAP[flag.icono] ?? AlertTriangle;

  // Support both old severidad field and new nivel field
  const sev = flag.severidad ?? (
    flag.nivel === "CRÍTICO" ? "critical"
    : flag.nivel === "ALTO"  ? "high"
    : flag.nivel === "MEDIO" ? "medium"
    : "medium"
  );

  const borderColor = isOcds
    ? "border-blue-100 hover:border-blue-200"
    : sev === "critical"
    ? "border-red-100 hover:border-red-200"
    : sev === "high"
    ? "border-amber-100 hover:border-amber-200"
    : "border-yellow-100 hover:border-yellow-200";

  const iconStyle = isOcds
    ? "bg-blue-50 text-blue-600"
    : sev === "critical"
    ? "bg-red-50 text-red-500"
    : sev === "high"
    ? "bg-amber-50 text-amber-500"
    : "bg-yellow-50 text-yellow-500";

  const weightColor = isOcds
    ? "text-blue-600"
    : sev === "critical"
    ? "text-red-600"
    : sev === "high"
    ? "text-amber-500"
    : "text-yellow-500";

  return (
    <div className={`rounded-xl border ${borderColor} bg-white transition-all duration-150`}>
      <button
        className="w-full flex items-start gap-3 p-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="shrink-0 font-mono text-[10px] text-slate-400 pt-1 w-5">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${iconStyle}`}>
          <Icon size={13} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <SeverityBadge severity={sev} />
            <span className="font-mono text-[10px] text-slate-400">{flag.codigo ?? flag.id_bandera}</span>
          </div>
          <p className="text-sm text-slate-800 font-display font-medium leading-snug">
            {flag.titulo ?? flag.nombre}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5 ml-1">
          <span className="font-mono text-[10px] text-slate-400">
            w<span className={`font-bold ${weightColor}`}>{flag.peso ?? flag.peso_pct}</span>
          </span>
          <span className="text-slate-400">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-surface-3 animate-fade-in">
          <p className="text-xs text-slate-500 leading-relaxed mt-2 mb-3">
            {flag.descripcion ?? flag.evidencia}
          </p>
          {/* Support both evidencia_lista (array) and evidencia (string) */}
          {(flag.evidencia_lista ?? flag.evidencia) && (
            <div className="mb-3">
              <p className="label-mono mb-1.5">Evidencia</p>
              <ul className="space-y-1">
                {(flag.evidencia_lista ?? [flag.evidencia]).map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-mono text-slate-500">
                    <span className={`mt-0.5 ${isOcds ? "text-blue-500" : "text-red-400"}`}>▸</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Norma / fuente for new VIGÍA flags */}
          {flag.norma && (
            <div className="flex items-start gap-1.5 text-[10px] font-mono text-slate-400 border-t border-surface-3 pt-2 flex-wrap gap-y-1">
              <Info size={10} className="mt-0.5 shrink-0" />
              <span>{flag.norma}</span>
              {flag.fuente && <span className="text-slate-300">· {flag.fuente}</span>}
            </div>
          )}
          {flag.legal_ref && !flag.norma && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 border-t border-surface-3 pt-2">
              <Info size={10} />
              {flag.legal_ref}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, sublabel, color = "text-slate-600", iconClass }) {
  return (
    <div className="flex items-center gap-2 py-2 mb-2">
      <span className={`w-6 h-6 rounded-md flex items-center justify-center ${iconClass}`}>
        <Icon size={12} />
      </span>
      <div>
        <p className={`text-xs font-display font-semibold ${color}`}>{label}</p>
        {sublabel && <p className="text-[10px] font-mono text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
// TODO: Fetch from FastAPI: GET /analyze/contract/:id
export function RiskScorePanel({ contract, banderasOcds = [] }) {
  const [showMethodology, setShowMethodology] = useState(false);
  const {
    score, nivel_riesgo, num_banderas, banderas,
    id, entidad, contratista, valor_contrato, fecha_firma, modalidad,
  } = contract;

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    }).format(v);

  const signingDate = new Date(fecha_firma);
  const signingLabel = signingDate.toLocaleString("es-CO", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const totalFlags = num_banderas + banderasOcds.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Shield size={15} className="text-risk-critical" />
        <span className="font-display font-semibold text-sm text-slate-800">
          Panel VIGÍA · 7 Banderas Rojas
        </span>
        <span className="ml-auto font-mono text-[10px] text-slate-400">{id}</span>
      </CardHeader>

      <div className="flex-1 overflow-y-auto">
        <CardBody className="space-y-5">
          {/* Gauge + methodology toggle */}
          <div className="flex flex-col items-center pt-1">
            <ScoreGauge score={score} size={172} />
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="mt-2 flex items-center gap-1.5 text-xs font-mono text-action-primary hover:underline transition-colors"
            >
              <BookOpen size={11} />
              Ver Metodología
              {showMethodology ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          </div>

          {showMethodology && (
            <MethodologyTooltip onClose={() => setShowMethodology(false)} />
          )}

          {/* Score pill */}
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
            <p className="font-mono text-sm text-risk-critical font-semibold tracking-wide">
              {totalFlags} banderas activas
            </p>
            <p className="text-[10px] text-risk-critical/70 mt-0.5 font-mono">
              {banderasOcds.length} estándar OCDS · {num_banderas} alertas IA VIGÍA
            </p>
          </div>

          {/* Contract summary grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Entidad", value: entidad.nombre },
              { label: "Modalidad", value: modalidad },
              { label: "Contratista", value: contratista.nombre },
              { label: "Valor total", value: formatCOP(valor_contrato) },
              { label: "Constituida", value: contratista.fecha_constitucion },
              { label: "Firma del contrato", value: signingLabel },
            ].map((item) => (
              <div key={item.label} className="bg-surface-1 border border-vigia-border rounded-xl p-2.5">
                <p className="label-mono mb-0.5">{item.label}</p>
                <p className="text-xs text-vigia-body font-display font-medium leading-snug">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── SECTION A: OCDS Standard Flags ─────────────────────── */}
          {banderasOcds.length > 0 && (
            <div>
              <SectionHeader
                icon={BookOpen}
                label="Alertas Estándar OCDS"
                sublabel="Cardinal · Open Contracting Partnership"
                color="text-blue-700"
                iconClass="bg-blue-50 text-blue-600"
              />
              <div className="space-y-2">
                {banderasOcds.map((flag, i) => (
                  <FlagRow key={flag.id} flag={flag} index={i} isOcds />
                ))}
              </div>
            </div>
          )}

          {/* ── SECTION B: Advanced AI VIGÍA Flags ─────────────────── */}
          <div>
            <SectionHeader
              icon={Brain}
              label="Alertas Avanzadas IA VIGÍA"
              sublabel="NLP · Análisis de Grafos · SARLAFT"
              color="text-red-700"
              iconClass="bg-red-50 text-red-500"
            />
            <div className="space-y-2">
              {banderas.map((flag, i) => (
                <FlagRow key={flag.id} flag={flag} index={i} isOcds={false} />
              ))}
            </div>
          </div>

          {/* Footer link */}
          <div className="flex items-center justify-center pt-1 border-t border-surface-3">
            <a
              href="https://www.anticorrupcion.co/metodologia"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-action-primary transition-colors"
            >
              metodología abierta · anticorrupcion.co <ExternalLink size={10} />
            </a>
          </div>
        </CardBody>
      </div>
    </Card>
  );
}
