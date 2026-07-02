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
		let file = path.join(ROOT, clean || 'index.html');
		if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
		if (req.url === '/' || clean === '.') file = path.join(ROOT, 'index.html');
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
			return cards >= 10 && txt.includes('Récursivité') && txt.includes('Pointeurs de fonction')
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
