import { el, clear } from './dom.js';
import { t } from '../game/i18n.js';

// « Ta libft » (E6-8) : l'inventaire des ft_ forgées par le joueur, affiché comme des
// jetons. C'est la matérialisation de la progression — ta boîte à outils qui grandit.
// Vue PURE (rendu seulement) : on lui passe la liste des noms déjà forgés.

export function renderLibft(container, names = []) {
	clear(container);
	if (!names.length)
		return;
	container.appendChild(el('h2', { text: t('ta libft') }));
	const strip = el('div', { class: 'libft-strip' });
	for (const name of names)
		strip.appendChild(el('span', { class: 'libft-chip', text: name }));
	container.appendChild(strip);
}
