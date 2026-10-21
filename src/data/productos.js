export const CHAPAS = [
  {
    slug: "laminado-en-caliente",
    nombre: "Laminado en Caliente",
    resumen: "Chapa obtenida por deformación del acero a altas temperaturas. Disponible en Negro y Decapado.",
    descripcion:
      "Elaborada a través de un proceso termomecánico que deforma el acero a altas temperaturas. " +
      "Ofrecemos stock permanente en distintos espesores y anchos, con servicio de corte a medida o en tamaños estándar.",
    normas: ["IRAM-IAS U 500-231 (uso comercial)", "IRAM-IAS U 500-42 (uso estructural)"],
    formas: [
      { titulo: "Negro", texto: "Tal como sale del proceso de laminado en caliente, sin tratamiento posterior." },
      { titulo: "Decapado", texto: "Se le remueve la capa de óxido de laminación mediante un baño ácido." },
    ],
    aplicaciones: [
      "Carrocerías y carpintería metálica",
      "Muebles metálicos",
      "Galpones industriales",
      "Autopartes",
      "Talleres navales",
      "Maquinaria agrícola",
    ],
  },
  {
    slug: "laminado-en-frio",
    nombre: "Laminado en Frío",
    resumen: "Menor espesor y mejor terminación superficial, obtenida deformando en frío chapa ya laminada en caliente.",
    descripcion:
      "El laminado en frío reduce el espesor de la chapa y mejora su formabilidad y terminación superficial, " +
      "quedando apta para una amplia variedad de aplicaciones que requieren buen acabado.",
    normas: ["IRAM-IAS U 500-05 / SPO", "IRAM-IAS U 500-42 (estructural)"],
    formas: [
      { titulo: "Crudo (Full Hard)", texto: "Sin recocido, de baja ductilidad, pensado para galvanizado u otro proceso posterior." },
      { titulo: "Recocido", texto: "Tratado térmicamente para recuperar ductilidad de cara a nuevas operaciones de conformado en frío." },
    ],
    aplicaciones: [
      "Industria automotriz",
      "Carpintería metálica",
      "Línea blanca",
      "Artefactos de iluminación y motores eléctricos",
      "Construcción",
    ],
  },
  {
    slug: "laminado-en-caliente-decapado",
    nombre: "Laminado en Caliente Decapado",
    resumen: "Laminado en caliente con la calamina removida por decapado ácido: superficie limpia, lista para trabajar.",
    descripcion:
      "Partimos de chapa laminada en caliente y le removemos el óxido de laminación mediante decapado ácido, " +
      "dejando una superficie limpia y uniforme, lista para pintar, soldar o conformar sin preparación adicional.",
    normas: ["IRAM-IAS U 500-231", "IRAM-IAS U 500-42"],
    aplicaciones: [
      "Estructuras metálicas",
      "Piezas soldadas",
      "Procesos de pintura directa",
      "Fabricación de perfiles",
    ],
  },
  {
    slug: "galvanizadas",
    nombre: "Galvanizadas",
    resumen: "Chapa recocida en continuo e inmersa en zinc fundido, con una capa protectora en ambas caras.",
    descripcion:
      "Se obtiene a partir de chapa laminada en frío (full hard) o laminada en caliente decapada, que se recuece en " +
      "continuo y se sumerge en zinc fundido. El resultado es un producto resistente que protege al acero de la corrosión.",
    normas: ["IRAM-IAS U 500-214"],
    aplicaciones: ["Fabricación de silos", "Cerramientos", "Perfiles", "Paneles"],
  },
  {
    slug: "laminado-en-caliente-antideslizante",
    nombre: "Laminado en Caliente Antideslizante",
    resumen: "Chapa estampada con relieve antideslizante para superficies de tránsito seguras.",
    descripcion:
      "Chapa laminada en caliente con un relieve estampado que mejora la adherencia, pensada para pisos, " +
      "pasarelas y plataformas donde se necesita una superficie de tránsito segura.",
    normas: ["IRAM-IAS U 500-231"],
    aplicaciones: ["Pisos industriales", "Pasarelas y plataformas", "Escalones", "Carrocerías"],
  },
];

export const TUBOS = [
  {
    slug: "redondos",
    nombre: "Tubos Redondos",
    resumen: "Tubos estructurales de sección circular, para uso general y estructural.",
  },
  {
    slug: "rectangulares",
    nombre: "Tubos Rectangulares",
    resumen: "Tubos estructurales de sección rectangular, ideales para estructuras y carpintería metálica.",
  },
  {
    slug: "cuadrados",
    nombre: "Tubos Cuadrados",
    resumen: "Tubos estructurales de sección cuadrada, de uso muy extendido en estructuras y mobiliario metálico.",
  },
].map((t) => ({
  ...t,
  descripcion:
    "Tubos estructurales soldados, de distribución oficial Ternium. Mantenemos stock permanente en múltiples " +
    "medidas y espesores — consultanos por la medida exacta que necesitás para tu proyecto.",
  aplicaciones: [
    "Estructuras metálicas",
    "Carpintería metálica",
    "Maquinaria agrícola",
    "Muebles y mobiliario urbano",
    "Cerramientos y barandas",
  ],
}));

for (const p of [...CHAPAS, ...TUBOS]) {
  p.imagen = `/img/productos/${p.slug}.jpg`;
}

export function buscarProducto(categoria, slug) {
  const lista = categoria === "tubos" ? TUBOS : CHAPAS;
  return lista.find((p) => p.slug === slug);
}
