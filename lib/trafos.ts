import rawData from "@/data/trafos.json";

export type Trafo = {
  name: string;
  lat: number;
  lng: number;
};

export const trafos = rawData as Trafo[];

const indexByName = new Map<string, Trafo>(
  trafos.map((t) => [t.name.toUpperCase(), t])
);

export type SearchResult = {
  found: Trafo[];
  notFound: string[];
};

/**
 * Aceita um texto com um ou vários códigos de trafo separados por vírgula,
 * ponto e vírgula, espaço ou quebra de linha (útil ao colar uma coluna
 * copiada de uma planilha). Tenta correspondência exata primeiro; se um
 * termo não bater exatamente com nenhum nome, tenta correspondência parcial
 * (contém) como alternativa.
 */
export function searchTrafos(query: string): SearchResult {
  const tokens = Array.from(
    new Set(
      query
        .split(/[\s,;]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => t.toUpperCase())
    )
  );

  const found: Trafo[] = [];
  const foundNames = new Set<string>();
  const notFound: string[] = [];

  for (const token of tokens) {
    const exact = indexByName.get(token);
    if (exact) {
      if (!foundNames.has(exact.name)) {
        found.push(exact);
        foundNames.add(exact.name);
      }
      continue;
    }

    const partial = trafos.filter((t) => t.name.toUpperCase().includes(token));
    if (partial.length > 0) {
      for (const t of partial) {
        if (!foundNames.has(t.name)) {
          found.push(t);
          foundNames.add(t.name);
        }
      }
    } else {
      notFound.push(token);
    }
  }

  found.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return { found, notFound };
}

export function googleMapsPointUrl(t: Trafo): string {
  return `https://www.google.com/maps?q=${t.lat},${t.lng}`;
}

/**
 * Monta uma URL de rota do Google Maps passando por vários pontos.
 * O Google Maps (interface web) aceita cerca de 25 paradas por rota;
 * limitamos por segurança para manter a URL curta e funcional.
 */
export function googleMapsRouteUrl(list: Trafo[], maxStops = 23): string {
  const stops = list.slice(0, maxStops);
  const path = stops.map((t) => `${t.lat},${t.lng}`).join("/");
  return `https://www.google.com/maps/dir/${path}`;
}
