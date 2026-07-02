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
	const attrs = { class: 'mf-room-link', style: `flex:1;min-width:120px;cursor:${clickable ? 'pointer' : 'default'}` };
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
	const head = el('div', { style: 'display:flex;justify-content:space-between;align-items:baseline' }, [
		el('div', { style: `font-size:var(--fs-md);font-weight:600;color:${open ? 'var(--accent)' : 'var(--text-muted)'}`, text: '▸ ' + localize(r, 'regions').name }),
		el('div', { style: 'font-size:var(--fs-2xs);color:var(--text-muted)', text: localize(r, 'regions').addr })
	]);
	const rooms = el('div', { style: 'display:flex;gap:9px;margin-top:9px;flex-wrap:wrap' });
	if (r.levelIds.length === 0) {
		rooms.appendChild(el('div', { style: 'font-size:var(--fs-2xs);color:var(--text-muted)', text: t('à venir') }));
	} else {
		for (const id of r.levelIds)
			rooms.appendChild(roomLink(id, open, solved.has(id), onEnter));
	}
	return el('div', {
		style: `background:${open ? 'var(--surface-nested)' : 'var(--surface)'};border:1px ${open ? 'solid var(--accent)' : 'dashed var(--border)'};border-radius:var(--radius-md);padding:11px 13px;opacity:${open ? 1 : 0.6}`
	}, [head, rooms]);
}

// Rend la carte de la RAM : régions, verrous, alerte fuite, entrée en salle.
// onEnter(levelId) au clic d'une salle ; onSandbox() bac à sable ; onExam() mode examen.
export function renderRegionMap(container, solved, onEnter, onSandbox, onExam) {
	clear(container);
	const body = el('div', { style: 'padding:16px 22px 20px' });

	body.appendChild(el('div', {
		style: 'font-family:var(--font-display);font-size:var(--fs-display-1);line-height:1;color:var(--accent);text-shadow:var(--text-glow-green)',
		text: t('LA RAM')
	}));
	body.appendChild(el('div', {
		style: 'display:flex;align-items:center;gap:8px;background:var(--danger-fill);border:1px solid var(--danger);border-radius:var(--radius-sm);padding:7px 10px;margin:8px 0 14px;color:var(--danger);font-size:var(--fs-sm)'
	}, [
		el('span', { text: '⚠' }),
		el('span', { text: t("des fuites menacent la RAM — remets de l'ordre dans une région pour débloquer la suivante") })
	]));

	const list = el('div', { style: 'display:flex;flex-direction:column;gap:12px' });
	for (const r of REGIONS)
		list.appendChild(regionBlock(r, solved, onEnter));
	body.appendChild(list);

	const actions = [];
	if (onSandbox) actions.push(button({ label: t('bac à sable'), variant: 'secondary', size: 'sm', glyph: '⌘', onClick: onSandbox }));
	if (onExam) actions.push(button({ label: t('examen'), variant: 'secondary', size: 'sm', glyph: '⏱', onClick: onExam }));
	if (actions.length) body.appendChild(el('div', { style: 'margin-top:14px;display:flex;gap:8px' }, actions));

	container.appendChild(terminalWindow({ title: t('forge_memoire — carte.ram — 0x0000…0xFFFF') }, [body]));
}
