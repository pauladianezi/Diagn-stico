import type { Metadata } from "next";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grenah | Diagnóstico de Comunicação",
  description: "Painel interno Grenah para geração de diagnósticos de comunicação",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
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
