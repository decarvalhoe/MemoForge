import { el, clear } from './dom.js';

export function renderControls(container, handlers, state) {
	clear(container);
	const bar = el('div', { class: 'controls-bar' }, [
		el('button', { class: 'btn-primary', onclick: handlers.onRun }, ['Exécuter']),
		el('button', { onclick: handlers.onStep }, ['Pas-à-pas']),
		el('button', { onclick: handlers.onReset }, ['Réinitialiser'])
	]);
	container.appendChild(bar);

	if (state.verdict) {
		const v = state.verdict;
		const banner = el('div', { class: 'verdict ' + (v.passed ? 'verdict-ok' : 'verdict-ko') }, [
			el('div', { class: 'verdict-msg', text: v.message })
		]);
		const stars = el('div', { class: 'stars' });
		for (const s of v.stars)
			stars.appendChild(el('span', { class: 'star ' + (s.got ? 'star-on' : 'star-off') }, [
				(s.got ? '★ ' : '☆ ') + s.label
			]));
		banner.appendChild(stars);
		if (v.passed && handlers.onNext)
			banner.appendChild(el('button', { class: 'btn-primary', onclick: handlers.onNext }, ['Niveau suivant →']));
		container.appendChild(banner);
	}
}
