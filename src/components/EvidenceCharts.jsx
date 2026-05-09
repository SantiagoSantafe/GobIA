import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { BarChart2, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

// Shared light-theme chart defaults
const CHART_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, title: { display: false } },
  scales: {
    x: {
      ticks: { color: "#94A3B8", font: { family: "JetBrains Mono, monospace", size: 9 } },
      grid:  { color: "rgba(226,232,240,0.8)" },
      border:{ color: "rgba(226,232,240,0.8)" },
    },
    y: {
      ticks: { color: "#94A3B8", font: { family: "JetBrains Mono, monospace", size: 9 } },
      grid:  { color: "rgba(226,232,240,0.8)" },
      border:{ color: "rgba(226,232,240,0.8)" },
    },
  },
};

const TOOLTIP_BASE = {
  backgroundColor: "#ffffff",
  borderColor: "#E2E8F0",
  borderWidth: 1,
  titleColor: "#0F172A",
  bodyColor: "#64748B",
  titleFont: { family: "Space Grotesk", size: 12 },
  bodyFont:  { family: "JetBrains Mono", size: 10 },
  padding: 10,
  boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
};

// TODO: Fetch from FastAPI: GET /analytics/pricing/:unspsc
function PricingChart({ pricing }) {
  const data = {
    labels: pricing.comparables.map((c) => c.entidad),
    datasets: [{
      label: "COP / ración",
      data: pricing.comparables.map((c) => c.valor),
      backgroundColor: pricing.comparables.map((c) =>
        c.esEsteContrato ? "rgba(239,68,68,0.85)" : "rgba(99,102,241,0.65)"
      ),
      borderColor: pricing.comparables.map((c) =>
        c.esEsteContrato ? "#ef4444" : "#6366f1"
      ),
      borderWidth: 1.5,
      borderRadius: 5,
    }],
  };

  const options = {
    ...CHART_BASE,
    plugins: {
      ...CHART_BASE.plugins,
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y;
            const c = pricing.comparables[ctx.dataIndex];
            const diff = ((v - pricing.mediana_mercado) / pricing.mediana_mercado * 100).toFixed(1);
            return [
              ` $${v.toLocaleString("es-CO")} COP/ración`,
              ` ${diff > 0 ? "+" : ""}${diff}% vs. mediana`,
              c.esEsteContrato ? " ▲ ESTE CONTRATO" : "",
            ].filter(Boolean);
          },
        },
      },
    },
    scales: {
      ...CHART_BASE.scales,
      x: {
        ...CHART_BASE.scales.x,
        ticks: { ...CHART_BASE.scales.x.ticks, maxRotation: 30, font: { family: "JetBrains Mono, monospace", size: 8 } },
      },
      y: {
        ...CHART_BASE.scales.y,
        ticks: { ...CHART_BASE.scales.y.ticks, callback: (v) => `$${(v / 1000).toFixed(0)}K` },
      },
    },
  };

  return (
    <div className="relative h-full">
      <Bar data={data} options={options} />
      {/* Median reference line overlay */}
      <div
        className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500/60 pointer-events-none"
        style={{ bottom: `calc(${((pricing.mediana_mercado - 9000) / (22000 - 9000)) * 100}% + 36px)` }}
      >
        <span className="absolute right-0 -top-5 text-[10px] font-mono text-emerald-600 bg-white px-1 rounded border border-emerald-200">
          mediana ${pricing.mediana_mercado.toLocaleString("es-CO")}
        </span>
      </div>
    </div>
  );
}

// TODO: Fetch from FastAPI: GET /analytics/timeline/:entidad_nit
function TimelineChart({ timeline }) {
  const data = {
    labels: timeline.datos.map((d) => d.fecha),
    datasets: [{
      label: "Contratos firmados",
      data: timeline.datos.map((d) => d.contratos),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.07)",
      pointBackgroundColor: timeline.datos.map((d) => d.esAtipico ? "#ef4444" : "#6366f1"),
      pointBorderColor:     timeline.datos.map((d) => d.esAtipico ? "#ef4444" : "#6366f1"),
      pointRadius:      timeline.datos.map((d) => d.esAtipico ? 8 : 3),
      pointHoverRadius: timeline.datos.map((d) => d.esAtipico ? 10 : 5),
      borderWidth: 2,
      fill: true,
      tension: 0.3,
    }],
  };

  const options = {
    ...CHART_BASE,
    plugins: {
      ...CHART_BASE.plugins,
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          title: (ctx) => {
            const d = timeline.datos[ctx[0].dataIndex];
            return d.esAtipico ? `⚠ ${d.fecha} — ${d.hora_max} — ATÍPICO` : d.fecha;
          },
          label: (ctx) => {
            const d = timeline.datos[ctx.dataIndex];
            const lines = [` ${ctx.parsed.y} contrato(s) firmado(s)`];
            if (d.hora_max) lines.push(` Hora: ${d.hora_max}`);
            if (d.esAtipico) lines.push(" ▲ Domingo · horario nocturno");
            return lines;
          },
        },
      },
    },
    scales: {
      ...CHART_BASE.scales,
      x: { ...CHART_BASE.scales.x, ticks: { ...CHART_BASE.scales.x.ticks, maxTicksLimit: 10 } },
      y: { ...CHART_BASE.scales.y, min: 0, max: 3, ticks: { ...CHART_BASE.scales.y.ticks, stepSize: 1 } },
    },
  };

  return <Line data={data} options={options} />;
}

export function EvidenceCharts({ pricing, timeline }) {
  const sobrecosto = (
    (pricing.valor_contrato - pricing.mediana_mercado) / pricing.mediana_mercado * 100
  ).toFixed(1);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Pricing chart */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <TrendingUp size={15} className="text-risk-critical" />
          <span className="font-display font-semibold text-sm text-slate-800">
            Sobrecosto vs. Mediana de Mercado
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <AlertCircle size={12} className="text-risk-critical" />
            <span className="font-mono text-xs text-risk-critical font-bold">+{sobrecosto}%</span>
            <span className="font-mono text-[10px] text-slate-400">vs. mediana</span>
          </div>
        </CardHeader>
        <CardBody className="flex-1 min-h-0">
          <div style={{ minHeight: "160px", height: "100%" }}>
            <PricingChart pricing={pricing} />
          </div>
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle size={12} className="text-risk-critical mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-slate-500">
              Valor/ración:{" "}
              <span className="text-risk-critical font-bold">${pricing.valor_contrato.toLocaleString("es-CO")}</span>
              {" vs. mediana "}
              <span className="text-emerald-600">${pricing.mediana_mercado.toLocaleString("es-CO")}</span>
              {" · Sobrecosto estimado: "}
              <span className="text-risk-critical font-bold">$1.422M COP</span>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Timeline chart */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <Clock size={15} className="text-risk-high" />
          <span className="font-display font-semibold text-sm text-slate-800">
            Anomalía Temporal — Timing Irregular
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-risk-critical shrink-0" />
            <span className="font-mono text-[10px] text-risk-critical">Dom. 23:14</span>
          </div>
        </CardHeader>
        <CardBody className="flex-1 min-h-0">
          <div style={{ minHeight: "120px", height: "100%" }}>
            <TimelineChart timeline={timeline} />
          </div>
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <BarChart2 size={12} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs font-mono text-slate-500">
              Contrato{" "}
              <span className="text-risk-critical font-bold">$4.820M</span>
              {" firmado el "}
              <span className="text-risk-high font-bold">domingo 03/05/2026 · 23:14</span>
              {" — fuera de horario laboral."}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
