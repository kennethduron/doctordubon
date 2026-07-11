import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://doctordubon.vercel.app";
const siteTitle = "Centro Financiero del Consultorio | Dr. Oscar Dubon";
const siteDescription = "Control diario de ingresos, gastos, libro diario y reportes financieros para el consultorio médico del Dr. Oscar Dubon.";
const openGraphDescription = "Sistema privado para controlar ingresos, gastos, libro diario y reportes financieros del consultorio médico.";
const openGraphImage = "/images/doctordubon.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Centro Financiero del Consultorio",
  authors: [{ name: "Ken Code" }],
  creator: "Ken Code",
  publisher: "Ken Code",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: siteTitle,
    description: openGraphDescription,
    url: siteUrl,
    siteName: "Centro Financiero del Consultorio",
    images: [
      {
        url: openGraphImage,
        width: 1200,
        height: 630,
        alt: "Doctor Dubon - Centro Financiero del Consultorio",
      },
    ],
    locale: "es_HN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: "Control financiero diario para el consultorio médico del Dr. Oscar Dubon.",
    images: [openGraphImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}