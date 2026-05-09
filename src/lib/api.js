/**
 * VIGÍA — API Client
 * Todos los calls al backend FastAPI pasan por aquí.
 * Si la API no responde, cada función hace fallback al mock data.
 *
 * Config: VITE_API_URL en .env
 * Default: https://gobia.santiagosantafe.me/api
 */

import MOCK_CONTRACT, {
  MOCK_ALERTS,
  BANDERAS_OCDS,
  PACO_NOTICIAS,
  DUE_DILIGENCE,
} from "../data/mockContract";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://gobia.santiagosantafe.me/api";
const TIMEOUT_MS = 8000;

// ─── Fetch helper con timeout ─────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ─── Merge datos reales con mock (campos que la API aún no devuelve) ──────────
/**
 * La API devuelve los campos SECOP reales.
 * Para los campos que el modelo ML aún no calcula (score, banderas, grafo, pricing)
 * mantenemos los mocks hasta que el endpoint los rellene.
 */
function mergeWithMock(apiData, mockData) {
  if (!apiData) return mockData;
  return {
    ...mockData,        // base: todos los campos del mock
    ...apiData,         // sobreescribe con datos reales de SECOP
    // Entidad: preferir API si tiene datos
    entidad: {
      ...mockData.entidad,
      ...(apiData.entidad ?? {}),
    },
    // Contratista: preferir API
    contratista: {
      ...mockData.contratista,
      ...(apiData.contratista ?? {}),
    },
    // Score y banderas: usar API si ya tiene ML, sino mock
    score:         apiData.score         ?? mockData.score,
    nivel_riesgo:  apiData.nivel_riesgo  ?? mockData.nivel_riesgo,
    num_banderas:  apiData.num_banderas  ?? mockData.num_banderas,
    banderas:      apiData.banderas?.length ? apiData.banderas : mockData.banderas,
    // Grafo: usar API si ya tiene nodos, sino mock
    network:  apiData.nodes?.length
                ? { nodes: apiData.nodes, links: apiData.links }
                : mockData.network,
    // Pricing: usar API si tiene mediana, sino mock
    pricing: apiData.mediana_mercado
                ? {
                    ...mockData.pricing,
                    mediana_mercado: apiData.mediana_mercado,
                    iqr_min:         apiData.iqr_min,
                    iqr_max:         apiData.iqr_max,
                    comparables:     apiData.comparables?.length
                                       ? apiData.comparables.map((c, i) => ({
                                           id:            c.id_contrato ?? `REF-${i+1}`,
                                           entidad:       c.nombre_entidad ?? "Entidad",
                                           valor:         parseFloat(c.valor_del_contrato ?? 0),
                                           año:           new Date(c.fecha_de_firma ?? "2025").getFullYear(),
                                         }))
                                       : mockData.pricing.comparables,
                  }
                : mockData.pricing,
  };
}

// ─── Merge feed de alertas ────────────────────────────────────────────────────
function mergeAlerts(apiAlerts) {
  if (!apiAlerts?.length) return MOCK_ALERTS;
  return apiAlerts.map((a, i) => ({
    // Base: campos del mock para los que la API aún no tiene ML
    ...MOCK_ALERTS[i % MOCK_ALERTS.length],
    // Campos reales de SECOP
    id:             a.id_contrato ?? a.id ?? MOCK_ALERTS[0].id,
    entidad:        a.nombre_entidad ?? a.entidad ?? "",
    departamento:   a.departamento ?? "",
    proveedor:      a.proveedor_adjudicado ?? a.proveedor ?? "",
    valor:          parseFloat(a.valor_del_contrato ?? a.valor ?? 0),
    modalidad:      a.modalidad_de_contratacion ?? a.modalidad ?? "",
    fecha_firma:    a.fecha_de_firma ?? a.fecha_firma ?? "",
    detalle_extra:  a.objeto_del_contrato ?? a.detalle_extra ?? "",
    // Score: usar API si tiene ML, sino mantener mock
    score:           a.score ?? null,
    nivel:           a.nivel ?? null,
    bandera_principal: a.bandera_principal ?? null,
    contract_data:   null, // se carga on-demand
  }));
}

// ─── Endpoints públicos ───────────────────────────────────────────────────────

/**
 * Obtiene y enriquece un contrato por ID.
 * Mezcla datos reales de SECOP con mocks donde la API aún no tiene ML.
 */
export async function fetchContract(contractId) {
  try {
    const real = await apiFetch(`/analyze/contract/${encodeURIComponent(contractId)}`);
    return mergeWithMock(real, MOCK_CONTRACT);
  } catch (err) {
    console.warn("[VIGÍA] fetchContract fallback to mock:", err.message);
    return MOCK_CONTRACT;
  }
}

/**
 * Feed de alertas rankeadas.
 * Mezcla datos reales con scores mock hasta que ML esté listo.
 */
export async function fetchAlerts({ departamento = "", minValor = 500_000_000, limit = 50 } = {}) {
  try {
    const params = new URLSearchParams({ min_valor: minValor, limit });
    if (departamento) params.set("departamento", departamento);
    const real = await apiFetch(`/alerts?${params}`);
    return mergeAlerts(real);
  } catch (err) {
    console.warn("[VIGÍA] fetchAlerts fallback to mock:", err.message);
    return MOCK_ALERTS;
  }
}

/**
 * Red de contratos del contratista (grafo).
 */
export async function fetchContractorGraph(nit) {
  try {
    const real = await apiFetch(`/graph/contractor/${encodeURIComponent(nit)}`);
    if (real?.nodes?.length) {
      return { nodes: real.nodes, links: real.links };
    }
    return MOCK_CONTRACT.network;
  } catch (err) {
    console.warn("[VIGÍA] fetchContractorGraph fallback to mock:", err.message);
    return MOCK_CONTRACT.network;
  }
}

/**
 * Comparativa de precios por UNSPSC.
 */
export async function fetchPricing(unspsc, departamento = "") {
  try {
    const params = departamento ? `?departamento=${departamento}` : "";
    const real = await apiFetch(`/analytics/pricing/${unspsc}${params}`);
    return mergeWithMock({ mediana_mercado: real.mediana_mercado, ...real }, MOCK_CONTRACT).pricing;
  } catch (err) {
    console.warn("[VIGÍA] fetchPricing fallback to mock:", err.message);
    return MOCK_CONTRACT.pricing;
  }
}

/**
 * Búsqueda de contratos por texto.
 */
export async function searchContracts(query) {
  try {
    return await apiFetch(`/search/contracts?q=${encodeURIComponent(query)}`);
  } catch (err) {
    console.warn("[VIGÍA] searchContracts failed:", err.message);
    return [];
  }
}

/**
 * Due diligence SARLAFT del contratista.
 */
export async function fetchDueDiligence(nit) {
  try {
    const real = await apiFetch(`/due-diligence/${encodeURIComponent(nit)}`);
    return { ...DUE_DILIGENCE, ...real };
  } catch (err) {
    console.warn("[VIGÍA] fetchDueDiligence fallback to mock:", err.message);
    return DUE_DILIGENCE;
  }
}

/**
 * Genera borrador de denuncia (LLM).
 */
export async function generateComplaint(contractId, score, flags) {
  try {
    const res = await apiFetch("/llm/draft-complaint", {
      method: "POST",
      body: JSON.stringify({ contract_id: contractId, score, flags }),
    });
    return res.draft ?? null;
  } catch (err) {
    console.warn("[VIGÍA] generateComplaint fallback to mock draft:", err.message);
    return null; // LLMActionPanel usa MOCK_DRAFT_DENUNCIA cuando es null
  }
}
