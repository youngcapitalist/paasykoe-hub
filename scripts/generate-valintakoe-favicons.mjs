#!/usr/bin/env node
/**
 * Regeneroi favicon PNG/ICO -tiedostot public/favicon.svg:stä.
 * Käyttö: node scripts/generate-valintakoe-favicons.mjs [projektipolku ...]
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, basename } from "path";
import { Resvg } from "@resvg/resvg-js";
import pngToIco from "png-to-ico";

const DEFAULT_PROJECTS = [
  "/Users/h.n/projektit/valintakoeapro",
  "/Users/h.n/projektit/valintakoe-b-pro",
  "/Users/h.n/projektit/valintakoe-c-pro",
  "/Users/h.n/projektit/valintakoe-e-pro",
  "/Users/h.n/projektit/valintakoefpro",
];

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    font: { loadSystemFonts: true },
  });
  return resvg.render().asPng();
}

async function generateForProject(projectDir) {
  const svgPath = join(projectDir, "public/favicon.svg");
  if (!existsSync(svgPath)) {
    console.warn(`SKIP ${basename(projectDir)}: no public/favicon.svg`);
    return false;
  }

  const svg = readFileSync(svgPath, "utf8");
  const publicDir = join(projectDir, "public");

  const png32 = renderPng(svg, 32);
  const png180 = renderPng(svg, 180);
  const png512 = renderPng(svg, 512);

  writeFileSync(join(publicDir, "favicon-32.png"), png32);
  writeFileSync(join(publicDir, "apple-touch-icon.png"), png180);
  writeFileSync(join(publicDir, "favicon-512.png"), png512);

  const ico = await pngToIco([png32, png512]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);

  console.log(`OK ${basename(projectDir)}`);
  return true;
}

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PROJECTS;
let ok = 0;
for (const dir of dirs) {
  if (await generateForProject(dir)) ok++;
}
console.log(`Done: ${ok}/${dirs.length} projects`);
