// =============================================================================
// VIGÍA — Landing Page
// Modo claro elegante. Inspirado en demoanalitica.com:
// Apple-like #f5f5f7 base, Inter/Space Grotesk, tracking ancho en labels,
// secciones alternadas, cards blancos con sombra sutil, tono institucional.
// =============================================================================
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowRight, ExternalLink, ChevronRight } from "lucide-react";
import { HeroParticleField } from "../components/HeroParticleField.jsx";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", decimals = 0, duration = 1600 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const inc = target / steps;
          let cur = 0;
          const iv = setInterval(() => {
            cur += inc;
            if (cur >= target) { setValue(target); clearInterval(iv); }
            else setValue(parseFloat(cur.toFixed(decimals)));
          }, duration / steps);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  const display = decimals > 0
    ? value.toFixed(decimals)
    : value.toLocaleString("es-CO");

  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const BANDERAS = [
  {
    id: "01", nombre: "Empresa de maletín", peso: 30, nivel: "CRÍTICO",
    color: "#dc2626",
    desc: "Empresa constituida días antes del contrato. Capital mínimo legal, sin historial en SECOP.",
    norma: "Art. 84, Ley 1474/2011",
    fuente: "RUES / qmzu-gj57",
  },
  {
    id: "02", nombre: "Representante legal PEP", peso: 30, nivel: "CRÍTICO",
    color: "#dc2626",
    desc: "Representante en lista de Personas Expuestas Políticamente o listas restrictivas OFAC.",
    norma: "SARLAFT — Circular Básica Jurídica SFC",
    fuente: "SIGEP II / OFAC SDN",
  },
  {
    id: "03", nombre: "Pliego sastre (NLP)", peso: 25, nivel: "CRÍTICO",
    color: "#dc2626",
    desc: "Cláusulas técnicas que restringen la competencia al perfil exacto del adjudicado. Detectado por NLP.",
    norma: "Ley 80/1993 Art. 24",
    fuente: "SECOP II / modelo VIGÍA",
  },
  {
    id: "04", nombre: "Precio atípico", peso: 20, nivel: "CRÍTICO",
    color: "#ea580c",
    desc: "Valor unitario por encima del P95 del mercado para el mismo código UNSPSC y región.",
    norma: "Ley 80/1993 Art. 23",
    fuente: "SECOP I — UNSPSC",
  },
  {
    id: "05", nombre: "Único oferente", peso: 20, nivel: "ALTO",
    color: "#ea580c",
    desc: "Un solo proponente en proceso publicado. Compatible con pliego dirigido.",
    norma: "Ley 80/1993 Art. 2 · Decreto 1082/2015",
    fuente: "SECOP I",
  },
  {
    id: "06", nombre: "Adjudicación horario atípico", peso: 10, nivel: "ALTO",
    color: "#ca8a04",
    desc: "Firma en día no laboral o fuera de horario institucional. Patrón documentado en escándalos PAE.",
    norma: "Ley 1474/2011 — Estatuto Anticorrupción",
    fuente: "SECOP I — metadatos",
  },
  {
    id: "07", nombre: "Desajuste geográfico", peso: 10, nivel: "MEDIO",
    color: "#ca8a04",
    desc: "Contratista en ciudad distante del lugar de ejecución, sin sede declarada.",
    norma: "Decreto 1082/2015",
    fuente: "RUES / SECOP I",
  },
];

const FUENTES = [
  { nombre: "SECOP I",     desc: "10.7M+ contratos" },
  { nombre: "SECOP II",    desc: "contratos electrónicos" },
  { nombre: "RUES",        desc: "constitución empresas" },
  { nombre: "SIGEP II",    desc: "personas expuestas" },
  { nombre: "SIRI",        desc: "inhabilitados" },
  { nombre: "OFAC SDN",    desc: "listas restrictivas" },
  { nombre: "UNODC SIMCI", desc: "territorio y conflicto" },
  { nombre: "OCP Cardinal",desc: "estándares OCDS" },
];

const CAPACIDADES = [
  { n: "01", t: "Ingesta SECOP", d: "Descarga incremental vía Socrata API. DuckDB para análisis columnar en local. Sin copiar datos personales." },
  { n: "02", t: "Detección NLP", d: "LangChain multi-agente + Gemini 1.5 Flash. Similitud coseno entre pliego y perfil del contratista adjudicado." },
  { n: "03", t: "Análisis de red", d: "Grafo de relaciones RUES: dirección compartida, representantes comunes, historial de multas SECOP." },
  { n: "04", t: "Score probabilístico", d: "Fórmula OCP: 100 × (1 − ∏(1 − wᵢ × cᵢ/100)). Cada bandera tiene peso, norma y trazabilidad de fuente." },
];

const TIMELINE = [
  { periodo: "ahora", items: ["MVP análisis PAE + UNGRD", "7 banderas calibradas", "Grafo 3D de red", "Reporte hallazgos exportable"] },
  { periodo: "próximo", items: ["API pública tiempo real", "Alertas push por entidad", "RUES automatizado", "Dashboard multi-contrato"] },
  { periodo: "2026–2027", items: ["Escala nacional", "Integración Contraloría", "NLP fine-tuned Colombia", "API ciudadana abierta"] },
  { periodo: "2027+", items: ["Red LATAM: MX, PE, BR", "Estándar OCDS regional", "20 años memoria institucional", "Federación por país"] },
];

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <hr className="border-0 border-t border-vigia-border" />;
}

// ── Section label ─────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-5">
      {children}
    </p>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="bg-surface-1 text-vigia-heading font-display min-h-screen">

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
              <Shield size={13} className="text-risk-critical" />
            </div>
            <span className="font-bold text-sm tracking-tight text-vigia-heading">
              VIG<span className="text-vigia-accent">Í</span>A
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-10">
            {[
              ["metodología", "#metodologia"],
              ["caso ungrd",  "#caso-ungrd"],
              ["datos",       "#datos"],
              ["visión",      "#vision"],
            ].map(([l, h]) => (
              <a key={l} href={h}
                className="text-[10px] font-mono tracking-label uppercase text-vigia-muted hover:text-vigia-heading transition-colors duration-200">
                {l}
              </a>
            ))}
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-[11px] font-mono text-vigia-heading hover:text-vigia-accent transition-colors duration-200"
          >
            dashboard <ChevronRight size={11} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-vigia-border">
        <HeroParticleField className="opacity-90" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(232,96,28,0.11),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(96,165,250,0.16),transparent_34%),radial-gradient(circle_at_72%_62%,rgba(96,165,250,0.08),transparent_26%),radial-gradient(circle_at_32%_70%,rgba(232,96,28,0.07),transparent_24%),radial-gradient(circle_at_56%_52%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.3)_40%,rgba(255,255,255,0.8)_100%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 min-h-[72vh] flex items-center">
          <div className="max-w-3xl">
            <Label>Colombia 5.0 Hackathon · Reto GobIA Auditor</Label>
            <h1 className="text-[clamp(2.6rem,6vw,4.5rem)] font-light leading-[1.06] tracking-tight text-vigia-heading mb-7 max-w-3xl">
              memoria institucional<br />
              para la contratación<br />
              <span className="font-semibold text-vigia-accent">pública colombiana.</span>
            </h1>
            <p className="text-vigia-muted text-lg leading-relaxed max-w-lg mb-10 font-light">
              detección automática de opacidad con datos 100% públicos.<br />
              agente de ia. señales probabilísticas. nunca acusaciones.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-vigia-heading text-white text-sm font-medium hover:bg-vigia-body transition-colors duration-200"
              >
                abrir dashboard <ArrowRight size={14} />
              </Link>
              <a href="#metodologia"
                className="flex items-center gap-1.5 text-sm text-vigia-muted hover:text-vigia-heading transition-colors duration-200 font-light">
                metodología <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTADORES ───────────────────────────────────────────────────────── */}
      <section className="bg-surface-1 border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 sm:grid-cols-4 gap-10">
          {[
            { v: 10.7, suf: "M+", dec: 1, label: "contratos analizados" },
            { v: 7,    suf: "",   dec: 0, label: "banderas rojas calibradas" },
            { v: 8,    suf: "",   dec: 0, label: "fuentes de datos integradas" },
            { v: 34,   suf: "",   dec: 0, label: "score promedio Colombia" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[2.5rem] font-light leading-none tracking-tight text-vigia-heading mb-1 tabular-nums">
                <AnimatedCounter target={s.v} suffix={s.suf} decimals={s.dec} />
              </p>
              <p className="text-[10px] font-mono uppercase tracking-label text-vigia-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMA ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Label>el problema</Label>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-light tracking-tight text-vigia-heading mb-5 max-w-2xl leading-snug">
            Colombia pierde $18 billones anuales por corrupción<br />
            en contratación pública.
          </h2>
          <p className="text-vigia-muted text-base leading-relaxed max-w-xl mb-14 font-light">
            los contratos están en secop. la señal existe.<br />
            falta quien la procese.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                t: "Opacidad SECOP",
                d: "10.7 millones de contratos publicados. Ninguna veeduría tiene capacidad de leer esa escala manualmente. Un modelo sí.",
              },
              {
                t: "Veedurías sin datos",
                d: "Voluntad ciudadana sin infraestructura analítica. Horas de trabajo manual para detectar lo que un agente hace en segundos.",
              },
              {
                t: "Reacción tardía",
                d: "Cuando la Contraloría actúa, los recursos ya se diluyeron. VIGÍA detecta en el momento de la adjudicación — no después.",
              },
            ].map((c) => (
              <div key={c.t}>
                <p className="text-xs font-mono uppercase tracking-label text-vigia-muted mb-3">{c.t}</p>
                <p className="text-sm text-vigia-body leading-relaxed font-light">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────────── */}
      <section id="metodologia" className="bg-surface-1 border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Label>cómo funciona</Label>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-light tracking-tight text-vigia-heading mb-14">
            cuatro capas de análisis.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CAPACIDADES.map((s) => (
              <div key={s.n}
                className="bg-white border border-vigia-border rounded-2xl p-6 hover:border-vigia-strong hover:shadow-card transition-all duration-200">
                <span className="text-[10px] font-mono tracking-label uppercase text-vigia-muted mb-4 block">{s.n}</span>
                <p className="text-sm font-semibold text-vigia-heading mb-2 leading-snug">{s.t}</p>
                <p className="text-xs text-vigia-muted leading-relaxed font-light">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 BANDERAS ───────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Label>detección · 7 banderas rojas</Label>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-light tracking-tight text-vigia-heading mb-3">
            señales con peso, norma y fuente trazable.
          </h2>
          <p className="text-vigia-muted text-sm leading-relaxed max-w-lg mb-12 font-light">
            Metodología: Fazekas &amp; Kocsis (2020) + OCP Red Flags (2024).
            Score = 100 × (1 − ∏(1 − wᵢ × cᵢ/100))
          </p>

          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_7rem_7rem_auto] gap-x-6 px-4 mb-2">
            {["#", "bandera", "norma", "fuente", "peso"].map((h) => (
              <span key={h} className="text-[9px] font-mono uppercase tracking-ultra text-vigia-dim hidden sm:block first:block last:block">
                {h}
              </span>
            ))}
          </div>
          <Divider />

          <div className="divide-y divide-vigia-border">
            {BANDERAS.map((b) => (
              <div key={b.id}
                className="grid grid-cols-[2rem_1fr_auto] sm:grid-cols-[2rem_1fr_7rem_7rem_auto] gap-x-6 items-start py-4 px-4 hover:bg-surface-1 transition-colors duration-150 group">
                {/* # */}
                <span className="font-mono text-[10px] text-vigia-dim pt-0.5">{b.id}</span>
                {/* Bandera */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-vigia-heading">{b.nombre}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                      style={{ color: b.color, borderColor: `${b.color}30`, background: `${b.color}08` }}>
                      {b.nivel}
                    </span>
                  </div>
                  <p className="text-xs text-vigia-muted leading-relaxed font-light hidden sm:block">{b.desc}</p>
                </div>
                {/* Norma */}
                <span className="text-[10px] font-mono text-vigia-dim leading-relaxed hidden sm:block pt-0.5">{b.norma}</span>
                {/* Fuente */}
                <span className="text-[10px] font-mono text-vigia-dim hidden sm:block pt-0.5">{b.fuente}</span>
                {/* Peso */}
                <div className="text-right shrink-0">
                  <span className="text-2xl font-light tabular-nums" style={{ color: b.color }}>{b.peso}</span>
                  <span className="text-[9px] font-mono text-vigia-dim block">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASO UNGRD ───────────────────────────────────────────────────────── */}
      <section id="caso-ungrd" className="bg-surface-1 border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Label>caso de uso · así hubiera funcionado vigía</Label>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-light tracking-tight text-vigia-heading mb-3">
            UNGRD — contrato $46.800M COP.
          </h2>
          <p className="text-vigia-muted text-sm leading-relaxed max-w-xl mb-12 font-light">
            Agosto 2023. UNGRD adjudicó a IMPOAMERICANA ROGER S.A.S. — empresa constituida 23 días antes.
            VIGÍA lo hubiera detectado el día 1 de publicación.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "valor del contrato", value: "$46.800M COP", accent: true },
              { label: "score vigía (retrospectivo)", value: "87 / 100  CRÍTICO", accent: true },
              { label: "días empresa antes del contrato", value: "23 días", accent: true },
              { label: "banderas activas", value: "5 de 7", accent: false },
              { label: "bandera principal", value: "Empresa de maletín", accent: false },
              { label: "detección posible", value: "día 1 de publicación", accent: false },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-vigia-border rounded-xl p-5">
                <p className="text-[9px] font-mono uppercase tracking-ultra text-vigia-dim mb-1.5">{s.label}</p>
                <p className={`text-sm font-medium leading-snug ${s.accent ? "text-risk-critical" : "text-vigia-heading"}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Diferenciadores */}
          <div className="bg-white border border-vigia-border rounded-2xl p-6">
            <p className="text-[9px] font-mono uppercase tracking-ultra text-vigia-muted mb-5">
              lo que vigía supera vs. anticorrupcion.co
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "cards planas  →  VIGÍA expande con grafo 3D de red corporativa",
                "sin documentos  →  VIGÍA genera reporte de hallazgos descargable",
                "sin cruce RUES  →  VIGÍA muestra «empresa constituida N días antes»",
                "22 banderas genéricas  →  7 con peso, norma específica y evidencia textual",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-vigia-accent mt-0.5 shrink-0 text-sm leading-none">→</span>
                  <p className="text-xs text-vigia-body leading-relaxed font-light">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FUENTES DE DATOS ─────────────────────────────────────────────────── */}
      <section id="datos" className="bg-white border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <Label>fuentes de datos integradas</Label>
          <div className="flex flex-wrap gap-2 mb-5">
            {FUENTES.map((f) => (
              <div key={f.nombre}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-vigia-border bg-surface-1 hover:bg-white hover:border-vigia-strong transition-colors duration-150">
                <span className="text-xs font-semibold text-vigia-heading">{f.nombre}</span>
                <span className="text-[10px] font-mono text-vigia-dim">{f.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono tracking-label text-vigia-dim">
            todos los datos son públicos · ningún dato personal · metodología abierta
          </p>
        </div>
      </section>

      {/* ── VISIÓN LATAM ─────────────────────────────────────────────────────── */}
      <section id="vision" className="bg-surface-1 border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Label>visión</Label>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-light tracking-tight text-vigia-heading mb-14">
            infraestructura anticorrupción para América Latina.
          </h2>
          <div className="grid sm:grid-cols-4 gap-8">
            {TIMELINE.map((t) => (
              <div key={t.periodo}>
                <p className="text-[10px] font-mono uppercase tracking-label text-vigia-accent mb-4">{t.periodo}</p>
                <ul className="space-y-2.5">
                  {t.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-vigia-dim shrink-0 mt-1 text-[10px]">·</span>
                      <span className="text-xs text-vigia-muted leading-relaxed font-light">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-28">
          <Label>construyamos</Label>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] font-light tracking-tight text-vigia-heading mb-5 max-w-2xl leading-snug">
            infraestructura de transparencia<br />
            para la contratación pública.
          </h2>
          <p className="text-vigia-muted text-base leading-relaxed max-w-md mb-10 font-light">
            open-source. datos públicos. metodología abierta.<br />
            el jurado es Colombia.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-vigia-heading text-white text-sm font-medium hover:bg-vigia-body transition-colors duration-200"
          >
            ver el dashboard analítico <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-surface-1 border-b border-vigia-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-risk-critical" />
            <span className="text-[10px] font-mono text-vigia-dim">
              vigía · sistema de ia para veeduría ciudadana · colombia 2026
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.anticorrupcion.co/metodologia" target="_blank" rel="noreferrer"
              className="text-[10px] font-mono text-vigia-dim hover:text-vigia-muted transition-colors">
              metodología
            </a>
            <a href="https://datos.gov.co" target="_blank" rel="noreferrer"
              className="text-[10px] font-mono text-vigia-dim hover:text-vigia-muted transition-colors">
              datos.gov.co
            </a>
            <span className="text-[10px] font-mono text-vigia-dim">
              © 2026 · hackathon colombia 5.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
