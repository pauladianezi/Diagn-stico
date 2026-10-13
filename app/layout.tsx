import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat, Crimson_Pro } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

// Montserrat é a fonte de apoio da marca. A Minion (títulos) não tem licença web gratuita;
// a Crimson Pro é a serifada mais próxima e entra como substituta na tela.
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Crimson_Pro({ subsets: ["latin"], variable: "--font-serif-web", display: "swap" });

export const metadata: Metadata = {
  title: "Grenah | Diagnóstico de Comunicação",
  description: "Painel interno Grenah para geração de diagnósticos de comunicação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <div className="flex min-h-screen">
          <Suspense>
            <Sidebar />
          </Suspense>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </body>
    </html>
  );
}
