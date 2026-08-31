import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grenah — Diagnóstico de Comunicação",
  description: "Painel interno Grenah para geração de diagnósticos de comunicação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
