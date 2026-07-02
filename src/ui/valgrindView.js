import { el, clear } from './dom.js';

// Mini-rapport façon valgrind (E6-5, cours M9), rendu sous le tas quand un niveau utilise
// la mémoire dynamique. Vert = objectif atteint (0 fuite, 0 erreur) ; ambre = il reste des
// blocs perdus. Vue PURE : on lui passe le rapport calculé par valgrind.js.

export function renderValgrind(container, report) {
	clear(container);
	if (!report)
		return;
	const box = el('div', { class: 'mf-valgrind' + (report.clean ? ' mf-valgrind--clean' : '') });
	box.appendChild(el('div', { class: 'mf-valgrind__label', text: '// valgrind --leak-check=full' }));
	for (const line of report.lines)
		box.appendChild(el('div', { class: 'mf-valgrind__line', text: '==memoforge== ' + line }));
	container.appendChild(box);
}
