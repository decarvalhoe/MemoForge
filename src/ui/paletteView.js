import { el, clear } from './dom.js';

export function renderPalette(container, bank, full, onAdd) {
	clear(container);
	for (const instr of bank) {
		container.appendChild(el('button', {
			class: 'chip',
			disabled: full ? 'true' : null,
			onclick: () => onAdd(instr)
		}, [el('code', { text: instr.label })]));
	}
}
