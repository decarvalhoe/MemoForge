import { el, clear } from './dom.js';

function cellBox(name, address, value, opts = {}) {
	const display = opts.isNull ? 'NULL' : value;
	return el('div', {
		class: 'cell'
			+ (opts.ptr ? ' cell-ptr' : '')
			+ (opts.heap ? ' cell-heap' : '')
			+ (opts.freed ? ' cell-freed' : '')
			+ (opts.hit ? ' cell-hit' : '')
	}, [
		el('div', { class: 'cell-name', text: name }),
		el('div', { class: 'cell-addr', text: 'n° ' + address }),
		el('div', { class: 'cell-val', text: String(display) })
	]);
}

export function renderMemory(container, snapshot, heap, changed) {
	clear(container);
	const row = el('div', { class: 'cells' });
	for (const c of snapshot) {
		const ptr = c.kind === 'ptr';
		row.appendChild(cellBox(
			c.name + (ptr ? '  (ptr)' : ''), c.address, c.value,
			{ ptr, isNull: ptr && c.value === 0, hit: changed.has(c.name) }
		));
	}
	container.appendChild(row);

	if (heap && heap.length) {
		container.appendChild(el('div', { class: 'heap-label', text: 'tas — mémoire dynamique' }));
		const hrow = el('div', { class: 'cells' });
		for (const h of heap)
			hrow.appendChild(cellBox(
				h.freed ? 'libéré' : 'alloué', h.address, h.freed ? '—' : h.value,
				{ heap: true, freed: h.freed }
			));
		container.appendChild(hrow);
	}
}
