#!/usr/bin/env node
/**
 * Päivitä lib/todistusvalinta/thresholds.json Vipunen-raportin CSV-viennistä.
 *
 * 1. Avaa https://vipunen.fi/fi-fi/kkyhteiset/Sivut/Haku-ja-valinta.aspx
 * 2. "Ammattikorkeakoulutuksen ja yliopistokoulutuksen yhteishaun pisterajat"
 * 3. Suodata: sektori=yliopisto, valintatapa=todistusvalinta, alkamisvuosi=2026, kausi=syksy
 * 4. Vie Excel/CSV ja tallenna data/vipunen-pisterajat.csv
 * 5. Aja: node scripts/import-vipunen-pisterajat.mjs
 *
 * CSV:ssä odotetaan vähintään: hakukohde-id tai nimi + alin pistemäärä + valintajono.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CSV_PATH = join(ROOT, "data/vipunen-pisterajat.csv");
const OUT_PATH = join(ROOT, "lib/todistusvalinta/thresholds.json");
const PROGRAMS_PATH = join(ROOT, "lib/todistusvalinta/programs.js");

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    return row;
  });
}

function num(val) {
  if (!val) return null;
  const n = parseFloat(String(val).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function loadProgramIds() {
  const src = readFileSync(PROGRAMS_PATH, "utf8");
  const ids = [...src.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
  return new Set(ids);
}

function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`Puuttuu ${CSV_PATH}`);
    console.error("Vie Vipunen-raportti CSV:nä ja aja uudelleen.");
    process.exit(1);
  }

  const existing = JSON.parse(readFileSync(OUT_PATH, "utf8"));
  const knownIds = loadProgramIds();
  const rows = parseCsv(readFileSync(CSV_PATH, "utf8"));
  let updated = 0;

  for (const row of rows) {
    const id = row["program_id"] || row["hakukohde_id"] || row.id;
    if (!id || !knownIds.has(id)) continue;

    const year = parseInt(row.vuosi || row.year || "2026", 10);
    const firstMin = num(row.ensikertalaiset ?? row.firstmin ?? row["alin ensikertalaisille"]);
    const min = num(row.kaikki ?? row.min ?? row["alin hyväksytty"] ?? row.pistemäärä);
    if (firstMin == null && min == null) continue;

    if (!existing.programs[id]) existing.programs[id] = {};
    existing.programs[id][year] = {
      min: min ?? firstMin,
      firstMin: firstMin ?? min,
      firstOnly: row.firstonly === "true" || row["vain ensikertalaiset"] === "1",
    };
    updated += 1;
  }

  existing.meta.updated = new Date().toISOString().slice(0, 10);
  existing.meta.source = "Vipunen CSV-vienti (Opintopolun opiskelijavalintarekisteri)";

  writeFileSync(OUT_PATH, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(`Päivitetty ${updated} hakukohdetta → ${OUT_PATH}`);
}

main();
