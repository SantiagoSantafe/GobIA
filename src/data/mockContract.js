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

  // --- 7 Banderas VIGÍA ---
  // Metodología: Fazekas & Kocsis (2020) + OCP Red Flags (2024)
  // Puntaje = 100 × (1 − ∏(1 − wᵢ × cᵢ / 100))
  banderas: [
    {
      id_bandera: "empresa_maleta",
      nombre: "Empresa de maletín",
      peso_pct: 30,
      score_aportado: 30,
      nivel: "CRÍTICO",
      evidencia: "Empresa constituida 15 días antes del contrato (18-abr-2026). Capital: $500.000 COP. 3 empleados.",
      norma: "Art. 84, Ley 1474/2011 — Estatuto Anticorrupción",
      fuente: "RUES / qmzu-gj57",
      // backward-compat fields for existing components
      id: "F06",
      codigo: "EMPRESA-M",
      titulo: "Empresa de Maletín",
      descripcion: "Empresa constituida hace 15 días (18/04/2026) adjudicataria de contrato por $4.820M COP. Capital suscrito: $500.000 COP.",
      categoria: "manipulacion_adjudicacion",
      peso: 30,
      confianza: 100,
      severidad: "critical",
      icono: "building2",
      legal_ref: "Art. 84, Ley 1474/2011 — Estatuto Anticorrupción",
      evidencia_lista: [
        "Fecha constitución RUES: 18/04/2026",
        "Capital suscrito: $500.000 COP",
        "3 empleados declarados",
        "Sin historial previo en SECOP",
      ],
    },
    {
      id_bandera: "pep_representante",
      nombre: "Representante Legal PEP",
      peso_pct: 30,
      score_aportado: 28,
      nivel: "CRÍTICO",
      evidencia: "Hernán D. Mosquera Palacios — exfuncionario Secretaría Educación Cauca 2020-2023. Match parcial OFAC-SDN 78%.",
      norma: "SARLAFT — Circular Básica Jurídica SFC",
      fuente: "SIGEP II / OFAC SDN List",
      id: "F_PEP",
      codigo: "PEP-MATCH",
      titulo: "Representante Legal en Lista PEP",
      descripcion: "Hernán Darío Mosquera Palacios aparece en lista de Personas Expuestas Políticamente — exfuncionario Secretaría de Educación Cauca 2020-2023.",
      categoria: "manipulacion_adjudicacion",
      peso: 30,
      confianza: 95,
      severidad: "critical",
      icono: "user-x",
      legal_ref: "SARLAFT Circular Básica Jurídica SFC — Gestión de riesgo LA/FT",
      evidencia_lista: [
        "Match en lista PEP SIGEP",
        "Exfuncionario público Cauca 2020-2023",
        "Aparece en red de 3 empresas vinculadas",
        "Match parcial OFAC lista SDN 78%",
      ],
    },
    {
      id_bandera: "pliego_sastre",
      nombre: "Pliego Sastre (NLP)",
      peso_pct: 25,
      score_aportado: 22,
      nivel: "CRÍTICO",
      evidencia: "14 cláusulas técnicas restringen la competencia al perfil exacto del adjudicado. Similitud coseno: 0.94.",
      norma: "Ley 80/1993 Art. 24 — Principio de Transparencia; Ley 1474/2011 Art. 5",
      fuente: "SECOP II NLP / VIGÍA",
      id: "F_NLP",
      codigo: "NLP-PS",
      titulo: "Pliego Sastre Detectado (NLP)",
      descripcion: "El modelo NLP de VIGÍA detectó 14 cláusulas que restringen la competencia al perfil exacto del contratista. Similitud coseno con contratos previos: 0.94.",
      categoria: "manipulacion_proceso",
      peso: 25,
      confianza: 88,
      severidad: "critical",
      icono: "file-text",
      legal_ref: "Ley 80/1993 Art. 24 — Principio de Transparencia; Ley 1474/2011 Art. 5",
      evidencia_lista: [
        "14 cláusulas restrictivas detectadas",
        "Similitud coseno pliego-contratista: 0.94",
        "Experiencia requerida: exacta al perfil del adjudicado",
        "Certificaciones técnicas específicas al oferente",
      ],
    },
    {
      id_bandera: "precio_atipico",
      nombre: "Precio Atípico +47%",
      peso_pct: 20,
      score_aportado: 19,
      nivel: "CRÍTICO",
      evidencia: "Valor/ración: $18.400 COP vs. mediana $12.500 COP (+47%). Sobrecosto estimado: $1.422M COP.",
      norma: "Ley 80/1993 Art. 23 — Principio de Economía",
      fuente: "SECOP I — UNSPSC 50000000",
      id: "F09",
      codigo: "PRECIO-AT",
      titulo: "Precio Atípico — Sobrecosto +47%",
      descripcion: "Valor unitario por ración PAE: $18.400 COP vs. mediana mercado de $12.500 COP. Sobrecosto total: $1.422M COP.",
      categoria: "manipulacion_adjudicacion",
      peso: 20,
      confianza: 96,
      severidad: "critical",
      icono: "trending-up",
      legal_ref: "Ley 80/1993 Art. 23 — Principio de Economía",
      evidencia_lista: [
        "Valor/ración: $18.400 vs mediana $12.500",
        "Sobrecosto: +47.2% sobre baseline UNSPSC",
        "8 contratos comparables analizados",
        "IQR mercado: $11.200 - $13.800",
      ],
    },
    {
      id_bandera: "unico_oferente",
      nombre: "Único Oferente",
      peso_pct: 20,
      score_aportado: 20,
      nivel: "ALTO",
      evidencia: "1 proponente registrado. Proceso publicado 28/04/2026, cierre 01/05/2026 (3 días hábiles).",
      norma: "Ley 80/1993 Art. 2 — Modalidades de selección; Decreto 1082/2015",
      fuente: "SECOP I / Proceso CO1.PCCNTR.7842913",
      id: "F01",
      codigo: "ÚNICO-OF",
      titulo: "Único Oferente en Proceso Competitivo",
      descripcion: "A pesar de usar Contratación Directa, el proceso fue publicado con un solo proponente. Señal de pliego dirigido.",
      categoria: "manipulacion_proceso",
      peso: 20,
      confianza: 100,
      severidad: "high",
      icono: "alert-triangle",
      legal_ref: "Ley 80/1993 Art. 2 — Modalidades de selección; Decreto 1082/2015",
      evidencia_lista: [
        "1 oferente en registro SECOP",
        "Proceso publicado: 28/04/2026",
        "Cierre: 01/05/2026 (3 días hábiles)",
        "Sin manifestación de interés de otros proponentes",
      ],
    },
    {
      id_bandera: "horario_atipico",
      nombre: "Firma Domingo 23:14",
      peso_pct: 10,
      score_aportado: 10,
      nivel: "ALTO",
      evidencia: "Contrato firmado domingo 03/05/2026 a las 23:14. Patrón documentado en escándalos PAE Cauca 2019-2022.",
      norma: "Ley 1474/2011 — Estatuto Anticorrupción",
      fuente: "SECOP I — metadatos firma",
      id: "F_TIME",
      codigo: "TIME-AT",
      titulo: "Adjudicación en Horario Atípico",
      descripcion: "El contrato fue firmado el domingo 03/05/2026 a las 23:14. Patrón de adjudicaciones nocturnas documentado en PAE 2019-2022.",
      categoria: "analisis_velocidad",
      peso: 10,
      confianza: 100,
      severidad: "high",
      icono: "clock",
      legal_ref: "Ley 1474/2011 — Estatuto Anticorrupción; patrón PAE validado",
      evidencia_lista: [
        "Fecha firma: domingo 03/05/2026",
        "Hora firma: 23:14:32",
        "Fuera de horario laboral Alcaldía",
        "Patrón recurrente en PAE Cauca 2019-2022",
      ],
    },
    {
      id_bandera: "desajuste_geografico",
      nombre: "Desajuste Geográfico",
      peso_pct: 10,
      score_aportado: 9,
      nivel: "MEDIO",
      evidencia: "Contratista en Bogotá D.C. para ejecución en Argelia, Cauca (520 km, 12 h). Sin sucursal en Cauca.",
      norma: "Decreto 1082/2015 — Principio de economía y eficiencia",
      fuente: "RUES / SECOP I",
      id: "F15",
      codigo: "GEO-AT",
      titulo: "Desajuste Geográfico",
      descripcion: "Contratista registrado en Bogotá para contrato de suministro PAE en Argelia, Cauca — municipio PDET a 12 h de Bogotá.",
      categoria: "senales_estructurales",
      peso: 10,
      confianza: 92,
      severidad: "medium",
      icono: "map-pin",
      legal_ref: "Decreto 1082/2015 — Principio de economía y eficiencia",
      evidencia_lista: [
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

// =============================================================================
// FEED DE ALERTAS — 10 contratos para el Dashboard
// Entidades reales colombianas, scores variados
// =============================================================================
export const MOCK_ALERTS = [
  {
    id: "CO1.PCCNTR.7842913",
    entidad: "Alcaldía Municipal de Argelia",
    departamento: "Cauca",
    proveedor: "Soluciones Nutricionales del Pacífico SAS",
    valor: 4820000000,
    modalidad: "Contratación Directa",
    fecha_firma: "2026-05-03",
    score: 92,
    nivel: "CRÍTICO",
    bandera_principal: "Empresa de maletín",
    detalle_extra: "Empresa constituida 15 días antes del contrato. Valor escaló 700% en 3 años.",
    dias_antes_constitucion: 15,
    contract_data: MOCK_CONTRACT,
  },
  {
    id: "SECOP2-2025-UNGRD-001",
    entidad: "UNGRD",
    departamento: "Bogotá D.C.",
    proveedor: "IMPOAMERICANA ROGER S.A.S.",
    valor: 46800000000,
    modalidad: "Contratación Directa",
    fecha_firma: "2023-08-15",
    score: 87,
    nivel: "CRÍTICO",
    bandera_principal: "Empresa de maletín",
    detalle_extra: "Empresa constituida 23 días antes del primer contrato. Valor escaló 700% en 3 años.",
    dias_antes_constitucion: 23,
    contract_data: null, // TODO: Fetch from FastAPI
  },
  {
    id: "CO-ICBF-2025-7234",
    entidad: "ICBF — Regional Córdoba",
    departamento: "Córdoba",
    proveedor: "Suministros Nutri-Costa SAS",
    valor: 8300000000,
    modalidad: "Licitación Pública",
    fecha_firma: "2025-11-22",
    score: 74,
    nivel: "CRÍTICO",
    bandera_principal: "Pliego sastre (NLP)",
    detalle_extra: "Similitud coseno pliego-contratista 0.91. Único oferente en proceso licitatorio.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "SECOP2-2025-MINJUSTICIA-443",
    entidad: "Ministerio de Justicia",
    departamento: "Bogotá D.C.",
    proveedor: "Consultores Legales & Asociados SAS",
    valor: 2100000000,
    modalidad: "Contratación Directa",
    fecha_firma: "2025-09-07",
    score: 68,
    nivel: "ALTO",
    bandera_principal: "Precio atípico +52%",
    detalle_extra: "Tarifa hora-consultor: $850.000 COP vs. mediana $560.000 COP del sector.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "CO-INVIAS-2025-8819",
    entidad: "INVIAS — Dirección Territorial Chocó",
    departamento: "Chocó",
    proveedor: "Constructora Vías del Atrato SAS",
    valor: 15600000000,
    modalidad: "Licitación Pública",
    fecha_firma: "2025-08-30",
    score: 61,
    nivel: "ALTO",
    bandera_principal: "Concentración proveedor recurrente",
    detalle_extra: "Mismo contratista ganó 5 contratos INVIAS Chocó en 24 meses. 72% del presupuesto vial.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "CO-GOBCHOCO-2025-3341",
    entidad: "Gobernación del Chocó",
    departamento: "Chocó",
    proveedor: "Salud Total Pacífico SAS",
    valor: 6900000000,
    modalidad: "Contratación Directa",
    fecha_firma: "2025-07-14",
    score: 55,
    nivel: "ALTO",
    bandera_principal: "Único oferente",
    detalle_extra: "PAE salud. Proceso publicado 3 días hábiles. Sin otras propuestas.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "SECOP1-2025-CUNDINAMARCA-881",
    entidad: "Gobernación de Cundinamarca",
    departamento: "Cundinamarca",
    proveedor: "Tecnologías Educativas SAS",
    valor: 3450000000,
    modalidad: "Selección Abreviada",
    fecha_firma: "2025-06-20",
    score: 42,
    nivel: "MEDIO",
    bandera_principal: "Desajuste geográfico",
    detalle_extra: "Contratista Medellín para ejecución en 28 municipios de Cundinamarca sin logística declarada.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "SECOP2-2025-MINEDUCACION-229",
    entidad: "Ministerio de Educación Nacional",
    departamento: "Bogotá D.C.",
    proveedor: "Editorial Educativa Nacional SAS",
    valor: 1800000000,
    modalidad: "Licitación Pública",
    fecha_firma: "2025-05-12",
    score: 34,
    nivel: "MEDIO",
    bandera_principal: "Ventana publicación corta",
    detalle_extra: "Proceso publicado con 4 días hábiles de plazo. Mínimo OCDS: 5 días hábiles.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "CO-IDU-2025-1102",
    entidad: "IDU — Instituto de Desarrollo Urbano",
    departamento: "Bogotá D.C.",
    proveedor: "Pavimentos Bogotá SAS",
    valor: 22400000000,
    modalidad: "Licitación Pública",
    fecha_firma: "2025-04-08",
    score: 21,
    nivel: "BAJO",
    bandera_principal: "Precio atípico +18%",
    detalle_extra: "Costo m² pavimento: $380.000 COP vs. mediana $322.000. Dentro de rango aceptable con justificación técnica.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
  {
    id: "CO-SENA-2025-0671",
    entidad: "SENA — Regional Antioquia",
    departamento: "Antioquia",
    proveedor: "Soluciones Tecnológicas Educativas Ltda.",
    valor: 950000000,
    modalidad: "Mínima Cuantía",
    fecha_firma: "2025-03-15",
    score: 12,
    nivel: "BAJO",
    bandera_principal: "Ventana publicación corta",
    detalle_extra: "Proceso estándar. Sin señales de riesgo adicionales detectadas.",
    dias_antes_constitucion: null,
    contract_data: null,
  },
];

// =============================================================================
// BANDERAS ESTÁNDAR OCDS (Cardinal / Open Contracting Partnership)
// =============================================================================
export const BANDERAS_OCDS = [
  {
    id: "OCDS-F02",
    codigo: "OCDS-F02",
    titulo: "Ventana de Publicación Inusualmente Corta",
    descripcion:
      "El proceso fue publicado el 28/04/2026 con cierre el 01/05/2026 — solo 3 días calendario (< 5 días hábiles recomendados por OCDS).",
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
      "La Alcaldía de Argelia concentró el 68% de su presupuesto de suministros en el mismo grupo de empresas vinculadas en los últimos 12 meses.",
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
      "3 de las 5 empresas vinculadas han rotado como adjudicatarias de contratos PAE en Cauca durante 2024-2026, con patrones de precios coordinados (diferencia < 2%).",
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
      "Investigación periodística reveló que contratos PAE adjudicados a empresas sin experiencia en el Cauca desviaron más de $12.000 millones entre 2021 y 2023.",
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
      "Informe de la CGR identificó 47 empresas constituidas en los 30 días previos a la firma de contratos PAE en municipios PDET del Cauca y Chocó.",
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
      "El informe correlaciona la presencia de cultivos de coca con un 34% más de irregularidades en contratación pública municipal.",
    tags: ["UNODC", "Cultivos ilícitos", "Contratación", "SIMCI"],
  },
];

// =============================================================================
// DEBIDA DILIGENCIA SARLAFT
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
  // ── OSINT geoespacial ──────────────────────────────────────────────
  osint: {
    direccion_registrada: "Cra. 15 # 88-64 Of. 301, Bogotá D.C.",
    coordenadas: { lat: 4.6745, lng: -74.0541 },
    tipo_inmueble_catastro: "Local comercial — predio sin uso registrado",
    ultima_inspeccion: "No registra visita en últimos 5 años",
    discrepancia_score: 0.91,
    hallazgos: [
      "Inmueble figura como local comercial pero parece bodega abandonada",
      "Sin avisos comerciales visibles desde calle",
      "Sin actividad económica registrada en visita virtual",
      "Código catastral: inmueble compartido con 4 empresas distintas",
    ],
    actividad_vecinal: "Zona residencial / Sin actividad comercial visible",
    historial_predial: "Sin licencias de construcción activas en últimos 10 años",
  },
};

// =============================================================================
// BORRADOR DENUNCIA — Formato VIGÍA
// TODO: Generate via FastAPI: POST /llm/draft-complaint
// =============================================================================
export const MOCK_DRAFT_DENUNCIA = `╔═══════════════════════════════════════════════════╗
║        HALLAZGOS PRELIMINARES — VIGÍA             ║
║  Sistema de IA para Veeduría Ciudadana            ║
╚═══════════════════════════════════════════════════╝

ID SECOP II  : CO1.PCCNTR.7842913
Entidad      : Alcaldía Municipal de Argelia (Cauca)
Proveedor    : Soluciones Nutricionales del Pacífico SAS
Valor        : $4.820.000.000 COP
Modalidad    : Contratación Directa
Fecha firma  : Domingo 03/05/2026 — 23:14 hrs

Score VIGÍA  : 92/100
Nivel riesgo : CRÍTICO
Banderas     : 7 activas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HALLAZGOS PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] EMPRESA DE MALETÍN — Peso: 30/100 — CRÍTICO
    Evidencia : Empresa constituida 15 días antes del contrato
                (18-abr-2026). Capital: $500.000 COP. 3 empleados.
    Norma     : Art. 84, Ley 1474/2011 — Estatuto Anticorrupción
    Fuente    : RUES / qmzu-gj57

[2] REPRESENTANTE LEGAL PEP — Peso: 30/100 — CRÍTICO
    Evidencia : Hernán D. Mosquera Palacios — exfuncionario Secretaría
                Educación Cauca 2020-2023. Match parcial OFAC-SDN 78%.
    Norma     : SARLAFT — Circular Básica Jurídica SFC
    Fuente    : SIGEP II / OFAC SDN List

[3] PLIEGO SASTRE (NLP) — Peso: 25/100 — CRÍTICO
    Evidencia : 14 cláusulas técnicas restringen la competencia al
                perfil exacto del adjudicado. Similitud coseno: 0.94.
    Norma     : Ley 80/1993 Art. 24 — Principio de Transparencia
    Fuente    : SECOP II NLP / VIGÍA

[4] PRECIO ATÍPICO +47% — Peso: 20/100 — CRÍTICO
    Evidencia : Valor/ración: $18.400 COP vs. mediana $12.500 COP.
                Sobrecosto estimado: $1.422.000.000 COP.
    Norma     : Ley 80/1993 Art. 23 — Principio de Economía
    Fuente    : SECOP I — UNSPSC 50000000

[5] ÚNICO OFERENTE — Peso: 20/100 — ALTO
    Evidencia : 1 proponente registrado. Proceso publicado 28/04/2026,
                cierre 01/05/2026 (3 días hábiles).
    Norma     : Ley 80/1993 Art. 2; Decreto 1082/2015
    Fuente    : SECOP I / Proceso CO1.PCCNTR.7842913

[6] FIRMA DOMINGO 23:14 — Peso: 10/100 — ALTO
    Evidencia : Contrato firmado domingo 03/05/2026 a las 23:14.
                Patrón documentado en escándalos PAE Cauca 2019-2022.
    Norma     : Ley 1474/2011 — Estatuto Anticorrupción
    Fuente    : SECOP I — metadatos firma

[7] DESAJUSTE GEOGRÁFICO — Peso: 10/100 — MEDIO
    Evidencia : Contratista en Bogotá D.C. para ejecución en Argelia,
                Cauca (520 km, 12 h). Sin sucursal en Cauca.
    Norma     : Decreto 1082/2015 — Principio de economía y eficiencia
    Fuente    : RUES / SECOP I

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORGANISMOS RECOMENDADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  → Contraloría General de la República
    Oficina de Participación Ciudadana
    contraloria.gov.co/web/denuncia-ciudadana

  → Procuraduría General de la Nación
    Sistema Único de Información de Quejas y Soluciones
    accion.procuraduria.gov.co

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVISO LEGAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este reporte contiene indicadores estadísticos de riesgo,
NO acusaciones formales. Los hallazgos ameritan revisión
humana por parte de los organismos de control competentes.

Metodología: Fazekas & Kocsis (2020) + OCP Red Flags (2024)
Datos: SECOP I, SECOP II, RUES, SIGEP II, SIRI (públicos)
Generado: VIGÍA — vigia.gov.co · 09/05/2026`;

export default MOCK_CONTRACT;
