"""
VIGÍA — Parquet Store
=====================
Carga el dataset SECOP (~1M contratos) en RAM una sola vez al arranque
de FastAPI. Todas las queries son pandas en memoria: < 50 ms por request.

Ruta del parquet: configurable via variable PARQUET_PATH.
Default: ~/Downloads/secop2-contratos-new/data/contratos.parquet
"""

from __future__ import annotations

import os
import logging
from typing import Optional

import pandas as pd

logger = logging.getLogger("vigia.parquet_store")

PARQUET_PATH = os.getenv(
    "PARQUET_PATH",
    os.path.expanduser("~/Downloads/secop2-contratos-new/data/contratos.parquet"),
)

# Singleton DataFrame en RAM
_df: Optional[pd.DataFrame] = None

# ─── Mapeo de columnas del Parquet → nombres canónicos VIGÍA ──────────────────
# El Parquet puede usar nombres con espacios ("Nombre Entidad") o
# nombres SODA snake_case ("nombre_entidad"). Este mapa normaliza ambos.
COLUMN_MAP: dict[str, str] = {
    # Parquet display names → VIGÍA canonical
    "Nombre Entidad":                   "nombre_entidad",
    "NIT Entidad":                      "nit_entidad",
    "Departamento":                     "departamento",
    "Ciudad":                           "ciudad",
    "ID Contrato SECOP":                "id_contrato",
    "Referencia del Contrato":          "referencia_contrato",
    "Estado Contrato":                  "estado_contrato",
    "Codigo UNSPSC":                    "codigo_unspsc",
    "Descripcion del Proceso":          "objeto_del_contrato",
    "Tipo de Contrato":                 "tipo_de_contrato",
    "Modalidad de Contratacion":        "modalidad_de_contratacion",
    "Justificacion Modalidad":          "justificacion_modalidad",
    "Fecha de Firma":                   "fecha_de_firma",
    "Fecha Inicio del Contrato":        "fecha_inicio",
    "Fecha Fin del Contrato":           "fecha_fin",
    "Proveedor Adjudicado":             "proveedor_adjudicado",
    "Documento Proveedor":              "documento_proveedor",
    "NIT Proveedor":                    "nit_proveedor",
    "Valor del Contrato":               "valor_del_contrato",
    "Valor Pagado":                     "valor_pagado",
    "Valor Facturado":                  "valor_facturado",
    "Nombre Representante Legal":       "nombre_representante_legal",
    "Es Postconflicto":                 "espostconflicto",
    "Dias Adicionados":                 "dias_adicionados",
    # SODA snake_case (ya en el nombre correcto, se pasan sin cambio)
    "nombre_entidad":                   "nombre_entidad",
    "nit_entidad":                      "nit_entidad",
    "departamento":                     "departamento",
    "id_contrato":                      "id_contrato",
    "modalidad_de_contratacion":        "modalidad_de_contratacion",
    "fecha_de_firma":                   "fecha_de_firma",
    "valor_del_contrato":               "valor_del_contrato",
    "proveedor_adjudicado":             "proveedor_adjudicado",
    "documento_proveedor":              "documento_proveedor",
    "nit_proveedor":                    "nit_proveedor",
    "nombre_representante_legal":       "nombre_representante_legal",
    "objeto_del_contrato":              "objeto_del_contrato",
    "estado_contrato":                  "estado_contrato",
    "espostconflicto":                  "espostconflicto",
    "codigo_de_categoria_principal":    "codigo_unspsc",
}


def load_parquet() -> pd.DataFrame:
    """Carga el Parquet en RAM y normaliza columnas. Llamar una sola vez al startup."""
    global _df
    if not os.path.exists(PARQUET_PATH):
        raise FileNotFoundError(
            f"Parquet no encontrado en {PARQUET_PATH}\n"
            f"Configura la variable PARQUET_PATH en el .env"
        )

    logger.info("Cargando Parquet desde %s …", PARQUET_PATH)
    raw = pd.read_parquet(PARQUET_PATH)
    logger.info("  %d contratos, %d columnas cargados", len(raw), len(raw.columns))

    # Normalizar nombres de columna usando el mapa
    rename = {c: COLUMN_MAP[c] for c in raw.columns if c in COLUMN_MAP}
    _df = raw.rename(columns=rename)

    # Asegurar tipos numéricos en columnas clave
    for col in ["valor_del_contrato", "valor_pagado", "valor_facturado"]:
        if col in _df.columns:
            _df[col] = pd.to_numeric(_df[col], errors="coerce").fillna(0)

    # Estandarizar id_contrato como string sin espacios
    if "id_contrato" in _df.columns:
        _df["id_contrato"] = _df["id_contrato"].astype(str).str.strip()

    logger.info("Parquet listo. Columnas canónicas: %s", list(_df.columns[:10]))
    return _df


def get_df() -> pd.DataFrame:
    """Devuelve el DataFrame cargado. Lanza error si no se llamó load_parquet()."""
    if _df is None:
        raise RuntimeError("DataFrame no inicializado. Llama load_parquet() en el startup.")
    return _df


def row_to_dict(row: pd.Series) -> dict:
    """Convierte una fila de pandas a dict serializable (maneja NaN, Timestamp)."""
    d = {}
    for k, v in row.items():
        if pd.isna(v):
            d[k] = None
        elif hasattr(v, "isoformat"):
            d[k] = v.isoformat()
        elif isinstance(v, (int, float)):
            d[k] = float(v) if isinstance(v, float) else int(v)
        else:
            d[k] = str(v)
    return d
