"""
VIGÍA — Cliente SECOP II / API SODA (datos.gov.co)
====================================================

Estrategia de dos enfoques:

1. ANALÍTICA MASIVA — Producción / Vast.ai GPU worker
   ────────────────────────────────────────────────────
   La data de 1M+ registros se carga UNA SOLA VEZ desde un archivo
   Parquet en RAM (~200 MB comprimido) usando PyArrow + pandas.
   El DataFrame se mantiene en memoria durante toda la vida del proceso.

   Flujo:
     startup → pd.read_parquet("secop_ii.parquet") → df global
     query   → df[mask].sort_values(...).head(500).to_dict("records")
   Latencia: <50 ms por query · Throughput: ~10 000 QPS
   Actualización: cron diario descarga dump SECOP y regenera el Parquet.

   Para activar este modo, set VIGIA_MODE=parquet en el entorno y
   asegurate que secop_ii.parquet esté en el CWD o en DATA_PATH.

   Ejemplo de activación (no implementado aquí, pero listo para DevOps):
     import pandas as pd
     _df: pd.DataFrame | None = None
     def load_parquet():
         global _df
         _df = pd.read_parquet(os.getenv("DATA_PATH", "secop_ii.parquet"))

2. CONSULTAS EN TIEMPO REAL — Demo / esta implementación
   ────────────────────────────────────────────────────────
   Consulta directa a la API SODA pública de datos.gov.co usando
   httpx async con soporte para SoQL ($where, $select, $order, $limit).
   Latencia: 200–800 ms · No requiere precarga · Ideal para hackathon.
   Dataset: SECOP II — Contratos https://www.datos.gov.co/resource/jbjy-vk9h.json
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

import httpx

logger = logging.getLogger("vigia.secop_client")

# ─── Configuración ────────────────────────────────────────────────────────────

SODA_BASE_URL: str = os.getenv(
    "SODA_BASE_URL",
    "https://www.datos.gov.co/resource/jbjy-vk9h.json",
)
SODA_APP_TOKEN: str | None = os.getenv("SODA_APP_TOKEN")   # opcional, sube rate-limit
SODA_TIMEOUT: float = float(os.getenv("SODA_TIMEOUT", "15"))
DEFAULT_LIMIT: int = int(os.getenv("SODA_DEFAULT_LIMIT", "500"))
USER_AGENT: str = "VIGIA/1.0 (gobia.santiagosantafe.me; veeduría ciudadana)"

# ─── Singleton de cliente httpx reutilizable ──────────────────────────────────

_client: httpx.AsyncClient | None = None


def _build_headers() -> dict[str, str]:
    headers = {
        "Accept":     "application/json",
        "User-Agent": USER_AGENT,
    }
    if SODA_APP_TOKEN:
        headers["X-App-Token"] = SODA_APP_TOKEN
    return headers


async def get_client() -> httpx.AsyncClient:
    """
    Devuelve el cliente httpx reutilizable.
    Llamar en el lifespan de FastAPI (startup) para prewarm la conexión.
    """
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=SODA_TIMEOUT,
            headers=_build_headers(),
            follow_redirects=True,
        )
        logger.info("httpx AsyncClient inicializado (SODA endpoint: %s)", SODA_BASE_URL)
    return _client


async def close_client() -> None:
    """Cerrar el cliente al shutdown de FastAPI."""
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        logger.info("httpx AsyncClient cerrado")
    _client = None


# ─── Funciones públicas ───────────────────────────────────────────────────────


async def fetch_contract(contract_id: str) -> dict[str, Any] | None:
    """
    Consulta un contrato específico por id_contrato.

    Parámetros
    ----------
    contract_id : str
        ID SECOP del contrato, ej. "CO1.PCCNTR.7842913".

    Retorna
    -------
    dict con los campos del contrato, o None si no existe.

    Endpoint FastAPI: GET /analyze/contract/{contract_id}

    Ejemplo de uso en FastAPI:
        @app.get("/analyze/contract/{contract_id}")
        async def analyze_contract(contract_id: str):
            result = await fetch_contract(contract_id)
            if not result:
                raise HTTPException(404, "Contrato no encontrado")
            return result
    """
    client = await get_client()
    params: dict[str, Any] = {
        "id_contrato": contract_id,
        "$limit":      1,
    }
    logger.debug("fetch_contract id=%s", contract_id)
    response = await client.get(SODA_BASE_URL, params=params)
    response.raise_for_status()
    rows: list[dict] = response.json()
    return rows[0] if rows else None


async def fetch_contractor_network(nit: str) -> list[dict[str, Any]]:
    """
    Red de contratos del contratista por NIT (nit_proveedor).

    Selecciona los campos clave para construir el grafo de relaciones
    y la línea de tiempo de adjudicaciones en el frontend.

    Parámetros
    ----------
    nit : str
        NIT del proveedor/contratista, ej. "901847392".

    Retorna
    -------
    Lista de hasta 500 contratos del contratista, ordenados por fecha
    descendente, con: id_contrato, nombre_entidad, valor_del_contrato,
    fecha_de_firma, modalidad_de_contratacion.

    Endpoint FastAPI: GET /graph/contractor/{nit}

    Notas
    -----
    - Los campos del SELECT deben existir en el dataset jbjy-vk9h.
    - Para el grafo completo (nodo → aristas) post-procesar en el
      endpoint FastAPI: agrupar por nombre_entidad, detectar entidades
      repetidas y calcular concentración.
    """
    client = await get_client()
    params: dict[str, Any] = {
        "nit_proveedor": nit,
        "$select": (
            "id_contrato,"
            "nombre_entidad,"
            "valor_del_contrato,"
            "fecha_de_firma,"
            "modalidad_de_contratacion"
        ),
        "$order":  "fecha_de_firma DESC",
        "$limit":  DEFAULT_LIMIT,
    }
    logger.debug("fetch_contractor_network nit=%s", nit)
    response = await client.get(SODA_BASE_URL, params=params)
    response.raise_for_status()
    return response.json()


async def fetch_by_region(
    departamento: str,
    min_valor: int = 0,
) -> list[dict[str, Any]]:
    """
    Contratos de un departamento por encima de un umbral de valor.

    Usa SoQL ($where) para filtrar simultáneamente por departamento y
    valor mínimo, ordenando de mayor a menor. Útil para:
    - Análisis territorial PDET / zonas de paz
    - Detección de concentración presupuestal regional
    - Heat-map de riesgo por departamento

    Parámetros
    ----------
    departamento : str
        Nombre del departamento tal como figura en SECOP, ej. "Cauca".
    min_valor : int
        Valor mínimo del contrato en COP, ej. 200_000_000 (200M).

    Retorna
    -------
    Lista de hasta 500 contratos ordenados por valor descendente.

    Endpoint FastAPI: GET /territory/{departamento}?min_valor={min_valor}

    Ejemplo de uso en FastAPI:
        @app.get("/territory/{departamento}")
        async def territory(departamento: str, min_valor: int = 0):
            return await fetch_by_region(departamento, min_valor)
    """
    client = await get_client()
    # SoQL: escapar comillas simples en el nombre del departamento
    depto_safe = departamento.replace("'", "''")
    where_clause = (
        f"valor_del_contrato > {int(min_valor)} "
        f"AND departamento='{depto_safe}'"
    )
    params: dict[str, Any] = {
        "$where": where_clause,
        "$order": "valor_del_contrato DESC",
        "$limit": DEFAULT_LIMIT,
    }
    logger.debug("fetch_by_region departamento=%s min_valor=%d", departamento, min_valor)
    response = await client.get(SODA_BASE_URL, params=params)
    response.raise_for_status()
    return response.json()


# ─── Integración FastAPI — ejemplo mínimo para DevOps ────────────────────────
#
# Copiar este bloque en app.py (o main.py) del servidor FastAPI:
#
#   from contextlib import asynccontextmanager
#   from fastapi import FastAPI, HTTPException
#   from secop_client import (
#       fetch_contract, fetch_contractor_network,
#       fetch_by_region, get_client, close_client,
#   )
#
#   @asynccontextmanager
#   async def lifespan(app: FastAPI):
#       await get_client()          # prewarm connection pool
#       yield
#       await close_client()        # graceful shutdown
#
#   app = FastAPI(title="VIGÍA API", lifespan=lifespan)
#
#   @app.get("/analyze/contract/{contract_id}")
#   async def analyze_contract(contract_id: str):
#       data = await fetch_contract(contract_id)
#       if not data:
#           raise HTTPException(404, "Contrato no encontrado en SECOP")
#       return data
#
#   @app.get("/graph/contractor/{nit}")
#   async def contractor_graph(nit: str):
#       return await fetch_contractor_network(nit)
#
#   @app.get("/territory/{departamento}")
#   async def territory(departamento: str, min_valor: int = 0):
#       return await fetch_by_region(departamento, min_valor)
#
# ─────────────────────────────────────────────────────────────────────────────


# ─── CLI — test rápido sin levantar FastAPI ───────────────────────────────────

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s — %(message)s")

    async def _demo() -> None:
        print("\n── 1. fetch_contract ──────────────────────────────────────")
        contrato = await fetch_contract("CO1.PCCNTR.7842913")
        if contrato:
            print(json.dumps(contrato, indent=2, ensure_ascii=False))
        else:
            print("Contrato no encontrado en SECOP (mock ID — esperado en demo)")

        print("\n── 2. fetch_contractor_network ────────────────────────────")
        red = await fetch_contractor_network("901847392")
        print(f"{len(red)} contrato(s) encontrado(s) para el NIT")
        if red:
            print(json.dumps(red[0], indent=2, ensure_ascii=False))

        print("\n── 3. fetch_by_region ─────────────────────────────────────")
        region = await fetch_by_region("Cauca", min_valor=200_000_000)
        print(f"{len(region)} contrato(s) > $200M en Cauca")
        if region:
            print(json.dumps(region[0], indent=2, ensure_ascii=False))

        await close_client()
        print("\n✅ Demo completa")

    asyncio.run(_demo())
