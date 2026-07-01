import { clear } from './dom.js';
import { button } from './components/index.js';

// Rend la banque d'instructions via le composant Button (variante ghost = brique cliquable).
// Désactivé quand le programme est plein. Signature inchangée.
export function renderPalette(container, bank, full, onAdd) {
	clear(container);
	for (const instr of bank) {
		container.appendChild(button({
			label: instr.label,
			variant: 'ghost',
			disabled: full,
			onClick: () => onAdd(instr)
		}));
	}
}
