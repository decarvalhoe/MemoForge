// Composants « navigation » du design-system MemoForge (vanilla).
// Miroir de components/navigation du prototype : RegionCard.
import { el } from '../dom.js';

const GLYPHS = { solved: '★★★', current: '◊', locked: '🔒' };
const DEFAULT_NOTE = { solved: 'résolu', current: 'tu es ici', locked: 'verrouillé' };

/**
 * Carte de salle/région dans l'aventure RAM.
 * @param {{id?:string|null, title:string, status?:'solved'|'current'|'locked',
 *          note?:string|null}} props
 */
export function regionCard({ id = null, title, status = 'locked', note = null } = {}) {
	const titleChildren = [];
	if (id) titleChildren.push(el('span', { class: 'mf-region__id', text: id + ' · ' }));
	titleChildren.push(document.createTextNode(title));
	return el('div', { class: 'mf-region mf-region--' + status }, [
		el('div', { class: 'mf-region__title' }, titleChildren),
		el('div', { class: 'mf-region__note', text: (GLYPHS[status] || '') + ' ' + (note || DEFAULT_NOTE[status] || '') })
	]);
}
