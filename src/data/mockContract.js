// =============================================================================
// VIGÍA — MOCK CONTRACT DATA
// Contrato ficticio pero realista de PAE en municipio PDET (Argelia, Cauca)
// Basado en patrones detectados por anticorrupcion.co/metodologia
// TODO: Replace with real fetch from FastAPI: GET /analyze/contract/:id
// =============================================================================

export const MOCK_CONTRACT = {
  // --- Identificación ---
  id: "CO1.PCCNTR.7842913",
  secop_version: "SECOP I",
  estado: "EJECUTANDO",
  modalidad: "Contratación Directa",
  objeto:
    "Suministro de Alimentos del Programa de Alimentación Escolar (PAE) para 4.200 estudiantes en instituciones educativas del municipio de Argelia, Cauca — Año 2026",
  entidad: {
    nombre: "Alcaldía Municipal de Argelia",
    departamento: "Cauca",
    municipio: "Argelia",
    tipo: "alcaldía",
    nit: "800.123.456-7",
    telefono: "+57 (2) 825-4120",
  },
  contratista: {
    nombre: "Soluciones Nutricionales del Pacífico SAS",
    nit: "901.847.392-1",
    ciudad_registro: "Bogotá D.C.",
    fecha_constitucion: "2026-04-18", // constituida hace 15 días
    representante_legal: "Hernán Darío Mosquera Palacios",
    objeto_social: "Comercio al por mayor de alimentos y bebidas",
    capital_suscrito: 500000,
    num_empleados: 3,
  },
  valor_contrato: 4820000000,
  valor_con_adiciones: 4820000000,
  fecha_firma: "2026-05-03T23:14:00", // domingo 23:14 — horario atípico
  fecha_inicio: "2026-05-04",
  fecha_fin: "2026-11-30",
  plazo_dias: 210,
  categoria_unspsc: "50000000",
  categoria_unspsc_descripcion: "Alimentos, bebidas y tabaco",

  // --- Score de Riesgo VIGÍA ---
  score: 92,
  nivel_riesgo: "CRÍTICO",
  num_banderas: 7,

  // --- Banderas SARLAFT / Anticorrupción ---
  // Metodología: https://www.anticorrupcion.co/metodologia
  // Puntaje = 100 × (1 − ∏(1 − wᵢ × cᵢ / 100))
  banderas: [
    {
      id: "F06",
      codigo: "SARLAFT-NE",
      titulo: "SARLAFT Alerta: Empresa de Papel",
      descripcion:
        "Empresa constituida hace 15 días (18/04/2026) adjudicataria de contrato por $4.820M COP. Empresa fachada constituida específicamente para capturar este contrato. Capital suscrito: $500.000 COP.",
      categoria: "manipulacion_adjudicacion",
      peso: 30,
      confianza: 100,
      severidad: "critical",
      icono: "building2",
      legal_ref: "Ley 1474/2011 Art. 84 — Tipificación empresa fachada",
      evidencia: [
        "Fecha constitución RUES: 18/04/2026",
        "Capital suscrito: $500.000 COP",
        "3 empleados declarados",
        "Sin historial previo en SECOP",
      ],
    },
    {
      id: "F_PEP",
      codigo: "SARLAFT-PEP",
      titulo: "SARLAFT Alerta: Representante Legal en Lista PEP",
      descripcion:
        "Hernán Darío Mosquera Palacios (CC 79.847.123) aparece en lista de Personas Expuestas Políticamente — exfuncionario Secretaría de Educación Cauca 2020-2023. Coincidencia en listas restrictivas OFAC.",
      categoria: "manipulacion_adjudicacion",
      peso: 30,
      confianza: 95,
      severidad: "critical",
      icono: "user-x",
      legal_ref:
        "SARLAFT Circular Básica Jurídica SFC — Gestión de riesgo LA/FT",
      evidencia: [
        "Match en lista PEP SIGEP",
        "Exfuncionario público Cauca 2020-2023",
        "Aparece en red de 3 empresas vinculadas",
        "Match parcial OFAC lista SDN",
      ],
    },
    {
      id: "F_NLP",
      codigo: "NLP-PS",
      titulo: "Pliego Sastre / Especificidad a Medida Detectada (Modelo NLP)",
      descripcion:
        "El modelo NLP de VIGÍA detectó 14 cláusulas técnicas en el pliego que restringen la competencia al perfil exacto del contratista adjudicado. Similitud coseno con contratos previos del mismo par entidad-contratista: 0.94.",
      categoria: "manipulacion_proceso",
      peso: 25,
      confianza: 88,
      severidad: "critical",
      icono: "file-text",
      legal_ref:
        "Ley 80/1993 Art. 24 — Principio de Transparencia; Ley 1474/2011 Art. 5",
      evidencia: [
        "14 cláusulas restrictivas detectadas",
        "Similitud coseno pliego-contratista: 0.94",
        "Experiencia requerida: exacta al perfil del adjudicado",
        "Certificaciones técnicas específicas al oferente",
      ],
    },
    {
      id: "F09",
      codigo: "PRECIO-AT",
      titulo: "Precio Atípico — Sobrecosto +47% sobre Mediana Mercado",
      descripcion:
        "Valor unitario por ración PAE: $18.400 COP vs. mediana mercado SECOP (UNSPSC 50000000) de $12.500 COP. Sobrecosto total estimado: $1.422M COP sobre mediana.",
      categoria: "manipulacion_adjudicacion",
      peso: 20,
      confianza: 96,
      severidad: "critical",
      icono: "trending-up",
      legal_ref: "Ley 80/1993 Art. 23 — Principio de Economía",
      evidencia: [
        "Valor/ración: $18.400 vs mediana $12.500",
        "Sobrecosto: +47.2% sobre baseline UNSPSC",
        "8 contratos comparables analizados",
        "IQR mercado: $11.200 - $13.800",
      ],
    },
    {
      id: "F01",
      codigo: "ÚNICO-OF",
      titulo: "Único Oferente en Proceso Competitivo",
      descripcion:
        "A pesar de usar modalidad de Contratación Directa, el proceso fue publicado en SECOP con un solo proponente. Señal de pliego dirigido compatible con bandera NLP.",
      categoria: "manipulacion_proceso",
      peso: 20,
      confianza: 100,
      severidad: "high",
      icono: "alert-triangle",
      legal_ref:
        "Ley 80/1993 Art. 2 — Modalidades de selección; Decreto 1082/2015",
      evidencia: [
        "1 oferente en registro SECOP",
        "Proceso publicado: 28/04/2026",
        "Cierre: 01/05/2026 (3 días hábiles)",
        "Sin manifestación de interés de otros proponentes",
      ],
    },
    {
      id: "F_TIME",
      codigo: "TIME-AT",
      titulo: "Adjudicación en Horario Atípico — Domingo 23:14",
      descripcion:
        "El contrato fue firmado el domingo 03/05/2026 a las 23:14 horas. Patrón de adjudicaciones nocturnas y en días no laborales documentado en escándalos PAE 2019-2022.",
      categoria: "analisis_velocidad",
      peso: 10,
      confianza: 100,
      severidad: "high",
      icono: "clock",
      legal_ref:
        "Ley 1474/2011 — Estatuto Anticorrupción; patrón PAE validado",
      evidencia: [
        "Fecha firma: domingo 03/05/2026",
        "Hora firma: 23:14:32",
        "Fuera de horario laboral Alcaldía",
        "Patrón recurrente en PAE Cauca 2019-2022",
      ],
    },
    {
      id: "F15",
      codigo: "GEO-AT",
      titulo: "Desajuste Geográfico — Contratista Bogotá, Contrato Cauca",
      descripcion:
        "Contratista registrado en Bogotá D.C. para un contrato de suministro PAE en Argelia, Cauca — municipio PDET de difícil acceso a 12 horas de Bogotá por carretera.",
      categoria: "senales_estructurales",
      peso: 10,
      confianza: 92,
      severidad: "medium",
      icono: "map-pin",
      legal_ref: "Decreto 1082/2015 — Principio de economía y eficiencia",
      evidencia: [
        "Domicilio contratista: Bogotá D.C. (RUES)",
        "Lugar ejecución: Argelia, Cauca",
        "Distancia: ~520 km / 12h por carretera",
        "Sin sucursal ni sede en Cauca",
      ],
    },
  ],

  // --- Red de Corrupción (grafo) ---
  // TODO: Fetch from FastAPI: GET /graph/contractor/:nit
  network: {
    nodes: [
      {
        id: "n1",
        name: "Alcaldía de Argelia",
        tipo: "entidad",
        nit: "800.123.456-7",
        municipio: "Argelia, Cauca",
        contratos_vigentes: 47,
        presupuesto_2026: 12400000000,
        color: "#22d3ee",
        val: 18,
      },
      {
        id: "n2",
        name: "Soluciones Nutricionales del Pacífico SAS",
        tipo: "adjudicada",
        nit: "901.847.392-1",
        ciudad: "Bogotá D.C.",
        fecha_constitucion: "18/04/2026",
        capital: 500000,
        multas_secop: 0,
        color: "#f59e0b",
        val: 14,
      },
      {
        id: "n3",
        name: "Distribuciones Agro del Sur SAS",
        tipo: "fachada",
        nit: "901.123.847-3",
        ciudad: "Bogotá D.C.",
        direccion: "Calle 72 # 14-23 Of. 502, Bogotá",
        fecha_constitucion: "12/01/2024",
        capital: 500000,
        multas_secop: 2,
        sancionada: true,
        rep_legal_compartido: true,
        color: "#ef4444",
        val: 10,
      },
      {
        id: "n4",
        name: "Comercializadora Andina de Víveres SAS",
        tipo: "fachada",
        nit: "901.234.567-8",
        ciudad: "Bogotá D.C.",
        direccion: "Calle 72 # 14-23 Of. 502, Bogotá",
        fecha_constitucion: "03/07/2023",
        capital: 1000000,
        multas_secop: 1,
        sancionada: false,
        rep_legal_compartido: true,
        color: "#ef4444",
        val: 10,
      },
      {
        id: "n5",
        name: "Alimentar Colombia SAS",
        tipo: "fachada",
        nit: "901.345.678-9",
        ciudad: "Bogotá D.C.",
        direccion: "Calle 72 # 14-23 Of. 502, Bogotá",
        fecha_constitucion: "19/03/2022",
        capital: 500000,
        multas_secop: 3,
        sancionada: true,
        rep_legal_compartido: false,
        color: "#ef4444",
        val: 10,
      },
      {
        id: "n6",
        name: "Inversiones Nutri-Pacífico SAS",
        tipo: "fachada",
        nit: "901.456.789-0",
        ciudad: "Bogotá D.C.",
        direccion: "Calle 72 # 14-23 Of. 502, Bogotá",
        fecha_constitucion: "08/11/2023",
        capital: 500000,
        multas_secop: 0,
        sancionada: false,
        rep_legal_compartido: true,
        color: "#ef4444",
        val: 10,
      },
      {
        id: "n7",
        name: "Tropical Foods & Logistics SAS",
        tipo: "fachada",
        nit: "901.567.890-1",
        ciudad: "Bogotá D.C.",
        direccion: "Calle 72 # 14-23 Of. 502, Bogotá",
        fecha_constitucion: "27/05/2023",
        capital: 2000000,
        multas_secop: 1,
        sancionada: false,
        rep_legal_compartido: false,
        color: "#ef4444",
        val: 10,
      },
    ],
    links: [
      {
        source: "n1",
        target: "n2",
        tipo: "adjudica",
        label: "Adjudicación $4.820M",
        valor: 4820000000,
        color: "#f59e0b",
        width: 4,
      },
      {
        source: "n2",
        target: "n3",
        tipo: "comparte_direccion",
        label: "Misma dirección física",
        color: "#ef4444",
        width: 2,
      },
      {
        source: "n2",
        target: "n4",
        tipo: "representante_compartido",
        label: "Rep. legal compartido",
        color: "#ef4444",
        width: 2,
      },
      {
        source: "n2",
        target: "n5",
        tipo: "comparte_direccion",
        label: "Misma dirección física",
        color: "#ef4444",
        width: 2,
      },
      {
        source: "n2",
        target: "n6",
        tipo: "representante_compartido",
        label: "Rep. legal compartido",
        color: "#ef4444",
        width: 2,
      },
      {
        source: "n2",
        target: "n7",
        tipo: "comparte_direccion",
        label: "Misma dirección física",
        color: "#ef4444",
        width: 2,
      },
      {
        source: "n3",
        target: "n1",
        tipo: "multa_secop",
        label: "2 multas SECOP I",
        color: "#94a3b8",
        width: 1,
      },
      {
        source: "n5",
        target: "n1",
        tipo: "multa_secop",
        label: "3 multas SECOP I",
        color: "#94a3b8",
        width: 1,
      },
    ],
  },

  // --- Datos para gráfico de precios ---
  // TODO: Fetch from FastAPI: GET /analytics/pricing/:unspsc
  pricing: {
    unspsc: "50000000",
    descripcion: "Suministro PAE — Ración diaria estudiante",
    unidad: "COP / ración",
    mediana_mercado: 12500,
    iqr_min: 11200,
    iqr_max: 13800,
    valor_contrato: 18400,
    comparables: [
      { id: "REF-01", entidad: "Alcaldía Toribío", valor: 11800, año: 2025 },
      { id: "REF-02", entidad: "Alcaldía Morales", valor: 12200, año: 2025 },
      { id: "REF-03", entidad: "Alcaldía Balboa", valor: 13400, año: 2025 },
      { id: "REF-04", entidad: "Alcaldía López de Micay", valor: 11950, año: 2025 },
      { id: "REF-05", entidad: "Alcaldía Riosucio", valor: 13100, año: 2026 },
      { id: "REF-06", entidad: "Alcaldía Suárez", valor: 12800, año: 2026 },
      { id: "REF-07", entidad: "Alcaldía El Tambo", valor: 12650, año: 2026 },
      {
        id: "CO1.PCCNTR.7842913",
        entidad: "Alcaldía Argelia ★",
        valor: 18400,
        año: 2026,
        esEsteContrato: true,
      },
    ],
  },

  // --- Timeline de contratación (últimos 30 días) ---
  // TODO: Fetch from FastAPI: GET /analytics/timeline/:entidad_nit
  timeline: {
    periodo: "Abril 4 — Mayo 3, 2026",
    datos: [
      { fecha: "04/04", contratos: 0, hora_max: null },
      { fecha: "05/04", contratos: 0, hora_max: null },
      { fecha: "06/04", contratos: 1, hora_max: "10:20" },
      { fecha: "07/04", contratos: 0, hora_max: null },
      { fecha: "08/04", contratos: 2, hora_max: "14:45" },
      { fecha: "09/04", contratos: 0, hora_max: null },
      { fecha: "10/04", contratos: 0, hora_max: null },
      { fecha: "11/04", contratos: 1, hora_max: "09:15" },
      { fecha: "12/04", contratos: 0, hora_max: null },
      { fecha: "13/04", contratos: 0, hora_max: null },
      { fecha: "14/04", contratos: 1, hora_max: "11:30" },
      { fecha: "15/04", contratos: 0, hora_max: null },
      { fecha: "16/04", contratos: 2, hora_max: "15:00" },
      { fecha: "17/04", contratos: 1, hora_max: "10:10" },
      { fecha: "18/04", contratos: 0, hora_max: null },
      { fecha: "19/04", contratos: 0, hora_max: null },
      { fecha: "20/04", contratos: 0, hora_max: null },
      { fecha: "21/04", contratos: 1, hora_max: "09:45" },
      { fecha: "22/04", contratos: 0, hora_max: null },
      { fecha: "23/04", contratos: 2, hora_max: "14:20" },
      { fecha: "24/04", contratos: 1, hora_max: "11:00" },
      { fecha: "25/04", contratos: 0, hora_max: null },
      { fecha: "26/04", contratos: 0, hora_max: null },
      { fecha: "27/04", contratos: 0, hora_max: null },
      { fecha: "28/04", contratos: 2, hora_max: "09:30" },
      { fecha: "29/04", contratos: 0, hora_max: null },
      { fecha: "30/04", contratos: 1, hora_max: "10:50" },
      { fecha: "01/05", contratos: 1, hora_max: "08:40" },
      { fecha: "02/05", contratos: 0, hora_max: null },
      { fecha: "03/05", contratos: 1, hora_max: "23:14", esAtipico: true }, // Domingo 23:14 — ALERTA
    ],
    anomalia: {
      fecha: "03/05",
      hora: "23:14",
      dia_semana: "Domingo",
      descripcion: "Adjudicación PAE $4.820M — Horario atípico",
    },
  },

  // --- Datos Territoriales ---
  territorio: {
    municipio: "Argelia",
    departamento: "Cauca",
    lat: 1.8519,
    lng: -77.2568,
    pdet: true,
    zona_paz: true,
    idh: 0.52,
    pobreza_multidimensional_pct: 71.4,
    poblacion: 26800,
    estudiantes_pae: 4200,
    vias_estado: "Precario — 82% sin pavimentar",
    presencia_estatal: "Limitada",
    conflicto_activo: true,
    grupos_armados: ["Disidencias FARC — Frente 6", "ELN"],
    inversion_contrato_per_capita: Math.round(4820000000 / 26800),
    carto_map_url: null, // set via VITE_CARTO_URL in .env — read in MapView.jsx
  },
};

// --- Borrador de denuncia (mock LLM output) ---
// TODO: Generate via FastAPI: POST /llm/draft-complaint
export const MOCK_DRAFT_DENUNCIA = `DENUNCIA FORMAL ANTE LA CONTRALORÍA GENERAL DE LA REPÚBLICA
DELEGADA PARA EL SECTOR SOCIAL — PROGRAMA DE ALIMENTACIÓN ESCOLAR

Bogotá D.C., 9 de mayo de 2026

Señores
CONTRALORÍA GENERAL DE LA REPÚBLICA
Oficina de Participación Ciudadana y Desarrollo Social
Ciudad

Ref.: Denuncia ciudadana por presuntas irregularidades en el Contrato
CO1.PCCNTR.7842913 de la Alcaldía Municipal de Argelia, Cauca

Estimados señores:

En ejercicio del derecho consagrado en el Artículo 209 de la Constitución Política de Colombia, y en cumplimiento del deber ciudadano de velar por el correcto uso de los recursos públicos, me permito presentar denuncia formal por las graves irregularidades detectadas por el Sistema de Vigilancia Ciudadana VIGÍA en el contrato de referencia.

I. HECHOS

1. La Alcaldía Municipal de Argelia (Cauca), NIT 800.123.456-7, suscribió el día domingo 3 de mayo de 2026 a las 23:14 horas — fuera del horario laboral — el Contrato CO1.PCCNTR.7842913 con la empresa Soluciones Nutricionales del Pacífico SAS (NIT 901.847.392-1), por valor de CUATRO MIL OCHOCIENTOS VEINTE MILLONES DE PESOS ($4.820.000.000 COP), para el suministro del Programa de Alimentación Escolar (PAE) 2026.

2. EMPRESA DE PAPEL — ALERTA SARLAFT: La empresa adjudicataria fue constituida apenas 15 días antes de la firma del contrato (18 de abril de 2026), con un capital suscrito de QUINIENTOS MIL PESOS ($500.000 COP) y tan solo 3 empleados declarados, lo que configura una presunta empresa de fachada constituida específicamente para capturar recursos públicos, conforme al Art. 84 de la Ley 1474 de 2011 — Estatuto Anticorrupción.

3. PERSONA EXPUESTA POLÍTICAMENTE — ALERTA SARLAFT: El representante legal de la empresa adjudicataria, identificado como Hernán Darío Mosquera Palacios (CC 79.847.123), aparece en la lista de Personas Expuestas Políticamente del SIGEP, en calidad de exfuncionario de la Secretaría de Educación del Cauca durante el período 2020-2023, y presenta coincidencias parciales con listas restrictivas internacionales (OFAC-SDN), lo que activa protocolos SARLAFT de la Circular Básica Jurídica de la Superintendencia Financiera.

4. PLIEGO SASTRE — NLP VIGÍA: El modelo de Procesamiento de Lenguaje Natural del sistema VIGÍA detectó 14 cláusulas técnicas en el pliego de condiciones que restringen la competencia al perfil exacto del contratista, con una similitud coseno de 0.94 respecto a contratos previos del mismo par entidad-contratista, configurando la conducta tipificada en el Artículo 24 de la Ley 80 de 1993 como vulneración al Principio de Transparencia, y en el Artículo 5 de la Ley 1474 de 2011.

5. SOBRECOSTO DEL 47%: El valor unitario por ración PAE pactado es de $18.400 COP, frente a una mediana de mercado de $12.500 COP (rango IQR: $11.200 - $13.800) calculada sobre 8 contratos comparables del mismo código UNSPSC 50000000 en municipios PDET del Cauca. El sobrecosto estimado sobre la mediana asciende a MIL CUATROCIENTOS VEINTIDÓS MILLONES DE PESOS ($1.422.000.000 COP), en violación del Principio de Economía consagrado en el Artículo 23 de la Ley 80 de 1993.

6. RED DE EMPRESAS VINCULADAS: El análisis de red del sistema VIGÍA identificó 5 empresas relacionadas con la adjudicataria que comparten la misma dirección física (Calle 72 # 14-23 Of. 502, Bogotá D.C.), tienen representantes legales comunes y acumulan 6 multas en SECOP I por incumplimiento en contratos PAE. Esta estructura configura un posible anillo de colusión bajo los criterios de la bandera #10 de la metodología anticorrupcion.co, alineada con la Open Contracting Partnership.

7. HORARIO ATÍPICO: La firma del contrato en día domingo a las 23:14 horas constituye un patrón documentado en los escándalos del PAE en Cauca y Chocó durante 2019-2022, sugiriendo deliberada evasión de controles institucionales.

II. FUNDAMENTOS DE DERECHO

- Ley 80 de 1993, Arts. 23, 24 y 26 — Principios de Economía, Transparencia y Responsabilidad.
- Ley 1150 de 2007 — Medidas de eficiencia y transparencia.
- Ley 1474 de 2011 (Estatuto Anticorrupción), Arts. 5 y 84 — Restricción a la competencia y tipificación de conductas corruptas.
- Decreto 1082 de 2015 — Sistema de Compras y Contratación Pública.
- Artículo 209 de la Constitución Política — Función pública al servicio del interés general.
- Circular Básica Jurídica SFC — SARLAFT: Gestión del Riesgo de Lavado de Activos y Financiación del Terrorismo.

III. SOLICITUD

Solicito respetuosamente a la Contraloría General de la República:
1. Abrir indagación preliminar sobre el contrato CO1.PCCNTR.7842913.
2. Ordenar medida cautelar de suspensión del contrato mientras se investiga.
3. Requerir a la Alcaldía de Argelia los soportes del proceso de selección.
4. Verificar los antecedentes SARLAFT del representante legal en listas PEP y restrictivas.
5. Investigar la red de 5 empresas vinculadas a la misma dirección física.

Los datos aquí consignados fueron generados por el sistema VIGÍA con base en información pública de SECOP I, RUES, SIGEP y SIRI. Esta denuncia es una señal de alerta estadística que amerita revisión humana — no determina culpabilidad.

Atentamente,

[CIUDADANO DENUNCIANTE]
Generado por VIGÍA — Sistema de IA para Veeduría Ciudadana
https://vigia.gov.co | datos: datos.gov.co`;

// =============================================================================
// BANDERAS ESTÁNDAR OCDS (Cardinal / Open Contracting Partnership)
// Simulan la librería open-source 'Cardinal' de la OCP
// =============================================================================
export const BANDERAS_OCDS = [
  {
    id: "OCDS-F02",
    codigo: "OCDS-F02",
    titulo: "Ventana de Publicación Inusualmente Corta",
    descripcion:
      "El proceso fue publicado el 28/04/2026 con cierre el 01/05/2026 — solo 3 días calendario (< 5 días hábiles recomendados por OCDS). Esta práctica desincentiva la participación de nuevos proponentes y es señal de pliego dirigido según los estándares de la Open Contracting Partnership.",
    categoria: "manipulacion_proceso",
    peso: 15,
    confianza: 100,
    severidad: "ocds",
    icono: "clock",
    legal_ref: "OCDS Red Flag #2 — Short bidding period · Ley 80/1993 Art. 30",
    evidencia: [
      "Fecha publicación: 28/04/2026",
      "Fecha cierre: 01/05/2026",
      "Plazo efectivo: 3 días calendario",
      "Mínimo recomendado OCDS: 5 días hábiles",
    ],
  },
  {
    id: "OCDS-F07",
    codigo: "OCDS-F07",
    titulo: "Concentración de Adjudicaciones — Proveedor Recurrente",
    descripcion:
      "El sistema identifica que la Alcaldía de Argelia ha concentrado el 68% de su presupuesto de suministros en el mismo grupo de empresas vinculadas en los últimos 12 meses. Patrón de captura del proceso de selección según el estándar OCDS F07.",
    categoria: "manipulacion_adjudicacion",
    peso: 20,
    confianza: 82,
    severidad: "ocds",
    icono: "pie-chart",
    legal_ref: "OCDS Red Flag #7 — Contract award concentration · Ley 1150/2007",
    evidencia: [
      "68% presupuesto suministros → mismo grupo empresarial",
      "Período análisis: mayo 2025 — mayo 2026",
      "Umbral OCDS alerta: > 30% concentración",
      "Fuente: SECOP I consolidado",
    ],
  },
  {
    id: "OCDS-F10",
    codigo: "OCDS-F10",
    titulo: "Anillo de Colusión Detectado — Rotación de Ganadores",
    descripcion:
      "Análisis de red detecta que 3 de las 5 empresas vinculadas han rotado como adjudicatarias de contratos PAE en Cauca durante 2024-2026, con patrones de precios coordinados (diferencia < 2% entre ofertas). Indicador OCDS de acuerdo de precios o distribución territorial de contratos.",
    categoria: "manipulacion_adjudicacion",
    peso: 25,
    confianza: 78,
    severidad: "ocds",
    icono: "git-branch",
    legal_ref: "OCDS Red Flag #10 — Bid rigging / collusion · Ley 1474/2011 Art. 27",
    evidencia: [
      "3 empresas vinculadas rotan como ganadoras PAE Cauca",
      "Diferencia entre ofertas: < 2% en 4 procesos",
      "Período: 2024-2026",
      "Metodología: análisis de grafos VIGÍA",
    ],
  },
];

// =============================================================================
// NOTICIAS PACO — Contexto Mediático Territorial
// Simulan la base de datos del Portal Anticorrupción PACO
// TODO: Fetch from FastAPI: GET /paco/news?municipio=Argelia&departamento=Cauca
// =============================================================================
export const PACO_NOTICIAS = [
  {
    id: "P1",
    titulo: "Escándalo por desvío de fondos PAE en el Cauca deja 3.200 niños sin alimentación",
    fuente: "Portal Anticorrupción PACO",
    fecha: "Nov 2023",
    url: "https://www.anticorrupcion.co",
    tipo: "escandalo",
    relevancia: "alta",
    extracto:
      "Investigación periodística reveló que contratos PAE adjudicados a empresas sin experiencia en el Cauca desviaron más de $12.000 millones entre 2021 y 2023. Procuraduría abrió investigación disciplinaria contra 4 alcaldes.",
    tags: ["PAE", "Cauca", "Procuraduría", "Desvío fondos"],
  },
  {
    id: "P2",
    titulo: "Contraloría detecta red de empresas de papel en contratación PAE — Argelia entre los municipios señalados",
    fuente: "Contraloría General de la República",
    fecha: "Mar 2024",
    url: "https://www.contraloria.gov.co",
    tipo: "alerta",
    relevancia: "alta",
    extracto:
      "Informe de la CGR identificó 47 empresas constituidas en los 30 días previos a la firma de contratos PAE en municipios PDET del Cauca y Chocó. Argelia aparece mencionado en 3 hallazgos fiscales.",
    tags: ["Contraloría", "Empresa papel", "PDET", "Hallazgo fiscal"],
  },
  {
    id: "P3",
    titulo: "UNODC: Municipios PDET con cultivos ilícitos registran mayor índice de irregularidades en contratación pública",
    fuente: "UNODC Colombia · Informe 2025",
    fecha: "Ene 2025",
    url: "https://www.unodc.org",
    tipo: "contexto",
    relevancia: "media",
    extracto:
      "El informe correlaciona la presencia de cultivos de coca con un 34% más de irregularidades en contratación pública municipal. Argelia, Cauca registra 1.240 hectáreas de coca según el monitoreo SIMCI 2025.",
    tags: ["UNODC", "Cultivos ilícitos", "Contratación", "SIMCI"],
  },
];

// =============================================================================
// DEBIDA DILIGENCIA SARLAFT — Ficha estructurada del contratista
// TODO: Fetch from FastAPI: GET /due-diligence/:nit
// =============================================================================
export const DUE_DILIGENCE = {
  nit: "901.847.392-1",
  empresa: "Soluciones Nutricionales del Pacífico SAS",
  tipo_sociedad: "Sociedad por Acciones Simplificada",
  objeto_social: "Comercio al por mayor de alimentos y bebidas",
  ciudad_domicilio: "Bogotá D.C.",
  direccion: "Cra. 15 # 88-64 Of. 301, Bogotá D.C.",
  fecha_constitucion: "18/04/2026",
  meses_existencia: 0.7,
  capital_suscrito: 500000,
  capital_pagado: 500000,
  num_empleados: 3,
  camara_comercio: "Cámara de Comercio de Bogotá",
  rep_legal: {
    nombre: "Hernán Darío Mosquera Palacios",
    cc: "79.847.123",
    ciudad: "Cali, Valle del Cauca",
    pep: true,
    cargo_anterior: "Coordinador Programa Alimentación — Secretaría Educación Cauca (2020-2023)",
    listas: ["SIGEP-PEP", "OFAC-SDN (match parcial 78%)"],
    match_ofac_pct: 78,
  },
  alertas_sarlaft: [
    { tipo: "EMPRESA_NUEVA", descripcion: "Constituida hace < 1 mes antes del contrato", nivel: "critical" },
    { tipo: "PEP_MATCH", descripcion: "Representante legal en lista PEP SIGEP", nivel: "critical" },
    { tipo: "OFAC_MATCH", descripcion: "Coincidencia parcial 78% en lista SDN OFAC", nivel: "high" },
    { tipo: "CAPITAL_MINIMO", descripcion: "Capital suscrito $500.000 COP (mínimo legal)", nivel: "high" },
    { tipo: "GEO_MISMATCH", descripcion: "Empresa Bogotá, contrato Argelia Cauca (520 km)", nivel: "medium" },
  ],
  territorio: {
    municipio: "Argelia",
    departamento: "Cauca",
    pdet: true,
    zona_paz: true,
    cultivos_ilicitos: {
      presente: true,
      hectareas: 1240,
      cultivo: "Coca",
      fuente: "UNODC SIMCI 2025",
      ranking_nacional: "Top 15 municipios",
    },
    conflicto_activo: true,
    grupos_armados: ["Disidencias FARC — Frente 6", "ELN — Frente Occidental"],
    indice_riesgo_electoral: "ALTO (MOE 2026)",
  },
  historial_secop: {
    contratos_previos: 0,
    multas: 0,
    valor_acumulado: 0,
    primera_aparicion_secop: "CO1.PCCNTR.7842913 (este contrato)",
    nota: "Sin historial previo en ninguna plataforma SECOP",
  },
  fuentes_consultadas: [
    "RUES — Cámara de Comercio de Bogotá",
    "SIGEP II — Sistema de Información y Gestión del Empleo Público",
    "SIRI — Sistema de Información de Registro de Inhabilitados",
    "OFAC SDN List (coincidencia parcial)",
    "SECOP I + SECOP II (sin historial)",
    "UNODC SIMCI 2025 — Monitoreo cultivos ilícitos",
  ],
  fecha_consulta: "09/05/2026 10:47",
};

export default MOCK_CONTRACT;
