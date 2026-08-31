"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  searchTrafos,
  googleMapsPointUrl,
  googleMapsRouteUrl,
  type Trafo,
} from "@/lib/trafos";
import { copyToClipboard } from "@/lib/clipboard";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-400">
      Carregando mapa…
    </div>
  ),
});

export default function AppShell() {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Trafo[]>([]);
  const [notFound, setNotFound] = useState<string[]>([]);
  const [selected, setSelected] = useState<Trafo | null>(null);
  const [searched, setSearched] = useState(false);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const hasQuery = query.trim().length > 0;

  async function handleCopyCoords(t: Trafo, e: React.MouseEvent) {
    e.stopPropagation();
    const ok = await copyToClipboard(`${t.lat}, ${t.lng}`);
    if (ok) {
      setCopiedName(t.name);
      setTimeout(() => setCopiedName((cur) => (cur === t.name ? null : cur)), 1500);
    }
  }

  function runSearch() {
    if (!hasQuery) {
      setFound([]);
      setNotFound([]);
      setSelected(null);
      setSearched(false);
      return;
    }
    const result = searchTrafos(query);
    setFound(result.found);
    setNotFound(result.notFound);
    setSelected(result.found[0] ?? null);
    setSearched(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runSearch();
    }
  }

  function clearAll() {
    setQuery("");
    setFound([]);
    setNotFound([]);
    setSelected(null);
    setSearched(false);
  }

  const routeUrl = useMemo(
    () => (found.length > 1 ? googleMapsRouteUrl(found) : null),
    [found]
  );

  return (
    <div className="flex h-full flex-col lg:flex-row gap-4 p-4">
      <aside className="flex w-full flex-col gap-3 lg:w-[380px] lg:shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <label htmlFor="query" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Números de trafo
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder={"Ex.: NI38912\nou vários: NI38912, NI801109 N800805\n(cole uma coluna inteira, um por linha)"}
            className="w-full resize-none rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="mt-1 text-xs text-gray-400">
            Separe vários códigos por vírgula, espaço ou quebra de linha. Ctrl+Enter busca direto.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={runSearch}
              disabled={!hasQuery}
              className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buscar
            </button>
            <button
              onClick={clearAll}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Limpar
            </button>
          </div>
        </div>

        {searched && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Resultados ({found.length})
              </h2>
              {routeUrl && (
                <a
                  href={routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-brand-600 underline hover:text-brand-700"
                >
                  Abrir rota com todos no Google Maps
                </a>
              )}
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
              {found.length === 0 && (
                <p className="p-4 text-sm text-gray-400">Nenhum trafo encontrado.</p>
              )}
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {found.map((t) => {
                  const isSelected = selected?.name === t.name;
                  return (
                    <li key={t.name}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelected(t)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(t);
                          }
                        }}
                        className={`w-full cursor-pointer px-4 py-2.5 text-left transition-colors ${
                          isSelected
                            ? "bg-brand-50 dark:bg-brand-700/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {t.name}
                          </span>
                          <a
                            href={googleMapsPointUrl(t)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-xs font-medium text-brand-600 underline hover:text-brand-700"
                          >
                            Google Maps
                          </a>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                            {t.lat.toFixed(6)}, {t.lng.toFixed(6)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyCoords(t, e)}
                            title="Copiar coordenada"
                            className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                          >
                            {copiedName === t.name ? "✓ Copiado" : "📋 Copiar"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {notFound.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <strong>Não encontrado{notFound.length > 1 ? "s" : ""}:</strong>{" "}
                {notFound.join(", ")}
              </div>
            )}
          </div>
        )}
      </aside>

      <main className="min-h-[50vh] flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
        <MapView results={found} selected={selected} onSelect={setSelected} />
      </main>
    </div>
  );
}
