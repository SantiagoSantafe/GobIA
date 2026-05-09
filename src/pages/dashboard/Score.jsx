// =============================================================================
// VIGÍA — Score Page
// Metodología de scoring: fórmula, banderas, simulador interactivo
// =============================================================================
import { useState } from "react";

// ── Bandera definitions ───────────────────────────────────────────────────────
const BANDERAS = [
  {
    id: "empresa_maleta",
    nombre: "Empresa de maletín",
    peso_pct: 30,
    descripcion: "Empresa constituida menos de 90 días antes de la firma del contrato con capital mínimo.",
    norma: "Art. 84, Ley 1474/2011",
    fuente: "RUES / Cámara de Comercio",
    ejemplos: ["Empresa constituida 15 días antes del contrato", "Capital social < 1 SMMLV", "Sin historial de contratos previos"],
    color: "#dc2626",
  },
  {
    id: "pep_rep",
    nombre: "PEP representante",
    peso_pct: 25,
    descripcion: "Persona Expuesta Políticamente como representante legal, socio o beneficiario final de la empresa contratista.",
    norma: "SARLAFT · Circular Ext. 006/2023 SFC",
    fuente: "SIGEP II / OFAC SDN",
    ejemplos: ["Representante legal en lista OFAC", "Familiar de funcionario público como socio", "Ex-contratista sancionado por Contraloría"],
    color: "#ea580c",
  },
  {
    id: "pliego_sastre",
    nombre: "Pliego sastre",
    peso_pct: 20,
    descripcion: "Términos de referencia o pliego de condiciones redactados a la medida de un proponente específico.",
    norma: "Art. 24, Ley 80/1993",
    fuente: "SECOP II / texto pliego",
    ejemplos: ["Especificaciones técnicas únicas que solo una empresa cumple", "Experiencia requerida igual a la del futuro adjudicatario", "Requisitos habilitantes diseñados para excluir competidores"],
    color: "#ca8a04",
  },
  {
    id: "precio_atipico",
    nombre: "Precio atípico",
    peso_pct: 10,
    descripcion: "Valor del contrato significativamente por encima o por debajo del precio de mercado para el bien/servicio.",
    norma: "Art. 29, Ley 80/1993",
    fuente: "SECOP II / índices DANE",
    ejemplos: ["Precio > 2σ sobre la media de contratos similares", "Sobrecosto superior al 40% frente a referencia SICE", "Valor muy inferior al de mercado (posible dumping)"],
    color: "#2563eb",
  },
  {
    id: "unico_oferente",
    nombre: "Único oferente",
    peso_pct: 8,
    descripcion: "Proceso licitatorio o de selección que recibe una sola propuesta válida, sugiriendo posible coordinación previa.",
    norma: "Art. 2°, Decreto 1082/2015",
    fuente: "SECOP II / documentos proceso",
    ejemplos: ["Licitación con solo un proponente habilitado", "Contratación directa sin justificación de mercado", "Convocatoria con plazo inferior a 5 días hábiles"],
    color: "#7c3aed",
  },
  {
    id: "horario_atipico",
    nombre: "Horario atípico",
    peso_pct: 4,
    descripcion: "Publicación, apertura o cierre del proceso en horarios inusuales (noches, festivos, fines de semana).",
    norma: "Art. 3°, Ley 1437/2011",
    fuente: "SECOP II / metadata",
    ejemplos: ["Apertura publicada sábado a las 11:58 PM", "Cierre a las 7:30 AM de un día lunes festivo", "Publicación masiva en diciembre 31"],
    color: "#0891b2",
  },
  {
    id: "desajuste_geo",
    nombre: "Desajuste geográfico",
    peso_pct: 3,
    descripcion: "Contratista domiciliado en un municipio diferente (o muy lejano) al lugar de ejecución del contrato.",
    norma: "Art. 6°, Ley 1150/2007",
    fuente: "RUES / SECOP II",
    ejemplos: ["Empresa de Bogotá gana obra en Chocó sin presencia local", "Domicilio fiscal diferente al de ejecución en contratos de obra", "Sin registro en cámara de comercio del departamento de ejecución"],
    color: "#059669",
  },
];

// ── Score formula ─────────────────────────────────────────────────────────────
function calcScore(confianzas) {
  const prod = BANDERAS.reduce((acc, b, i) => {
    const w = b.peso_pct / 100;
    const c = (confianzas[i] ?? 0) / 100;
    return acc * (1 - w * c);
  }, 1);
  return Math.round(100 * (1 - prod));
}

function scoreColor(s) {
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
}

function scoreLabel(s) {
  return s >= 71 ? "CRÍTICO" : s >= 46 ? "ALTO" : s >= 21 ? "MEDIO" : "BAJO";
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ScoreArc({ score }) {
  const r = 72;
  const cx = 90;
  const cy = 90;
  const startAngle = Math.PI;
  const sweepAngle = Math.PI;
  const angle = startAngle + (score / 100) * sweepAngle;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(Math.PI * 2);
  const y2 = cy + r * Math.sin(Math.PI * 2);
  const pX = cx + r * Math.cos(angle);
  const pY = cy + r * Math.sin(angle);

  const trackPath = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  const fillPath = score > 0
    ? `M ${x1} ${y1} A ${r} ${r} 0 ${angle - startAngle > Math.PI ? 1 : 0} 1 ${pX} ${pY}`
    : null;

  const c = scoreColor(score);

  return (
    <svg width="180" height="100" viewBox="0 0 180 100">
      <path d={trackPath} fill="none" stroke="#e8e8ed" strokeWidth="10" strokeLinecap="round" />
      {fillPath && (
        <path d={fillPath} fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="300"
        fontFamily="JetBrains Mono, monospace" fill={c}>{score}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace"
        fill="#aeaeb2" letterSpacing="1">{scoreLabel(score)}</text>
    </svg>
  );
}

function BanderaSlider({ bandera, value, onChange }) {
  return (
    <div className="py-3 border-b border-vigia-border last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bandera.color }} />
            <p className="text-xs font-medium text-vigia-heading">{bandera.nombre}</p>
            <span className="text-[9px] font-mono text-vigia-dim bg-surface-1 px-1.5 py-0.5 rounded border border-vigia-border">
              w={bandera.peso_pct}%
            </span>
          </div>
        </div>
        <span className="font-mono text-xs font-semibold tabular-nums shrink-0"
          style={{ color: value > 0 ? bandera.color : "#aeaeb2" }}>
          {value}%
        </span>
      </div>
      <input
        type="range" min="0" max="100" step="5" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: bandera.color }}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Score() {
  const [confianzas, setConfianzas] = useState(BANDERAS.map(() => 0));
  const [expanded, setExpanded] = useState(null);
  const score = calcScore(confianzas);
  const c = scoreColor(score);
  const label = scoreLabel(score);

  function setConfianza(i, v) {
    setConfianzas((prev) => prev.map((x, j) => (j === i ? v : x)));
  }

  function reset() {
    setConfianzas(BANDERAS.map(() => 0));
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-1">metodología · score</p>
        <h1 className="text-2xl font-light tracking-tight text-vigia-heading">Score de riesgo VIGÍA</h1>
        <p className="text-sm text-vigia-muted font-light mt-1">
          fórmula basada en Fazekas & Kocsis (2020) · OCP Red Flags (2024)
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: methodology */}
        <div className="space-y-5">

          {/* Formula card */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Fórmula de scoring compuesto</p>
            <p className="label-mono mb-4">modelo multiplicativo de probabilidad de riesgo</p>

            <div className="bg-surface-1 rounded-xl border border-vigia-border p-4 font-mono text-[11px] text-vigia-heading mb-4 text-center leading-relaxed">
              <p className="text-vigia-muted text-[10px] mb-2">Score = 100 × ( 1 − ∏ ( 1 − wᵢ × cᵢ / 100 ) )</p>
              <p className="text-[10px] text-vigia-dim">i ∈ {"{"} 1 … 7 banderas {"}"}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
              {[
                { sym: "wᵢ", desc: "Peso de la bandera i (suma total = 100%)" },
                { sym: "cᵢ", desc: "Confianza de detección (0–100%), asignada por el modelo" },
                { sym: "∏", desc: "Productoria sobre las 7 banderas activas" },
                { sym: "Score", desc: "Índice final 0–100; ≥ 71 = CRÍTICO" },
              ].map((r) => (
                <div key={r.sym} className="flex items-start gap-2 bg-surface-1 rounded-lg p-3 border border-vigia-border">
                  <span className="font-mono text-[13px] font-semibold text-vigia-accent w-8 shrink-0">{r.sym}</span>
                  <span className="text-vigia-muted leading-snug">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banderas table */}
          <div className="bg-white rounded-2xl border border-vigia-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-vigia-border">
              <p className="text-xs font-medium text-vigia-heading">7 Banderas rojas VIGÍA</p>
              <p className="label-mono mt-0.5">indicadores · pesos · fuentes normativas</p>
            </div>
            <div className="divide-y divide-vigia-border">
              {BANDERAS.map((b, i) => (
                <div key={b.id}>
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full grid grid-cols-[2rem_2fr_auto_auto] gap-x-4 px-5 py-3.5 items-center
                      hover:bg-surface-1 transition-colors text-left">
                    <span className="w-2.5 h-2.5 rounded-full mx-auto" style={{ backgroundColor: b.color }} />
                    <div>
                      <p className="text-xs font-medium text-vigia-heading">{b.nombre}</p>
                      <p className="label-mono mt-0.5 truncate">{b.norma}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-light text-vigia-heading">{b.peso_pct}%</p>
                      <p className="label-mono">peso</p>
                    </div>
                    <span className="text-[9px] font-mono text-vigia-dim ml-2">
                      {expanded === i ? "▲" : "▼"}
                    </span>
                  </button>
                  {expanded === i && (
                    <div className="px-12 pb-4 pt-1 bg-surface-1 border-t border-vigia-border">
                      <p className="text-xs text-vigia-muted mb-3">{b.descripcion}</p>
                      <p className="text-[10px] font-mono text-vigia-dim mb-1 uppercase tracking-label">
                        Fuente: {b.fuente}
                      </p>
                      <ul className="space-y-1">
                        {b.ejemplos.map((ej) => (
                          <li key={ej} className="text-[11px] text-vigia-muted flex gap-2">
                            <span className="text-vigia-dim shrink-0">·</span>
                            {ej}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Umbrales de clasificación</p>
            <p className="label-mono mb-4">niveles de alerta y acción sugerida</p>
            <div className="space-y-2">
              {[
                { rango: "71 – 100", nivel: "CRÍTICO", color: "#dc2626", bg: "bg-red-50 border-red-200",   accion: "Remitir a Procuraduría General / Contraloría. Posible suspensión cautelar." },
                { rango: "46 – 70",  nivel: "ALTO",    color: "#ea580c", bg: "bg-orange-50 border-orange-200", accion: "Solicitar documentos adicionales. Incluir en auditoría de seguimiento." },
                { rango: "21 – 45",  nivel: "MEDIO",   color: "#ca8a04", bg: "bg-yellow-50 border-yellow-200", accion: "Monitoreo pasivo. Registrar en bitácora de riesgo." },
                { rango: "0 – 20",   nivel: "BAJO",    color: "#16a34a", bg: "bg-green-50 border-green-200",  accion: "Sin acción requerida. Registrar para estadísticas." },
              ].map((t) => (
                <div key={t.nivel} className={`flex items-start gap-4 rounded-xl border p-3 ${t.bg}`}>
                  <div className="shrink-0 text-center w-16">
                    <p className="font-mono text-[11px] font-semibold" style={{ color: t.color }}>{t.nivel}</p>
                    <p className="font-mono text-[9px] text-vigia-dim mt-0.5">{t.rango}</p>
                  </div>
                  <p className="text-[11px] text-vigia-muted leading-snug">{t.accion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card">
            <p className="text-xs font-medium text-vigia-heading mb-3">Referencias académicas y normativas</p>
            <div className="space-y-2">
              {[
                "Fazekas, M. & Kocsis, G. (2020). Uncovering High-Level Corruption: Cross-National Objective Corruption Risk Indicators Using Public Procurement Data. *British Journal of Political Science*, 50(1), 155–164.",
                "Open Contracting Partnership (2024). Red Flags for Integrity: Appraising Government Procurement Data. OCP Technical Guide.",
                "Transparencia por Colombia (2023). Índice de Riesgo de Corrupción en Contratación Pública. Capítulo Colombia de Transparency International.",
                "Ley 80/1993. Estatuto General de Contratación de la Administración Pública. Congreso de la República de Colombia.",
                "Ley 1474/2011. Estatuto Anticorrupción. Congreso de la República de Colombia.",
                "Decreto 1082/2015. Régimen Único Reglamentario del Sector Administrativo de Planeación Nacional.",
              ].map((ref, i) => (
                <p key={i} className="text-[10px] text-vigia-muted leading-relaxed pl-3 border-l-2 border-vigia-border">{ref}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: simulator */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-vigia-border p-5 shadow-card sticky top-[88px]">
            <p className="text-xs font-medium text-vigia-heading mb-0.5">Simulador de score</p>
            <p className="label-mono mb-4">ajusta la confianza de cada bandera</p>

            {/* Arc gauge */}
            <div className="flex justify-center mb-4">
              <ScoreArc score={score} />
            </div>

            {/* Score badge */}
            <div className="flex justify-center mb-5">
              <span className="px-4 py-1.5 rounded-full text-[11px] font-mono font-semibold border"
                style={{
                  backgroundColor: c + "18",
                  borderColor: c + "50",
                  color: c,
                }}>
                {label} · {score} / 100
              </span>
            </div>

            {/* Sliders */}
            <div className="divide-y divide-vigia-border">
              {BANDERAS.map((b, i) => (
                <BanderaSlider
                  key={b.id}
                  bandera={b}
                  value={confianzas[i]}
                  onChange={(v) => setConfianza(i, v)}
                />
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="mt-4 w-full py-2 rounded-xl text-[11px] font-mono text-vigia-muted
                border border-vigia-border hover:bg-surface-1 transition-colors">
              Limpiar simulador
            </button>

            <p className="mt-3 text-[9px] font-mono text-vigia-dim text-center leading-snug">
              indicadores de riesgo · no determinan culpabilidad ·<br />
              uso para auditoría preventiva únicamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
