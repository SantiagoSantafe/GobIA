// =============================================================================
// VIGÍA — Dashboard Layout
// Nav compartida para todas las sub-páginas del dashboard
// =============================================================================
import { NavLink, Link, Outlet } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard/alertas",    label: "Alertas" },
  { to: "/dashboard/contratos",  label: "Contratos" },
  { to: "/dashboard/historico",  label: "Histórico" },
  { to: "/dashboard/radar",      label: "Radar" },
  { to: "/dashboard/score",      label: "Score" },
  { to: "/metodologia",          label: "Metodología" },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-surface-1 font-display flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-vigia-border">
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Primary row */}
          <div className="h-12 flex items-center gap-4">
            <Link to="/"
              className="flex items-center gap-1.5 text-[10px] font-mono tracking-label text-vigia-muted hover:text-vigia-heading transition-colors">
              <ArrowLeft size={11} /> inicio
            </Link>

            <div className="flex items-center gap-2 ml-1">
              <div className="w-5 h-5 rounded-md bg-red-50 border border-red-200 flex items-center justify-center">
                <Shield size={11} className="text-risk-critical" />
              </div>
              <span className="font-bold text-sm tracking-tight text-vigia-heading">
                VIG<span className="text-vigia-accent">Í</span>A
              </span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-vigia-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                ingesta activa
              </span>
              <span className="hidden sm:block text-[10px] font-mono text-vigia-dim">10.7M+ contratos</span>
            </div>
          </div>

          {/* Secondary nav */}
          <nav className="flex items-center gap-0 overflow-x-auto -mb-px" role="navigation">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-[11px] font-mono tracking-label uppercase whitespace-nowrap
                   border-b-2 transition-all duration-150 -mb-px
                   ${isActive
                     ? "border-vigia-accent text-vigia-accent"
                     : "border-transparent text-vigia-muted hover:text-vigia-heading hover:border-vigia-border"
                   }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-vigia-border bg-white px-6 py-4 text-center">
        <p className="font-mono text-[10px] text-vigia-dim">
          vigía · datos públicos secop · metodología abierta · indicadores de riesgo, no determinan culpabilidad
        </p>
      </footer>
    </div>
  );
}
