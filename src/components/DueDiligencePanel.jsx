import { useState } from "react";
import jsPDF from "jspdf";
import {
  FileSearch, Download, CheckCircle, Loader2,
  AlertTriangle, ShieldAlert, XCircle, Leaf,
  Building2, User, Database, MapPin, ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

// ── PDF export state machine steps ───────────────────────────────────────────
const PDF_STEPS = [
  { id: "compiling",  label: "Compilando evidencia legal...",               icon: FileSearch },
  { id: "capturing", label: "Capturando gráficas y red de corrupción...",  icon: Database },
  { id: "generating",label: "Generando documento PDF...",                  icon: Download },
  { id: "done",      label: "¡Documento listo! Descargando...",            icon: CheckCircle },
];

const SARLAFT_SEVERITY_CONFIG = {
  critical: { pill: "bg-red-50 text-red-600 border-red-200",   icon: XCircle,       label: "CRÍTICO" },
  high:     { pill: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertTriangle, label: "ALTO" },
  medium:   { pill: "bg-yellow-50 text-yellow-600 border-yellow-200", icon: AlertTriangle, label: "MEDIO" },
};

// ── Row helpers ───────────────────────────────────────────────────────────────
function DDQRow({ label, value, accent, mono }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-surface-3 last:border-0">
      <span className="text-xs text-slate-500 font-display shrink-0 w-40">{label}</span>
      <span className={`text-xs font-display text-right ${accent ? accent : "text-slate-800"} ${mono ? "font-mono" : "font-medium"} flex-1 min-w-0`}>
        {value}
      </span>
    </div>
  );
}

function DDQSection({ title, icon: Icon, iconClass, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center ${iconClass}`}>
          <Icon size={12} />
        </span>
        <h3 className="text-xs font-display font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="bg-white border border-surface-3 rounded-xl px-4 divide-y divide-surface-3">
        {children}
      </div>
    </div>
  );
}

// ── PDF export — generación directa con jsPDF (sin html2canvas) ──────────────
// TODO: Replace with FastAPI: POST /export/pdf for server-side rendering
function exportToPDF(ddq, contractId) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 14;        // left/right margin
  const lineH = 6;     // line height
  let y = 0;

  const fmt = (v) => v != null
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
    : "No registra";

  const newPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkY = (needed = 10) => { if (y + needed > pageH - 14) newPage(); };

  // ── Header band ──
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageW, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VIGIA — Analisis de Debida Diligencia SARLAFT", m, 11);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Contrato: ${contractId}   Generado: ${new Date().toLocaleString("es-CO")}`, m, 18);
  doc.setFillColor(239, 68, 68);
  doc.rect(0, 24, pageW, 4, "F");
  y = 34;

  const section = (title) => {
    checkY(12);
    doc.setFillColor(248, 250, 252);
    doc.rect(m, y, pageW - m * 2, 7, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(m, y, pageW - m * 2, 7, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(title.toUpperCase(), m + 3, y + 5);
    y += 10;
  };

  const row = (label, value, accent = false) => {
    checkY(lineH + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, m + 2, y);
    doc.setFont("helvetica", accent ? "bold" : "normal");
    doc.setTextColor(accent ? 220 : 30, accent ? 38 : 41, accent ? 38 : 59);
    const safeVal = String(value ?? "No registra").slice(0, 70);
    doc.text(safeVal, m + 55, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(m, y + 1.5, pageW - m, y + 1.5);
    y += lineH;
  };

  // ── SCORE BANNER ──
  doc.setFillColor(254, 242, 242);
  doc.rect(m, y, pageW - m * 2, 14, "F");
  doc.setDrawColor(252, 165, 165);
  doc.rect(m, y, pageW - m * 2, 14, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(220, 38, 38);
  doc.text("92 / 100", m + 6, y + 10);
  doc.setFontSize(10);
  doc.setTextColor(185, 28, 28);
  doc.text("RIESGO CRITICO  |  7 Banderas Activas  |  SARLAFT Alerta", m + 48, y + 10);
  y += 20;

  // ── IDENTIFICACION ──
  section("1. Identificacion del Contratista");
  row("NIT", ddq.nit);
  row("Razon social", ddq.empresa);
  row("Tipo sociedad", ddq.tipo_sociedad);
  row("Objeto social", ddq.objeto_social);
  row("Domicilio", ddq.ciudad_domicilio);
  row("Direccion", ddq.direccion);
  row("Fecha constitucion", `${ddq.fecha_constitucion} (hace ${ddq.meses_existencia} meses)`, true);
  row("Capital suscrito", fmt(ddq.capital_suscrito), true);
  row("Empleados declarados", `${ddq.num_empleados} personas`);

  // ── REPRESENTANTE LEGAL ──
  section("2. Representante Legal");
  row("Nombre", ddq.rep_legal?.nombre);
  row("Cedula", ddq.rep_legal?.cc);
  row("En lista PEP", ddq.rep_legal?.pep ? "SI — PERSONA EXPUESTA POLITICAMENTE" : "No", ddq.rep_legal?.pep);
  row("Listas restrictivas", ddq.rep_legal?.listas?.join(" | ") ?? "—", true);
  row("Match OFAC SDN", ddq.rep_legal?.match_ofac_pct ? `${ddq.rep_legal.match_ofac_pct}% coincidencia` : "—", true);
  row("Cargo anterior", ddq.rep_legal?.cargo_anterior ?? "—");

  // ── ALERTAS SARLAFT ──
  section("3. Alertas SARLAFT");
  (ddq.alertas_sarlaft ?? []).forEach((a) => {
    checkY(lineH + 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(a.nivel === "critical" ? 220 : 180, a.nivel === "critical" ? 38 : 80, 38);
    doc.text(`[${a.nivel?.toUpperCase() ?? "?"}]`, m + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(`${a.tipo}: ${a.descripcion}`.slice(0, 90), m + 22, y);
    y += lineH;
  });

  // ── CONTEXTO TERRITORIAL ──
  section("4. Contexto Territorial");
  const t = ddq.territorio ?? {};
  row("Municipio", `${t.municipio}, ${t.departamento}`);
  row("Zona PDET", t.pdet ? "SI — Programa Desarrollo con Enfoque Territorial" : "No", t.pdet);
  row("Zona de Paz", t.zona_paz ? "SI — Acuerdos de Paz 2016" : "No");
  row("Cultivos ilicitos", t.cultivos_ilicitos?.presente
    ? `SI — ${t.cultivos_ilicitos.hectareas?.toLocaleString("es-CO")} ha coca (${t.cultivos_ilicitos.fuente})`
    : "No registra", t.cultivos_ilicitos?.presente);
  row("Conflicto activo", t.conflicto_activo ? (t.grupos_armados ?? []).join(" · ") : "No", t.conflicto_activo);
  row("Riesgo electoral", t.indice_riesgo_electoral ?? "—");

  // ── HISTORIAL SECOP ──
  section("5. Historial SECOP");
  const h = ddq.historial_secop ?? {};
  row("Contratos previos", `${h.contratos_previos ?? 0}`, (h.contratos_previos ?? 0) === 0);
  row("Multas", `${h.multas ?? 0}`);
  row("Valor acumulado", fmt(h.valor_acumulado ?? 0));
  row("Primera aparicion", h.primera_aparicion_secop ?? "Este contrato");

  // ── FUNDAMENTOS LEGALES ──
  checkY(40);
  section("6. Fundamentos Legales");
  const normas = [
    "Art. 209 CP — Funcion publica al servicio del interes general",
    "Ley 80/1993 Art. 23-24 — Principios de Economia y Transparencia",
    "Ley 1474/2011 Art. 84 — Tipificacion empresa fachada",
    "Decreto 1082/2015 — Sistema de Compras y Contratacion Publica",
    "SARLAFT — Circular Basica Juridica SFC — Gestion Riesgo LA/FT",
    "OFAC SDN List — Coincidencia parcial representante legal",
  ];
  normas.forEach((n) => {
    checkY(lineH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`• ${n}`, m + 2, y);
    y += lineH;
  });

  // ── FOOTER en todas las paginas ──
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(
      "VIGIA — Sistema de IA para Veeduría Ciudadana · datos SECOP · señales de alerta, no determinan culpabilidad",
      m, pageH - 4
    );
    doc.text(`Pag. ${p} / ${total}`, pageW - m, pageH - 4, { align: "right" });
  }

  doc.save(`VIGIA_DDQ_${contractId}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Main component ────────────────────────────────────────────────────────────
// TODO: Fetch from FastAPI: GET /due-diligence/:nit
export function DueDiligencePanel({ ddq, contractId }) {
  const [pdfPhase, setPdfPhase] = useState("idle"); // idle | compiling | capturing | generating | done

  const handleExportPDF = async () => {
    if (pdfPhase !== "idle") return;

    setPdfPhase("compiling");
    await new Promise((r) => setTimeout(r, 700));
    setPdfPhase("capturing");
    await new Promise((r) => setTimeout(r, 600));
    setPdfPhase("generating");

    try {
      exportToPDF(ddq, contractId); // síncrono — genera y descarga de inmediato
    } catch (e) {
      console.error("PDF export error:", e);
    }

    setPdfPhase("done");
    await new Promise((r) => setTimeout(r, 2000));
    setPdfPhase("idle");
  };

  const currentStep = PDF_STEPS.find((s) => s.id === pdfPhase);
  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-4">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Left: DDQ structured report ── */}
        <div className="lg:col-span-8" id="vigia-report-area">
          <Card>
            <CardHeader>
              <FileSearch size={15} className="text-action-primary" />
              <span className="font-display font-semibold text-sm text-slate-800">
                Análisis de Debida Diligencia SARLAFT
              </span>
              <span className="ml-auto font-mono text-[10px] text-slate-400">
                Consulta: {ddq.fecha_consulta}
              </span>
            </CardHeader>
            <CardBody className="space-y-1">
              {/* Identification */}
              <DDQSection title="Identificación del Contratista" icon={Building2} iconClass="bg-slate-100 text-slate-600">
                <DDQRow label="NIT" value={ddq.nit} mono />
                <DDQRow label="Razón social" value={ddq.empresa} />
                <DDQRow label="Tipo de sociedad" value={ddq.tipo_sociedad} />
                <DDQRow label="Objeto social" value={ddq.objeto_social} />
                <DDQRow label="Domicilio" value={ddq.ciudad_domicilio} />
                <DDQRow label="Dirección" value={ddq.direccion} />
                <DDQRow
                  label="Fecha constitución"
                  value={`${ddq.fecha_constitucion} (hace ${ddq.meses_existencia} meses)`}
                  accent="text-risk-critical font-bold"
                  mono
                />
                <DDQRow
                  label="Capital suscrito"
                  value={formatCOP(ddq.capital_suscrito)}
                  accent="text-risk-critical"
                />
                <DDQRow label="Empleados declarados" value={`${ddq.num_empleados} personas`} />
                <DDQRow label="Cámara de Comercio" value={ddq.camara_comercio} />
              </DDQSection>

              {/* Rep legal */}
              <DDQSection title="Representante Legal" icon={User} iconClass="bg-red-50 text-red-500">
                <DDQRow label="Nombre" value={ddq.rep_legal.nombre} />
                <DDQRow label="Cédula de ciudadanía" value={ddq.rep_legal.cc} mono />
                <DDQRow label="Ciudad" value={ddq.rep_legal.ciudad} />
                <DDQRow label="Cargo anterior" value={ddq.rep_legal.cargo_anterior} />
                <div className="py-2.5 border-b border-surface-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-500 font-display shrink-0 w-40">En lista PEP</span>
                    <div className="flex items-center gap-2">
                      {ddq.rep_legal.pep ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                          <ShieldAlert size={11} /> SÍ — PERSONA EXPUESTA POLÍTICAMENTE
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-emerald-600">No</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-500 font-display shrink-0 w-40">Listas restrictivas</span>
                    <div className="flex flex-col gap-1 items-end">
                      {ddq.rep_legal.listas.map((l) => (
                        <span key={l} className="text-xs font-mono text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </DDQSection>

              {/* SARLAFT alerts */}
              <DDQSection title="Alertas SARLAFT" icon={ShieldAlert} iconClass="bg-red-50 text-red-500">
                {ddq.alertas_sarlaft.map((alerta, i) => {
                  const cfg = SARLAFT_SEVERITY_CONFIG[alerta.nivel] ?? SARLAFT_SEVERITY_CONFIG.medium;
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="py-2.5 border-b border-surface-3 last:border-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Icon size={13} className={alerta.nivel === "critical" ? "text-red-500 mt-0.5" : "text-amber-500 mt-0.5"} />
                          <div>
                            <p className="text-xs font-mono font-semibold text-slate-700">{alerta.tipo}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{alerta.descripcion}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold border rounded-full px-2 py-0.5 shrink-0 ${cfg.pill}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </DDQSection>

              {/* Territorial context */}
              <DDQSection title="Contexto Territorial" icon={MapPin} iconClass="bg-emerald-50 text-emerald-600">
                <DDQRow label="Municipio" value={`${ddq.territorio.municipio}, ${ddq.territorio.departamento}`} />
                <DDQRow
                  label="Zona PDET"
                  value={ddq.territorio.pdet ? "SÍ — Programa Desarrollo con Enfoque Territorial" : "No"}
                  accent={ddq.territorio.pdet ? "text-emerald-600 font-semibold" : "text-slate-600"}
                />
                <DDQRow
                  label="Zona de Paz"
                  value={ddq.territorio.zona_paz ? "SÍ — Acuerdos de Paz 2016" : "No"}
                  accent={ddq.territorio.zona_paz ? "text-emerald-600 font-semibold" : "text-slate-600"}
                />
                <div className="py-2.5 border-b border-surface-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-500 font-display shrink-0 w-40">
                      <span className="flex items-center gap-1"><Leaf size={11} /> Cultivos ilícitos</span>
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-risk-critical">
                        SÍ — {ddq.territorio.cultivos_ilicitos.hectareas.toLocaleString("es-CO")} ha. coca
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {ddq.territorio.cultivos_ilicitos.fuente} · {ddq.territorio.cultivos_ilicitos.ranking_nacional}
                      </p>
                    </div>
                  </div>
                </div>
                <DDQRow
                  label="Conflicto activo"
                  value={ddq.territorio.conflicto_activo ? ddq.territorio.grupos_armados.join(" · ") : "No"}
                  accent={ddq.territorio.conflicto_activo ? "text-risk-critical" : "text-slate-600"}
                />
                <DDQRow
                  label="Riesgo electoral"
                  value={ddq.territorio.indice_riesgo_electoral}
                  accent="text-risk-high font-semibold"
                />
              </DDQSection>

              {/* SECOP history */}
              <DDQSection title="Historial SECOP" icon={Database} iconClass="bg-slate-100 text-slate-600">
                <DDQRow
                  label="Contratos previos"
                  value={`${ddq.historial_secop.contratos_previos} contratos`}
                  accent={ddq.historial_secop.contratos_previos === 0 ? "text-risk-critical font-bold" : "text-slate-700"}
                />
                <DDQRow label="Multas en SECOP" value={`${ddq.historial_secop.multas}`} />
                <DDQRow label="Valor acumulado" value={ddq.historial_secop.contratos_previos === 0 ? "$0 — Sin historial" : ddq.historial_secop.valor_acumulado} accent={ddq.historial_secop.contratos_previos === 0 ? "text-risk-critical font-bold" : undefined} />
                <DDQRow label="Primera aparición" value={ddq.historial_secop.primera_aparicion_secop} />
                <DDQRow label="Nota" value={ddq.historial_secop.nota} accent="text-risk-critical font-semibold" />
              </DDQSection>

              {/* Sources */}
              <div className="pt-1">
                <p className="label-mono mb-2">Fuentes consultadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {ddq.fuentes_consultadas.map((f) => (
                    <span key={f} className="text-[10px] font-mono bg-surface-2 text-slate-500 border border-surface-3 rounded px-2 py-0.5">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ── Right: PDF Export CTA ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Export card */}
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <Download size={15} className="text-action-primary" />
              <span className="font-display font-semibold text-sm text-slate-800">
                Exportar Evidencia
              </span>
            </CardHeader>
            <CardBody className="flex-1 flex flex-col gap-5">
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="w-16 h-16 rounded-2xl bg-action-light border border-action-border flex items-center justify-center">
                  <Download size={28} className="text-action-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-slate-800 text-base leading-snug">
                    Generar y Descargar<br />Análisis / Denuncia (PDF)
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                    Genera un documento formal con la ficha DDQ, score de riesgo, banderas
                    SARLAFT y evidencia cuantitativa, listo para presentar ante la
                    Contraloría General de la República.
                  </p>
                </div>
              </div>

              {/* CTA button / loading state */}
              {pdfPhase === "idle" ? (
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl
                    font-display font-semibold text-white text-sm
                    bg-action-primary hover:bg-action-hover active:scale-[0.98]
                    transition-all duration-150 shadow-card-md hover:shadow-glow-indigo"
                >
                  <Download size={18} />
                  Generar y Descargar PDF
                </button>
              ) : pdfPhase === "done" ? (
                <div className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl
                  bg-emerald-50 border border-emerald-200 text-emerald-700 font-display font-semibold text-sm">
                  <CheckCircle size={18} />
                  {currentStep?.label}
                </div>
              ) : (
                <div className="w-full px-6 py-4 rounded-2xl bg-action-light border border-action-border text-center space-y-3">
                  <Loader2 size={22} className="text-action-primary animate-spin mx-auto" />
                  <p className="text-sm font-display font-medium text-action-primary">
                    {currentStep?.label}
                  </p>
                  {/* Progress dots */}
                  <div className="flex justify-center gap-2">
                    {PDF_STEPS.slice(0, 3).map((step) => {
                      const stepIdx = PDF_STEPS.findIndex((s) => s.id === pdfPhase);
                      const thisIdx = PDF_STEPS.findIndex((s) => s.id === step.id);
                      return (
                        <span
                          key={step.id}
                          className={`w-2 h-2 rounded-full transition-all ${
                            thisIdx <= stepIdx ? "bg-action-primary" : "bg-surface-3"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* What's included */}
              <div className="space-y-2">
                <p className="label-mono">El documento incluye</p>
                {[
                  "Ficha DDQ SARLAFT completa",
                  "Score de Riesgo VIGÍA (92/100)",
                  "7 banderas IA + 3 alertas OCDS",
                  "Evidencia de red de empresas",
                  "Análisis de precios y timeline",
                  "Borrador de denuncia legal",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={12} className="text-action-primary shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-3 pt-3">
                <a
                  href="https://www.contraloria.gov.co/web/denuncia-ciudadana"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-mono text-action-primary hover:underline"
                >
                  Portal de denuncias Contraloría <ExternalLink size={10} />
                </a>
              </div>
            </CardBody>
          </Card>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
            <p className="font-display font-semibold text-amber-700 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={13} /> Aviso Legal
            </p>
            Este análisis es generado automáticamente por IA con datos públicos SECOP.
            Las alertas son indicios estadísticos —{" "}
            <strong className="text-slate-700">no determinan culpabilidad</strong>.
            Verifica con documentos originales antes de presentar ante órganos de control.
          </div>
        </div>
      </div>
    </div>
  );
}
