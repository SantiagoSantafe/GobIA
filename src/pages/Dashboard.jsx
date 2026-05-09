// =============================================================================
// VIGÍA — Dashboard Page
// Feed de alertas estilo anticorrupcion.co + panel de detalle con componentes existentes
// =============================================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Search, ChevronDown, ArrowLeft,
  AlertTriangle, TrendingUp, Building2, MapPin, X, Zap,
} from "lucide-react";
import MOCK_CONTRACT, {
  MOCK_ALERTS, BANDERAS_OCDS, PACO_NOTICIAS, DUE_DILIGENCE,
} from "../data/mockContract";
import { TabNav } from "../components/TabNav";
import { RiskScorePanel } from "../components/RiskScorePanel";
import { MapView } from "../components/MapView";
import { NetworkGraph3D } from "../components/NetworkGraph3D";
import { EvidenceCharts } from "../components/EvidenceCharts";
import { LLMActionPanel } from "../components/LLMActionPanel";
import { PACONewsWidget } from "../components/PACONewsWidget";
import { DueDiligencePanel } from "../components/DueDiligencePanel";
import { OSINTVerification } from "../components/OSINTVerification";

// Alert counts per tab
const TAB_ALERT_COUNTS = { resumen: 10, redes: 5, territorio: 3, denuncia: 5 };

// ── Score bar ─────────────────────────────────────────────────────────────────
function scoreColor(score) {
  return score >= 71 ? "#dc2626"
       : score >= 46 ? "#ea580c"
       : score >= 21 ? "#ca8a04"
       : "#16a34a";
}

function ScoreBar({ score }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-full bg-vigia-border overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[11px] font-semibold shrink-0 tabular-nums" style={{ color }}>
        {score}/100
      </span>
    </div>
  );
}

// ── Nivel badge ───────────────────────────────────────────────────────────────
function NivelBadge({ nivel }) {
  const styles = {
    CRÍTICO: "bg-red-50 text-risk-critical border-red-200",
    ALTO:    "bg-orange-50 text-risk-high border-orange-200",
    MEDIO:   "bg-yellow-50 text-risk-medium border-yellow-200",
    BAJO:    "bg-green-50 text-risk-low border-green-200",
  };
  return (
    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${styles[nivel] ?? styles.BAJO}`}>
      {nivel}
    </span>
  );
}

// ── Alert card ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onClick, isSelected }) {
  const fmt = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP",
      maximumFractionDigits: 0, notation: "compact",
    }).format(v);

  return (
    <div
      onClick={() => onClick(alert)}
      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
        isSelected
          ? "border-vigia-accent/40 bg-orange-50/30 shadow-card"
          : "border-vigia-border bg-white hover:border-vigia-strong hover:shadow-card"
      }`}
    >
      {/* Row 1: badge + bandera */}
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <NivelBadge nivel={alert.nivel} />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          {alert.bandera_principal}
        </span>
        {alert.dias_antes_constitucion && (
          <span className="text-[10px] font-mono text-slate-400 ml-auto">
            {alert.dias_antes_constitucion} días antes
          </span>
        )}
      </div>

      {/* Row 2: entidad → proveedor */}
      <p className="text-sm font-medium text-vigia-heading leading-snug mb-1">
        {alert.entidad}
        <span className="text-vigia-dim font-normal mx-1.5">→</span>
        <span className="text-vigia-body font-normal">{alert.proveedor}</span>
      </p>

      {/* Row 3: meta */}
      <p className="text-[10px] text-vigia-muted font-mono mb-3 leading-relaxed">
        {fmt(alert.valor)} COP &nbsp;·&nbsp; {alert.modalidad} &nbsp;·&nbsp;
        {alert.departamento} &nbsp;·&nbsp; {alert.fecha_firma}
      </p>

      {/* Row 4: score bar */}
      <ScoreBar score={alert.score} />

      {/* Row 5: detalle extra */}
      {alert.detalle_extra && (
        <p className="text-[11px] text-vigia-muted mt-2.5 leading-relaxed line-clamp-2 font-light">
          {alert.detalle_extra}
        </p>
      )}

      {/* Row 6: ver */}
      <div className="flex justify-end mt-3">
        <span className="text-[11px] font-mono text-vigia-accent hover:underline transition-colors">
          ver detalle →
        </span>
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ alert, onClose }) {
  const [activeTab, setActiveTab] = useState("resumen");
  const contract = alert.contract_data ?? MOCK_CONTRACT;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-start gap-3 p-4 border-b border-vigia-border bg-white shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-1 transition-colors shrink-0 mt-0.5"
        >
          <X size={14} className="text-vigia-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <NivelBadge nivel={alert.nivel} />
            <span className="font-mono text-[9px] text-vigia-dim">{alert.id}</span>
          </div>
          <p className="text-sm font-medium text-vigia-heading leading-snug truncate">
            {alert.entidad}
          </p>
          <p className="text-[11px] text-vigia-muted truncate font-light">{alert.proveedor}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-light tabular-nums" style={{ color: scoreColor(alert.score) }}>
            {alert.score}<span className="text-sm text-vigia-dim">/100</span>
          </p>
          <p className="text-[9px] font-mono text-vigia-dim uppercase tracking-label">score vigía</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-vigia-border bg-white">
        <TabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          alertCounts={TAB_ALERT_COUNTS}
          compact
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-surface-1 p-4">
        {activeTab === "resumen" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Contrato ID", value: alert.id, mono: true },
                { label: "Valor total", value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(alert.valor) },
                { label: "Score VIGÍA", value: `${alert.score}/100 — ${alert.nivel}`, accent: true },
                { label: "Modalidad", value: alert.modalidad },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="label-mono mb-0.5">{item.label}</p>
                  <p className={`font-display font-semibold text-xs ${item.accent ? "text-risk-critical" : "text-slate-700"} ${item.mono ? "font-mono text-[10px]" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {/* TODO: Fetch from FastAPI: GET /analyze/contract/:id */}
            <RiskScorePanel contract={contract} banderasOcds={BANDERAS_OCDS} />
          </div>
        )}

        {activeTab === "redes" && (
          <div className="space-y-4 animate-fade-in">
            <div style={{ minHeight: "380px" }}>
              {/* TODO: Fetch from FastAPI: GET /graph/contractor/:nit */}
              <NetworkGraph3D network={contract.network} />
            </div>
            {/* TODO: Fetch from FastAPI: GET /analytics/pricing/:unspsc */}
            <EvidenceCharts pricing={contract.pricing} timeline={contract.timeline} />
          </div>
        )}

        {activeTab === "territorio" && (
          <div className="space-y-4 animate-fade-in">
            <div style={{ minHeight: "360px" }}>
              {/* TODO: Fetch from FastAPI: GET /territory/:municipio_code */}
              <MapView territorio={contract.territorio} />
            </div>
            {/* TODO: Fetch from FastAPI: GET /paco/news?municipio=... */}
            <PACONewsWidget noticias={PACO_NOTICIAS} />
          </div>
        )}

        {activeTab === "denuncia" && (
          <div className="space-y-4 animate-fade-in">
            {/* TODO: Fetch from FastAPI: GET /osint/verify-address?nit=... */}
            <OSINTVerification ddq={DUE_DILIGENCE} />
            {/* TODO: Fetch from FastAPI: GET /due-diligence/:nit */}
            <DueDiligencePanel ddq={DUE_DILIGENCE} contractId={alert.id} />
            {/* TODO: Fetch from FastAPI: POST /llm/draft-complaint */}
            <LLMActionPanel contract={contract} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-vigia-border px-4 py-3.5 flex items-center gap-3 shadow-card">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-red-50 text-risk-critical" : "bg-surface-1 text-vigia-muted"}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className={`font-display font-medium text-sm ${accent ? "text-risk-critical" : "text-vigia-heading"}`}>{value}</p>
        <p className="label-mono truncate">{label}</p>
      </div>
    </div>
  );
}

// ── Frequency bars ────────────────────────────────────────────────────────────
const FREQ_BANDERAS = [
  { nombre: "Empresa de maletín", count: 38, pct: 100, color: "#dc2626" },
  { nombre: "Precio atípico",     count: 31, pct: 82,  color: "#ea580c" },
  { nombre: "Único oferente",     count: 28, pct: 74,  color: "#ea580c" },
  { nombre: "Pliego sastre",      count: 24, pct: 63,  color: "#ca8a04" },
  { nombre: "Horario atípico",    count: 19, pct: 50,  color: "#ca8a04" },
  { nombre: "PEP representante",  count: 11, pct: 29,  color: "#aeaeb2" },
  { nombre: "Desajuste geo.",     count: 8,  pct: 21,  color: "#aeaeb2" },
];

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterNivel, setFilterNivel] = useState("TODOS");
  const [filterDepto, setFilterDepto] = useState("TODOS");

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Fetch from FastAPI: GET /search/contracts?q=:query
    console.info("[VIGÍA] Search:", query, "— TODO: connect to FastAPI");
  };

  // Filter alerts
  const filtered = MOCK_ALERTS.filter((a) => {
    const matchNivel = filterNivel === "TODOS" || a.nivel === filterNivel;
    const matchDepto = filterDepto === "TODOS" || a.departamento === filterDepto;
    const matchQuery = !query || [a.entidad, a.proveedor, a.id, a.departamento]
      .some((f) => f?.toLowerCase().includes(query.toLowerCase()));
    return matchNivel && matchDepto && matchQuery;
  });

  // Aggregate metrics
  const totalValor = MOCK_ALERTS.reduce((s, a) => s + a.valor, 0);
  const topEntidad = MOCK_ALERTS.reduce((top, a) => {
    const cnt = MOCK_ALERTS.filter((x) => x.entidad === a.entidad).length;
    return cnt > (top.cnt ?? 0) ? { entidad: a.entidad, cnt } : top;
  }, {}).entidad ?? "—";

  const deptos = ["TODOS", ...new Set(MOCK_ALERTS.map((a) => a.departamento))];

  return (
    <div className="min-h-screen bg-surface-1 font-display">
      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-vigia-border px-6 h-14 flex items-center gap-4 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-1.5 text-vigia-muted hover:text-vigia-heading transition-colors text-[10px] font-mono tracking-label">
          <ArrowLeft size={11} /> inicio
        </Link>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-5 h-5 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
            <Shield size={11} className="text-risk-critical" />
          </div>
          <h1 className="font-display font-bold text-sm tracking-tight text-vigia-heading">
            VIG<span className="text-vigia-accent">Í</span>A
            <span className="text-vigia-muted font-light text-xs ml-2">/ dashboard</span>
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-vigia-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            ingesta activa
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-vigia-dim">10.7M+ contratos</span>
        </div>
      </div>

      {/* ── SEARCH BAR ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-vigia-border px-6 py-4">
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 rounded-xl border border-vigia-border px-4 py-2.5 bg-surface-1 hover:border-vigia-strong focus-within:border-vigia-strong focus-within:shadow-card transition-all">
            <Search size={15} className="text-vigia-muted shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por entidad, proveedor, contrato, departamento…  Ej: UNGRD · Cauca · CO1.PCCNTR"
              className="flex-1 bg-transparent text-vigia-heading placeholder:text-vigia-dim outline-none text-sm font-light"
            />
            <button type="submit"
              className="shrink-0 px-4 py-1.5 rounded-lg bg-vigia-heading text-white text-[11px] font-mono hover:bg-vigia-body transition-colors">
              buscar
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="max-w-4xl mx-auto flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[9px] font-mono tracking-ultra uppercase text-vigia-dim mr-1">filtrar:</span>

          {/* Nivel */}
          <div className="relative">
            <select
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
              className="appearance-none text-[10px] font-mono bg-white border border-vigia-border rounded-full px-3 py-1.5 pr-7 text-vigia-muted cursor-pointer hover:border-vigia-strong focus:outline-none transition-colors"
            >
              {["TODOS", "CRÍTICO", "ALTO", "MEDIO", "BAJO"].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <ChevronDown size={9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vigia-dim pointer-events-none" />
          </div>

          {/* Departamento */}
          <div className="relative">
            <select
              value={filterDepto}
              onChange={(e) => setFilterDepto(e.target.value)}
              className="appearance-none text-xs font-mono bg-white border border-surface-3 rounded-full px-3 py-1.5 pr-7 text-slate-600 cursor-pointer hover:border-slate-300 focus:outline-none"
            >
              {deptos.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vigia-dim pointer-events-none" />
          </div>

          <span className="ml-auto text-[9px] font-mono text-vigia-dim">
            {filtered.length} alertas
          </span>
        </div>
      </div>

      {/* ── FEATURED RISK SCORE — lo primero que ve el usuario ───────────── */}
      {!selectedAlert && (
        <div className="bg-white border-b border-vigia-border px-4 sm:px-6 py-4">
          <div className="max-w-[1600px] mx-auto">
            <div
              className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 flex items-center gap-5 cursor-pointer hover:border-red-300 hover:shadow-card transition-all"
              onClick={() => setSelectedAlert(MOCK_ALERTS[0])}
            >
              {/* Score gauge mini */}
              <div className="relative shrink-0 w-16 h-16">
                <svg width="64" height="64" className="rotate-[-90deg]">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#fecaca" strokeWidth="8" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="#dc2626" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - 0.92)}`}
                    style={{ filter: "drop-shadow(0 0 6px rgba(239,68,68,0.5))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-lg leading-none text-risk-critical">92</span>
                  <span className="font-mono text-[8px] text-slate-400">/100</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[9px] font-mono font-bold bg-risk-critical text-white rounded-full px-2.5 py-0.5 animate-pulse-dot">
                    RIESGO CRÍTICO
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">Contrato más reciente · PAE PDET</span>
                </div>
                <p className="text-sm font-display font-semibold text-slate-900 leading-snug truncate">
                  Alcaldía de Argelia → Soluciones Nutricionales del Pacífico SAS
                </p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  $4.820M COP · Cauca · 7 banderas · empresa constituida hace 15 días
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0 hidden sm:flex items-center gap-2 text-[11px] font-mono text-risk-critical font-semibold">
                <Zap size={12} />
                ver análisis completo →
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────── */}
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 py-6 ${selectedAlert ? "grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6" : ""}`}>

        {/* LEFT: metrics + feed */}
        <div className="space-y-5">
          {/* Metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Alertas activas"
              value={String(MOCK_ALERTS.length)}
              icon={AlertTriangle}
              accent
            />
            <MetricCard
              label="Valor total en riesgo"
              value={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(totalValor)}
              icon={TrendingUp}
              accent
            />
            <MetricCard
              label="Entidad con más alertas"
              value={topEntidad.length > 20 ? topEntidad.substring(0, 20) + "…" : topEntidad}
              icon={Building2}
              accent={false}
            />
            <MetricCard
              label="Bandera más frecuente"
              value="Empresa de maletín"
              icon={MapPin}
              accent={false}
            />
          </div>

          {/* Frequency bars */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Distribución de banderas activas — semana</p>
            <p className="label-mono mb-4">top 7 banderas por frecuencia de aparición</p>
            <div className="space-y-2.5">
              {FREQ_BANDERAS.map((b) => (
                <div key={b.nombre} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-vigia-muted w-40 shrink-0 truncate">{b.nombre}</span>
                  <div className="flex-1 h-1 rounded-full bg-vigia-border overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-vigia-dim w-5 text-right shrink-0">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alert feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-vigia-heading">Feed de Alertas</p>
              <span className="text-[9px] font-mono text-vigia-dim uppercase tracking-label">ordenado por score</span>
            </div>
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-vigia-muted font-mono text-sm">
                  ninguna alerta coincide con los filtros
                </div>
              ) : (
                filtered.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onClick={setSelectedAlert}
                    isSelected={selectedAlert?.id === alert.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: detail panel */}
        {selectedAlert && (
          <div className="lg:sticky lg:top-14 lg:self-start lg:max-h-[calc(100vh-3.5rem)] lg:overflow-hidden rounded-2xl border border-vigia-border bg-white shadow-card-lg flex flex-col">
            <DetailPanel
              alert={selectedAlert}
              onClose={() => setSelectedAlert(null)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-vigia-border bg-white px-6 py-5 text-center mt-6">
        <p className="font-mono text-[10px] text-vigia-dim">
          vigía · sistema de ia para veeduría ciudadana · datos públicos secop ·{" "}
          <a href="https://www.anticorrupcion.co/metodologia" target="_blank" rel="noreferrer"
            className="hover:text-vigia-muted transition-colors">
            metodología abierta
          </a>{" "}
          · indicadores de riesgo, no determinan culpabilidad
        </p>
      </footer>
    </div>
  );
}
