// Composants « memory » du design-system MemoForge (vanilla).
// Miroir de components/memory du prototype : Locker, CodeBrick, Medal.
import { el } from '../dom.js';
import { t } from '../../game/i18n.js';

const STATE_LABELS = { normal: 'normal', changed: 'modifié', pointer: 'pointeur', allocated: 'alloué', freed: 'libéré' };

/**
 * Casier mémoire (variable ou case du tas).
 * @param {{name:string, address?:string|number|null, value?:*, kind?:string|null,
 *          state?:'normal'|'changed'|'pointer'|'allocated'|'freed',
 *          stateLabel?:string|null}} props
 */
export function locker({ name, address = null, value = null, kind = null, state = 'normal', stateLabel = null } = {}) {
	const cls = 'mf-locker' + (state !== 'normal' ? ' mf-locker--' + state : '');
	const children = [el('div', { class: 'mf-locker__name', text: name })];
	if (address != null)
		children.push(el('div', { class: 'mf-locker__addr', text: 'n° ' + address + (kind ? ' · ' + kind : '') }));
	children.push(el('div', { class: 'mf-locker__val', text: value == null ? '—' : String(value) }));
	children.push(el('div', { class: 'mf-locker__state', text: t(stateLabel || STATE_LABELS[state] || '') }));
	return el('div', { class: cls }, children);
}

/**
 * Brique d'instruction déplaçable.
 * @param {{code:string, index?:number|null, role?:'plain'|'pointer'|'free'|'value',
 *          state?:'placed'|'active'|'ghost'|'bank', handle?:boolean}} props
 */
export function codeBrick({ code, index = null, role = 'plain', state = 'placed', handle = true } = {}) {
	let cls = 'mf-brick';
	if (role !== 'plain') cls += ' mf-brick--' + role;
	if (state === 'active') cls += ' mf-brick--active';
	else if (state === 'ghost') cls += ' mf-brick--ghost';
	const children = [];
	if (handle) children.push(el('span', { class: 'mf-brick__handle', text: '⠿' }));
	if (index != null) children.push(el('span', { class: 'mf-brick__idx', text: String(index).padStart(2, '0') }));
	children.push(el('code', { class: 'mf-brick__code', text: code }));
	return el('div', { class: cls }, children);
}

/**
 * Médaille d'optimisation (gagnée ou non).
 * @param {{label:string, earned?:boolean}} props
 */
export function medal({ label, earned = false } = {}) {
	return el('div', { class: 'mf-medal' + (earned ? ' mf-medal--earned' : '') }, [
		el('span', { class: 'mf-medal__label', text: label }),
		el('span', { class: 'mf-medal__mark', text: earned ? '★' : '☆' })
	]);
}
