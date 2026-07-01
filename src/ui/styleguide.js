// Styleguide vivant : rend chaque composant du design-system dans tous ses états.
// Sert de galerie de référence (E1-4) et de cible pour les snapshots visuels (E0-6).
import { el } from './dom.js';
import {
	button, badge, statChip,
	locker, codeBrick, medal,
	terminalWindow, mascot, feedbackBanner,
	regionCard
} from './components/index.js';

/** Une section titrée contenant une rangée de démos. */
function section(title, nodes) {
	return el('section', { class: 'sg-section' }, [
		el('h2', { class: 'sg-h', text: title }),
		el('div', { class: 'sg-row' }, nodes)
	]);
}

/** Enveloppe un composant avec un petit libellé d'état. */
function demo(label, node) {
	return el('div', { class: 'sg-demo' }, [
		node,
		el('div', { class: 'sg-caption', text: label })
	]);
}

const root = document.getElementById('guide');

root.append(
	section('Button', [
		demo('primary', button({ label: 'RUN', glyph: '>', onClick: () => {} })),
		demo('secondary', button({ label: 'médailles →', variant: 'secondary', size: 'sm' })),
		demo('ghost', button({ label: 'reset', variant: 'ghost', size: 'sm' })),
		demo('danger', button({ label: 'free', variant: 'danger', size: 'sm' })),
		demo('disabled', button({ label: 'RUN', disabled: true }))
	]),

	section('Badge', [
		demo('neutral', badge({ text: 'verrouillé', glyph: '🔒' })),
		demo('value', badge({ text: 'valeur', tone: 'value' })),
		demo('pointer', badge({ text: 'adresse', tone: 'pointer' })),
		demo('danger', badge({ text: 'crash', tone: 'danger' }))
	]),

	section('StatChip', [
		demo('neutral', statChip({ label: 'INSTR.', value: 2 })),
		demo('value', statChip({ label: 'PAS', value: 3, tone: 'value' })),
		demo('pointer', statChip({ label: 'PAR', value: 2, tone: 'pointer' }))
	]),

	section('Locker', [
		demo('normal', locker({ name: 'n', address: '0x41', kind: 'int', value: 0, stateLabel: 'la cible' })),
		demo('changed', locker({ name: 'n', address: '0x41', kind: 'int', value: 42, state: 'changed' })),
		demo('pointer', locker({ name: 'p', address: '0x42', kind: 'ptr', value: '→0x41', state: 'pointer', stateLabel: 'contient une adresse' })),
		demo('allocated', locker({ name: 'alloué', address: '0x1388', value: 0, state: 'allocated' })),
		demo('freed', locker({ name: 'libéré', address: '0x1388', value: null, state: 'freed' }))
	]),

	section('CodeBrick', [
		demo('placed', codeBrick({ code: 'p = &n', index: 1, role: 'pointer' })),
		demo('active', codeBrick({ code: '*p = 42', index: 2, state: 'active' })),
		demo('bank', codeBrick({ code: 'free(p)', role: 'free', handle: false })),
		demo('ghost', codeBrick({ code: 'p = 42', state: 'ghost', handle: false }))
	]),

	section('Medal', [
		demo('earned', medal({ label: '≤ 2 instructions', earned: true })),
		demo('locked', medal({ label: '≤ 1 casier utilisé' }))
	]),

	section('Mascot', [
		demo('think', mascot({ mood: 'think', caption: 'GLIF surveille\nla mémoire' })),
		demo('win', mascot({ mood: 'win' })),
		demo('err', mascot({ mood: 'err' }))
	]),

	section('FeedbackBanner', [
		demo('success', feedbackBanner({ tone: 'success', title: 'RÉUSSITE', body: 'n == 42 · leaks: 0' })),
		demo('crash', feedbackBanner({ tone: 'crash', title: 'CRASH — déréférencement de NULL', body: '*p = 42 alors que p == NULL' })),
		demo('leak', feedbackBanner({ tone: 'leak', title: 'FUITE MÉMOIRE', body: 'malloc sans free → casier orphelin' }))
	]),

	section('RegionCard', [
		demo('solved', regionCard({ id: '1-1', title: 'Mets 42 dans n', status: 'solved' })),
		demo('current', regionCard({ id: '1-2', title: 'Atteins n via p', status: 'current' })),
		demo('locked', regionCard({ id: '1-3', title: 'Échange a et b', status: 'locked' }))
	]),

	section('TerminalWindow', [
		terminalWindow({ title: 'forge_memoire — démo' }, [
			el('div', { class: 'sg-terminal-inner', text: '> une fenêtre de terminal avec scanlines' })
		])
	])
);
