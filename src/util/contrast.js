// Contraste WCAG 2.1 (luminance relative + ratio). Fonctions pures sur des couleurs #rrggbb.
// Sert à auditer les tokens du thème (voir tests/a11y/contrast.test.mjs et docs/A11Y.md).

/** @param {string} hex  '#rrggbb' ou '#rgb' @returns {[number,number,number]} */
function hexToRgb(hex) {
	const h = hex.replace('#', '');
	const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
	const n = parseInt(full, 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Linéarise un canal sRGB (0..255) selon WCAG. */
function channel(c) {
	const s = c / 255;
	return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** @returns {number} luminance relative (0..1). */
export function relativeLuminance(hex) {
	const [r, g, b] = hexToRgb(hex);
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** @returns {number} ratio de contraste (1..21). */
export function contrastRatio(a, b) {
	const l1 = relativeLuminance(a);
	const l2 = relativeLuminance(b);
	const hi = Math.max(l1, l2);
	const lo = Math.min(l1, l2);
	return (hi + 0.05) / (lo + 0.05);
}

/**
 * @param {string} fg  premier plan
 * @param {string} bg  fond
 * @param {{large?:boolean}} [opts]  large = texte ≥ ~18px bold / 24px, ou éléments UI
 * @returns {boolean} conforme WCAG AA (4.5:1 texte normal, 3:1 grand/UI).
 */
export function passesAA(fg, bg, { large = false } = {}) {
	return contrastRatio(fg, bg) >= (large ? 3 : 4.5);
}
