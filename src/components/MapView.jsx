import { useState } from "react";
import { Map, AlertTriangle, TrendingDown, Users, Crosshair, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

function ColombiaFallback({ territorio }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden border border-surface-3">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Colombia SVG */}
      <svg viewBox="0 0 200 260" className="h-60 opacity-20" fill="none">
        <path
          d="M80 10 L120 8 L140 20 L155 35 L160 55 L155 70 L145 80 L150 100 L160 115
             L165 135 L158 155 L145 170 L130 185 L118 205 L115 225 L108 245 L100 255
             L92 245 L85 225 L82 205 L70 185 L55 170 L42 155 L35 135 L40 115 L50 100
             L55 80 L45 70 L40 55 L45 35 L60 20 Z"
          stroke="#94A3B8" strokeWidth="2" fill="#F1F5F9"
        />
        <path
          d="M80 10 L65 5 L50 10 L35 18 L28 30 L35 35 L45 35 L60 20 L80 10"
          stroke="#94A3B8" strokeWidth="1.5" fill="#F1F5F9"
        />
      </svg>

      {/* Cauca marker */}
      <div className="absolute" style={{ left: "37%", top: "58%" }}>
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-risk-critical/15 animate-ping absolute -inset-2.5" />
          <div className="w-3.5 h-3.5 rounded-full bg-risk-critical shadow-glow-red relative z-10 border-2 border-white" />
          <div className="absolute left-5 -top-1 bg-white border border-surface-3 rounded-lg px-2.5 py-1.5 whitespace-nowrap z-20 shadow-card-md">
            <p className="text-xs font-mono font-semibold text-risk-critical">Argelia, Cauca</p>
            <p className="text-[10px] font-mono text-slate-400">PDET · Score 92/100</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-0 right-0 text-center px-4">
        <p className="text-xs font-mono text-slate-400">
          Configura{" "}
          <code className="text-action-primary bg-action-light px-1 rounded">VITE_CARTO_URL</code>{" "}
          en <code className="text-action-primary bg-action-light px-1 rounded">.env</code>
        </p>
      </div>
    </div>
  );
}

// TODO: Fetch from FastAPI: GET /territory/:municipio_code
export function MapView({ territorio }) {
  const [mapError, setMapError] = useState(false);
  const cartoUrl = import.meta.env.VITE_CARTO_URL ?? territorio.carto_map_url;
  const showIframe = cartoUrl && !mapError;

  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact",
    }).format(v);

  const kpis = [
    { label: "Inversión contrato", value: formatCOP(4820000000), accent: "text-risk-critical font-bold" },
    { label: "IDH municipal", value: territorio.idh.toString(), accent: "text-risk-high font-semibold" },
    { label: "Pobreza multidim.", value: `${territorio.pobreza_multidimensional_pct}%`, accent: "text-risk-high font-semibold" },
    { label: "Población", value: territorio.poblacion.toLocaleString("es-CO"), accent: "text-slate-700" },
    { label: "Inversión/cápita", value: formatCOP(territorio.inversion_contrato_per_capita), accent: "text-action-primary font-semibold" },
    { label: "Zona PDET", value: territorio.pdet ? "SÍ" : "NO", accent: territorio.pdet ? "text-emerald-600 font-bold" : "text-slate-500" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Map size={15} className="text-action-primary" />
        <span className="font-display font-semibold text-sm text-slate-800">
          Pertinencia Territorial
        </span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">PDET</span>
          <span className="font-mono text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">ZONA DE PAZ</span>
          <span className="font-mono text-[10px] text-slate-400">{territorio.municipio}, {territorio.departamento}</span>
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col gap-4">
        {/* Map area */}
        <div className="relative rounded-xl overflow-hidden bg-slate-50 border border-surface-3" style={{ aspectRatio: "16/7" }}>
          {showIframe ? (
            <iframe
              src={cartoUrl}
              title="Mapa CARTO — Pertinencia Territorial"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              onError={() => setMapError(true)}
            />
          ) : (
            <ColombiaFallback territorio={territorio} />
          )}

          {/* Risk overlay */}
          <div className="absolute top-3 left-3 glass-card px-3 py-2 !rounded-lg">
            <p className="label-mono">contrato en análisis</p>
            <p className="font-display font-bold text-risk-critical text-sm mt-0.5">Score 92/100 · CRÍTICO</p>
          </div>

          {!showIframe && (
            <a
              href="https://carto.com" target="_blank" rel="noreferrer"
              className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-action-primary transition-colors bg-white/80 rounded px-2 py-1 border border-surface-3"
            >
              CARTO <ExternalLink size={9} />
            </a>
          )}
        </div>

        {/* Conflict + Alertas Tempranas Defensoría */}
        {territorio.conflicto_activo && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-semibold text-amber-700">ZONA DE CONFLICTO ACTIVO</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Presencia de {territorio.grupos_armados.join(" · ")}. La ejecución real
                del contrato PAE en esta zona es de muy difícil verificación.
              </p>
              {territorio.alertas_tempranas_defensoria?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-amber-200 space-y-1">
                  {territorio.alertas_tempranas_defensoria.map((a, i) => (
                    <p key={i} className="text-[10px] font-mono text-amber-700 leading-relaxed">
                      ⚠ {a}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-3 gap-2">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-surface-1 border border-surface-3 rounded-xl p-3" title={kpi.label}>
              <p className="label-mono mb-1">{kpi.label}</p>
              <p className={`font-display font-bold text-sm ${kpi.accent}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400 text-center border-t border-surface-3 pt-3">
          Vías: {territorio.vias_estado} · Presencia estatal: {territorio.presencia_estatal}
        </div>
      </CardBody>
    </Card>
  );
}
