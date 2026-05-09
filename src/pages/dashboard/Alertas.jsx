// =============================================================================
// VIGÍA — Alertas Page (feed principal)
// Movido desde Dashboard.jsx como sub-ruta
// =============================================================================
import { useState } from "react";
import { Search, ChevronDown, AlertTriangle, TrendingUp, Building2, MapPin, X } from "lucide-react";
import MOCK_CONTRACT, { MOCK_ALERTS, BANDERAS_OCDS, PACO_NOTICIAS, DUE_DILIGENCE } from "../../data/mockContract";
import { TabNav } from "../../components/TabNav";
import { RiskScorePanel } from "../../components/RiskScorePanel";
import { MapView } from "../../components/MapView";
import { NetworkGraph3D } from "../../components/NetworkGraph3D";
import { EvidenceCharts } from "../../components/EvidenceCharts";
import { LLMActionPanel } from "../../components/LLMActionPanel";
import { PACONewsWidget } from "../../components/PACONewsWidget";
import { DueDiligencePanel } from "../../components/DueDiligencePanel";

const TAB_ALERT_COUNTS = { resumen: 10, redes: 5, territorio: 3, denuncia: 5 };
const PAGE_SIZE = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(s) {
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
}

function ScoreBar({ score }) {
  const c = scoreColor(score);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-full bg-vigia-border overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: c }} />
      </div>
      <span className="font-mono text-[11px] font-semibold shrink-0 tabular-nums" style={{ color: c }}>
        {score}/100
      </span>
    </div>
  );
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

function AlertCard({ alert, onClick, isSelected }) {
  const fmt = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(v);

  return (
    <div
      onClick={() => onClick(alert)}
      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-150 ${
        isSelected
          ? "border-vigia-accent/40 bg-orange-50/30 shadow-card"
          : "border-vigia-border bg-white hover:border-vigia-strong hover:shadow-card"
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <NivelBadge nivel={alert.nivel} />
        <span className="text-[9px] font-mono uppercase tracking-label text-vigia-muted">{alert.bandera_principal}</span>
        {alert.dias_antes_constitucion && (
          <span className="text-[9px] font-mono text-vigia-dim ml-auto">{alert.dias_antes_constitucion} días antes</span>
        )}
      </div>
      <p className="text-sm font-medium text-vigia-heading leading-snug mb-1">
        {alert.entidad}
        <span className="text-vigia-dim font-normal mx-1.5">→</span>
        <span className="text-vigia-body font-normal">{alert.proveedor}</span>
      </p>
      <p className="text-[10px] text-vigia-muted font-mono mb-3">
        {fmt(alert.valor)} COP · {alert.modalidad} · {alert.departamento} · {alert.fecha_firma}
      </p>
      <ScoreBar score={alert.score} />
      {alert.detalle_extra && (
        <p className="text-[11px] text-vigia-muted mt-2.5 leading-relaxed line-clamp-2 font-light">{alert.detalle_extra}</p>
      )}
      <div className="flex justify-end mt-3">
        <span className="text-[11px] font-mono text-vigia-accent hover:underline">ver detalle →</span>
      </div>
    </div>
  );
}

function DetailPanel({ alert, onClose }) {
  const [activeTab, setActiveTab] = useState("resumen");
  const contract = alert.contract_data ?? MOCK_CONTRACT;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start gap-3 p-4 border-b border-vigia-border bg-white shrink-0">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-1 transition-colors shrink-0 mt-0.5">
          <X size={14} className="text-vigia-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <NivelBadge nivel={alert.nivel} />
            <span className="font-mono text-[9px] text-vigia-dim">{alert.id}</span>
          </div>
          <p className="text-sm font-medium text-vigia-heading leading-snug truncate">{alert.entidad}</p>
          <p className="text-[11px] text-vigia-muted truncate font-light">{alert.proveedor}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-light tabular-nums" style={{ color: scoreColor(alert.score) }}>
            {alert.score}<span className="text-sm text-vigia-dim">/100</span>
          </p>
          <p className="text-[9px] font-mono text-vigia-dim uppercase tracking-label">score vigía</p>
        </div>
      </div>

      <div className="shrink-0 border-b border-vigia-border bg-white">
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} alertCounts={TAB_ALERT_COUNTS} compact />
      </div>

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
                <div key={item.label} className="bg-white rounded-xl border border-vigia-border px-3 py-2.5">
                  <p className="label-mono mb-0.5">{item.label}</p>
                  <p className={`font-display font-semibold text-xs ${item.accent ? "text-risk-critical" : "text-vigia-body"} ${item.mono ? "font-mono text-[10px]" : ""}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <RiskScorePanel contract={contract} banderasOcds={BANDERAS_OCDS} />
          </div>
        )}
        {activeTab === "redes" && (
          <div className="space-y-4 animate-fade-in">
            <div style={{ minHeight: "380px" }}>
              <NetworkGraph3D network={contract.network} />
            </div>
            <EvidenceCharts pricing={contract.pricing} timeline={contract.timeline} />
          </div>
        )}
        {activeTab === "territorio" && (
          <div className="space-y-4 animate-fade-in">
            <div style={{ minHeight: "360px" }}>
              <MapView territorio={contract.territorio} />
            </div>
            <PACONewsWidget noticias={PACO_NOTICIAS} />
          </div>
        )}
        {activeTab === "denuncia" && (
          <div className="space-y-4 animate-fade-in">
            <DueDiligencePanel ddq={DUE_DILIGENCE} contractId={alert.id} />
            <LLMActionPanel contract={contract} />
          </div>
        )}
      </div>
    </div>
  );
}

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

const FREQ_BANDERAS = [
  { nombre: "Empresa de maletín", count: 38, pct: 100, color: "#dc2626" },
  { nombre: "Precio atípico",     count: 31, pct: 82,  color: "#ea580c" },
  { nombre: "Único oferente",     count: 28, pct: 74,  color: "#ea580c" },
  { nombre: "Pliego sastre",      count: 24, pct: 63,  color: "#ca8a04" },
  { nombre: "Horario atípico",    count: 19, pct: 50,  color: "#ca8a04" },
  { nombre: "PEP representante",  count: 11, pct: 29,  color: "#aeaeb2" },
  { nombre: "Desajuste geo.",     count: 8,  pct: 21,  color: "#aeaeb2" },
];

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border hover:border-vigia-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
      >
        ← anterior
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-[11px] font-mono transition-colors ${
            p === page
              ? "bg-vigia-heading text-white"
              : "text-vigia-muted hover:text-vigia-heading border border-vigia-border hover:border-vigia-strong bg-white"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border hover:border-vigia-strong disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
      >
        siguiente →
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Alertas() {
  const [query, setQuery] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterNivel, setFilterNivel] = useState("TODOS");
  const [filterDepto, setFilterDepto] = useState("TODOS");
  const [page, setPage] = useState(1);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); };

  const filtered = MOCK_ALERTS.filter((a) => {
    const mN = filterNivel === "TODOS" || a.nivel === filterNivel;
    const mD = filterDepto === "TODOS" || a.departamento === filterDepto;
    const mQ = !query || [a.entidad, a.proveedor, a.id, a.departamento]
      .some((f) => f?.toLowerCase().includes(query.toLowerCase()));
    return mN && mD && mQ;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalValor = MOCK_ALERTS.reduce((s, a) => s + a.valor, 0);
  const topEntidad = MOCK_ALERTS.reduce((top, a) => {
    const cnt = MOCK_ALERTS.filter((x) => x.entidad === a.entidad).length;
    return cnt > (top.cnt ?? 0) ? { entidad: a.entidad, cnt } : top;
  }, {}).entidad ?? "—";
  const deptos = ["TODOS", ...new Set(MOCK_ALERTS.map((a) => a.departamento))];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Search + filters */}
      <div className="mb-5">
        <form onSubmit={handleSearch} className="mb-3">
          <div className="flex items-center gap-3 rounded-xl border border-vigia-border px-4 py-2.5 bg-white hover:border-vigia-strong focus-within:border-vigia-strong focus-within:shadow-card transition-all">
            <Search size={15} className="text-vigia-muted shrink-0" />
            <input
              type="text" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Buscar entidad, proveedor, contrato, departamento…"
              className="flex-1 bg-transparent text-vigia-heading placeholder:text-vigia-dim outline-none text-sm font-light"
            />
            <button type="submit" className="shrink-0 px-4 py-1.5 rounded-lg bg-vigia-heading text-white text-[11px] font-mono hover:bg-vigia-body transition-colors">
              buscar
            </button>
          </div>
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono tracking-ultra uppercase text-vigia-dim">filtrar:</span>
          {["nivel", "departamento"].map((f) => (
            <div key={f} className="relative">
              <select
                value={f === "nivel" ? filterNivel : filterDepto}
                onChange={(e) => { f === "nivel" ? setFilterNivel(e.target.value) : setFilterDepto(e.target.value); setPage(1); }}
                className="appearance-none text-[10px] font-mono bg-white border border-vigia-border rounded-full px-3 py-1.5 pr-7 text-vigia-muted cursor-pointer hover:border-vigia-strong focus:outline-none transition-colors"
              >
                {f === "nivel"
                  ? ["TODOS", "CRÍTICO", "ALTO", "MEDIO", "BAJO"].map((n) => <option key={n}>{n}</option>)
                  : deptos.map((d) => <option key={d}>{d}</option>)
                }
              </select>
              <ChevronDown size={9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vigia-dim pointer-events-none" />
            </div>
          ))}
          <span className="ml-auto text-[9px] font-mono text-vigia-dim">{filtered.length} alertas</span>
        </div>
      </div>

      <div className={`${selectedAlert ? "grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-6" : ""}`}>
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Alertas activas" value={String(MOCK_ALERTS.length)} icon={AlertTriangle} accent />
            <MetricCard
              label="Valor total en riesgo"
              value={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(totalValor)}
              icon={TrendingUp} accent
            />
            <MetricCard label="Entidad con más alertas" value={topEntidad.length > 20 ? topEntidad.slice(0, 20) + "…" : topEntidad} icon={Building2} accent={false} />
            <MetricCard label="Bandera más frecuente" value="Empresa de maletín" icon={MapPin} accent={false} />
          </div>

          {/* Frequency bars */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Distribución de banderas activas</p>
            <p className="label-mono mb-4">top 7 por frecuencia — semana actual</p>
            <div className="space-y-2.5">
              {FREQ_BANDERAS.map((b) => (
                <div key={b.nombre} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-vigia-muted w-40 shrink-0 truncate">{b.nombre}</span>
                  <div className="flex-1 h-1 rounded-full bg-vigia-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                  </div>
                  <span className="text-[9px] font-mono text-vigia-dim w-5 text-right shrink-0">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-vigia-heading">Feed de alertas</p>
              <span className="text-[9px] font-mono text-vigia-dim uppercase tracking-label">
                pág. {page} · {filtered.length} resultados
              </span>
            </div>
            <div className="space-y-3">
              {paginated.length === 0 ? (
                <div className="text-center py-12 text-vigia-muted font-mono text-sm">ninguna alerta coincide</div>
              ) : (
                paginated.map((a) => (
                  <AlertCard key={a.id} alert={a} onClick={setSelectedAlert} isSelected={selectedAlert?.id === a.id} />
                ))
              )}
            </div>
            <div className="mt-4">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selectedAlert && (
          <div className="lg:sticky lg:top-[6.5rem] lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden rounded-2xl border border-vigia-border bg-white shadow-card-lg flex flex-col">
            <DetailPanel alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
