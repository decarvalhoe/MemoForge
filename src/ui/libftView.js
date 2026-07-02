import { el, clear } from './dom.js';

// « Ta libft » (E6-8) : l'inventaire des ft_ forgées par le joueur, affiché comme des
// jetons. C'est la matérialisation de la progression — ta boîte à outils qui grandit.
// Vue PURE (rendu seulement) : on lui passe la liste des noms déjà forgés.

export function renderLibft(container, names = []) {
	clear(container);
	if (!names.length)
		return;
	container.appendChild(el('h2', { text: 'ta libft' }));
	const strip = el('div', { class: 'libft-strip', style: 'display:flex;flex-wrap:wrap;gap:6px' });
	for (const name of names)
		strip.appendChild(el('span', {
			class: 'libft-chip',
			style: 'font-family:var(--font-mono);font-size:var(--fs-2xs);padding:3px 8px;'
				+ 'color:var(--accent);background:var(--surface-well);border:1px solid var(--accent);'
				+ 'border-radius:var(--radius-sm)',
			text: name
		}));
	container.appendChild(strip);
}
