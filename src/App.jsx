import { useState, useEffect, useCallback } from "react";
import { BANDERAS_OCDS, PACO_NOTICIAS, DUE_DILIGENCE } from "./data/mockContract";
import { fetchContract, fetchDueDiligence } from "./lib/api";
import { Header } from "./components/Header";
import { TabNav } from "./components/TabNav";
import { RiskScorePanel } from "./components/RiskScorePanel";
import { MapView } from "./components/MapView";
import { NetworkGraph3D } from "./components/NetworkGraph3D";
import { EvidenceCharts } from "./components/EvidenceCharts";
import { LLMActionPanel } from "./components/LLMActionPanel";
import { PACONewsWidget } from "./components/PACONewsWidget";
import { DueDiligencePanel } from "./components/DueDiligencePanel";

const TAB_ALERT_COUNTS = {
  resumen:   10,
  redes:      5,
  territorio: 3,
  denuncia:   5,
};

// Contrato que se muestra en la vista de análisis individual (desde Header search)
const DEFAULT_CONTRACT_ID = "CO1.PCCNTR.7842913";

export default function App() {
  const [contract, setContract]   = useState(null);
  const [ddq, setDdq]             = useState(DUE_DILIGENCE);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("resumen");

  const loadContract = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [contractData, ddqData] = await Promise.all([
        fetchContract(id),
        fetchDueDiligence(id),
      ]);
      setContract(contractData);
      setDdq(ddqData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContract(DEFAULT_CONTRACT_ID);
  }, [loadContract]);

  const handleSearch = (query) => {
    if (query?.trim()) loadContract(query.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-2 border-action-primary border-t-transparent animate-spin mx-auto" />
          <p className="font-mono text-sm text-slate-500">Cargando datos reales SECOP…</p>
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
            onClick={() => loadContract(DEFAULT_CONTRACT_ID)}
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
      <Header onSearch={handleSearch} />

      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        alertCounts={TAB_ALERT_COUNTS}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {/* TAB 1 — Resumen y Banderas */}
        {activeTab === "resumen" && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Contrato ID",   value: contract.id,            mono: true },
                { label: "Valor total",   value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(contract.valor_contrato), accent: "text-risk-critical" },
                { label: "Score VIGÍA",   value: contract.score ? `${contract.score}/100` : "Calculando…", accent: "text-risk-critical font-bold" },
                { label: "Modalidad",     value: contract.modalidad },
              ].map((item) => (
                <div key={item.label} className="card px-4 py-3.5">
                  <p className="label-mono mb-1">{item.label}</p>
                  <p className={`font-display font-semibold text-sm ${item.accent ?? "text-slate-800"} ${item.mono ? "font-mono text-xs" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <RiskScorePanel contract={contract} banderasOcds={BANDERAS_OCDS} />
          </div>
        )}

        {/* TAB 2 — Grafo + Evidencia */}
        {activeTab === "redes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" style={{ minHeight: "600px" }}>
            <div className="lg:col-span-7 min-h-[580px]">
              <NetworkGraph3D network={contract.network} />
            </div>
            <div className="lg:col-span-5 min-h-[580px]">
              <EvidenceCharts pricing={contract.pricing} timeline={contract.timeline} />
            </div>
          </div>
        )}

        {/* TAB 3 — Territorio + PACO */}
        {activeTab === "territorio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in" style={{ minHeight: "600px" }}>
            <div className="lg:col-span-7 min-h-[560px]">
              <MapView territorio={contract.territorio} />
            </div>
            <div className="lg:col-span-5 min-h-[560px]">
              <PACONewsWidget noticias={PACO_NOTICIAS} />
            </div>
          </div>
        )}

        {/* TAB 4 — Denuncia + PDF */}
        {activeTab === "denuncia" && (
          <div className="space-y-6 animate-fade-in">
            <DueDiligencePanel ddq={ddq} contractId={contract.id} />
            <LLMActionPanel contract={contract} />
          </div>
        )}
      </main>

      <footer className="border-t border-surface-3 bg-white px-6 py-5 text-center mt-10">
        <p className="font-mono text-xs text-slate-400">
          VIGÍA · datos reales SECOP ({new Intl.NumberFormat("es-CO").format(1003902)} contratos) ·{" "}
          <a href="https://www.anticorrupcion.co/metodologia" target="_blank" rel="noreferrer" className="hover:text-action-primary transition-colors">
            metodología abierta
          </a>
          {" "}· señales de alerta, no determinan culpabilidad
        </p>
      </footer>
    </div>
  );
}
