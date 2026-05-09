# VIGÍA — Backend API

Cliente SECOP II + FastAPI para el dashboard de veeduría ciudadana.

## Instalación rápida

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux / Mac
# .venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

## Variables de entorno

Crea un archivo `.env` en `backend/`:

```env
# URL del dataset SECOP II en datos.gov.co (no cambiar salvo migración)
SODA_BASE_URL=https://www.datos.gov.co/resource/jbjy-vk9h.json

# App Token de Socrata (opcional — sube el rate-limit de 1000 a 100 000 req/hora)
# Solicitar gratis en: https://data.socrata.com/profile/edit/developer_settings
SODA_APP_TOKEN=

# Timeout en segundos para cada llamada SODA
SODA_TIMEOUT=15

# Límite por defecto de resultados por query
SODA_DEFAULT_LIMIT=500

# Ruta al archivo Parquet para el modo analítica masiva (Vast.ai)
DATA_PATH=secop_ii.parquet
```

## Test CLI rápido

```bash
python secop_client.py
```

Ejecuta las 3 funciones en secuencia contra la API SODA real y muestra el primer resultado de cada una.

## Estructura del cliente

| Función | Parámetros | Descripción |
|---|---|---|
| `fetch_contract(contract_id)` | ID SECOP | Contrato específico por `id_contrato` |
| `fetch_contractor_network(nit)` | NIT proveedor | Red de contratos del contratista |
| `fetch_by_region(departamento, min_valor)` | Nombre depto + valor mínimo COP | Contratos por región sobre umbral |

## Integración con FastAPI

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from secop_client import (
    fetch_contract, fetch_contractor_network,
    fetch_by_region, get_client, close_client,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_client()      # prewarm connection pool al arranque
    yield
    await close_client()    # graceful shutdown

app = FastAPI(title="VIGÍA API", version="1.0.0", lifespan=lifespan)

@app.get("/analyze/contract/{contract_id}")
async def analyze_contract(contract_id: str):
    data = await fetch_contract(contract_id)
    if not data:
        raise HTTPException(404, "Contrato no encontrado en SECOP")
    return data

@app.get("/graph/contractor/{nit}")
async def contractor_graph(nit: str):
    return await fetch_contractor_network(nit)

@app.get("/territory/{departamento}")
async def territory(departamento: str, min_valor: int = 0):
    return await fetch_by_region(departamento, min_valor)
```

Correr el servidor:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## Estrategia de dos enfoques

### 1. Tiempo real — SODA API (esta implementación)

```
Browser → React → FastAPI → httpx → datos.gov.co/SODA
```

- Sin precarga, consulta directa a la API pública
- Latencia: 200–800 ms por query
- Ideal para demo, hackathon y datos frescos
- Rate limit: 1 000 req/hora sin token, 100 000 con `SODA_APP_TOKEN`

### 2. Analítica masiva — Parquet en RAM (Vast.ai, producción)

```
Cron diario → descarga dump SECOP → genera secop_ii.parquet
FastAPI startup → pd.read_parquet() → DataFrame en RAM
Browser → React → FastAPI → pandas filter → response
```

- Latencia: < 50 ms por query
- Throughput: ~ 10 000 QPS
- Requiere ~ 200 MB RAM para 1M+ registros comprimidos
- Activar con: `VIGIA_MODE=parquet` y `DATA_PATH=secop_ii.parquet`

```python
# Ejemplo de activación Parquet (agregar a app.py):
import os
import pandas as pd

_df: pd.DataFrame | None = None

def load_parquet():
    global _df
    path = os.getenv("DATA_PATH", "secop_ii.parquet")
    _df = pd.read_parquet(path)

# En lifespan FastAPI:
# if os.getenv("VIGIA_MODE") == "parquet":
#     load_parquet()
```

## Endpoints esperados por el frontend

| Método | Ruta | Función cliente | Descripción |
|---|---|---|---|
| GET | `/analyze/contract/:id` | `fetch_contract` | Análisis completo de contrato |
| GET | `/graph/contractor/:nit` | `fetch_contractor_network` | Red de contratos del contratista |
| GET | `/territory/:departamento` | `fetch_by_region` | Contratos por región |
| GET | `/analytics/pricing/:unspsc` | (pendiente) | Comparativa de precios por categoría |
| GET | `/analytics/timeline/:entidad_nit` | (pendiente) | Línea de tiempo de contratación |
| POST | `/llm/draft-complaint` | (pendiente) | Generación de denuncia con LLM |
| GET | `/osint/verify-address` | (pendiente) | Verificación geoespacial SARLAFT |
| GET | `/due-diligence/:nit` | (pendiente) | Ficha DDQ SARLAFT completa |

## Notas para DevOps

1. El archivo `secop_client.py` es autónomo — no tiene dependencias internas.
2. El cliente httpx es un singleton reutilizable; no crear una instancia por request.
3. Para alta disponibilidad, usar `uvicorn --workers 4` (el cliente httpx es thread-safe con asyncio).
4. En producción, agregar CORS en FastAPI para permitir `https://gobia.santiagosantafe.me`.
5. Los tokens SODA no son obligatorios pero se recomiendan encarecidamente en producción.
