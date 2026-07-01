import { el, clear } from './dom.js';
import { button, medal, feedbackBanner, mascot } from './components/index.js';

// Rend les contrôles, la mascotte GLIF réactive et le verdict.
// state = { verdict, mood, hint } (game.js) — verdict.feedback vient de pitfalls.explainRun.
export function renderControls(container, handlers, state) {
	clear(container);

	const runBtn = button({ label: 'Exécuter', variant: 'primary', glyph: '>', onClick: handlers.onRun });
	runBtn.style.flex = '1';
	const barButtons = [
		runBtn,
		button({ label: 'Pas-à-pas', variant: 'ghost', onClick: handlers.onStep }),
		button({ label: 'Réinitialiser', variant: 'ghost', onClick: handlers.onReset })
	];
	if (handlers.onSkip) barButtons.push(button({ label: 'passer →', variant: 'ghost', onClick: handlers.onSkip }));
	container.appendChild(el('div', { class: 'controls-bar' }, barButtons));

	// Mascotte : réagit (win/think/err) et donne l'indice du niveau après 2 échecs.
	const caption = state.hint ? 'indice :\n' + state.hint : 'GLIF surveille\nla mémoire';
	container.appendChild(el('div', { style: 'margin-top:14px' }, [
		mascot({ mood: state.mood || 'think', caption })
	]));

	if (state.verdict) {
		const v = state.verdict;
		const fb = v.feedback || { tone: v.passed ? 'success' : 'crash', title: v.message, hint: null };
		const banner = feedbackBanner({ tone: fb.tone, title: fb.title, body: fb.hint || undefined });
		const medals = el(
			'div',
			{ class: 'stars', style: 'display:flex;flex-direction:column;gap:6px;margin:10px 0' },
			v.stars.map((s) => medal({ label: s.label, earned: s.got }))
		);
		const area = el('div', { style: 'margin-top:16px' }, [banner, medals]);
		if (v.passed && handlers.onNext) {
			const next = button({ label: 'Niveau suivant →', variant: 'primary', onClick: handlers.onNext });
			next.style.marginTop = '4px';
			area.appendChild(next);
		}
		container.appendChild(area);
	}
}
