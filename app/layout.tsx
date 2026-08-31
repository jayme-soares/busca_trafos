import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Busca de Trafos",
  description: "Busque trafos por código e visualize a localização no mapa",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">
        <div className="flex h-full flex-col">
          <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              🔌 Busca de Trafos
            </h1>
          </header>
          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
