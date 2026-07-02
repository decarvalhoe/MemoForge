import { el, clear } from './dom.js';
import { terminalWindow, regionCard, button } from './components/index.js';
import { REGIONS, regionStatus } from '../game/world.js';
import { t, localize } from '../game/i18n.js';
import { LEVELS } from '../game/levels.js';

const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

// Une salle de la carte : carte cliquable (rôle bouton, accessible clavier) si débloquée.
// `clickable` = la région est ouverte ; `isSolved` = niveau déjà résolu (★★★).
function roomLink(id, clickable, isSolved, onEnter) {
	const lv = LEVEL_BY_ID[id];
	const title = lv ? localize(lv, 'levels').title : id;
	const roomStatus = isSolved ? 'solved' : (clickable ? 'current' : 'locked');
	const card = regionCard({ id, title, status: roomStatus });
	const attrs = { class: 'mf-room-link' };
	if (clickable) {
		attrs.role = 'button';
		attrs.tabindex = '0';
		attrs['aria-label'] = `${t('Entrer dans la salle')} ${id} : ${title}`;
		attrs.onclick = () => onEnter(id);
		attrs.onkeydown = (e) => {
			if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEnter(id); }
		};
	} else {
		attrs['aria-disabled'] = 'true';
	}
	return el('div', attrs, [card]);
}

// Un bloc de région : en-tête (nom + adresse) et ses salles (ou « à venir »).
function regionBlock(r, solved, onEnter) {
	const status = regionStatus(r.id, solved);
	const open = status === 'current' || status === 'solved';
	const head = el('div', { class: 'mf-region-head' }, [
		el('h3', { class: 'mf-region-name' + (open ? ' mf-region-name--open' : ''), text: '▸ ' + localize(r, 'regions').name }),
		el('div', { class: 'mf-region-addr', text: localize(r, 'regions').addr })
	]);
	const rooms = el('div', { class: 'mf-region-rooms' });
	if (r.levelIds.length === 0) {
		rooms.appendChild(el('div', { class: 'mf-region-soon', text: t('à venir') }));
	} else {
		for (const id of r.levelIds)
			rooms.appendChild(roomLink(id, open, solved.has(id), onEnter));
	}
	return el('div', {
		class: 'mf-region-block' + (open ? ' mf-region-block--open' : '')
	}, [head, rooms]);
}

// Rend la carte de la RAM : régions, verrous, alerte fuite, entrée en salle.
// onEnter(levelId) au clic d'une salle ; onSandbox() bac à sable ; onExam() mode examen.
export function renderRegionMap(container, solved, onEnter, onSandbox, onExam) {
	clear(container);
	const body = el('div', { class: 'mf-map-body' });

	body.appendChild(el('h2', { class: 'mf-map-title', text: t('LA RAM') }));
	body.appendChild(el('div', { class: 'mf-map-alert' }, [
		el('span', { text: '⚠' }),
		el('span', { text: t("des fuites menacent la RAM — remets de l'ordre dans une région pour débloquer la suivante") })
	]));

	const list = el('div', { class: 'mf-map-list' });
	for (const r of REGIONS)
		list.appendChild(regionBlock(r, solved, onEnter));
	body.appendChild(list);

	const actions = [];
	if (onSandbox) actions.push(button({ label: t('bac à sable'), variant: 'secondary', size: 'sm', glyph: '⌘', onClick: onSandbox }));
	if (onExam) actions.push(button({ label: t('examen'), variant: 'secondary', size: 'sm', glyph: '⏱', onClick: onExam }));
	if (actions.length) body.appendChild(el('div', { class: 'mf-map-actions' }, actions));

	container.appendChild(terminalWindow({ title: t('forge_memoire — carte.ram — 0x0000…0xFFFF') }, [body]));
}
