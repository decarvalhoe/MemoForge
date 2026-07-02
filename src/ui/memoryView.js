import { el, clear } from './dom.js';
import { t } from '../game/i18n.js';
import { locker } from './components/index.js';

const SVGNS = 'http://www.w3.org/2000/svg';

// Trace les « fils pointeur » : un arc ambre du casier pointeur vers le casier dont l'adresse
// = la valeur du pointeur (le déplacement suit le pointeur, cf. GAME_DESIGN). Dessiné après
// layout via requestAnimationFrame (les rects doivent être valides).
function drawThreads(row, snapshot, byAddr) {
	row.querySelectorAll('svg.mf-threads').forEach((s) => s.remove());
	const svg = document.createElementNS(SVGNS, 'svg');
	svg.setAttribute('class', 'mf-threads');
	Object.assign(svg.style, {
		position: 'absolute', inset: '0', width: '100%', height: '100%',
		overflow: 'visible', pointerEvents: 'none', zIndex: '3'
	});
	const rr = row.getBoundingClientRect();
	let drew = false;
	for (const c of snapshot) {
		if (c.kind !== 'ptr' || !c.value) continue;
		const src = byAddr.get(c.address);
		const tgt = byAddr.get(c.value);
		if (!src || !tgt) continue;
		const sr = src.getBoundingClientRect();
		const tr = tgt.getBoundingClientRect();
		const x1 = sr.left + sr.width / 2 - rr.left, y1 = sr.top - rr.top + 6;
		const x2 = tr.left + tr.width / 2 - rr.left, y2 = tr.top - rr.top + 6;
		const cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - 28;
		const path = document.createElementNS(SVGNS, 'path');
		path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
		path.setAttribute('fill', 'none');
		path.setAttribute('stroke', 'var(--pointer)');
		path.setAttribute('stroke-width', '2');
		path.setAttribute('stroke-dasharray', '4 4');
		path.style.filter = 'drop-shadow(0 0 4px rgba(232,184,75,.7))';
		svg.appendChild(path);
		const dot = document.createElementNS(SVGNS, 'circle');
		dot.setAttribute('cx', x2); dot.setAttribute('cy', y2); dot.setAttribute('r', '4');
		dot.setAttribute('fill', 'var(--pointer)');
		svg.appendChild(dot);
		drew = true;
	}
	if (drew) row.appendChild(svg);
}

// Rend le mur de casiers via le composant Locker, + la console de sortie (mem.output) pour
// les niveaux d'affichage (write/putnbr_base).
export function renderMemory(container, snapshot, heap, changed, output) {
	clear(container);
	const row = el('div', { class: 'cells', style: 'position:relative' });
	const byAddr = new Map();
	for (const c of snapshot) {
		const ptr = c.kind === 'ptr';
		const isNull = ptr && c.value === 0;
		const state = changed.has(c.name) ? 'changed' : (ptr ? 'pointer' : 'normal');
		const node = locker({
			name: c.name + (ptr ? '  (ptr)' : ''),
			address: c.address,
			value: isNull ? 'NULL' : c.value,
			state
		});
		row.appendChild(node);
		byAddr.set(c.address, node);
	}
	container.appendChild(row);
	if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => drawThreads(row, snapshot, byAddr));
	else drawThreads(row, snapshot, byAddr);

	if (heap && heap.length) {
		container.appendChild(el('div', { class: 'heap-label', text: t('tas — mémoire dynamique') }));
		const hrow = el('div', { class: 'cells' });
		for (const h of heap) {
			hrow.appendChild(locker({
				name: h.freed ? t('libéré') : t('alloué'),
				address: h.address,
				value: h.freed ? '—' : h.value,
				state: h.freed ? 'freed' : 'allocated'
			}));
		}
		container.appendChild(hrow);
	}

	if (output) {
		container.appendChild(el('div', { class: 'heap-label', text: t('// sortie') }));
		container.appendChild(el('pre', {
			class: 'mf-output',
			style: 'margin:0;padding:10px 12px;background:var(--surface-well);border:1px solid var(--accent);border-radius:var(--radius-sm);color:var(--accent);font-family:var(--font-mono);font-size:var(--fs-md);text-shadow:var(--text-glow-green);white-space:pre-wrap;word-break:break-all',
			text: output
		}));
	}
}
