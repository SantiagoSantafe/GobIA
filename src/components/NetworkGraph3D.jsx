import { useRef, useEffect, useState, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { Network, RotateCcw, ExternalLink, X } from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";

const NODE_COLORS = {
  entidad:    "#6366f1",
  adjudicada: "#f59e0b",
  fachada:    "#ef4444",
};

const LINK_COLORS = {
  adjudica:               "#f59e0b",
  comparte_direccion:     "#ef4444",
  representante_compartido: "#f97316",
  multa_secop:            "#94a3b8",
};

const NODE_LEGEND = [
  { color: "#6366f1", label: "Entidad pública" },
  { color: "#f59e0b", label: "Empresa adjudicada" },
  { color: "#ef4444", label: "Empresa fachada / vinculada" },
];

const LINK_LEGEND = [
  { color: "#f59e0b", label: "Adjudicación" },
  { color: "#ef4444", label: "Misma dirección" },
  { color: "#f97316", label: "Rep. legal compartido" },
  { color: "#94a3b8", label: "Multa SECOP I" },
];

function NodeTooltip({ node, onClose }) {
  if (!node) return null;
  const formatCOP = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0, notation: "compact" }).format(v);

  return (
    <div className="absolute top-4 right-4 z-20 glass-card p-4 w-60 shadow-card-lg animate-fade-in">
      <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 transition-colors">
        <X size={13} />
      </button>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[node.tipo] ?? "#94a3b8" }} />
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">{node.tipo}</span>
        {node.sancionada && (
          <span className="ml-auto text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">SANCIONADA</span>
        )}
      </div>
      <p className="font-display font-semibold text-sm text-slate-800 leading-snug mb-3">{node.name}</p>
      <div className="space-y-1.5 text-xs">
        {node.nit && <div className="flex justify-between gap-2"><span className="text-slate-400 font-mono">NIT</span><span className="text-slate-700 font-mono">{node.nit}</span></div>}
        {node.ciudad && <div className="flex justify-between gap-2"><span className="text-slate-400 font-mono">Ciudad</span><span className="text-slate-700">{node.ciudad}</span></div>}
        {node.fecha_constitucion && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-mono">Constituida</span>
            <span className={`font-mono ${node.tipo === "adjudicada" ? "text-risk-critical font-bold" : "text-slate-700"}`}>{node.fecha_constitucion}</span>
          </div>
        )}
        {node.capital && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-mono">Capital</span>
            <span className={`font-mono ${node.capital < 1000000 ? "text-risk-critical" : "text-slate-700"}`}>{formatCOP(node.capital)}</span>
          </div>
        )}
        {node.multas_secop !== undefined && (
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-mono">Multas</span>
            <span className={`font-mono font-bold ${node.multas_secop > 0 ? "text-risk-high" : "text-slate-400"}`}>{node.multas_secop}</span>
          </div>
        )}
        {node.direccion && (
          <div className="mt-2 pt-2 border-t border-surface-3">
            <span className="text-slate-400 font-mono block mb-0.5">Dirección</span>
            <span className="text-risk-critical font-mono text-[10px] leading-relaxed">{node.direccion}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// TODO: Fetch from FastAPI: GET /graph/contractor/:nit
export function NetworkGraph3D({ network }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 440 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node ?? null);
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? "pointer" : "default";
    }
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
    if (fgRef.current && node) {
      fgRef.current.cameraPosition(
        { x: node.x * 1.5, y: node.y * 1.5, z: (node.z ?? 0) * 1.5 + 120 },
        node, 800
      );
    }
  }, []);

  const resetCamera = () => {
    fgRef.current?.cameraPosition({ x: 0, y: 0, z: 350 }, { x: 0, y: 0, z: 0 }, 800);
  };

  const tooltip = selectedNode ?? hoveredNode;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Network size={15} className="text-risk-high" />
        <span className="font-display font-semibold text-sm text-slate-800">
          Red de Corrupción — Grafo 3D
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={resetCamera}
            title="Resetear cámara"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface-1 border border-surface-3 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
          >
            <RotateCcw size={12} />
          </button>
          <a
            href="https://www.anticorrupcion.co/metodologia"
            target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-action-primary transition-colors"
          >
            metodología <ExternalLink size={9} />
          </a>
        </div>
      </CardHeader>

      <div className="relative flex-1 min-h-0 bg-slate-50 rounded-b-2xl overflow-hidden" ref={containerRef}>
        <ForceGraph3D
          ref={fgRef}
          graphData={network}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#F8FAFC"
          nodeLabel={() => ""}
          nodeColor={(node) => node.color ?? NODE_COLORS[node.tipo] ?? "#94a3b8"}
          nodeVal={(node) => node.val ?? 8}
          nodeOpacity={0.92}
          linkColor={(link) => link.color ?? LINK_COLORS[link.tipo] ?? "#CBD5E1"}
          linkWidth={(link) => link.width ?? 1.5}
          linkOpacity={0.65}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={0.85}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={(link) => link.tipo === "adjudica" ? 2.5 : 1.5}
          linkDirectionalParticleColor={(link) => link.color ?? "#f59e0b"}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          nodeResolution={16}
          enableNodeDrag
          enableNavigationControls
          showNavInfo={false}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          cooldownTicks={80}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
        />

        {tooltip && (
          <NodeTooltip node={tooltip} onClose={() => setSelectedNode(null)} />
        )}

        <div className="absolute bottom-14 left-3 text-[10px] font-mono text-slate-400">
          Clic · arrastra · scroll para navegar
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 glass-card px-3 py-2.5 space-y-2 !rounded-xl">
          <div>
            <p className="label-mono mb-1.5">Nodos</p>
            <div className="space-y-1">
              {NODE_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-mono text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono mb-1.5">Aristas</p>
            <div className="space-y-1">
              {LINK_LEGEND.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="w-5 h-0.5 rounded shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-mono text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-3 px-5 py-3 flex items-center gap-3 flex-wrap text-[10px] font-mono text-slate-400">
        <span>{network.nodes.length} nodos</span>
        <span className="text-surface-3">·</span>
        <span>{network.links.length} conexiones</span>
        <span className="text-surface-3">·</span>
        <span className="text-risk-critical font-semibold">5 empresas fachada · misma dirección</span>
        <span className="text-surface-3">·</span>
        <span className="text-risk-high">2 sancionadas SECOP I</span>
      </div>
    </Card>
  );
}
