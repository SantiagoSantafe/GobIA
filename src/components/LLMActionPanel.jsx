import { useState, useEffect, useRef } from "react";
import {
  Zap, Copy, Download, Send, CheckCircle,
  Loader2, BotMessageSquare, FileSignature, ExternalLink, AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { MOCK_DRAFT_DENUNCIA } from "../data/mockContract";

const TYPEWRITER_CHUNK = 6;
const TYPEWRITER_INTERVAL_MS = 12;

// TODO: Fetch from FastAPI: POST /llm/draft-complaint
// Body: { contract_id, score, flags, network_summary, pricing_delta }
export function LLMActionPanel({ contract }) {
  const [phase, setPhase] = useState("idle"); // idle | loading | streaming | done
  const [displayedText, setDisplayedText] = useState("");
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null);
  const textareaRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleGenerate = () => {
    if (phase !== "idle") return;
    setPhase("loading");
    setDisplayedText("");
    indexRef.current = 0;

    setTimeout(() => {
      setPhase("streaming");
      intervalRef.current = setInterval(() => {
        indexRef.current += TYPEWRITER_CHUNK;
        setDisplayedText(MOCK_DRAFT_DENUNCIA.slice(0, indexRef.current));
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
        if (indexRef.current >= MOCK_DRAFT_DENUNCIA.length) {
          clearInterval(intervalRef.current);
          setPhase("done");
        }
      }, TYPEWRITER_INTERVAL_MS);
    }, 1600);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setDisplayedText("");
    indexRef.current = 0;
  };

  const isActive = phase === "streaming" || phase === "done";
  const progressPct = MOCK_DRAFT_DENUNCIA.length > 0
    ? Math.min(100, Math.round((displayedText.length / MOCK_DRAFT_DENUNCIA.length) * 100))
    : 0;

  return (
    <Card>
      <CardHeader className="flex-wrap gap-y-2">
        <BotMessageSquare size={15} className="text-action-primary" />
        <span className="font-display font-semibold text-sm text-slate-800">
          Generador de Hallazgos — Formato VIGÍA
        </span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-action-primary bg-action-light border border-action-border rounded-full px-2.5 py-1">
            <Zap size={9} />
            7 Banderas · Fazekas &amp; Kocsis · OCP 2024
          </span>
          {phase !== "idle" && (
            <button onClick={handleReset} className="text-xs font-mono text-slate-400 hover:text-slate-700 transition-colors">
              ↺ reiniciar
            </button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        {/* Context strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Contrato ID",       value: contract.id,                         accent: false },
            { label: "Score VIGÍA",       value: `${contract.score}/100 — CRÍTICO`,   accent: true  },
            { label: "Banderas activas",  value: `${contract.num_banderas} detectadas`, accent: true  },
            { label: "Sobrecosto estim.", value: "$1.422M COP",                        accent: true  },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-surface-1 border border-surface-3 p-3">
              <p className="label-mono mb-0.5">{item.label}</p>
              <p className={`font-display font-semibold text-sm ${item.accent ? "text-risk-critical" : "text-slate-700"}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* CTA — idle */}
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-5 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
              <FileSignature size={28} className="text-risk-critical" />
            </div>
            <div>
              <p className="font-display font-semibold text-slate-800 text-lg mb-1">
                Generar Hallazgos VIGÍA
              </p>
              <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                Reporte estructurado con las 7 banderas activas, evidencia cuantitativa,
                norma aplicable y organismos recomendados.
                Indicadores de riesgo — no acusaciones formales.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-display font-semibold text-white text-sm
                bg-action-primary hover:bg-action-hover transition-all duration-150 shadow-card-md hover:shadow-glow-indigo active:scale-[0.98]"
            >
              <Zap size={17} />
              Generar Reporte de Hallazgos
            </button>
            <p className="text-xs font-mono text-slate-400">
              indicadores de riesgo · no acusaciones formales
            </p>
          </div>
        )}

        {/* Loading */}
        {phase === "loading" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 size={30} className="text-action-primary animate-spin" />
            <div className="text-center">
              <p className="font-display font-semibold text-slate-800">Analizando evidencia…</p>
              {/* TODO: FastAPI POST /llm/draft-complaint — streaming SSE response */}
              <p className="text-sm text-slate-400 mt-1 font-mono">
                Consultando modelo LLM · aplicando fundamentos legales
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["Banderas SARLAFT", "Evidencia grafo", "Sobrecosto", "Ley 80/93"].map((step) => (
                <span key={step} className="text-xs font-mono text-action-primary bg-action-light border border-action-border rounded-full px-2.5 py-1 animate-pulse">
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Streaming / Done */}
        {isActive && (
          <div className="space-y-3 animate-fade-in">
            {phase === "streaming" && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full bg-action-primary transition-all duration-150" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="font-mono text-xs text-action-primary shrink-0">{progressPct}%</span>
                <Loader2 size={12} className="text-action-primary animate-spin shrink-0" />
              </div>
            )}

            {phase === "done" && (
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="font-mono text-xs text-emerald-600">Borrador generado — revisa antes de presentar</span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              readOnly
              value={displayedText}
              rows={16}
              className={`w-full rounded-xl bg-surface-1 border px-5 py-4 font-mono text-xs text-slate-700 leading-relaxed resize-none outline-none transition-colors ${
                phase === "streaming"
                  ? "border-action-primary/40 typing-cursor focus:border-action-primary/60"
                  : "border-surface-3"
              }`}
            />

            {phase === "done" && (
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-surface-3 text-sm font-display text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-card"
                >
                  {copied ? <><CheckCircle size={13} className="text-emerald-500" /> ¡Copiado!</> : <><Copy size={13} /> Copiar texto</>}
                </button>

                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-surface-3 text-sm font-display text-slate-400 cursor-not-allowed shadow-card opacity-60"
                  title="Próximamente"
                >
                  <Download size={13} /> Descargar PDF
                </button>

                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-sm font-display text-red-600 hover:bg-red-100 transition-all shadow-card"
                  onClick={() => window.open("https://www.contraloria.gov.co/web/denuncia-ciudadana", "_blank")}
                >
                  <Send size={13} /> Enviar a Contraloría <ExternalLink size={11} className="opacity-60" />
                </button>

                <a
                  href="https://www.anticorrupcion.co/metodologia"
                  target="_blank" rel="noreferrer"
                  className="ml-auto text-[10px] font-mono text-slate-400 hover:text-action-primary transition-colors"
                >
                  metodología VIGÍA ↗
                </a>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs font-mono text-slate-500 leading-relaxed">
            Este borrador es generado por IA con datos públicos SECOP.
            Es una señal estadística —{" "}
            <strong className="text-slate-600">no determina culpabilidad</strong>.
            Verifica con documentos originales antes de presentar ante los órganos de control.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
