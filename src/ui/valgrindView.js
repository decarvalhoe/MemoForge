import { el, clear } from './dom.js';

// Mini-rapport façon valgrind (E6-5, cours M9), rendu sous le tas quand un niveau utilise
// la mémoire dynamique. Vert = objectif atteint (0 fuite, 0 erreur) ; ambre = il reste des
// blocs perdus. Vue PURE : on lui passe le rapport calculé par valgrind.js.

export function renderValgrind(container, report) {
	clear(container);
	if (!report)
		return;
	const tone = report.clean ? 'var(--accent)' : 'var(--pointer)';
	const box = el('div', {
		style: `margin-top:8px;padding:8px 10px;border:1px solid ${tone};border-radius:var(--radius-sm);`
			+ 'background:var(--surface-well);font-family:var(--font-mono);font-size:var(--fs-2xs)'
	});
	box.appendChild(el('div', { style: 'color:var(--text-muted);margin-bottom:4px', text: '// valgrind --leak-check=full' }));
	for (const line of report.lines)
		box.appendChild(el('div', { style: `color:${tone}`, text: '==memoforge== ' + line }));
	container.appendChild(box);
}
