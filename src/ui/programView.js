import { el, clear } from './dom.js';
import { t } from '../game/i18n.js';
import { codeBrick } from './components/index.js';

const MOVE_STYLE = 'min-height:auto;padding:0 6px;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:.9rem';

// Rend le programme (slots) via CodeBrick. Réordonnable : glisser-déposer (souris) ET
// boutons ▲/▼ (clavier/accessible). onMove(from, to) réordonne. Signature étendue mais
// rétro-compatible (onMove optionnel).
export function renderProgram(container, program, slots, activeIndex, onRemove, onMove) {
	clear(container);
	for (let i = 0; i < slots; i++) {
		const instr = program[i];
		if (instr) {
			const brick = codeBrick({
				code: instr.label,
				index: i + 1,
				handle: true,
				state: i === activeIndex ? 'active' : 'placed'
			});
			brick.style.flex = '1';

			const up = el('button', {
				style: MOVE_STYLE, title: 'monter', 'aria-label': 'monter l\'instruction',
				disabled: i === 0 ? 'true' : null, onclick: () => onMove && onMove(i, i - 1)
			}, ['▲']);
			const down = el('button', {
				style: MOVE_STYLE, title: 'descendre', 'aria-label': 'descendre l\'instruction',
				disabled: i === program.length - 1 ? 'true' : null, onclick: () => onMove && onMove(i, i + 1)
			}, ['▼']);
			const remove = el('button', { class: 'slot-remove', title: 'retirer', onclick: () => onRemove(i) }, ['×']);

			const rowEl = el('div', { class: 'mf-slot', style: 'display:flex;gap:6px;align-items:stretch', draggable: 'true' }, [brick, up, down, remove]);
			rowEl.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', String(i)); e.dataTransfer.effectAllowed = 'move'; });
			rowEl.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
			rowEl.addEventListener('drop', (e) => {
				e.preventDefault();
				const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
				if (!Number.isNaN(from) && from !== i && onMove) onMove(from, i);
			});
			container.appendChild(rowEl);
		} else {
			container.appendChild(el('div', { class: 'slot slot-empty' }, [
				el('span', { class: 'slot-num', text: String(i + 1) }),
				el('span', { class: 'slot-hint', text: t('slot libre') })
			]));
		}
	}
}
