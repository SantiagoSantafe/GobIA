import { useState } from "react";
import { Search, Shield, Activity, MapPin, AlertCircle, ChevronDown } from "lucide-react";

const FILTER_CHIPS = [
  { id: "pdet", label: "Municipios PDET", icon: MapPin, count: 170 },
  { id: "paz",  label: "Zonas de Paz",    icon: Shield, count: 46 },
  { id: "top",  label: "Top Riesgo Hoy",  icon: AlertCircle, count: 12 },
];

// TODO: Fetch from FastAPI: GET /search/contracts?q=:query&filter=:filter
export function Header({ onSearch }) {
  const [query, setQuery] = useState("CO1.PCCNTR.7842913");
  const [activeFilter, setActiveFilter] = useState(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <header className="bg-white border-b border-surface-3">
      {/* Status bar */}
      <div className="border-b border-surface-3 px-6 py-2 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            ingesta SECOP activa · última actualización hace 4 min
          </span>
          <span className="hidden sm:block text-surface-3">|</span>
          <span className="hidden sm:block">SECOP I · SECOP II · SECOP Integrado</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>10.7M+ contratos analizados</span>
          <span className="text-surface-3">|</span>
          <span className="flex items-center gap-1">
            <Activity size={10} className="text-action-primary" />
            22 modelos activos
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-6 py-7 max-w-5xl mx-auto">
        {/* Logo + stats */}
        <div className="flex items-start justify-between mb-7 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shadow-card">
                  <Shield size={20} className="text-risk-critical" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-risk-critical animate-pulse-dot" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900 leading-none">
                  VIG<span className="text-risk-critical">Í</span>A
                </h1>
                <p className="text-[10px] font-mono text-slate-400 tracking-widest mt-0.5">
                  SISTEMA DE IA · VEEDURÍA CIUDADANA
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
              Vigilancia de contratación pública con inteligencia artificial.
              Detecta irregularidades, redes de corrupción y alertas SARLAFT
              con datos abiertos SECOP.
            </p>
          </div>

          <div className="hidden lg:flex gap-6 text-right shrink-0">
            {[
              { label: "Contratos hoy", value: "1.247", accent: false },
              { label: "Alertas activas", value: "38", accent: true },
              { label: "Score promedio", value: "34/100", accent: false },
            ].map((s) => (
              <div key={s.label}>
                <div className={`font-display font-bold text-xl ${s.accent ? "text-risk-critical" : "text-slate-800"}`}>
                  {s.value}
                </div>
                <div className="label-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSubmit}>
          <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 bg-surface-1 transition-all duration-150 ${
            focused
              ? "border-action-primary shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
              : "border-surface-3 hover:border-slate-300"
          }`}>
            <Search size={18} className={`shrink-0 transition-colors ${focused ? "text-action-primary" : "text-slate-400"}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ingresa el ID del contrato o busca tu municipio…  Ej: CO1.PCCNTR.7842913 · Argelia · Riosucio"
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none font-display text-sm"
            />
            <button
              type="submit"
              className="shrink-0 px-5 py-2 rounded-xl bg-action-primary text-white font-display font-semibold text-sm hover:bg-action-hover transition-colors shadow-card"
            >
              Analizar
            </button>
          </div>
        </form>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="label-mono mr-1">filtrar por:</span>
          {FILTER_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const active = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(active ? null : chip.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  active
                    ? "bg-action-light border-action-border text-action-primary"
                    : "bg-white border-surface-3 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon size={11} />
                {chip.label}
                <span className={`ml-0.5 ${active ? "text-action-primary" : "text-slate-400"}`}>
                  ({chip.count})
                </span>
              </button>
            );
          })}
          <span className="ml-auto flex items-center gap-1 text-xs font-mono text-slate-400 hidden sm:flex">
            <ChevronDown size={11} />
            metodología · anticorrupcion.co
          </span>
        </div>
      </div>
    </header>
  );
}
