# VIGÍA — Sistema de IA para Veeduría Ciudadana

Dashboard de vigilancia de contratación pública con detección de irregularidades SARLAFT, grafo 3D de redes de corrupción, evidencia cuantitativa y generación automática de denuncias. Construido con React + Vite + Tailwind CSS.

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación arranca en `http://localhost:5173` con **mock data** completamente precargado — sin necesidad de backend.

## Stack

| Herramienta | Rol |
|---|---|
| Vite + React 18 | Build tool + framework |
| Tailwind CSS v3 | Estilos (paleta dark ciberseguridad) |
| chart.js + react-chartjs-2 | Gráficos de precios y timeline |
| react-force-graph-3d + three.js | Grafo 3D de redes de corrupción |
| lucide-react | Iconografía |

## Estructura

```
src/
├── data/
│   └── mockContract.js        ← Todos los mock data aquí
└── components/
    ├── Header.jsx              ← Buscador ciudadano
    ├── RiskScorePanel.jsx      ← Score + banderas SARLAFT
    ├── MapView.jsx             ← CARTO / fallback Colombia
    ├── NetworkGraph3D.jsx      ← Grafo 3D Three.js
    ├── EvidenceCharts.jsx      ← Bar + Line chart
    ├── LLMActionPanel.jsx      ← Generador de denuncia
    └── ui/
        ├── Card.jsx
        ├── Badge.jsx
        └── ScoreGauge.jsx
```

## Endpoints FastAPI esperados

Todos los `// TODO: Fetch from FastAPI` están marcados en el código. Resumen:

| Archivo | Comentario TODO | Endpoint FastAPI |
|---|---|---|
| `App.jsx` | `useEffect` | `GET /analyze/contract/:id` |
| `RiskScorePanel.jsx` | función del componente | `GET /analyze/contract/:id` |
| `MapView.jsx` | función del componente | `GET /territory/:municipio_code` |
| `NetworkGraph3D.jsx` | función del componente | `GET /graph/contractor/:nit` |
| `EvidenceCharts.jsx` — pricing | función interna | `GET /analytics/pricing/:unspsc` |
| `EvidenceCharts.jsx` — timeline | función interna | `GET /analytics/timeline/:entidad_nit` |
| `LLMActionPanel.jsx` | `handleGenerate` | `POST /llm/draft-complaint` |

### Payload esperado para `/llm/draft-complaint`

```json
{
  "contract_id": "CO1.PCCNTR.7842913",
  "score": 92,
  "flags": ["SARLAFT-NE", "SARLAFT-PEP", "NLP-PS", "PRECIO-AT"],
  "network_summary": "5 empresas fachada, misma dirección",
  "pricing_delta_pct": 47.2
}
```

### Respuesta esperada (streaming SSE o JSON)

```json
{
  "draft": "DENUNCIA FORMAL...",
  "model": "gpt-4o",
  "tokens_used": 1240
}
```

## Configuración de CARTO

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_CARTO_URL=https://your-org.carto.com/builder/your-map-id/embed
VITE_API_URL=http://localhost:8000
```

Si `VITE_CARTO_URL` no está definida, el componente `MapView` muestra automáticamente un fallback SVG de Colombia con marcador animado en Argelia, Cauca.

## Conectar a FastAPI

En `src/App.jsx`, descomenta y adapta:

```js
const fetchContract = async (id) => {
  setLoading(true);
  const res = await fetch(`${import.meta.env.VITE_API_URL}/analyze/contract/${id}`);
  const data = await res.json();
  setContract(data);
  setLoading(false);
};
```

El esquema de `data` debe seguir la estructura de `src/data/mockContract.js`.

## Metodología

Las 22 banderas de detección siguen la metodología de [anticorrupcion.co](https://www.anticorrupcion.co/metodologia), alineada con:

- Ley 80/1993 — Estatuto General de Contratación
- Ley 1474/2011 — Estatuto Anticorrupción
- Decreto 1082/2015 — Sistema de Compras
- Art. 209 CP — Función pública
- SARLAFT — Circular Básica Jurídica SFC

> Este sistema detecta señales de alerta, no determina culpabilidad. Para investigaciones formales, los datos deben ser verificados con los documentos originales.
