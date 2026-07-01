// Composants « core » du design-system MemoForge (vanilla).
// Miroir de components/core du prototype : Button, Badge, StatChip.
import { el } from '../dom.js';

const txt = (s) => document.createTextNode(s);

/**
 * Bouton d'action.
 * @param {{label?:string, variant?:'primary'|'secondary'|'ghost'|'danger',
 *          size?:'md'|'sm', glyph?:string|null, onClick?:Function|null,
 *          disabled?:boolean}} props
 */
export function button({ label = '', variant = 'primary', size = 'md', glyph = null, onClick = null, disabled = false } = {}) {
	const cls = 'mf-btn mf-btn--' + variant + (size === 'sm' ? ' mf-btn--sm' : '');
	const children = [];
	if (glyph) children.push(el('span', { text: glyph }));
	if (label) children.push(txt(label));
	return el('button', {
		class: cls,
		type: 'button',
		disabled: disabled ? 'true' : null,
		onclick: typeof onClick === 'function' ? onClick : undefined
	}, children);
}

/**
 * Étiquette compacte.
 * @param {{text?:string, tone?:'neutral'|'value'|'pointer'|'danger', glyph?:string|null}} props
 */
export function badge({ text = '', tone = 'neutral', glyph = null } = {}) {
	const cls = 'mf-badge' + (tone !== 'neutral' ? ' mf-badge--' + tone : '');
	const children = [];
	if (glyph) children.push(el('span', { text: glyph }));
	if (text) children.push(txt(text));
	return el('span', { class: cls }, children);
}

/**
 * Puce de statistique (valeur + libellé).
 * @param {{label:string, value:string|number, tone?:'neutral'|'value'|'pointer'}} props
 */
export function statChip({ label, value, tone = 'neutral' } = {}) {
	const cls = 'mf-stat' + (tone !== 'neutral' ? ' mf-stat--' + tone : '');
	return el('div', { class: cls }, [
		el('div', { class: 'mf-stat__val', text: String(value) }),
		el('div', { class: 'mf-stat__label', text: label })
	]);
}
