import { useState } from "react";
import {
  MapPin, AlertTriangle, Eye, ExternalLink,
  Building2, Calendar, ShieldAlert, CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

// ── Row helper (reused from DueDiligencePanel style) ─────────────────────────
function DataRow({ label, value, accent, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-surface-3 last:border-0">
      <span className="text-xs text-slate-500 font-display shrink-0 w-44">{label}</span>
      <span
        className={`text-xs text-right flex-1 min-w-0 leading-snug ${
          accent ?? "text-slate-800 font-medium"
        } ${mono ? "font-mono" : "font-display"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Street view / Maps embed ─────────────────────────────────────────────────
function MapEmbed({ ddq }) {
  const [embedError, setEmbedError] = useState(false);
  const addr = encodeURIComponent(`${ddq.direccion}, Bogotá, Colombia`);
  const embedUrl = `https://maps.google.com/maps?q=${addr}&t=k&z=18&output=embed`;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 border border-surface-3" style={{ aspectRatio: "4/3" }}>
      {!embedError ? (
        <iframe
          src={embedUrl}
          title="Verificación geoespacial OSINT — VIGÍA"
          className="w-full h-full border-0"
          loading="lazy"
          onError={() => setEmbedError(true)}
          allowFullScreen
        />
      ) : (
        // Fallback: imagen de Unsplash con lote/local genérico
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"
          alt="Domicilio comercial registrado"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "";
            e.target.parentElement.classList.add("flex", "items-center", "justify-center");
          }}
        />
      )}

      {/* ── Alert badge parpadeante ─────────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="flex items-start gap-2.5 bg-risk-critical text-white rounded-xl px-4 py-3 shadow-glow-red">
          <div className="relative shrink-0 mt-0.5">
            <AlertTriangle size={16} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse-dot" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">
              ALERTA VIGÍA · Discrepancia Física
            </p>
            <p className="text-xs font-mono opacity-90 mt-0.5">
              Alta probabilidad de Empresa Fachada · Score {(ddq.osint?.discrepancia_score * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
        <p className="text-white text-[10px] font-mono truncate opacity-90">
          {ddq.direccion}
        </p>
        <p className="text-white/60 text-[9px] font-mono">
          Vista satelital · Google Maps
        </p>
      </div>
    </div>
  );
}

// ── Hallazgo item ────────────────────────────────────────────────────────────
function HallazgoItem({ texto }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      <ShieldAlert size={11} className="text-risk-critical mt-0.5 shrink-0" />
      <p className="text-xs text-slate-600 leading-snug">{texto}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// TODO: Fetch from FastAPI: GET /osint/verify-address?nit=:nit
export function OSINTVerification({ ddq }) {
  const osint = ddq.osint ?? {};
  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0,
    }).format(v);

  return (
    <Card>
      <CardHeader>
        <Eye size={15} className="text-risk-critical" />
        <span className="font-display font-semibold text-sm text-slate-800">
          OSINT · Verificación de Domicilio Comercial
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {/* Source pills */}
          {["RUES", "IGAC", "Catastro Distrital"].map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono text-slate-500 bg-surface-2 border border-surface-3 rounded-full px-2 py-0.5"
            >
              {s}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardBody>
        {/* Discrepancy score banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200 mb-5">
          <div className="w-10 h-10 rounded-xl bg-risk-critical flex items-center justify-center shrink-0 shadow-glow-red">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-display font-bold text-red-700">
              Discrepancia Física Detectada
            </p>
            <p className="text-xs text-red-500 font-mono mt-0.5">
              Análisis IA VIGÍA · Modelo de verificación geoespacial SARLAFT
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-display font-bold text-risk-critical">
              {osint.discrepancia_score
                ? `${(osint.discrepancia_score * 100).toFixed(0)}%`
                : "91%"}
            </p>
            <p className="text-[9px] font-mono text-red-400 uppercase tracking-wider">
              prob. fachada
            </p>
          </div>
        </div>

        {/* Split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── Left: RUES data ────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={13} className="text-slate-500" />
              <p className="text-xs font-display font-bold text-slate-700 uppercase tracking-wider">
                Datos Registrales RUES
              </p>
            </div>

            <div className="bg-white border border-surface-3 rounded-xl px-4 divide-y divide-surface-3 mb-4">
              <DataRow
                label="Sede registrada (RUES)"
                value={ddq.direccion}
                mono
              />
              <DataRow
                label="Patrimonio declarado"
                value={formatCOP(ddq.capital_suscrito)}
                accent="text-risk-critical font-bold"
              />
              <DataRow
                label="Empleados declarados"
                value={`${ddq.num_empleados} personas`}
              />
              <DataRow
                label="Cámara de Comercio"
                value={ddq.camara_comercio}
              />
              <DataRow
                label="Tipo inmueble (IGAC)"
                value={osint.tipo_inmueble_catastro ?? "Local comercial — predio sin uso"}
                accent="text-risk-critical font-medium"
              />
              <DataRow
                label="Última inspección"
                value={osint.ultima_inspeccion ?? "No registra visita en últimos 5 años"}
                accent="text-risk-high font-medium"
              />
              <DataRow
                label="Actividad vecinal"
                value={osint.actividad_vecinal ?? "Sin actividad comercial visible"}
                accent="text-risk-high font-medium"
              />
              <DataRow
                label="Historial predial"
                value={osint.historial_predial ?? "Sin licencias activas"}
              />
            </div>

            {/* Hallazgos IA */}
            {osint.hallazgos?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="label-mono text-red-600 mb-2">
                  Hallazgos del Modelo IA
                </p>
                <div className="divide-y divide-red-100">
                  {osint.hallazgos.map((h, i) => (
                    <HallazgoItem key={i} texto={h} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Street View / Maps ──────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={13} className="text-slate-500" />
              <p className="text-xs font-display font-bold text-slate-700 uppercase tracking-wider">
                Verificación Visual — Vista Satelital
              </p>
            </div>

            <MapEmbed ddq={ddq} />

            {/* Coordinates */}
            {osint.coordenadas && (
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>
                  {osint.coordenadas.lat.toFixed(4)}, {osint.coordenadas.lng.toFixed(4)}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${osint.coordenadas.lat},${osint.coordenadas.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-action-primary transition-colors"
                >
                  Ver en Google Maps <ExternalLink size={9} />
                </a>
              </div>
            )}

            {/* Comparison summary */}
            <div className="mt-4 space-y-2">
              {[
                { label: "Empresa registrada", value: "Cra. 15 # 88-64 Of. 301", icon: Building2, ok: false },
                { label: "Actividad visible", value: "Sin actividad comercial (OSINT)", icon: Eye, ok: false },
                { label: "Coincidencia física", value: "NO VERIFICADA", icon: AlertTriangle, ok: false },
                { label: "Riesgo SARLAFT", value: "CRÍTICO — Empresa Fachada", icon: ShieldAlert, ok: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 border ${
                      item.ok
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {item.ok ? (
                      <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Icon size={12} className="text-risk-critical shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 w-36">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        item.ok ? "text-emerald-600" : "text-risk-critical"
                      }`}
                    >
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-surface-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              "Google Maps Satellite",
              "Catastro IGAC 2025",
              "Cámara de Comercio Bogotá",
              "OpenStreetMap",
            ].map((src) => (
              <span
                key={src}
                className="text-[9px] font-mono text-slate-400 bg-surface-2 border border-surface-3 rounded px-2 py-0.5"
              >
                {src}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={10} className="text-slate-400" />
            <span className="text-[9px] font-mono text-slate-400">
              Consulta: {ddq.fecha_consulta}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
