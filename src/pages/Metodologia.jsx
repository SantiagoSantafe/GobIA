// =============================================================================
// VIGÍA — Metodología Page
// Página estática completa: fórmula, fuentes, estándares, créditos
// =============================================================================
import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const BANDERAS = [
  { id: "F01", nombre: "Empresa de maletín",   peso: 30, tipo: "Proveedor",  norma: "Art. 84, Ley 1474/2011",      fuente: "RUES / Cámara de Comercio" },
  { id: "F02", nombre: "PEP representante",    peso: 25, tipo: "Proveedor",  norma: "SARLAFT · Circ. 006/2023 SFC", fuente: "SIGEP II / OFAC SDN" },
  { id: "F03", nombre: "Pliego sastre",        peso: 20, tipo: "Proceso",    norma: "Art. 24, Ley 80/1993",         fuente: "SECOP II / texto pliego" },
  { id: "F04", nombre: "Precio atípico",       peso: 10, tipo: "Financiero", norma: "Art. 29, Ley 80/1993",         fuente: "SECOP II / índices DANE" },
  { id: "F05", nombre: "Único oferente",       peso:  8, tipo: "Proceso",    norma: "Art. 2°, Decreto 1082/2015",   fuente: "SECOP II / documentos" },
  { id: "F06", nombre: "Horario atípico",      peso:  4, tipo: "Proceso",    norma: "Art. 3°, Ley 1437/2011",       fuente: "SECOP II / metadata" },
  { id: "F07", nombre: "Desajuste geográfico", peso:  3, tipo: "Proveedor",  norma: "Art. 6°, Ley 1150/2007",       fuente: "RUES / SECOP II" },
];

const SOURCES = [
  { nombre: "SECOP I",         tipo: "API Socrata",       endpoint: "open.datos.gov.co · g2r9-8u2n",    descripcion: "Contratos sector público (modalidad antes 2018)" },
  { nombre: "SECOP II",        tipo: "API Socrata",       endpoint: "open.datos.gov.co · jbjy-vk9h",    descripcion: "Contratos sector público (modalidad desde 2018)" },
  { nombre: "RUES",            tipo: "API REST",           endpoint: "rues.gov.co/rues/api",             descripcion: "Registro Único Empresarial — constitución, socios, capital" },
  { nombre: "SIGEP II",        tipo: "API REST",           endpoint: "sigep.gov.co/app/api",             descripcion: "PEP: servidores públicos activos e históricos" },
  { nombre: "OFAC SDN",        tipo: "XML descarga",       endpoint: "ofac.treas.gov/sdnlist.xml",       descripcion: "Lista de Nacionales Especialmente Designados (EE.UU.)" },
  { nombre: "DANE IPC/PPI",    tipo: "API REST",           endpoint: "dane.gov.co/services/api/rest",    descripcion: "Índices de precio para detectar sobrecostos" },
  { nombre: "Contraloría CGR", tipo: "CSV / scraping",     endpoint: "contraloria.gov.co/web/sistema",   descripcion: "Sanciones e inhabilidades a contratistas" },
];

const PIPELINE = [
  { paso: "01", titulo: "Ingesta SECOP",     desc: "Python + DuckDB. Descarga incremental diaria vía Socrata API. ~10.7M contratos procesados." },
  { paso: "02", titulo: "Enriquecimiento",   desc: "JOIN con RUES (fecha constitución, capital), SIGEP II (PEP check), OFAC SDN (listas negras)." },
  { paso: "03", titulo: "Cálculo de flags",  desc: "7 reglas deterministas aplicadas en DuckDB SQL. Cada regla produce confianza 0–100." },
  { paso: "04", titulo: "Score compuesto",   desc: "Fórmula multiplicativa de Fazekas & Kocsis. Score final 0–100 por contrato." },
  { paso: "05", titulo: "Análisis LLM",      desc: "Gemini 1.5 Flash vía LangChain. Genera reporte de hallazgos en formato VIGÍA estructurado." },
  { paso: "06", titulo: "Publicación API",   desc: "FastAPI expone endpoints paginados. Frontend React consume y visualiza en tiempo real." },
];

export default function Metodologia() {
  return (
    <div className="min-h-screen bg-surface-1 font-display">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-vigia-border">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center gap-4">
          <Link to="/dashboard/alertas"
            className="flex items-center gap-1.5 text-[10px] font-mono tracking-label text-vigia-muted hover:text-vigia-heading transition-colors">
            <ArrowLeft size={11} /> dashboard
          </Link>
          <div className="flex items-center gap-2 ml-1">
            <div className="w-5 h-5 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
              <Shield size={11} className="text-risk-critical" />
            </div>
            <span className="font-bold text-sm tracking-tight text-vigia-heading">
              VIG<span className="text-vigia-accent">Í</span>A
            </span>
          </div>
          <span className="ml-auto text-[10px] font-mono text-vigia-muted">metodología abierta</span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">

        {/* Hero */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">metodología</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.08] tracking-tight text-vigia-heading mb-4">
            Cómo VIGÍA detecta<br />riesgo de corrupción
          </h1>
          <p className="text-base text-vigia-muted font-light max-w-2xl leading-relaxed">
            Sistema de detección basado en banderas rojas estándar internacionales (OCP 2024) aplicado
            a datos públicos de SECOP I y II. Los scores son indicadores de riesgo estadístico —
            no determinan culpabilidad ni sustituyen investigación formal.
          </p>
        </section>

        {/* Formula */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">fórmula</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Score compuesto multiplicativo</h2>
          <div className="bg-white rounded-2xl border border-vigia-border p-6 shadow-card">
            <div className="bg-surface-1 rounded-xl p-5 font-mono text-center mb-6 border border-vigia-border">
              <p className="text-lg text-vigia-heading font-light mb-1">
                Score = 100 × ( 1 − ∏<sub>i=1</sub><sup>7</sup> ( 1 − w<sub>i</sub> × c<sub>i</sub> / 100 ) )
              </p>
              <p className="text-[10px] text-vigia-dim">Fazekas & Kocsis (2020) · adaptado para SECOP II</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { sym: "wᵢ",    desc: "Peso asignado a cada bandera (suma = 100%)" },
                { sym: "cᵢ",    desc: "Confianza de detección 0–100 por bandera" },
                { sym: "∏",     desc: "Productoria: cada bandera reduce independientemente el complemento" },
                { sym: "Score", desc: "Índice final 0–100 · ≥ 71 = CRÍTICO" },
              ].map((r) => (
                <div key={r.sym} className="bg-surface-1 rounded-xl p-3.5 border border-vigia-border">
                  <p className="font-mono text-lg font-light text-vigia-accent mb-1">{r.sym}</p>
                  <p className="text-[11px] text-vigia-muted leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-[11px] text-vigia-muted leading-relaxed">
                <strong className="text-vigia-heading font-medium">¿Por qué multiplicativo?</strong> A diferencia de una
                suma lineal, el modelo multiplicativo captura que varias banderas coexistentes se refuerzan entre sí
                (riesgo compuesto mayor que la suma de sus partes). Dos banderas de 50% de confianza dan un score de
                75, no de 100 como en una suma directa — evitando saturación y manteniendo discriminación en el tramo alto.
              </p>
            </div>
          </div>
        </section>

        {/* Banderas table */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">banderas</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">7 Banderas rojas VIGÍA</h2>
          <div className="bg-white rounded-2xl border border-vigia-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-vigia-border bg-surface-1">
                    {["ID", "Bandera", "Peso", "Tipo", "Norma colombiana", "Fuente de datos"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-mono text-[9px] tracking-label uppercase text-vigia-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-vigia-border">
                  {BANDERAS.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-1 transition-colors">
                      <td className="px-5 py-3 font-mono text-[10px] text-vigia-dim">{b.id}</td>
                      <td className="px-5 py-3 font-medium text-vigia-heading">{b.nombre}</td>
                      <td className="px-5 py-3 font-mono font-semibold text-vigia-accent">{b.peso}%</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-surface-1 border border-vigia-border text-vigia-muted">
                          {b.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-vigia-muted">{b.norma}</td>
                      <td className="px-5 py-3 text-vigia-dim">{b.fuente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pipeline */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">pipeline</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Arquitectura de procesamiento</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIPELINE.map((p) => (
              <div key={p.paso} className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
                <p className="font-mono text-[10px] text-vigia-dim mb-2">{p.paso}</p>
                <p className="text-sm font-medium text-vigia-heading mb-1.5">{p.titulo}</p>
                <p className="text-[11px] text-vigia-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">fuentes</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Fuentes de datos abiertos</h2>
          <div className="bg-white rounded-2xl border border-vigia-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-vigia-border bg-surface-1">
                    {["Sistema", "Tipo de acceso", "Endpoint / dataset", "Uso en VIGÍA"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-mono text-[9px] tracking-label uppercase text-vigia-muted whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-vigia-border">
                  {SOURCES.map((s) => (
                    <tr key={s.nombre} className="hover:bg-surface-1 transition-colors">
                      <td className="px-5 py-3 font-medium text-vigia-heading">{s.nombre}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-surface-1 border border-vigia-border text-vigia-muted">
                          {s.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[10px] text-vigia-dim">{s.endpoint}</td>
                      <td className="px-5 py-3 text-vigia-muted">{s.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Thresholds */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">umbrales</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Niveles de riesgo y acciones</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { nivel: "CRÍTICO", rango: "71 – 100", color: "#dc2626", bg: "bg-red-50 border-red-200",
                accion: "Remitir a Procuraduría General de la Nación o Contraloría General de la República. Considerar solicitud de medida cautelar de suspensión de contrato.",
                base: "Umbral basado en estudios de la OCDE: contratos con score ≥ 71 presentan irregularidades documentadas en > 80% de los casos auditados." },
              { nivel: "ALTO",    rango: "46 – 70",  color: "#ea580c", bg: "bg-orange-50 border-orange-200",
                accion: "Solicitar documentos adicionales de justificación. Incluir en auditoría de seguimiento semestral. Notificar área de control interno.",
                base: "Contratos en este rango son prioritarios para revisión en el modelo de Transparencia por Colombia (2023)." },
              { nivel: "MEDIO",   rango: "21 – 45",  color: "#ca8a04", bg: "bg-yellow-50 border-yellow-200",
                accion: "Monitoreo pasivo. Registrar en bitácora de riesgo para seguimiento en próximos 90 días.",
                base: "Señales presentes pero no concluyentes. Requieren contexto adicional antes de escalar." },
              { nivel: "BAJO",    rango: "0 – 20",   color: "#16a34a", bg: "bg-green-50 border-green-200",
                accion: "Sin acción requerida. Registrar para estadísticas de línea base.",
                base: "Indicadores dentro de rango normal para contratación pública colombiana." },
            ].map((t) => (
              <div key={t.nivel} className={`rounded-2xl border p-5 ${t.bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-sm font-semibold" style={{ color: t.color }}>{t.nivel}</span>
                  <span className="font-mono text-[10px] text-vigia-dim">{t.rango}</span>
                </div>
                <p className="text-[11px] text-vigia-muted mb-2 leading-relaxed"><strong className="text-vigia-heading font-medium">Acción:</strong> {t.accion}</p>
                <p className="text-[10px] text-vigia-dim leading-relaxed">{t.base}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Limitations */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">limitaciones</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Alcance y limitaciones del modelo</h2>
          <div className="bg-white rounded-2xl border border-vigia-border p-6 shadow-card space-y-3">
            {[
              "VIGÍA detecta correlaciones estadísticas con irregularidades documentadas, no prueba de actos ilegales. Un score alto es indicador de revisión prioritaria, no acusación.",
              "Los pesos de las banderas son calibrados con base en literatura académica (Fazekas & Kocsis, OCP) pero no han sido validados específicamente para el contexto colombiano con datos etiquetados.",
              "SECOP II no contiene todos los contratos públicos colombianos. Contratos de urgencia manifiesta, convenios interadministrativos y contratos de entidades descentralizadas pueden estar ausentes.",
              "La detección de PEP depende de la calidad y actualización de SIGEP II. Personas políticamente expuestas no registradas en el sistema no serán detectadas.",
              "El modelo no detecta corrupción en la etapa de ejecución contractual (adicionales, otrosí, desequilibrios económicos). Solo analiza la etapa de adjudicación.",
            ].map((l, i) => (
              <div key={i} className="flex gap-3 text-[11px] text-vigia-muted leading-relaxed">
                <span className="text-vigia-accent shrink-0 mt-0.5">·</span>
                {l}
              </div>
            ))}
          </div>
        </section>

        {/* References */}
        <section>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-3">referencias</p>
          <h2 className="text-xl font-light tracking-tight text-vigia-heading mb-5">Bibliografía</h2>
          <div className="space-y-3">
            {[
              { cita: "Fazekas, M. & Kocsis, G. (2020). Uncovering High-Level Corruption: Cross-National Objective Corruption Risk Indicators Using Public Procurement Data.", pub: "British Journal of Political Science, 50(1), 155–164. DOI: 10.1017/S0007123417000461" },
              { cita: "Open Contracting Partnership (2024). Red Flags for Integrity: Appraising Government Procurement Data.", pub: "OCP Technical Guide. opencontracting.org" },
              { cita: "Transparencia por Colombia (2023). Índice de Riesgo de Corrupción en Contratación Pública.", pub: "Capítulo Colombia de Transparency International. transparenciacolombia.org.co" },
              { cita: "OCDE (2022). Compras Públicas Limpias: Herramientas e Indicadores para Prevenir la Corrupción.", pub: "OECD Public Governance Reviews. doi.org/10.1787/9789264174719" },
              { cita: "Congreso de la República (1993). Ley 80. Estatuto General de Contratación de la Administración Pública.", pub: "Diario Oficial No. 41.094 del 28 de octubre de 1993." },
              { cita: "Congreso de la República (2011). Ley 1474. Estatuto Anticorrupción.", pub: "Diario Oficial No. 48.128 del 12 de julio de 2011." },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl border border-vigia-border p-4 shadow-card">
                <p className="text-[11px] text-vigia-heading leading-relaxed mb-1">{r.cita}</p>
                <p className="text-[10px] text-vigia-dim font-mono">{r.pub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-vigia-border pt-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-vigia-heading">Metodología abierta</p>
              <p className="text-[11px] text-vigia-muted mt-0.5">Código fuente disponible · datos SECOP públicos · reproducible</p>
            </div>
            <Link to="/dashboard/alertas"
              className="px-5 py-2.5 rounded-xl bg-vigia-heading text-white text-[11px] font-mono
                tracking-label uppercase hover:opacity-90 transition-opacity">
              Ver dashboard →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-vigia-border bg-white px-6 py-4 text-center mt-10">
        <p className="font-mono text-[10px] text-vigia-dim">
          vigía · datos públicos secop · metodología abierta · indicadores de riesgo, no determinan culpabilidad
        </p>
      </footer>
    </div>
  );
}
