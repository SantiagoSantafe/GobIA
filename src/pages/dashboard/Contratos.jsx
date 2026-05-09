// =============================================================================
// VIGÍA — Contratos Page
// Tabla completa con búsqueda, filtros y paginación — DATOS REALES SECOP
// =============================================================================
import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { fetchAlerts } from "../../lib/api";
import { MOCK_ALERTS } from "../../data/mockContract";

const PAGE_SIZE = 15;

function scoreColor(s) {
  if (s == null) return "#94a3b8";
  return s >= 71 ? "#dc2626" : s >= 46 ? "#ea580c" : s >= 21 ? "#ca8a04" : "#16a34a";
}

function NivelBadge({ nivel }) {
  const s = {
    CRÍTICO: "bg-red-50 text-risk-critical border-red-200",
    ALTO:    "bg-orange-50 text-risk-high border-orange-200",
    MEDIO:   "bg-yellow-50 text-risk-medium border-yellow-200",
    BAJO:    "bg-green-50 text-risk-low border-green-200",
  };
  if (!nivel) return <span className="text-[9px] font-mono text-vigia-dim">—</span>;
  return (
    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${s[nivel] ?? s.BAJO}`}>
      {nivel}
    </span>
  );
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
        <span key={p}>
          {i > 0 && visible[i - 1] !== p - 1 && (
            <span className="text-vigia-dim text-[11px] font-mono px-1">…</span>
          )}
          <button onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-[11px] font-mono transition-colors ${
              p === page ? "bg-vigia-heading text-white" : "text-vigia-muted hover:text-vigia-heading border border-vigia-border bg-white"
            }`}>
            {p}
          </button>
        </span>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        className="px-3 py-1.5 rounded-lg text-[11px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white">
        siguiente →
      </button>
    </div>
  );
}

export default function Contratos() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isReal, setIsReal]       = useState(false);
  const [query, setQuery]         = useState("");
  const [filterNivel, setFilterNivel]         = useState("TODOS");
  const [filterDepto, setFilterDepto]         = useState("TODOS");
  const [filterModalidad, setFilterModalidad] = useState("TODAS");
  const [sortBy, setSortBy]   = useState("valor");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage]       = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      // Pide 200 contratos reales de SECOP ordenados por valor
      const data = await fetchAlerts({ minValor: 100_000_000, limit: 200 });
      // fetchAlerts devuelve datos reales si la API responde, mock si falla
      // Detectamos si son reales comprobando que el score sea null (API real) o número (mock)
      const firstScore = data[0]?.score;
      setIsReal(firstScore === null || firstScore === undefined);
      setContracts(data);
    } catch {
      setContracts(MOCK_ALERTS);
      setIsReal(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deptos = ["TODOS", ...new Set(contracts.map((a) => a.departamento).filter(Boolean))].sort();
  const modalidades = ["TODAS", ...new Set(contracts.map((a) => a.modalidad).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    return contracts
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
        if (sortBy === "score") return ((a.score ?? -1) - (b.score ?? -1)) * dir;
        if (sortBy === "valor") return ((a.valor ?? 0) - (b.valor ?? 0)) * dir;
        if (sortBy === "fecha") return ((a.fecha_firma ?? "") > (b.fecha_firma ?? "") ? 1 : -1) * dir;
        return 0;
      });
  }, [contracts, query, filterNivel, filterDepto, filterModalidad, sortBy, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  const fmt = (v) =>
    v == null ? "—" :
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono tracking-ultra uppercase text-vigia-muted mb-1">explorador</p>
          <h1 className="text-2xl font-light tracking-tight text-vigia-heading">Contratos públicos</h1>
          <div className="flex items-center gap-2 mt-1">
            {loading ? (
              <Loader2 size={12} className="text-vigia-muted animate-spin" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${isReal ? "bg-emerald-500" : "bg-amber-400"}`} />
            )}
            <p className="text-sm text-vigia-muted font-light">
              {loading
                ? "Cargando contratos reales de SECOP…"
                : isReal
                  ? `${contracts.length.toLocaleString("es-CO")} contratos reales · SECOP II (datos.gov.co)`
                  : `${contracts.length} contratos · modo demo (API no disponible)`
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => { setPage(1); load(); }}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-mono text-vigia-muted hover:text-vigia-heading border border-vigia-border rounded-lg px-3 py-1.5 bg-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          actualizar
        </button>
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

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white border border-vigia-border rounded-2xl shadow-card overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[2fr_2fr_1.5fr_auto_auto_auto_auto] gap-x-4 px-5 py-3.5 border-b border-vigia-border">
              {[200, 180, 140, 80, 100, 60, 80].map((w, j) => (
                <div key={j} className="shimmer-bg h-3 rounded" style={{ width: w }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white border border-vigia-border rounded-2xl shadow-card overflow-hidden">
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

          <div className="divide-y divide-vigia-border">
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-vigia-muted font-mono text-sm">
                ningún contrato coincide con los filtros
              </div>
            ) : (
              paginated.map((a) => (
                <div key={a.id}
                  className="grid grid-cols-[2fr_2fr_1.5fr_auto_auto_auto_auto] gap-x-4 px-5 py-3.5 items-center hover:bg-surface-1 transition-colors group">
                  <p className="text-xs font-medium text-vigia-heading truncate">{a.entidad || "—"}</p>
                  <p className="text-xs text-vigia-body truncate font-light">{a.proveedor || "—"}</p>
                  <p className="text-[10px] font-mono text-vigia-dim truncate">{a.id}</p>
                  <p className="text-[11px] font-mono font-medium text-vigia-heading tabular-nums whitespace-nowrap">
                    {fmt(a.valor)}
                  </p>
                  <p className="text-[10px] font-mono text-vigia-muted whitespace-nowrap">{a.modalidad || "—"}</p>
                  <div className="flex items-center gap-2">
                    {a.score != null ? (
                      <>
                        <span className="text-[11px] font-mono font-semibold tabular-nums" style={{ color: scoreColor(a.score) }}>
                          {a.score}
                        </span>
                        <div className="w-12 h-1 rounded-full bg-vigia-border overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${a.score}%`, backgroundColor: scoreColor(a.score) }} />
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <NivelBadge nivel={a.nivel} />
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-vigia-dim italic">ML pendiente</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono text-vigia-dim">
                      {a.fecha_firma ? String(a.fecha_firma).slice(0, 10) : "—"}
                    </p>
                    <a href="https://www.secop.gov.co/" target="_blank" rel="noreferrer"
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
      )}

      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />

      {!loading && (
        <p className="text-center text-[10px] font-mono text-vigia-dim mt-3">
          mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} contratos
          {isReal ? " · fuente: SECOP II datos.gov.co" : " · modo demo"}
        </p>
      )}
    </div>
  );
}
