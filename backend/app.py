"""
VIGÍA — FastAPI Backend
=======================
Punto de entrada principal. Expone todos los endpoints que consume
el dashboard React en gobia.santiagosantafe.me.

Arquitectura:
  - /analyze/contract/:id  → SECOP SODA + modelo ML (TODO)
  - /graph/contractor/:nit → análisis de red RUES + SECOP (TODO ML)
  - /analytics/pricing/:unspsc → estadísticas de mercado (TODO ML)
  - /analytics/timeline/:nit → línea de tiempo contratación
  - /due-diligence/:nit    → DDQ SARLAFT (TODO PEP/OFAC)
  - /paco/news             → noticias territoriales (TODO PACO)
  - /osint/verify-address  → verificación geoespacial (TODO ML)
  - /llm/draft-complaint   → borrador denuncia (TODO LLM)
  - /alerts                → feed de alertas del dashboard

Para tu compañero ML:
  Busca todos los comentarios marcados con "# ← ML:" — ahí van
  los outputs de los modelos. El resto ya está conectado a SECOP.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from secop_client import (
    close_client,
    fetch_by_region,
    fetch_contract,
    fetch_contractor_network,
    get_client,
)

# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_client()          # prewarm httpx connection pool
    yield
    await close_client()


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VIGÍA API",
    version="1.0.0",
    description="Backend para el dashboard de veeduría ciudadana VIGÍA",
    lifespan=lifespan,
)

# CORS — permite que el dashboard React en gobia.santiagosantafe.me llame a esta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gobia.santiagosantafe.me",
        "http://localhost:5173",   # desarrollo local
        "http://localhost:4173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Modelos Pydantic ─────────────────────────────────────────────────────────

class ComplaintRequest(BaseModel):
    contract_id: str
    score: int
    flags: list[str]
    network_summary: str = ""
    pricing_delta_pct: float = 0.0


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "vigia-api"}


# ─── 1. Análisis de contrato ──────────────────────────────────────────────────

@app.get("/analyze/contract/{contract_id}")
async def analyze_contract(contract_id: str) -> dict[str, Any]:
    """
    Devuelve el análisis completo de un contrato:
    - Datos crudos de SECOP II (ya funciona)
    - Score de riesgo VIGÍA  ← ML: agregar aquí
    - Banderas detectadas    ← ML: agregar aquí
    """
    # 1. Datos de SECOP (ya funciona)
    raw = await fetch_contract(contract_id)
    if not raw:
        raise HTTPException(404, f"Contrato {contract_id} no encontrado en SECOP")

    # 2. ← ML: calcular score y banderas
    # TODO: llamar al modelo de detección de anomalías
    # Ejemplo de integración:
    #
    #   from ml_models import score_contract, detect_flags
    #   score_result = score_contract(raw)
    #   flags = detect_flags(raw)
    #
    #   return {
    #       **raw,
    #       "score": score_result["score"],
    #       "nivel_riesgo": score_result["nivel"],
    #       "num_banderas": len(flags),
    #       "banderas": flags,
    #   }

    # Por ahora devuelve los datos crudos de SECOP sin score
    return {
        **raw,
        "score": None,       # ← ML rellena esto
        "banderas": [],      # ← ML rellena esto
        "_note": "score pendiente de modelo ML",
    }


# ─── 2. Red del contratista (grafo) ───────────────────────────────────────────

@app.get("/graph/contractor/{nit}")
async def contractor_graph(nit: str) -> dict[str, Any]:
    """
    Red de contratos y relaciones del contratista.
    - Contratos SECOP (ya funciona)
    - Detección de nodos fachada  ← ML: agregar aquí
    - Aristas por dirección/rep. legal compartido ← ML: agregar aquí
    """
    # 1. Historial de contratos en SECOP (ya funciona)
    contratos = await fetch_contractor_network(nit)

    # 2. ← ML: construir grafo de relaciones RUES + detección fachadas
    # TODO: llamar al módulo de análisis de red
    # Ejemplo:
    #   from ml_models import build_network_graph
    #   graph = build_network_graph(nit, contratos)
    #   return graph  # { nodes: [...], links: [...] }

    # Por ahora devuelve lista plana de contratos
    return {
        "nit": nit,
        "contratos": contratos,
        "nodes": [],    # ← ML construye el grafo
        "links": [],
        "_note": "grafo pendiente de modelo ML",
    }


# ─── 3. Análisis de precios / sobrecosto ──────────────────────────────────────

@app.get("/analytics/pricing/{unspsc}")
async def pricing_analysis(
    unspsc: str,
    departamento: str = Query(default=""),
) -> dict[str, Any]:
    """
    Comparativa de precios para un código UNSPSC.
    ← ML: el modelo calcula mediana, IQR y detecta sobrecosto
    """
    # 1. Contratos del mismo UNSPSC en SECOP (datos crudos)
    # Por ahora filtra por región si se pasa departamento
    comparables = []
    if departamento:
        comparables = await fetch_by_region(departamento, min_valor=0)

    # 2. ← ML: estadísticas de precios
    # TODO:
    #   from ml_models import calculate_pricing_stats
    #   stats = calculate_pricing_stats(unspsc, comparables)
    #   return stats

    return {
        "unspsc": unspsc,
        "comparables": comparables[:20],
        "mediana_mercado": None,   # ← ML calcula
        "iqr_min": None,
        "iqr_max": None,
        "_note": "estadísticas de precio pendientes de modelo ML",
    }


# ─── 4. Timeline de contratación ──────────────────────────────────────────────

@app.get("/analytics/timeline/{entidad_nit}")
async def timeline(entidad_nit: str) -> dict[str, Any]:
    """
    Línea de tiempo de contratos de una entidad.
    ← ML: detectar anomalías temporales (horarios atípicos, picos)
    """
    # TODO: fetch contratos por entidad y construir serie temporal
    # raw_contracts = await fetch_contracts_by_entity(entidad_nit)
    # from ml_models import build_timeline, detect_temporal_anomalies
    # timeline = build_timeline(raw_contracts)
    # anomalies = detect_temporal_anomalies(timeline)
    # return { "datos": timeline, "anomalia": anomalies }

    return {
        "entidad_nit": entidad_nit,
        "datos": [],
        "_note": "timeline pendiente de integración ML",
    }


# ─── 5. Debida diligencia SARLAFT ─────────────────────────────────────────────

@app.get("/due-diligence/{nit}")
async def due_diligence(nit: str) -> dict[str, Any]:
    """
    Ficha DDQ SARLAFT del contratista.
    - Datos SECOP (ya funciona)
    - PEP/OFAC match ← ML/externo: agregar aquí
    - Cultivos ilícitos UNODC ← datos territoriales
    """
    # 1. Historial SECOP del NIT
    contratos = await fetch_contractor_network(nit)

    # 2. ← ML / integración externa: cruce con listas
    # TODO:
    #   from ml_models import check_pep_lists, check_ofac
    #   from territory_client import get_territorial_context
    #   pep = check_pep_lists(nit)
    #   ofac = check_ofac(nit)
    #   territorio = get_territorial_context(municipio)

    return {
        "nit": nit,
        "historial_secop": {
            "contratos_previos": len(contratos),
            "valor_acumulado": sum(
                float(c.get("valor_del_contrato", 0) or 0)
                for c in contratos
            ),
        },
        "rep_legal": {
            "pep": None,          # ← ML/SIGEP rellena
            "ofac_match": None,   # ← OFAC rellena
        },
        "alertas_sarlaft": [],    # ← ML rellena
        "osint": {
            "discrepancia_score": None,  # ← ML rellena
        },
        "_note": "DDQ parcial — PEP/OFAC pendientes de integración",
    }


# ─── 6. Noticias PACO ─────────────────────────────────────────────────────────

@app.get("/paco/news")
async def paco_news(
    municipio: str = Query(default=""),
    departamento: str = Query(default=""),
    limit: int = Query(default=5),
) -> list[dict[str, Any]]:
    """
    Noticias del Portal Anticorrupción (PACO) relacionadas con el municipio.
    ← Requiere acceso a base de datos PACO o integración NewsAPI
    """
    # TODO: conectar a base de datos PACO o NewsAPI
    # from paco_client import fetch_news
    # return await fetch_news(municipio=municipio, departamento=departamento, limit=limit)

    return []   # ← equipo PACO rellena


# ─── 7. Verificación OSINT ────────────────────────────────────────────────────

@app.get("/osint/verify-address")
async def osint_verify(nit: str = Query(...)) -> dict[str, Any]:
    """
    Verificación geoespacial SARLAFT del domicilio comercial.
    ← ML: modelo de discrepancia física (RUES vs Google Maps/IGAC)
    """
    # TODO:
    #   from ml_models import verify_address_osint
    #   from rues_client import fetch_company_address
    #   address = await fetch_company_address(nit)
    #   result = verify_address_osint(address)
    #   return result

    return {
        "nit": nit,
        "discrepancia_score": None,   # ← ML rellena (0.0–1.0)
        "hallazgos": [],              # ← ML rellena
        "_note": "OSINT pendiente de modelo ML",
    }


# ─── 8. Generación de denuncia (LLM) ──────────────────────────────────────────

@app.post("/llm/draft-complaint")
async def draft_complaint(req: ComplaintRequest) -> dict[str, Any]:
    """
    Genera borrador de denuncia formal usando LLM.
    ← Requiere API key de OpenAI/Gemini y prompt engineering
    """
    # TODO:
    #   from llm_client import generate_complaint_draft
    #   draft = await generate_complaint_draft(
    #       contract_id=req.contract_id,
    #       score=req.score,
    #       flags=req.flags,
    #       network_summary=req.network_summary,
    #       pricing_delta=req.pricing_delta_pct,
    #   )
    #   return { "draft": draft }

    return {
        "draft": "",
        "_note": "LLM pendiente de integración (OpenAI/Gemini + prompt)",
    }


# ─── 9. Feed de alertas (dashboard principal) ─────────────────────────────────

@app.get("/alerts")
async def alerts(
    departamento: str = Query(default=""),
    nivel: str = Query(default=""),
    limit: int = Query(default=50),
) -> list[dict[str, Any]]:
    """
    Feed principal del dashboard — contratos con score más alto.
    ← ML: el modelo analiza y devuelve contratos ya rankeados por riesgo
    """
    # TODO:
    #   from ml_models import get_top_risk_contracts
    #   return await get_top_risk_contracts(
    #       departamento=departamento, nivel=nivel, limit=limit
    #   )

    # Por ahora consulta SECOP por valor alto como proxy de riesgo
    min_valor = 500_000_000
    contratos = await fetch_by_region(departamento or "Cauca", min_valor)
    return contratos[:limit]


# ─── 10. Búsqueda de contratos ────────────────────────────────────────────────

@app.get("/search/contracts")
async def search_contracts(
    q: str = Query(default=""),
    filter: str = Query(default=""),
    limit: int = Query(default=20),
) -> list[dict[str, Any]]:
    """
    Búsqueda por ID de contrato, nombre de entidad o municipio.
    """
    if not q:
        return []
    result = await fetch_contract(q)
    return [result] if result else []


# ─── Territorio ───────────────────────────────────────────────────────────────

@app.get("/territory/{departamento}")
async def territory(
    departamento: str,
    min_valor: int = Query(default=200_000_000),
) -> list[dict[str, Any]]:
    """
    Contratos de un departamento PDET sobre un umbral de valor.
    """
    return await fetch_by_region(departamento, min_valor)
