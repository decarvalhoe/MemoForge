import { el, clear } from './dom.js';
import { t } from '../game/i18n.js';
import { explain } from '../game/bytes.js';

// Explorateur d'octets (E6-7, cours M1/M2) : montre qu'un int s'étale sur 4 cases d'octet
// en little-endian (1000 → e8 03 00 00). Rendu pour les niveaux qui l'activent (showBytes).
// Vue PURE : on lui passe le snapshot mémoire et les noms de variables à décomposer.

export function renderBytes(container, snapshot, names = []) {
	clear(container);
	const wanted = snapshot.filter((c) => names.includes(c.name));
	if (!wanted.length)
		return;
	container.appendChild(el('div', { class: 'heap-label', text: '// explorateur d\'octets (little-endian)' }));
	const strip = el('div', { style: 'display:flex;flex-direction:column;gap:6px' });
	for (const cell of wanted) {
		const e = explain(cell.value);
		const row = el('div', { style: 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:var(--font-mono);font-size:var(--fs-2xs)' });
		row.appendChild(el('span', { style: 'color:var(--text)', text: `${cell.name} = ${e.value}` }));
		row.appendChild(el('span', { style: 'color:var(--text-muted)', text: e.compact }));
		const bytes = el('div', { style: 'display:flex;gap:4px' });
		for (const b of e.bytes)
			bytes.appendChild(el('span', {
				style: 'padding:2px 6px;color:var(--accent);background:var(--surface-well);border:1px solid var(--border);border-radius:var(--radius-sm)',
				text: b.toString(16).padStart(2, '0')
			}));
		row.appendChild(bytes);
		strip.appendChild(row);
	}
	container.appendChild(strip);
}
