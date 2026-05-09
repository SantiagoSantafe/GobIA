import { Shield, Network, Map, FileText } from "lucide-react";

const TABS = [
  {
    id: "resumen",
    label: "Resumen y Banderas",
    icon: Shield,
    description: "Score SARLAFT y alertas",
  },
  {
    id: "redes",
    label: "Grafo de Redes y Datos",
    icon: Network,
    description: "Red de corrupción y evidencia",
  },
  {
    id: "territorio",
    label: "Territorio y Contexto",
    icon: Map,
    description: "Mapa y prensa PACO",
  },
  {
    id: "denuncia",
    label: "Denuncia y Exportación",
    icon: FileText,
    description: "Debida diligencia y PDF",
  },
];

export function TabNav({ activeTab, onTabChange, alertCounts = {} }) {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-3">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 overflow-x-auto" role="tablist">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const count = alertCounts[tab.id];
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-4 text-sm font-display font-medium
                  whitespace-nowrap transition-all duration-150 border-b-2 -mb-px
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-action-primary/40
                  ${active
                    ? "border-action-primary text-action-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-surface-3"
                  }
                `}
              >
                <Icon
                  size={15}
                  className={active ? "text-action-primary" : "text-slate-400"}
                />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden font-mono text-xs">{i + 1}</span>

                {/* Alert count badge */}
                {count != null && count > 0 && (
                  <span
                    className={`
                      ml-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center
                      text-xs font-mono font-bold px-1
                      ${active
                        ? "bg-action-primary text-white"
                        : "bg-red-100 text-red-600"
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
