import { el, clear } from './dom.js';

export function renderProgram(container, program, slots, activeIndex, onRemove) {
	clear(container);
	for (let i = 0; i < slots; i++) {
		const instr = program[i];
		if (instr) {
			const cls = 'slot slot-filled' + (i === activeIndex ? ' slot-active' : '');
			container.appendChild(el('div', { class: cls }, [
				el('span', { class: 'slot-num', text: String(i + 1) }),
				el('code', { class: 'slot-code', text: instr.label }),
				el('button', {
					class: 'slot-remove',
					title: 'retirer',
					onclick: () => onRemove(i)
				}, ['×'])
			]));
		} else {
			container.appendChild(el('div', { class: 'slot slot-empty' }, [
				el('span', { class: 'slot-num', text: String(i + 1) }),
				el('span', { class: 'slot-hint', text: 'slot libre' })
			]));
		}
	}
}
