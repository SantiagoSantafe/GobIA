"""
VIGÍA — FastAPI Backend (Parquet + SODA fallback)
==================================================
Estrategia:
  1. PRIMARIO:  pandas sobre Parquet en RAM (~1M contratos SECOP real)
               Latencia < 50ms · cargado al startup de uvicorn
  2. FALLBACK:  httpx → SODA API (datos.gov.co) si el Parquet no está disponible

Para tu compañero ML → busca los comentarios "# ← ML:"
Ahí van los outputs de tus modelos de detección de anomalías.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from parquet_store import get_df, load_parquet, row_to_dict
from secop_client import (
    close_client,
    fetch_by_region,
    fetch_contract as soda_fetch_contract,
    fetch_contractor_network as soda_fetch_network,
    get_client,
)

logger = logging.getLogger("vigia.app")
logging.basicConfig(level=logging.INFO)

USE_PARQUET = os.path.exists(
    os.path.expanduser(
        os.getenv("PARQUET_PATH", "~/Downloads/secop2-contratos-new/data/contratos.parquet")
    )
)


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    if USE_PARQUET:
        try:
            load_parquet()
            logger.info("Modo PARQUET activo")
        except Exception as e:
            logger.warning("No se pudo cargar Parquet: %s — usando SODA fallback", e)
    else:
        logger.info("Modo SODA activo (Parquet no encontrado)")
        await get_client()
    yield
    await close_client()


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VIGÍA API",
    version="2.0.0",
    description="Backend VIGÍA — Parquet SECOP real + endpoints ML",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gobia.santiagosantafe.me",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "*",  # quitar en producción
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic ─────────────────────────────────────────────────────────────────

class ComplaintRequest(BaseModel):
    contract_id: str
    score: int
    flags: list[str]
    network_summary: str = ""
    pricing_delta_pct: float = 0.0


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _score_from_row(row: dict) -> dict:
    """
    ← ML: aquí va tu modelo de scoring.
    Recibe los campos del contrato (ya normalizados) y devuelve score + banderas.
    
    Para conectar tu modelo:
      from ml_models import score_contract, detect_flags
      result = score_contract(row)
      return { "score": result["score"], "nivel_riesgo": result["nivel"], "banderas": detect_flags(row) }
    
    Por ahora devuelve None para que el frontend muestre el mock mientras se integra.
    """
    return {
        "score": None,       # ← ML: int 0-100
        "nivel_riesgo": None, # ← ML: "CRÍTICO"|"ALTO"|"MEDIO"|"BAJO"
        "num_banderas": 0,
        "banderas": [],       # ← ML: lista de banderas detectadas
    }


def _contract_row_to_vigia(row: dict) -> dict:
    """Transforma una fila SECOP al shape que espera el dashboard VIGÍA."""
    score_data = _score_from_row(row)
    return {
        # Identificación
        "id":          row.get("id_contrato", ""),
        "estado":      row.get("estado_contrato", ""),
        "modalidad":   row.get("modalidad_de_contratacion", ""),
        "objeto":      row.get("objeto_del_contrato", ""),
        # Entidad
        "entidad": {
            "nombre":      row.get("nombre_entidad", ""),
            "nit":         row.get("nit_entidad", ""),
            "departamento": row.get("departamento", ""),
            "municipio":   row.get("ciudad", ""),
        },
        # Contratista
        "contratista": {
            "nombre":             row.get("proveedor_adjudicado", ""),
            "nit":                row.get("nit_proveedor") or row.get("documento_proveedor", ""),
            "representante_legal": row.get("nombre_representante_legal", ""),
        },
        # Valores
        "valor_contrato": row.get("valor_del_contrato", 0),
        "valor_pagado":   row.get("valor_pagado", 0),
        # Fechas
        "fecha_firma":   row.get("fecha_de_firma", ""),
        "fecha_inicio":  row.get("fecha_inicio", ""),
        "fecha_fin":     row.get("fecha_fin", ""),
        # Categoría
        "categoria_unspsc": row.get("codigo_unspsc", ""),
        # Zona postconflicto
        "espostconflicto": str(row.get("espostconflicto", "No")).lower() in ("sí", "si", "yes", "true", "1"),
        # Score ML (relleno por modelo)
        **score_data,
        # Raw para debugging
        "_raw": row,
    }


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    rows = 0
    if USE_PARQUET:
        try:
            rows = len(get_df())
        except Exception:
            pass
    return {
        "status": "ok",
        "mode": "parquet" if USE_PARQUET else "soda",
        "rows_in_memory": rows,
    }


# ─── 1. Análisis de contrato ──────────────────────────────────────────────────

@app.get("/analyze/contract/{contract_id}")
async def analyze_contract(contract_id: str) -> dict[str, Any]:
    """
    Devuelve el contrato enriquecido con score ML.
    - Parquet (primario) o SODA (fallback)
    - ← ML: _score_from_row() en este archivo
    """
    row: dict | None = None

    if USE_PARQUET:
        try:
            df = get_df()
            mask = df["id_contrato"] == contract_id.strip()
            hits = df[mask]
            if len(hits) > 0:
                row = row_to_dict(hits.iloc[0])
        except Exception as e:
            logger.warning("Parquet query failed: %s", e)

    # Fallback SODA
    if row is None:
        row = await soda_fetch_contract(contract_id)

    if row is None:
        raise HTTPException(404, f"Contrato {contract_id!r} no encontrado")

    return _contract_row_to_vigia(row)


# ─── 2. Feed de alertas (dashboard principal) ─────────────────────────────────

@app.get("/alerts")
async def alerts(
    departamento: str = Query(default=""),
    nivel: str = Query(default=""),
    min_valor: int = Query(default=500_000_000),
    limit: int = Query(default=50),
) -> list[dict[str, Any]]:
    """
    Feed principal rankeado por valor (proxy de riesgo mientras el modelo ML no esté).
    ← ML: reemplazar con get_top_risk_contracts() para rankear por score real.
    """
    if USE_PARQUET:
        try:
            df = get_df()
            mask = df["valor_del_contrato"] >= min_valor
            if departamento:
                mask &= df["departamento"].str.contains(departamento, case=False, na=False)
            result_df = (
                df[mask]
                .sort_values("valor_del_contrato", ascending=False)
                .head(limit)
            )
            rows = [row_to_dict(r) for _, r in result_df.iterrows()]
            return [_alerts_row(r) for r in rows]
        except Exception as e:
            logger.warning("Parquet alerts failed: %s", e)

    # Fallback SODA
    raw = await fetch_by_region(departamento or "Cauca", min_valor)
    return [_alerts_row(r) for r in raw[:limit]]


def _alerts_row(row: dict) -> dict:
    """Shape que espera el AlertCard del dashboard."""
    valor = float(row.get("valor_del_contrato") or 0)
    return {
        "id":                row.get("id_contrato", ""),
        "entidad":           row.get("nombre_entidad", ""),
        "departamento":      row.get("departamento", ""),
        "proveedor":         row.get("proveedor_adjudicado", ""),
        "valor":             valor,
        "modalidad":         row.get("modalidad_de_contratacion", ""),
        "fecha_firma":       row.get("fecha_de_firma", ""),
        "score":             None,    # ← ML rellena
        "nivel":             None,    # ← ML rellena
        "bandera_principal": None,    # ← ML rellena
        "detalle_extra":     row.get("objeto_del_contrato", "")[:120] if row.get("objeto_del_contrato") else "",
        "contract_data":     None,    # carga on-demand via /analyze/contract/:id
    }


# ─── 3. Red del contratista ───────────────────────────────────────────────────

@app.get("/graph/contractor/{nit}")
async def contractor_graph(nit: str) -> dict[str, Any]:
    """
    Construye el grafo de contratos del contratista desde el Parquet.
    Nodos: entidades que le han contratado + el contratista mismo.
    Aristas: relaciones adjudicación con valor y fecha.
    ← ML: añadir detección de fachadas, dirección compartida (RUES).
    """
    contratos: list[dict] = []

    if USE_PARQUET:
        try:
            df = get_df()
            nit_col = next(
                (c for c in ["nit_proveedor", "documento_proveedor"] if c in df.columns), None
            )
            if nit_col:
                mask = df[nit_col].astype(str).str.strip() == nit.strip()
                hits = df[mask].head(500)
                contratos = [row_to_dict(r) for _, r in hits.iterrows()]
        except Exception as e:
            logger.warning("Parquet graph failed: %s", e)

    if not contratos:
        contratos = await soda_fetch_network(nit)

    # Construir grafo desde contratos reales
    entidades: dict[str, dict] = {}
    links = []
    node_id = 1

    proveedor_name = contratos[0].get("proveedor_adjudicado", nit) if contratos else nit

    for c in contratos:
        ent_nit = str(c.get("nit_entidad") or c.get("nombre_entidad", ""))
        ent_name = c.get("nombre_entidad", "Entidad desconocida")
        valor = float(c.get("valor_del_contrato") or 0)

        if ent_nit not in entidades:
            node_id += 1
            entidades[ent_nit] = {
                "id": f"e{node_id}",
                "name": ent_name,
                "tipo": "entidad",
                "nit": ent_nit,
                "ciudad": c.get("ciudad", ""),
                "val": min(6 + valor / 2_000_000_000, 18),
                "color": "#6366f1",
            }
            links.append({
                "source": entidades[ent_nit]["id"],
                "target": "proveedor",
                "tipo": "adjudica",
                "label": f"${valor/1_000_000:.0f}M",
                "valor": valor,
                "color": "#f59e0b",
                "width": min(1.5 + valor / 3_000_000_000, 5),
            })

    nodes = [
        {
            "id": "proveedor",
            "name": proveedor_name,
            "tipo": "adjudicada",
            "nit": nit,
            "val": 14,
            "color": "#f59e0b",
            # ← ML: marcar como fachada si el modelo lo detecta
        },
        *list(entidades.values()),
    ]

    return {
        "nit": nit,
        "proveedor": proveedor_name,
        "total_contratos": len(contratos),
        "nodes": nodes,
        "links": links,
        # ← ML: añadir "empresas_fachada": [...] cuando el modelo lo detecte
    }


# ─── 4. Pricing / Comparativa de mercado ──────────────────────────────────────

@app.get("/analytics/pricing/{unspsc}")
async def pricing_analysis(
    unspsc: str,
    departamento: str = Query(default=""),
) -> dict[str, Any]:
    """
    Estadísticas de precios para un código UNSPSC.
    Calcula mediana, IQR y contratos comparables desde el Parquet real.
    """
    if not USE_PARQUET:
        return {"error": "Parquet no disponible", "unspsc": unspsc}

    try:
        df = get_df()
        unspsc_col = next(
            (c for c in ["codigo_unspsc", "codigo_de_categoria_principal"] if c in df.columns), None
        )
        if not unspsc_col:
            raise HTTPException(500, "Columna UNSPSC no encontrada en Parquet")

        mask = df[unspsc_col].astype(str).str.startswith(unspsc[:4])
        if departamento:
            mask &= df["departamento"].str.contains(departamento, case=False, na=False)

        dv = df[mask].dropna(subset=["valor_del_contrato"])
        dv = dv[dv["valor_del_contrato"] > 0]

        if len(dv) == 0:
            raise HTTPException(404, f"Sin contratos para UNSPSC {unspsc}")

        mediana = float(dv["valor_del_contrato"].median())
        comparables_df = (
            dv.nlargest(8, "valor_del_contrato")[
                [c for c in ["nombre_entidad", "valor_del_contrato", "fecha_de_firma"] if c in dv.columns]
            ]
        )
        comparables = [row_to_dict(r) for _, r in comparables_df.iterrows()]

        return {
            "unspsc": unspsc,
            "n_contratos": len(dv),
            "mediana_mercado": mediana,
            "iqr_min": float(dv["valor_del_contrato"].quantile(0.25)),
            "iqr_max": float(dv["valor_del_contrato"].quantile(0.75)),
            "p95": float(dv["valor_del_contrato"].quantile(0.95)),
            "comparables": comparables,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e)) from e


# ─── 5. Timeline de contratación ──────────────────────────────────────────────

@app.get("/analytics/timeline/{entidad_nit}")
async def timeline(entidad_nit: str) -> dict[str, Any]:
    """
    Serie temporal de contratos de una entidad (por día/semana).
    ← ML: detect_temporal_anomalies() para detectar horarios atípicos.
    """
    if not USE_PARQUET:
        return {"entidad_nit": entidad_nit, "datos": []}

    try:
        df = get_df()
        mask = df.get("nit_entidad", pd.Series(dtype=str)).astype(str) == entidad_nit
        hits = df[mask].copy()

        if "fecha_de_firma" not in hits.columns or len(hits) == 0:
            return {"entidad_nit": entidad_nit, "datos": []}

        hits["_fecha"] = pd.to_datetime(hits["fecha_de_firma"], errors="coerce")
        hits = hits.dropna(subset=["_fecha"])
        daily = hits.groupby(hits["_fecha"].dt.date).size().reset_index()
        daily.columns = ["fecha", "contratos"]

        datos = [
            {
                "fecha": str(r["fecha"]),
                "contratos": int(r["contratos"]),
                "hora_max": None,   # ← ML: detectar hora más tardía del día
                "esAtipico": False,  # ← ML: detect_temporal_anomalies()
            }
            for _, r in daily.iterrows()
        ]
        return {"entidad_nit": entidad_nit, "datos": datos}

    except Exception as e:
        logger.warning("Timeline failed: %s", e)
        return {"entidad_nit": entidad_nit, "datos": []}


# ─── 6. Territorio ────────────────────────────────────────────────────────────

@app.get("/territory/{departamento}")
async def territory(
    departamento: str,
    min_valor: int = Query(default=200_000_000),
    limit: int = Query(default=100),
) -> dict[str, Any]:
    """
    Contratos de un departamento sobre umbral. Incluye stats territoriales.
    """
    if USE_PARQUET:
        try:
            df = get_df()
            mask = (
                df["departamento"].str.contains(departamento, case=False, na=False)
                & (df["valor_del_contrato"] >= min_valor)
            )
            hits = df[mask].sort_values("valor_del_contrato", ascending=False).head(limit)
            contratos = [row_to_dict(r) for _, r in hits.iterrows()]
            total_valor = float(df[mask]["valor_del_contrato"].sum())
            return {
                "departamento": departamento,
                "total_contratos": int(mask.sum()),
                "valor_total": total_valor,
                "contratos": contratos,
            }
        except Exception as e:
            logger.warning("Territory parquet failed: %s", e)

    raw = await fetch_by_region(departamento, min_valor)
    return {"departamento": departamento, "contratos": raw}


# ─── 7. Búsqueda ──────────────────────────────────────────────────────────────

@app.get("/search/contracts")
async def search_contracts(
    q: str = Query(default=""),
    filter: str = Query(default=""),
    limit: int = Query(default=20),
) -> list[dict[str, Any]]:
    """Busca por ID de contrato, entidad o NIT proveedor."""
    if not q:
        return []

    if USE_PARQUET:
        try:
            df = get_df()
            q_lower = q.lower().strip()
            mask = (
                df["id_contrato"].str.lower().str.contains(q_lower, na=False)
                | df["nombre_entidad"].str.lower().str.contains(q_lower, na=False)
                | df.get("proveedor_adjudicado", pd.Series(dtype=str)).str.lower().str.contains(q_lower, na=False)
            )
            hits = df[mask].head(limit)
            return [row_to_dict(r) for _, r in hits.iterrows()]
        except Exception as e:
            logger.warning("Search failed: %s", e)

    result = await soda_fetch_contract(q)
    return [result] if result else []


# ─── 8. Due diligence SARLAFT ─────────────────────────────────────────────────

@app.get("/due-diligence/{nit}")
async def due_diligence(nit: str) -> dict[str, Any]:
    """
    DDQ SARLAFT con historial real de contratos.
    ← ML: check_pep_lists(nit), check_ofac(nit)
    """
    contratos: list[dict] = []

    if USE_PARQUET:
        try:
            df = get_df()
            nit_col = next(
                (c for c in ["nit_proveedor", "documento_proveedor"] if c in df.columns), None
            )
            if nit_col:
                mask = df[nit_col].astype(str).str.strip() == nit.strip()
                contratos = [row_to_dict(r) for _, r in df[mask].iterrows()]
        except Exception as e:
            logger.warning("DDQ parquet failed: %s", e)

    if not contratos:
        contratos = await soda_fetch_network(nit)

    valor_acumulado = sum(float(c.get("valor_del_contrato") or 0) for c in contratos)
    proveedor_name = contratos[0].get("proveedor_adjudicado", nit) if contratos else nit

    return {
        "nit": nit,
        "empresa": proveedor_name,
        "historial_secop": {
            "contratos_previos": len(contratos),
            "valor_acumulado":   valor_acumulado,
            "multas":            0,   # ← integrar SIRI/SECOP multas
        },
        "rep_legal": {
            "nombre":      contratos[0].get("nombre_representante_legal", "") if contratos else "",
            "pep":         None,    # ← ML/SIGEP
            "ofac_match":  None,    # ← OFAC
        },
        "alertas_sarlaft": [],      # ← ML
        "osint": {
            "discrepancia_score": None,  # ← ML
            "hallazgos":          [],
        },
        "fuentes_consultadas": ["SECOP II Parquet — 1M contratos"],
        "fecha_consulta": pd.Timestamp.now().strftime("%d/%m/%Y %H:%M"),
    }


# ─── 9. LLM — Borrador denuncia ───────────────────────────────────────────────

@app.post("/llm/draft-complaint")
async def draft_complaint(req: ComplaintRequest) -> dict[str, Any]:
    """
    ← ML/LLM: generar borrador usando OpenAI/Gemini.
    Conectar a generate_complaint_draft() cuando esté disponible.
    """
    return {
        "draft": "",
        "_note": "LLM pendiente de integración",
    }


# ─── 10. PACO Noticias ────────────────────────────────────────────────────────

@app.get("/paco/news")
async def paco_news(
    municipio: str = Query(default=""),
    departamento: str = Query(default=""),
    limit: int = Query(default=5),
) -> list[dict[str, Any]]:
    """← Requiere acceso PACO o NewsAPI."""
    return []


# ─── 11. OSINT ────────────────────────────────────────────────────────────────

@app.get("/osint/verify-address")
async def osint_verify(nit: str = Query(...)) -> dict[str, Any]:
    """← ML: modelo de verificación geoespacial."""
    return {
        "nit": nit,
        "discrepancia_score": None,
        "hallazgos": [],
    }
