import { Newspaper, ExternalLink, AlertCircle, AlertTriangle, Info, Radio } from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

const TIPO_CONFIG = {
  escandalo: {
    border: "border-l-risk-critical",
    bg:     "bg-red-50",
    pill:   "bg-red-100 text-red-600",
    icon:   AlertCircle,
    label:  "Escándalo",
  },
  alerta: {
    border: "border-l-risk-high",
    bg:     "bg-amber-50",
    pill:   "bg-amber-100 text-amber-600",
    icon:   AlertTriangle,
    label:  "Alerta",
  },
  contexto: {
    border: "border-l-surface-4",
    bg:     "bg-surface-1",
    pill:   "bg-slate-100 text-slate-500",
    icon:   Info,
    label:  "Contexto",
  },
};

const RELEVANCIA_PILL = {
  alta:  "bg-red-100 text-red-600",
  media: "bg-amber-100 text-amber-600",
  baja:  "bg-slate-100 text-slate-500",
};

// TODO: Fetch from FastAPI: GET /paco/news?municipio=:municipio&departamento=:departamento
export function PACONewsWidget({ noticias = [] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Radio size={14} className="text-action-primary" />
        <span className="font-display font-semibold text-sm text-slate-800">
          Contexto Mediático Territorial
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-surface-1 border border-surface-3 rounded-full px-2 py-0.5">
          PACO · Portal Anticorrupción
        </span>
      </CardHeader>

      <CardBody className="flex-1 space-y-3 overflow-y-auto">
        {/* Lead context note */}
        <div className="flex items-start gap-2 rounded-xl bg-action-light border border-action-border p-3">
          <Newspaper size={13} className="text-action-primary mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Noticias relacionadas con el contrato y su contexto territorial, extraídas
            automáticamente de la base de datos{" "}
            <strong className="text-slate-700">PACO</strong> (Portal Anticorrupción).
          </p>
        </div>

        {/* News cards */}
        {noticias.map((noticia) => {
          const cfg = TIPO_CONFIG[noticia.tipo] ?? TIPO_CONFIG.contexto;
          const TypeIcon = cfg.icon;
          return (
            <div
              key={noticia.id}
              className={`
                rounded-xl border border-surface-3 border-l-4 ${cfg.border}
                bg-white shadow-card overflow-hidden
                transition-shadow duration-150 hover:shadow-card-md
              `}
            >
              <div className={`px-4 pt-3.5 pb-3 ${cfg.bg}/30`}>
                {/* Top meta row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`flex items-center gap-1 text-[10px] font-mono font-semibold rounded-full px-2 py-0.5 ${cfg.pill}`}>
                    <TypeIcon size={9} />
                    {cfg.label}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold rounded-full px-2 py-0.5 ${RELEVANCIA_PILL[noticia.relevancia]}`}>
                    Relevancia {noticia.relevancia}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-slate-400">
                    {noticia.fecha}
                  </span>
                </div>

                {/* Headline */}
                <p className="text-sm font-display font-semibold text-slate-800 leading-snug mb-1.5">
                  {noticia.titulo}
                </p>

                {/* Excerpt */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2.5">
                  {noticia.extracto}
                </p>

                {/* Tags */}
                {noticia.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {noticia.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono bg-surface-2 text-slate-500 rounded px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source + link */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[60%]">
                    {noticia.fuente}
                  </span>
                  <a
                    href={noticia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-mono text-action-primary hover:underline"
                  >
                    Ver fuente <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {noticias.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Newspaper size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-display">Sin noticias relacionadas</p>
            <p className="text-xs font-mono mt-1">PACO no registra casos para este contrato</p>
          </div>
        )}

        <p className="text-center text-[10px] font-mono text-slate-400 pt-2 border-t border-surface-3">
          Fuente: PACO — Portal Anticorrupción · datos.gov.co · UNODC
        </p>
      </CardBody>
    </Card>
  );
}
