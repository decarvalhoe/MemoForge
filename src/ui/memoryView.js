import { el, clear } from './dom.js';
import { locker } from './components/index.js';

// Rend le mur de casiers via le composant Locker (design-system). Signature inchangée :
// game.js n'a pas à bouger.
export function renderMemory(container, snapshot, heap, changed) {
	clear(container);
	const row = el('div', { class: 'cells' });
	for (const c of snapshot) {
		const ptr = c.kind === 'ptr';
		const isNull = ptr && c.value === 0;
		const state = changed.has(c.name) ? 'changed' : (ptr ? 'pointer' : 'normal');
		row.appendChild(locker({
			name: c.name + (ptr ? '  (ptr)' : ''),
			address: c.address,
			value: isNull ? 'NULL' : c.value,
			state
		}));
	}
	container.appendChild(row);

	if (heap && heap.length) {
		container.appendChild(el('div', { class: 'heap-label', text: 'tas — mémoire dynamique' }));
		const hrow = el('div', { class: 'cells' });
		for (const h of heap) {
			hrow.appendChild(locker({
				name: h.freed ? 'libéré' : 'alloué',
				address: h.address,
				value: h.freed ? '—' : h.value,
				state: h.freed ? 'freed' : 'allocated'
			}));
		}
		container.appendChild(hrow);
	}
}
