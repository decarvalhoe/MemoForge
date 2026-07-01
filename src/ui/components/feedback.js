// Composants « feedback » du design-system MemoForge (vanilla).
// Miroir de components/feedback du prototype : TerminalWindow, Mascot, FeedbackBanner.
import { el } from '../dom.js';

const MASCOT_FACES = { win: '[^‿^]', think: '[o_o]', err: '[x_x]' };
const FEEDBACK_GLYPHS = { success: '[^‿^]', crash: '[x_x]', leak: '⚠' };

/**
 * Fenêtre de terminal : barre à pastilles + titre, corps avec scanlines optionnelles.
 * @param {{title?:string, scanlines?:boolean}} props
 * @param {Node[]} children  contenu du corps
 */
export function terminalWindow({ title = 'forge_memoire', scanlines = true } = {}, children = []) {
	const content = el('div', { class: 'mf-terminal__content' }, children);
	const bodyChildren = scanlines ? [el('div', { class: 'mf-terminal__scan' }), content] : [content];
	return el('div', { class: 'mf-terminal' }, [
		el('div', { class: 'mf-terminal__bar' }, [
			el('span', { class: 'mf-terminal__dot mf-terminal__dot--r' }),
			el('span', { class: 'mf-terminal__dot mf-terminal__dot--a' }),
			el('span', { class: 'mf-terminal__dot mf-terminal__dot--g' }),
			el('span', { class: 'mf-terminal__title', text: title })
		]),
		el('div', { class: 'mf-terminal__body' }, bodyChildren)
	]);
}

/**
 * Mascotte GLIF expressive.
 * @param {{mood?:'win'|'think'|'err', caption?:string|null, boxed?:boolean}} props
 */
export function mascot({ mood = 'think', caption = null, boxed = true } = {}) {
	const face = el('span', { class: 'mf-mascot__face', text: MASCOT_FACES[mood] || MASCOT_FACES.think });
	if (!boxed) return el('span', { class: 'mf-mascot mf-mascot--' + mood }, [face]);
	const children = [face];
	if (caption) children.push(el('span', { class: 'mf-mascot__cap', text: caption }));
	return el('div', { class: 'mf-mascot mf-mascot--' + mood }, children);
}

/**
 * Bannière de feedback pédagogique.
 * @param {{tone?:'success'|'crash'|'leak', title:string, glyph?:string|null,
 *          body?:string|Node|null}} props
 */
export function feedbackBanner({ tone = 'success', title, glyph = null, body = null } = {}) {
	const children = [
		el('div', { class: 'mf-feedback__head' }, [
			el('span', { class: 'mf-feedback__glyph', text: glyph || FEEDBACK_GLYPHS[tone] || '' }),
			el('span', { class: 'mf-feedback__title', text: title })
		])
	];
	if (body != null) {
		const node = typeof body === 'string' ? document.createTextNode(body) : body;
		children.push(el('div', { class: 'mf-feedback__body' }, [node]));
	}
	return el('div', { class: 'mf-feedback mf-feedback--' + tone }, children);
}
