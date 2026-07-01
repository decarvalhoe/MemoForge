import { el, clear } from './dom.js';
import { button, medal, feedbackBanner } from './components/index.js';

// Rend les contrôles + le verdict via les composants Button, FeedbackBanner et Medal.
// Signature inchangée : game.js passe toujours { verdict } dans state.
export function renderControls(container, handlers, state) {
	clear(container);

	const runBtn = button({ label: 'Exécuter', variant: 'primary', glyph: '>', onClick: handlers.onRun });
	runBtn.style.flex = '1';
	const bar = el('div', { class: 'controls-bar' }, [
		runBtn,
		button({ label: 'Pas-à-pas', variant: 'ghost', onClick: handlers.onStep }),
		button({ label: 'Réinitialiser', variant: 'ghost', onClick: handlers.onReset })
	]);
	container.appendChild(bar);

	if (state.verdict) {
		const v = state.verdict;
		const tone = v.passed ? 'success' : (/crash/i.test(v.message) ? 'crash' : 'leak');
		const banner = feedbackBanner({ tone, title: v.message });
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
