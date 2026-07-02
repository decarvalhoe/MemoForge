import { el, clear } from './dom.js';
import { t } from '../game/i18n.js';
import { badge } from './components/index.js';

// Visualisation du contrôle de flux pour le pas-à-pas, d'après le contrat moteur (#79) :
//
//   interp.frames() -> [{ label, vars: [{name, value, kind}], loop?: {i, n} }]   (bas -> haut)
//
// Deux cas :
//   - BOUCLE (B7) : une seule frame qui exécute une boucle → indicateur « ⟳ tour i/n ».
//   - RÉCURSION/APPELS (B9/B11) : plusieurs frames → pile d'appels (sommet en premier).
// `callStackModel` est PUR (testable sans DOM) ; `renderCallStack` n'est que le rendu.

function iterLabel(loop) {
	return `tour ${loop.i + 1}${loop.n == null ? '' : ' / ' + loop.n}`;
}

/**
 * @param {Array<{label:string, vars?:Array, loop?:{i:number,n:number|null}}>} frames
 * @returns {{visible:boolean, loop:({i:number,n:number|null})|null, frames:Array}}
 */
export function callStackModel(frames = []) {
	if (!Array.isArray(frames) || frames.length === 0) return { visible: false, loop: null, frames: [] };
	const topFrame = frames[frames.length - 1];
	const hasStack = frames.length > 1;
	const loop = topFrame.loop ? { i: topFrame.loop.i, n: topFrame.loop.n } : null;
	if (!hasStack && !loop) return { visible: false, loop: null, frames: [] };
	const top = frames.length - 1;
	return {
		visible: true,
		loop,
		frames: hasStack
			? frames.map((f, i) => ({
				label: f.label,
				active: i === top,
				loopLabel: f.loop ? iterLabel(f.loop) : null,
				vars: (f.vars || []).map((v) => ({ name: v.name, value: v.value == null ? '—' : v.value }))
			})).reverse()
			: []
	};
}

/** Rend l'indicateur de boucle et/ou la pile d'appels. Ne rend rien pour un programme à plat. */
export function renderCallStack(container, frames = []) {
	clear(container);
	const model = callStackModel(frames);
	if (!model.visible) return;

	if (model.loop) {
		container.appendChild(el('div', { style: 'margin-bottom:8px' }, [
			badge({ text: '⟳ ' + iterLabel(model.loop), tone: 'pointer' })
		]));
	}

	if (model.frames.length) {
		container.appendChild(el('div', { class: 'heap-label', text: t('// pile d\'appels') }));
		const strip = el('div', { style: 'display:flex;flex-direction:column;gap:6px' });
		for (const f of model.frames) {
			const head = el('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:3px' }, [
				el('span', { style: `font-family:var(--font-mono);font-size:var(--fs-sm);font-weight:600;color:${f.active ? 'var(--accent)' : 'var(--text-muted)'}`, text: f.label })
			]);
			if (f.loopLabel) head.appendChild(badge({ text: f.loopLabel, tone: 'pointer' }));
			const vars = el('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' },
				f.vars.map((v) => el('span', { style: 'font-family:var(--font-mono);font-size:var(--fs-2xs);color:var(--text-muted)', text: `${v.name}=${v.value}` })));
			strip.appendChild(el('div', {
				style: `background:var(--surface-well);border:1px solid ${f.active ? 'var(--accent)' : 'var(--border)'};border-radius:var(--radius-sm);padding:8px 10px;${f.active ? 'box-shadow:var(--glow-green);' : ''}`
			}, [head, vars]));
		}
		container.appendChild(strip);
	}
}
