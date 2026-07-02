// Harnais de tests visuels (E0-6) — `npm run test:visual`.
//
// Produit ET vérifie les captures des écrans clés :
//   1. capture chaque écran dans tests/visual/out/ (toujours) ;
//   2. vérifie des invariants STRUCTURELS par écran (l'écran rend vraiment ce qu'il doit) ;
//   3. compare au pixel près à la référence tests/visual/baseline/<plateforme>/ quand elle
//      existe (le rendu des polices varie selon l'OS → références par plateforme).
//      Référence absente = créée (seeding, info). `--update` régénère les références.
//
// Chrome : PUPPETEER_EXECUTABLE_PATH > cache Puppeteer (~/.cache/puppeteer) > emplacements
// standards (google-chrome/chromium sur Linux, Chrome/Edge sur Windows, Chrome sur macOS).
// Écrans pilotés via window.__memoforge (src/main.js) — déterministe, sans clics fragiles.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'tests', 'visual', 'out');
const BASE_DIR = path.join(ROOT, 'tests', 'visual', 'baseline', process.platform);
const UPDATE = process.argv.includes('--update');
// `--root dist` : sert (et pèse) un autre répertoire racine — vérifie l'artefact de prod
// (E5-4) avec les mêmes écrans, invariants et budgets que les sources.
const rootArg = process.argv.indexOf('--root');
const SERVE_ROOT = rootArg > -1 ? path.resolve(ROOT, process.argv[rootArg + 1]) : ROOT;
const PORT = 8123;
const VIEWPORT = { width: 1280, height: 900, deviceScaleFactor: 1 };
const MAX_DIFF_RATIO = 0.005; // 0,5 % de pixels divergents tolérés (anti-aliasing)

// ---------------------------------------------------------------- serveur statique
const MIME = {
	'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
	'.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json'
};

function serve() {
	const server = http.createServer((req, res) => {
		const clean = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^([/\\])+/, '');
		let file = path.join(SERVE_ROOT, clean || 'index.html');
		if (!file.startsWith(SERVE_ROOT)) { res.writeHead(403); res.end(); return; }
		if (req.url === '/' || clean === '.') file = path.join(SERVE_ROOT, 'index.html');
		fs.readFile(file, (err, data) => {
			if (err) { res.writeHead(404); res.end('not found'); return; }
			res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
			res.end(data);
		});
	});
	return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

// ---------------------------------------------------------------- résolution de Chrome
function chromeFromPuppeteerCache() {
	const cache = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
	if (!fs.existsSync(cache)) return null;
	for (const version of fs.readdirSync(cache)) {
		const dir = path.join(cache, version);
		for (const sub of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
			for (const bin of ['chrome', 'chrome.exe', path.join('Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing')]) {
				const p = path.join(dir, sub, bin);
				if (fs.existsSync(p)) return p;
			}
		}
	}
	return null;
}

const CHROME_CANDIDATES = {
	linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium'],
	win32: [
		'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
		'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
		'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
	],
	darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
};

function findChrome() {
	if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH))
		return process.env.PUPPETEER_EXECUTABLE_PATH;
	const cached = chromeFromPuppeteerCache();
	if (cached) return cached;
	return (CHROME_CANDIDATES[process.platform] || []).find((p) => fs.existsSync(p)) || null;
}

// ---------------------------------------------------------------- écrans clés
// Chaque écran : une préparation déterministe (dans la page) + des invariants structurels.
const SCREENS = [
	{
		name: 'carte',
		url: '/',
		verify: () => {
			const cards = document.querySelectorAll('.mf-region').length;
			const txt = document.body.innerText;
			return cards >= 9 && txt.includes('Récursivité') && txt.includes('Listes & arbres')
				|| `carte incomplète (${cards} salles)`;
		}
	},
	{
		name: 'salle-1-1',
		url: '/',
		prepare: () => { window.__memoforge.enterRoom('1-1'); },
		verify: () => {
			const title = document.querySelector('.mission-title');
			const palette = document.querySelectorAll('.palette button').length;
			return !!title && title.textContent.includes('42') && palette >= 2
				|| 'salle 1-1 : mission ou palette manquante';
		}
	},
	{
		// La pile d'appels réelle, au plus profond de fact(3) — l'écran emblème du Monde 6.
		name: 'salle-rec-1-pile',
		url: '/',
		prepare: () => {
			const g = window.__memoforge;
			g.enterRoom('rec-1');
			for (const id of ['base', 'rec', 'comb']) g.addBlock(g.level.bank.find((b) => b.id === id));
			g.freshInterp();
			while (!g.interp.done && g.interp.frames().length < 4) g.interp.step();
			g.render();
		},
		verify: () => {
			// innerText passe par text-transform (uppercase) → comparaison insensible à la casse.
			const txt = ((document.querySelector('.callstack') || {}).innerText || '').toLowerCase();
			return txt.includes('pile d\'appels') && txt.includes('fact(3)') && txt.includes('fact(1)')
				|| 'pile d\'appels absente ou incomplète : ' + JSON.stringify(txt.slice(0, 80));
		}
	},
	{
		name: 'styleguide',
		url: '/styleguide.html',
		verify: () => document.querySelectorAll('h2').length >= 3 || 'styleguide sans sections'
	}
];

// ---------------------------------------------------------------- capture + comparaison
async function shoot(page, screen) {
	await page.goto(`http://127.0.0.1:${PORT}${screen.url}`, { waitUntil: 'networkidle0' });
	await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }' });
	if (screen.prepare) await page.evaluate(screen.prepare);
	const result = await page.evaluate(screen.verify);
	const outFile = path.join(OUT_DIR, `${screen.name}.png`);
	await page.screenshot({ path: outFile, fullPage: false });
	return { ok: result === true, detail: result === true ? null : result, outFile };
}

function compareToBaseline(name, outFile) {
	const baseFile = path.join(BASE_DIR, `${name}.png`);
	if (UPDATE || !fs.existsSync(baseFile)) {
		fs.copyFileSync(outFile, baseFile);
		return { status: UPDATE ? 'mise à jour' : 'créée (seed)' };
	}
	const a = PNG.sync.read(fs.readFileSync(baseFile));
	const b = PNG.sync.read(fs.readFileSync(outFile));
	if (a.width !== b.width || a.height !== b.height)
		return { status: 'échec', detail: `dimensions ${a.width}x${a.height} → ${b.width}x${b.height}` };
	const diff = new PNG({ width: a.width, height: a.height });
	const bad = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
	const ratio = bad / (a.width * a.height);
	if (ratio > MAX_DIFF_RATIO) {
		const diffFile = path.join(OUT_DIR, `${name}.diff.png`);
		fs.writeFileSync(diffFile, PNG.sync.write(diff));
		return { status: 'échec', detail: `${(ratio * 100).toFixed(2)} % de pixels divergents (diff : ${path.relative(ROOT, diffFile)})` };
	}
	return { status: 'conforme', detail: `${(ratio * 100).toFixed(2)} %` };
}

// ---------------------------------------------------------------- budget de perf (docs/PERF.md)
const PERF_BUDGET = { weightKB: 200, roomMedianMs: 16, roomP95Ms: 32, mapMedianMs: 16 };

function appWeightKB() {
	let total = 0;
	const walk = (dir) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, entry.name);
			if (entry.isDirectory()) walk(p);
			else total += fs.statSync(p).size;
		}
	};
	total += fs.statSync(path.join(SERVE_ROOT, 'index.html')).size;
	walk(path.join(SERVE_ROOT, 'src'));
	walk(path.join(SERVE_ROOT, 'styles'));
	return total / 1024;
}

// Mesure 60 rendus de la vue la plus chargée (salle rec-1, pile déployée) et de la carte.
async function measurePerf(page) {
	await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle0' });
	return page.evaluate(() => {
		const g = window.__memoforge;
		const stats = (fn) => {
			const t = [];
			for (let i = 0; i < 60; i++) { const t0 = performance.now(); fn(); t.push(performance.now() - t0); }
			t.sort((a, b) => a - b);
			return { median: t[30], p95: t[Math.floor(60 * 0.95)] };
		};
		g.enterRoom('rec-1');
		for (const id of ['base', 'rec', 'comb']) g.addBlock(g.level.bank.find((b) => b.id === id));
		g.freshInterp();
		while (!g.interp.done && g.interp.frames().length < 4) g.interp.step();
		const room = stats(() => g.render());
		g.showMap();
		const map = stats(() => g.renderMap());
		return { room, map };
	});
}

async function checkPerfBudget(page) {
	let failures = 0;
	const kb = appWeightKB();
	const okW = kb <= PERF_BUDGET.weightKB;
	if (!okW) failures += 1;
	console.log(`${okW ? '✔' : '✖'} perf — poids app : ${kb.toFixed(0)} KB (budget ${PERF_BUDGET.weightKB} KB)`);
	const { room, map } = await measurePerf(page);
	const okRoom = room.median <= PERF_BUDGET.roomMedianMs && room.p95 <= PERF_BUDGET.roomP95Ms;
	if (!okRoom) failures += 1;
	console.log(`${okRoom ? '✔' : '✖'} perf — rendu salle rec-1 (pile déployée) : médiane ${room.median.toFixed(1)} ms · p95 ${room.p95.toFixed(1)} ms (budget ${PERF_BUDGET.roomMedianMs}/${PERF_BUDGET.roomP95Ms} ms)`);
	const okMap = map.median <= PERF_BUDGET.mapMedianMs;
	if (!okMap) failures += 1;
	console.log(`${okMap ? '✔' : '✖'} perf — rendu carte : médiane ${map.median.toFixed(1)} ms (budget ${PERF_BUDGET.mapMedianMs} ms)`);
	return failures;
}

// ---------------------------------------------------------------- main
async function main() {
	fs.mkdirSync(OUT_DIR, { recursive: true });
	fs.mkdirSync(BASE_DIR, { recursive: true });
	const chrome = findChrome();
	if (!chrome) {
		console.error('✖ Aucun Chrome/Chromium trouvé (PUPPETEER_EXECUTABLE_PATH, cache Puppeteer, emplacements standards).');
		process.exit(1);
	}
	console.log(`Chrome : ${chrome}`);
	const server = await serve();
	const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-gpu', '--force-device-scale-factor=1', '--hide-scrollbars'] });
	let failures = 0;
	try {
		const page = await browser.newPage();
		await page.setViewport(VIEWPORT);
		await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
		for (const screen of SCREENS) {
			const { ok, detail, outFile } = await shoot(page, screen);
			if (!ok) {
				failures += 1;
				console.error(`✖ ${screen.name} — invariant structurel violé : ${detail}`);
				continue;
			}
			const cmp = compareToBaseline(screen.name, outFile);
			if (cmp.status === 'échec') {
				failures += 1;
				console.error(`✖ ${screen.name} — régression visuelle : ${cmp.detail}`);
			} else {
				console.log(`✔ ${screen.name} — structure OK · référence ${cmp.status}${cmp.detail ? ` (${cmp.detail})` : ''}`);
			}
		}
		failures += await checkPerfBudget(page);
	} finally {
		await browser.close();
		server.close();
	}
	if (failures > 0) {
		console.error(`\n${failures} écran(s) en échec.`);
		process.exit(1);
	}
	console.log(`\n${SCREENS.length} écrans clés capturés et vérifiés → tests/visual/out/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
