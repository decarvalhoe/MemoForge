import { el, clear } from './dom.js';
import { badge } from './components/index.js';

// Vue « pile d'appels » pour le pas-à-pas des niveaux à contrôle de flux (récursion B9,
// pointeurs de fonction B11, boucles B7). PRÉPARÉE pour le contrat proposé à la lane moteur
// (issue #20) :
//
//   interp.frames() -> [{ label, vars: [{name, value, kind}], loop?: {i, n} }]   (bas -> haut)
//
// `callStackModel` est PUR (testable sans DOM) ; `renderCallStack` n'est que le rendu.
// Provisoire tant que #20 n'est pas mergé — la forme suivra ce qu'expose finalement ast.js.

/**
 * Transforme les frames moteur en modèle de vue (sommet en premier).
 * @param {Array<{label:string, vars?:Array, loop?:{i:number,n:number}}>} frames
 * @returns {{visible:boolean, frames:Array}}
 */
export function callStackModel(frames = []) {
	if (!Array.isArray(frames) || frames.length <= 1) return { visible: false, frames: [] };
	const top = frames.length - 1;
	return {
		visible: true,
		frames: frames.map((f, i) => ({
			label: f.label,
			active: i === top,
			loopLabel: f.loop ? `tour ${f.loop.i}/${f.loop.n}` : null,
			vars: (f.vars || []).map((v) => ({ name: v.name, value: v.value == null ? '—' : v.value }))
		})).reverse()
	};
}

/** Rend la pile dans `container`. Ne rend rien pour un programme à plat (≤ 1 frame). */
export function renderCallStack(container, frames = []) {
	clear(container);
	const model = callStackModel(frames);
	if (!model.visible) return;

	container.appendChild(el('div', { class: 'heap-label', text: '// pile d\'appels' }));
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
