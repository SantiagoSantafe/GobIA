// =============================================================================
// VIGÍA — Histórico Page
// Tendencias temporales: alertas por mes, valor en riesgo, evolución de banderas
// =============================================================================
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

// ── Mock data ─────────────────────────────────────────────────────────────────
const MESES = ["May 24","Jun 24","Jul 24","Ago 24","Sep 24","Oct 24","Nov 24","Dic 24","Ene 25","Feb 25","Mar 25","Abr 25","May 25"];

const ALERTAS_POR_MES   = [3, 4, 6, 5, 8, 11, 9, 7, 13, 15, 18, 14, 17];
const VALOR_RIESGO_BILL = [4.2, 6.1, 8.3, 7.4, 11.2, 15.6, 12.8, 9.3, 18.4, 21.1, 26.3, 19.7, 24.1]; // billones COP

const BANDERAS_EVOLUCION = {
  labels: MESES,
  datasets: [
    { label: "Empresa de maletín", data: [1,2,3,2,3,4,3,2,4,5,6,4,6], borderColor: "#dc2626", backgroundColor: "#dc262618", tension: 0.4, fill: true },
    { label: "Precio atípico",     data: [1,1,2,1,2,3,2,2,3,4,5,4,4], borderColor: "#ea580c", backgroundColor: "#ea580c10", tension: 0.4, fill: false },
    { label: "Único oferente",     data: [0,1,1,2,2,3,3,2,4,4,5,3,5], borderColor: "#ca8a04", backgroundColor: "#ca8a0410", tension: 0.4, fill: false },
    { label: "Pliego sastre",      data: [0,0,1,1,1,2,2,1,3,3,4,3,4], borderColor: "#2563eb", backgroundColor: "#2563eb10", tension: 0.4, fill: false },
  ],
};

const TOP_ENTIDADES = [
  { entidad: "Alcaldía Argelia",         alertas: 3, score_prom: 82, valor_total_bill: 9.4 },
  { entidad: "UNGRD",                    alertas: 2, score_prom: 79, valor_total_bill: 68.2 },
  { entidad: "ICBF Córdoba",             alertas: 2, score_prom: 71, valor_total_bill: 12.6 },
  { entidad: "Gobernación del Chocó",    alertas: 2, score_prom: 68, valor_total_bill: 15.3 },
  { entidad: "Ministerio de Justicia",   alertas: 1, score_prom: 64, valor_total_bill: 2.1 },
  { entidad: "INVIAS Chocó",             alertas: 1, score_prom: 61, valor_total_bill: 15.6 },
];

// ── Chart hooks ───────────────────────────────────────────────────────────────
function BarChart({ id, labels, dataset, color }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current?.destroy();
    instance.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: dataset.label,
          data: dataset.data,
          backgroundColor: color + "CC",
          borderRadius: 4,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: "JetBrains Mono" }, color: "#aeaeb2" } },
          y: { grid: { color: "#e8e8ed" }, ticks: { font: { size: 9, family: "JetBrains Mono" }, color: "#aeaeb2" }, beginAtZero: true },
        },
      },
    });
    return () => instance.current?.destroy();
  }, []);

  return <canvas ref={ref} id={id} />;
}

function LineChart({ id, config }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current?.destroy();
    instance.current = new Chart(ref.current, {
      type: "line",
      data: config,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 9, family: "JetBrains Mono" }, color: "#6e6e73", boxWidth: 10, padding: 12 },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9, family: "JetBrains Mono" }, color: "#aeaeb2" } },
          y: { grid: { color: "#e8e8ed" }, ticks: { font: { size: 9, family: "JetBrains Mono" }, color: "#aeaeb2" }, beginAtZero: true },
        },
      },
    });
    return () => instance.current?.destroy();
  }, []);

  return <canvas ref={ref} id={id} />;
}

function scoreColor(s) {
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Historico() {
  const totalAlertas = ALERTAS_POR_MES.reduce((s, v) => s + v, 0);
  const totalValor   = VALOR_RIESGO_BILL.reduce((s, v) => s + v, 0);
  const tendencia    = ALERTAS_POR_MES.at(-1) > ALERTAS_POR_MES.at(-3) ? "↑" : "↓";

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-1">análisis temporal</p>
        <h1 className="text-2xl font-light tracking-tight text-vigia-heading">Histórico de alertas</h1>
        <p className="text-sm text-vigia-muted font-light mt-1">últimos 13 meses · mayo 2024 — mayo 2025</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Alertas generadas (13m)", value: totalAlertas, accent: true },
          { label: "Valor en riesgo (13m)", value: `$${totalValor.toFixed(1)}B COP`, accent: true },
          { label: "Tendencia mensual", value: `${tendencia} vs hace 3 meses`, accent: false },
          { label: "Score promedio alertas", value: "62 / 100", accent: false },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-vigia-border px-4 py-3.5 shadow-card">
            <p className={`text-xl font-light tabular-nums ${k.accent ? "text-risk-critical" : "text-vigia-heading"}`}>{k.value}</p>
            <p className="label-mono mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
          <p className="text-xs font-medium text-vigia-heading mb-0.5">Alertas generadas por mes</p>
          <p className="label-mono mb-4">cantidad de contratos con score {">"} 45</p>
          <div style={{ height: "220px" }}>
            <BarChart id="alertas-mes" labels={MESES}
              dataset={{ label: "Alertas", data: ALERTAS_POR_MES }}
              color="#dc2626"
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
          <p className="text-xs font-medium text-vigia-heading mb-0.5">Valor en riesgo por mes (billones COP)</p>
          <p className="label-mono mb-4">suma del valor de contratos alertados</p>
          <div style={{ height: "220px" }}>
            <BarChart id="valor-mes" labels={MESES}
              dataset={{ label: "Valor (B COP)", data: VALOR_RIESGO_BILL }}
              color="#ea580c"
            />
          </div>
        </div>
      </div>

      {/* Chart row 2: bandera evolution */}
      <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
        <p className="text-xs font-medium text-vigia-heading mb-0.5">Evolución de banderas por tipo</p>
        <p className="label-mono mb-4">frecuencia mensual de cada bandera detectada</p>
        <div style={{ height: "240px" }}>
          <LineChart id="banderas-evol" config={BANDERAS_EVOLUCION} />
        </div>
      </div>

      {/* Top entities table */}
      <div className="bg-white rounded-2xl border border-vigia-border shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-vigia-border">
          <p className="text-xs font-medium text-vigia-heading">Entidades con más alertas acumuladas (13 meses)</p>
          <p className="label-mono mt-0.5">ordenadas por score promedio descendente</p>
        </div>
        <div className="divide-y divide-vigia-border">
          {TOP_ENTIDADES.map((e, i) => (
            <div key={e.entidad} className="grid grid-cols-[2rem_2fr_auto_auto_auto] gap-x-6 px-5 py-3.5 items-center hover:bg-surface-1 transition-colors">
              <span className="font-mono text-[10px] text-vigia-dim">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-sm font-medium text-vigia-heading">{e.entidad}</p>
              <div className="text-right">
                <p className="text-sm font-light tabular-nums" style={{ color: scoreColor(e.score_prom) }}>{e.score_prom}</p>
                <p className="label-mono">score prom.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-light tabular-nums text-vigia-heading">{e.alertas}</p>
                <p className="label-mono">alertas</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-light tabular-nums text-risk-critical">${e.valor_total_bill}B</p>
                <p className="label-mono">valor riesgo</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
