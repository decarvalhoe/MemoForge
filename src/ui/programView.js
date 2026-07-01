import { el, clear } from './dom.js';
import { codeBrick } from './components/index.js';

// Rend le programme (slots) via le composant CodeBrick. Le slot actif prend l'état 'active'
// (halo). Signature inchangée.
export function renderProgram(container, program, slots, activeIndex, onRemove) {
	clear(container);
	for (let i = 0; i < slots; i++) {
		const instr = program[i];
		if (instr) {
			const brick = codeBrick({
				code: instr.label,
				index: i + 1,
				handle: false,
				state: i === activeIndex ? 'active' : 'placed'
			});
			brick.style.flex = '1';
			const remove = el('button', { class: 'slot-remove', title: 'retirer', onclick: () => onRemove(i) }, ['×']);
			container.appendChild(el('div', { class: 'mf-slot', style: 'display:flex;gap:6px;align-items:stretch' }, [brick, remove]));
		} else {
			container.appendChild(el('div', { class: 'slot slot-empty' }, [
				el('span', { class: 'slot-num', text: String(i + 1) }),
				el('span', { class: 'slot-hint', text: 'slot libre' })
			]));
		}
	}
}
