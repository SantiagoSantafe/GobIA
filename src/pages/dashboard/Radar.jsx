// =============================================================================
// VIGÍA — Radar Page
// Mapa de riesgo por departamento + entidades + distribución por bandera
// =============================================================================
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ── Mock data ─────────────────────────────────────────────────────────────────
const DEPTOS = [
  { depto: "Chocó",               score_prom: 73, alertas: 6, valor_bill: 22.5, nivel: "CRÍTICO" },
  { depto: "Cauca",               score_prom: 71, alertas: 5, valor_bill: 14.2, nivel: "CRÍTICO" },
  { depto: "Bogotá D.C.",         score_prom: 64, alertas: 8, valor_bill: 51.3, nivel: "ALTO" },
  { depto: "Córdoba",             score_prom: 61, alertas: 3, valor_bill: 9.1,  nivel: "ALTO" },
  { depto: "Nariño",              score_prom: 58, alertas: 3, valor_bill: 8.7,  nivel: "ALTO" },
  { depto: "Norte de Santander",  score_prom: 54, alertas: 2, valor_bill: 4.8,  nivel: "ALTO" },
  { depto: "Sucre",               score_prom: 51, alertas: 2, valor_bill: 5.3,  nivel: "ALTO" },
  { depto: "Meta",                score_prom: 48, alertas: 2, valor_bill: 11.2, nivel: "ALTO" },
  { depto: "Tolima",              score_prom: 46, alertas: 2, valor_bill: 7.4,  nivel: "ALTO" },
  { depto: "Vaupés",              score_prom: 44, alertas: 1, valor_bill: 1.0,  nivel: "MEDIO" },
  { depto: "Cundinamarca",        score_prom: 39, alertas: 2, valor_bill: 4.2,  nivel: "MEDIO" },
  { depto: "Antioquia",           score_prom: 34, alertas: 3, valor_bill: 8.1,  nivel: "MEDIO" },
  { depto: "Huila",               score_prom: 27, alertas: 1, valor_bill: 1.2,  nivel: "MEDIO" },
  { depto: "Boyacá",              score_prom: 24, alertas: 1, valor_bill: 18.6, nivel: "MEDIO" },
  { depto: "Atlántico",           score_prom: 22, alertas: 1, valor_bill: 14.2, nivel: "MEDIO" },
  { depto: "Caldas",              score_prom: 19, alertas: 1, valor_bill: 3.1,  nivel: "BAJO" },
  { depto: "Quindío",             score_prom: 11, alertas: 1, valor_bill: 1.9,  nivel: "BAJO" },
  { depto: "Magdalena",           score_prom: 10, alertas: 1, valor_bill: 4.5,  nivel: "BAJO" },
];

const RADAR_LABELS = [
  "Empresa de maletín", "PEP representante", "Pliego sastre",
  "Precio atípico", "Único oferente", "Horario atípico", "Desajuste geog.",
];
const RADAR_DATA_CRITICOS = [6, 4, 5, 6, 5, 3, 2];
const RADAR_DATA_ALTOS    = [4, 2, 3, 5, 6, 4, 4];

function scoreColor(s) {
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
}

function NivelBadge({ nivel }) {
  const s = {
    CRÍTICO: "bg-red-50 text-risk-critical border-red-200",
    ALTO:    "bg-orange-50 text-risk-high border-orange-200",
    MEDIO:   "bg-yellow-50 text-risk-medium border-yellow-200",
    BAJO:    "bg-green-50 text-risk-low border-green-200",
  };
  return <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${s[nivel] ?? s.BAJO}`}>{nivel}</span>;
}

function RadarChart() {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current?.destroy();
    instance.current = new Chart(ref.current, {
      type: "radar",
      data: {
        labels: RADAR_LABELS,
        datasets: [
          {
            label: "Contratos CRÍTICO",
            data: RADAR_DATA_CRITICOS,
            backgroundColor: "rgba(220,38,38,0.12)",
            borderColor: "#dc2626",
            borderWidth: 1.5,
            pointBackgroundColor: "#dc2626",
            pointRadius: 3,
          },
          {
            label: "Contratos ALTO",
            data: RADAR_DATA_ALTOS,
            backgroundColor: "rgba(234,88,12,0.08)",
            borderColor: "#ea580c",
            borderWidth: 1.5,
            pointBackgroundColor: "#ea580c",
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 10, family: "JetBrains Mono" }, color: "#6e6e73", boxWidth: 10, padding: 14 },
          },
        },
        scales: {
          r: {
            grid: { color: "#e8e8ed" },
            angleLines: { color: "#e8e8ed" },
            ticks: { display: false, stepSize: 2 },
            pointLabels: { font: { size: 9, family: "JetBrains Mono" }, color: "#6e6e73" },
            beginAtZero: true,
          },
        },
      },
    });
    return () => instance.current?.destroy();
  }, []);

  return <canvas ref={ref} />;
}

function HeatBar({ score }) {
  const c = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 rounded-full bg-vigia-border overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: c }} />
      </div>
      <span className="font-mono text-[10px] font-semibold tabular-nums" style={{ color: c }}>{score}</span>
    </div>
  );
}

export default function Radar() {
  const maxAlertas = Math.max(...DEPTOS.map((d) => d.alertas));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-1">distribución de riesgo</p>
        <h1 className="text-2xl font-light tracking-tight text-vigia-heading">Radar territorial</h1>
        <p className="text-sm text-vigia-muted font-light mt-1">
          score promedio por departamento · {DEPTOS.length} departamentos con alertas activas
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: table */}
        <div className="bg-white rounded-2xl border border-vigia-border shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-vigia-border flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-vigia-heading">Ranking de riesgo por departamento</p>
              <p className="label-mono mt-0.5">score promedio · alertas activas · valor total</p>
            </div>
          </div>
          <div className="divide-y divide-vigia-border">
            {DEPTOS.map((d, i) => (
              <div key={d.depto}
                className="grid grid-cols-[2rem_2fr_1fr_auto_auto] gap-x-5 px-5 py-3 items-center hover:bg-surface-1 transition-colors">
                <span className="font-mono text-[10px] text-vigia-dim">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-vigia-heading">{d.depto}</p>
                  <NivelBadge nivel={d.nivel} />
                </div>
                <HeatBar score={d.score_prom} />
                <div className="text-right">
                  <p className="text-[11px] font-mono font-medium text-vigia-heading tabular-nums">{d.alertas}</p>
                  <p className="label-mono">alertas</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-mono text-risk-critical tabular-nums">${d.valor_bill}B</p>
                  <p className="label-mono">riesgo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: radar chart */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Radar de banderas</p>
            <p className="label-mono mb-4">distribución por tipo en contratos de alto riesgo</p>
            <div style={{ height: "300px" }}>
              <RadarChart />
            </div>
          </div>

          {/* Top 5 concentración */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Concentración de alertas</p>
            <p className="label-mono mb-4">top 5 departamentos por frecuencia</p>
            <div className="space-y-3">
              {DEPTOS.slice(0, 5).map((d) => (
                <div key={d.depto} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-vigia-muted w-32 shrink-0 truncate">{d.depto}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-vigia-border overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(d.alertas / maxAlertas) * 100}%`, backgroundColor: scoreColor(d.score_prom) }} />
                  </div>
                  <span className="text-[9px] font-mono text-vigia-dim w-4 text-right">{d.alertas}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
