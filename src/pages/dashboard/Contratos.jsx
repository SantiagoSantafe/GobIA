// =============================================================================
// VIGÍA — Contratos Page
// Tabla completa con búsqueda, filtros y paginación
// =============================================================================
import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { MOCK_ALERTS } from "../../data/mockContract";

const PAGE_SIZE = 8;

// Ampliar el dataset a 25 filas generando variantes
const EXTRA_CONTRACTS = [
  { id: "SECOP2-2024-GOBMETA-112", entidad: "Gobernación del Meta", departamento: "Meta", proveedor: "Infraestructura Llanos SAS", valor: 9800000000, modalidad: "Licitación Pública", fecha_firma: "2024-11-04", score: 48, nivel: "ALTO", bandera_principal: "Precio atípico +34%", detalle_extra: null },
  { id: "CO-MINSALUD-2024-3341", entidad: "Ministerio de Salud", departamento: "Bogotá D.C.", proveedor: "Distribuciones Médicas SAS", valor: 5400000000, modalidad: "Selección Abreviada", fecha_firma: "2024-10-15", score: 39, nivel: "MEDIO", bandera_principal: "Único oferente", detalle_extra: null },
  { id: "CO-ALCNORTE-2024-8821", entidad: "Alcaldía Norte de Santander", departamento: "Norte de Santander", proveedor: "Alimentos del Catatumbo SAS", valor: 3200000000, modalidad: "Contratación Directa", fecha_firma: "2024-09-28", score: 71, nivel: "CRÍTICO", bandera_principal: "Empresa de maletín", detalle_extra: "Empresa constituida 8 días antes del contrato.", dias_antes_constitucion: 8 },
  { id: "SECOP1-2024-BOYACA-220", entidad: "Gobernación de Boyacá", departamento: "Boyacá", proveedor: "Constructora Altiplano SAS", valor: 18600000000, modalidad: "Licitación Pública", fecha_firma: "2024-08-19", score: 27, nivel: "MEDIO", bandera_principal: "Ventana publicación corta", detalle_extra: null },
  { id: "CO-HUILA-2024-0445", entidad: "Gobernación del Huila", departamento: "Huila", proveedor: "Tech Solutions Neiva SAS", valor: 1200000000, modalidad: "Mínima Cuantía", fecha_firma: "2024-07-11", score: 15, nivel: "BAJO", bandera_principal: "Sin alertas mayores", detalle_extra: null },
  { id: "CO-TOLIMA-2024-1119", entidad: "Alcaldía de Ibagué", departamento: "Tolima", proveedor: "Pavimentos del Tolima SAS", valor: 6700000000, modalidad: "Licitación Pública", fecha_firma: "2024-06-03", score: 52, nivel: "ALTO", bandera_principal: "Pliego sastre (NLP)", detalle_extra: null },
  { id: "SECOP2-2024-ATLANTICO-88", entidad: "Gobernación del Atlántico", departamento: "Atlántico", proveedor: "Caribe Construcciones SAS", valor: 14200000000, modalidad: "Licitación Pública", fecha_firma: "2024-05-22", score: 33, nivel: "MEDIO", bandera_principal: "Concentración proveedor", detalle_extra: null },
  { id: "CO-MAGDALENA-2024-775", entidad: "Alcaldía de Santa Marta", departamento: "Magdalena", proveedor: "Turismo y Obras SAS", valor: 4500000000, modalidad: "Selección Abreviada", fecha_firma: "2024-04-08", score: 19, nivel: "BAJO", bandera_principal: "Sin alertas mayores", detalle_extra: null },
  { id: "CO-NARIÑO-2024-334", entidad: "Gobernación de Nariño", departamento: "Nariño", proveedor: "Andina Servicios SAS", valor: 7800000000, modalidad: "Licitación Pública", fecha_firma: "2024-03-17", score: 61, nivel: "ALTO", bandera_principal: "PEP representante", detalle_extra: null },
  { id: "SECOP1-2024-CALDAS-112", entidad: "Gobernación de Caldas", departamento: "Caldas", proveedor: "Obras Cafeteras SAS", valor: 3100000000, modalidad: "Selección Abreviada", fecha_firma: "2024-02-14", score: 24, nivel: "MEDIO", bandera_principal: "Ventana publicación corta", detalle_extra: null },
  { id: "CO-SUCRE-2024-0088", entidad: "Alcaldía de Sincelejo", departamento: "Sucre", proveedor: "Alimentos Costeños SAS", valor: 2800000000, modalidad: "Contratación Directa", fecha_firma: "2024-01-29", score: 76, nivel: "CRÍTICO", bandera_principal: "Empresa de maletín", detalle_extra: "Empresa constituida 11 días antes.", dias_antes_constitucion: 11 },
  { id: "CO-QUINDIO-2024-0234", entidad: "Gobernación del Quindío", departamento: "Quindío", proveedor: "Café y Construcción SAS", valor: 1900000000, modalidad: "Mínima Cuantía", fecha_firma: "2024-01-10", score: 11, nivel: "BAJO", bandera_principal: "Sin alertas mayores", detalle_extra: null },
  { id: "CO-VAUPÉS-2024-001", entidad: "Gobernación del Vaupés", departamento: "Vaupés", proveedor: "Selva Servicios SAS", valor: 980000000, modalidad: "Contratación Directa", fecha_firma: "2023-12-20", score: 67, nivel: "ALTO", bandera_principal: "Desajuste geográfico", detalle_extra: null },
  { id: "CO-VICHADA-2023-007", entidad: "Gobernación del Vichada", departamento: "Vichada", proveedor: "Llano Integrado SAS", valor: 1500000000, modalidad: "Contratación Directa", fecha_firma: "2023-11-15", score: 44, nivel: "MEDIO", bandera_principal: "Único oferente", detalle_extra: null },
  { id: "CO-GUAINÍA-2023-003", entidad: "Gobernación del Guainía", departamento: "Guainía", proveedor: "Amazonía Suministros SAS", valor: 850000000, modalidad: "Mínima Cuantía", fecha_firma: "2023-10-05", score: 29, nivel: "MEDIO", bandera_principal: "Desajuste geográfico", detalle_extra: null },
];

const ALL_CONTRACTS = [...MOCK_ALERTS, ...EXTRA_CONTRACTS];

function scoreColor(s) {
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
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

function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const visible = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white">
        ← anterior
      </button>
      {visible.map((p, i) => (
        <>
          {i > 0 && visible[i - 1] !== p - 1 && (
            <span key={`gap-${p}`} className="text-vigia-dim text-[11px] font-mono px-1">…</span>
          )}
          <button key={p} onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-[11px] font-mono transition-colors ${
              p === page ? "bg-vigia-heading text-white" : "text-vigia-muted hover:text-vigia-heading border border-vigia-border bg-white"
            }`}>
            {p}
          </button>
        </>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white">
        siguiente →
      </button>
    </div>
  );
}

export default function Contratos() {
  const [query, setQuery] = useState("");
  const [filterNivel, setFilterNivel] = useState("TODOS");
  const [filterDepto, setFilterDepto] = useState("TODOS");
  const [filterModalidad, setFilterModalidad] = useState("TODAS");
  const [sortBy, setSortBy] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const deptos      = ["TODOS", ...new Set(ALL_CONTRACTS.map((a) => a.departamento))].sort();
  const modalidades = ["TODAS", ...new Set(ALL_CONTRACTS.map((a) => a.modalidad))].sort();

  const filtered = useMemo(() => {
    return ALL_CONTRACTS
      .filter((a) => {
        const mN = filterNivel === "TODOS" || a.nivel === filterNivel;
        const mD = filterDepto === "TODOS" || a.departamento === filterDepto;
        const mM = filterModalidad === "TODAS" || a.modalidad === filterModalidad;
        const mQ = !query || [a.entidad, a.proveedor, a.id, a.departamento]
          .some((f) => f?.toLowerCase().includes(query.toLowerCase()));
        return mN && mD && mM && mQ;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortBy === "score")  return (a.score - b.score) * dir;
        if (sortBy === "valor")  return (a.valor - b.valor) * dir;
        if (sortBy === "fecha")  return (a.fecha_firma > b.fecha_firma ? 1 : -1) * dir;
        return 0;
      });
  }, [query, filterNivel, filterDepto, filterModalidad, sortBy, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  const fmt = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(v);

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown size={10} className="text-vigia-dim" />;
    return sortDir === "desc"
      ? <ChevronDown size={10} className="text-vigia-accent" />
      : <ChevronUp size={10} className="text-vigia-accent" />;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-1">explorador</p>
        <h1 className="text-2xl font-light tracking-tight text-vigia-heading">Contratos públicos</h1>
        <p className="text-sm text-vigia-muted font-light mt-1">{ALL_CONTRACTS.length} contratos en base demo · ordenados por score de riesgo VIGÍA</p>
      </div>

      {/* Search + filters */}
      <div className="bg-white border border-vigia-border rounded-2xl p-4 mb-5 shadow-card space-y-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }}>
          <div className="flex items-center gap-3 rounded-xl border border-vigia-border px-4 py-2.5 bg-surface-1 focus-within:border-vigia-strong transition-all">
            <Search size={15} className="text-vigia-muted shrink-0" />
            <input type="text" value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Buscar por entidad, proveedor, ID de contrato o departamento…"
              className="flex-1 bg-transparent text-vigia-heading placeholder:text-vigia-dim outline-none text-sm font-light"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-mono tracking-ultra uppercase text-vigia-dim">filtros:</span>
          {[
            { label: "Nivel", val: filterNivel, set: setFilterNivel, opts: ["TODOS", "CRÍTICO", "ALTO", "MEDIO", "BAJO"] },
            { label: "Departamento", val: filterDepto, set: setFilterDepto, opts: deptos },
            { label: "Modalidad", val: filterModalidad, set: setFilterModalidad, opts: modalidades },
          ].map((f) => (
            <div key={f.label} className="relative">
              <select value={f.val} onChange={(e) => { f.set(e.target.value); setPage(1); }}
                className="appearance-none text-[10px] font-mono bg-white border border-vigia-border rounded-full px-3 py-1.5 pr-7 text-vigia-muted cursor-pointer hover:border-vigia-strong focus:outline-none transition-colors">
                {f.opts.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vigia-dim pointer-events-none" />
            </div>
          ))}
          <span className="ml-auto text-[9px] font-mono text-vigia-dim">{filtered.length} contratos</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-vigia-border rounded-2xl shadow-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_2fr_1.5fr_auto_auto_auto_auto] gap-x-4 px-5 py-3 border-b border-vigia-border bg-surface-1">
          {[
            { label: "Entidad", col: null },
            { label: "Proveedor", col: null },
            { label: "ID Contrato", col: null },
            { label: "Valor", col: "valor" },
            { label: "Modalidad", col: null },
            { label: "Score", col: "score" },
            { label: "Fecha", col: "fecha" },
          ].map(({ label, col }) => (
            <button key={label}
              onClick={() => col && handleSort(col)}
              className={`flex items-center gap-1 text-[9px] font-mono uppercase tracking-ultra text-left transition-colors
                ${col ? "hover:text-vigia-muted cursor-pointer text-vigia-dim" : "cursor-default text-vigia-dim"}`}>
              {label}
              {col && <SortIcon col={col} />}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-vigia-border">
          {paginated.length === 0 ? (
            <div className="py-16 text-center text-vigia-muted font-mono text-sm">ningún contrato coincide con los filtros</div>
          ) : (
            paginated.map((a) => (
              <div key={a.id}
                className="grid grid-cols-[2fr_2fr_1.5fr_auto_auto_auto_auto] gap-x-4 px-5 py-3.5 items-center hover:bg-surface-1 transition-colors group">
                <p className="text-xs font-medium text-vigia-heading truncate">{a.entidad}</p>
                <p className="text-xs text-vigia-body truncate font-light">{a.proveedor}</p>
                <p className="text-[10px] font-mono text-vigia-dim truncate">{a.id}</p>
                <p className="text-[11px] font-mono font-medium text-vigia-heading tabular-nums whitespace-nowrap">{fmt(a.valor)}</p>
                <p className="text-[10px] font-mono text-vigia-muted whitespace-nowrap">{a.modalidad}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold tabular-nums" style={{ color: scoreColor(a.score) }}>
                    {a.score}
                  </span>
                  <div className="w-12 h-1 rounded-full bg-vigia-border overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${a.score}%`, backgroundColor: scoreColor(a.score) }} />
                  </div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <NivelBadge nivel={a.nivel} />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-mono text-vigia-dim">{a.fecha_firma}</p>
                  <a href={`https://www.secop.gov.co/`} target="_blank" rel="noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-vigia-accent hover:text-vigia-heading"
                    title="Ver en SECOP">
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

      {/* Summary row */}
      <p className="text-center text-[10px] font-mono text-vigia-dim mt-3">
        mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} contratos
      </p>
    </div>
  );
}
