// Build de prod (E5-4) — `npm run build` → dist/ servi statiquement tel quel.
//
// Le jeu est du vanilla ES modules sans dépendance runtime : « builder » = assembler
// l'artefact par LISTE BLANCHE (le prototype React de design/, les docs, les tests et
// l'outillage restent hors-prod). Pas de bundler ni de minification : 130 KB non minifié
// (budget docs/PERF.md), la compression HTTP fait le reste. dist/ est vérifié par le
// harnais visuel (`npm run test:visual -- --root dist`) — mêmes écrans, mêmes budgets.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// Liste blanche : tout ce dont le jeu servi a besoin, rien d'autre.
const INCLUDE = ['index.html', 'styleguide.html', 'src', 'styles'];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const entry of INCLUDE)
	fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), { recursive: true });

// Traçabilité de l'artefact (version sémantique + commit + date de build).
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
let commit = 'unknown';
try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).toString().trim(); } catch { /* hors dépôt git */ }
fs.writeFileSync(path.join(DIST, 'build-info.json'), JSON.stringify({
	name: pkg.name, version: pkg.version, commit, builtAt: new Date().toISOString()
}, null, '\t') + '\n');

const size = (dir) => {
	let total = 0;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		total += e.isDirectory() ? size(p) : fs.statSync(p).size;
	}
	return total;
};
console.log(`dist/ prêt — ${(size(DIST) / 1024).toFixed(0)} KB (v${pkg.version} @ ${commit})`);
