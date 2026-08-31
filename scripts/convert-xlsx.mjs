// Converte base_trafos.xlsx -> data/trafos.json
//
// A planilha mistura dois tipos de registro na mesma tabela:
//  - Transformadores (pontos): name + latitude/longitude válidos
//  - Trechos de rede ("Track ..."): sem latitude/longitude, coordinates
//    contém uma polilinha (vários pares lon,lat,0 separados por espaço)
//
// Este script mantém apenas os registros de transformador (ponto único,
// lat/lon válidos), remove duplicatas exatas e grava um JSON enxuto.

import xlsx from "xlsx";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "..", "base_trafos.xlsx");
const OUT = path.resolve(__dirname, "..", "data", "trafos.json");

const wb = xlsx.readFile(SRC);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

const seen = new Set();
const trafos = [];

for (const row of rows) {
  const name = String(row.name ?? "").trim();
  if (!name || name.toLowerCase().startsWith("track")) continue;

  const lat = Number(row.latitude);
  const lng = Number(row.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

  const key = `${name}|${lat}|${lng}`;
  if (seen.has(key)) continue; // dedup de linhas exatamente repetidas
  seen.add(key);

  trafos.push({ name, lat, lng });
}

trafos.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

writeFileSync(OUT, JSON.stringify(trafos));
console.log(`OK: ${trafos.length} trafos gravados em ${path.relative(process.cwd(), OUT)}`);
