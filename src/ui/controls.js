import { el, clear } from './dom.js';
import { button, medal, feedbackBanner, mascot } from './components/index.js';
import { t } from '../game/i18n.js';

// Rend les contrôles, la mascotte GLIF réactive et le verdict.
// state = { verdict, mood, hint } (game.js) — verdict.feedback vient de pitfalls.explainRun.
export function renderControls(container, handlers, state) {
	clear(container);

	const runBtn = button({ label: t('Exécuter'), variant: 'primary', glyph: '>', onClick: handlers.onRun });
	runBtn.style.flex = '1';
	const barButtons = [
		runBtn,
		button({ label: t('Pas-à-pas'), variant: 'ghost', onClick: handlers.onStep }),
		button({ label: t('Réinitialiser'), variant: 'ghost', onClick: handlers.onReset })
	];
	if (handlers.onSkip) barButtons.push(button({ label: t('passer →'), variant: 'ghost', onClick: handlers.onSkip }));
	container.appendChild(el('div', { class: 'controls-bar' }, barButtons));

	// Mascotte : réagit (win/think/err) et donne l'indice du niveau après 2 échecs.
	const caption = state.hint ? t('indice :') + '\n' + state.hint : t('GLIF surveille\nla mémoire');
	container.appendChild(el('div', { style: 'margin-top:14px' }, [
		mascot({ mood: state.mood || 'think', caption })
	]));

	if (state.verdict) {
		const v = state.verdict;
		const fb = v.feedback || { tone: v.passed ? 'success' : 'crash', title: v.message, hint: null };
		const banner = feedbackBanner({ tone: fb.tone, title: t(fb.title), body: fb.hint ? t(fb.hint) : undefined });
		const medals = el(
			'div',
			{ class: 'stars', style: 'display:flex;flex-direction:column;gap:6px;margin:10px 0' },
			v.stars.map((s) => medal({ label: s.label, earned: s.got }))
		);
		const area = el('div', { role: 'status', 'aria-live': 'polite', style: 'margin-top:16px' }, [banner, medals]);
		if (v.passed && handlers.onNext) {
			const next = button({ label: t('Niveau suivant →'), variant: 'primary', onClick: handlers.onNext });
			next.style.marginTop = '4px';
			area.appendChild(next);
		}
		container.appendChild(area);
	}
}
