// main.ts — the entry program of Neon Bay Cover Studio (Node 22, stdlib only).
// It hands the entry in: it copies app/ and screenshots/ from this
// repository into the output directory and writes /output/dossier.json
// with buildDossier from the kit's vendor/makefun-app.ts. Outside the
// grader, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = import.meta.dirname;
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
for (const name of ['app', 'screenshots']) {
  cpSync(join(repoRoot, name), join(outDir, name), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`dossier written: ${dossier.length} bytes -> ${join(outDir, 'dossier.json')}`);
