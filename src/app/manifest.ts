import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Centro Financiero del Consultorio",
    short_name: "Dr. Dubon",
    description: "Control diario de ingresos, gastos, libro diario y reportes financieros para el consultorio médico del Dr. Oscar Dubon.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f4c81",
    icons: [
      {
        src: "/images/favicon.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
    ],
  };
}
