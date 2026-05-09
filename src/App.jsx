import { useState, useEffect } from "react";
import MOCK_CONTRACT, { BANDERAS_OCDS, PACO_NOTICIAS, DUE_DILIGENCE } from "./data/mockContract";
import { Header } from "./components/Header";
import { TabNav } from "./components/TabNav";
import { RiskScorePanel } from "./components/RiskScorePanel";
import { MapView } from "./components/MapView";
import { NetworkGraph3D } from "./components/NetworkGraph3D";
import { EvidenceCharts } from "./components/EvidenceCharts";
import { LLMActionPanel } from "./components/LLMActionPanel";
import { PACONewsWidget } from "./components/PACONewsWidget";
import { DueDiligencePanel } from "./components/DueDiligencePanel";

// FastAPI base URL — set via .env
// const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Alert counts per tab (for TabNav badges)
const TAB_ALERT_COUNTS = {
  resumen:    10,  // 7 AI flags + 3 OCDS flags
  redes:       5,  // 5 fachada nodes
  territorio:  3,  // 3 PACO news items
  denuncia:    5,  // 5 SARLAFT alerts
};

export default function App() {
  // TODO: Fetch from FastAPI: GET /analyze/contract/:id
  const [contract, setContract] = useState(MOCK_CONTRACT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resumen");

  useEffect(() => {
    // TODO: Replace with real fetch when FastAPI is ready:
    //
    // const fetchContract = async (id) => {
    //   setLoading(true);
    //   try {
    //     const res = await fetch(`${API_BASE}/analyze/contract/${id}`);
    //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
    //     const data = await res.json();
    //     setContract(data);
    //   } catch (err) {
    //     setError(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchContract("CO1.PCCNTR.7842913");
    setLoading(false);
  }, []);

  const handleSearch = (query) => {
    // TODO: Fetch from FastAPI: GET /analyze/contract/:id or GET /search/contracts?q=:query
    console.info("[VIGÍA] Search:", query, "— TODO: connect to FastAPI");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-action-primary border-t-transparent animate-spin mx-auto" />
          <p className="font-mono text-sm text-slate-500">Analizando contrato…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="font-mono text-risk-critical text-sm">Error: {error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs font-mono text-slate-500 hover:text-slate-700 transition-colors"
          >
            reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  return (
    <div className="min-h-screen bg-surface-1 font-display">
      {/* ── Header / Hero ────────────────────────────────────────── */}
      <Header onSearch={handleSearch} />

      {/* ── Tab Navigation ───────────────────────────────────────── */}
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCounts={TAB_ALERT_COUNTS}
      />

      {/* ── Tab Content ──────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">

        {/* ── TAB 1: Resumen y Banderas Rojas ─────────────────────── */}
        {activeTab === "resumen" && (
          <div className="animate-fade-in">
            {/* Contract quick-facts strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Contrato ID", value: contract.id, mono: true },
                { label: "Valor total", value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(contract.valor_contrato), accent: "text-risk-critical" },
                { label: "Score VIGÍA", value: `${contract.score}/100 — CRÍTICO`, accent: "text-risk-critical font-bold" },
                { label: "Modalidad", value: contract.modalidad },
              ].map((item) => (
                <div key={item.label} className="card px-4 py-3.5">
                  <p className="label-mono mb-1">{item.label}</p>
                  <p className={`font-display font-semibold text-sm ${item.accent ?? "text-slate-800"} ${item.mono ? "font-mono text-xs" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Risk panel full width on Tab 1 */}
            {/* TODO: Fetch from FastAPI: GET /analyze/contract/:id */}
            <RiskScorePanel
              contract={contract}
              banderasOcds={BANDERAS_OCDS}
            />
          </div>
        )}

        {/* ── TAB 2: Grafo de Redes y Datos ────────────────────────── */}
        {activeTab === "redes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" style={{ minHeight: "600px" }}>
            <div className="lg:col-span-7 min-h-[580px]">
              {/* TODO: Fetch from FastAPI: GET /graph/contractor/:nit */}
              <NetworkGraph3D network={contract.network} />
            </div>
            <div className="lg:col-span-5 min-h-[580px]">
              {/* TODO: Fetch from FastAPI: GET /analytics/pricing/:unspsc + /analytics/timeline/:entidad_nit */}
              <EvidenceCharts
                pricing={contract.pricing}
                timeline={contract.timeline}
              />
            </div>
          </div>
        )}

        {/* ── TAB 3: Territorio y Contexto ─────────────────────────── */}
        {activeTab === "territorio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" style={{ minHeight: "600px" }}>
            <div className="lg:col-span-7 min-h-[560px]">
              {/* TODO: Fetch from FastAPI: GET /territory/:municipio_code */}
              <MapView territorio={contract.territorio} />
            </div>
            <div className="lg:col-span-5 min-h-[560px]">
              {/* TODO: Fetch from FastAPI: GET /paco/news?municipio=Argelia&departamento=Cauca */}
              <PACONewsWidget noticias={PACO_NOTICIAS} />
            </div>
          </div>
        )}

        {/* ── TAB 4: Denuncia y Exportación ────────────────────────── */}
        {activeTab === "denuncia" && (
          <div className="space-y-6 animate-fade-in">
            {/* TODO: Fetch from FastAPI: GET /due-diligence/:nit */}
            <DueDiligencePanel
              ddq={DUE_DILIGENCE}
              contractId={contract.id}
            />
            {/* TODO: Fetch from FastAPI: POST /llm/draft-complaint */}
            <LLMActionPanel contract={contract} />
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-surface-3 bg-white px-6 py-5 text-center mt-10">
        <p className="font-mono text-xs text-slate-400">
          VIGÍA — Sistema de IA para Veeduría Ciudadana · datos públicos SECOP ·{" "}
          <a
            href="https://www.anticorrupcion.co/metodologia"
            target="_blank" rel="noreferrer"
            className="hover:text-action-primary transition-colors"
          >
            metodología abierta
          </a>{" "}
          · Este sistema detecta señales de alerta, no determina culpabilidad ·{" "}
          <a
            href="https://www.demoanalitica.com"
            target="_blank" rel="noreferrer"
            className="hover:text-action-primary transition-colors"
          >
            demoanalitica.com
          </a>
        </p>
      </footer>
    </div>
  );
}
