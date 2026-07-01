import { el, clear } from './dom.js';
import { terminalWindow, regionCard, button } from './components/index.js';
import { REGIONS, regionStatus } from '../game/world.js';
import { LEVELS } from '../game/levels.js';

const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

// Rend la carte de la RAM : régions, verrous, alerte fuite, entrée en salle.
// onEnter(levelId) au clic d'une salle jouable ; onSandbox() pour le bac à sable.
export function renderRegionMap(container, solved, onEnter, onSandbox) {
	clear(container);
	const body = el('div', { style: 'padding:16px 22px 20px' });

	body.appendChild(el('div', {
		style: 'font-family:var(--font-display);font-size:var(--fs-display-1);line-height:1;color:var(--accent);text-shadow:var(--text-glow-green)',
		text: 'LA RAM'
	}));
	body.appendChild(el('div', {
		style: 'display:flex;align-items:center;gap:8px;background:var(--danger-fill);border:1px solid var(--danger);border-radius:var(--radius-sm);padding:7px 10px;margin:8px 0 14px;color:var(--danger);font-size:var(--fs-sm)'
	}, [
		el('span', { text: '⚠' }),
		el('span', { text: "des fuites menacent la RAM — remets de l'ordre dans une région pour débloquer la suivante" })
	]));

	const list = el('div', { style: 'display:flex;flex-direction:column;gap:12px' });
	for (const r of REGIONS) {
		const status = regionStatus(r.id, solved);
		const open = status === 'current' || status === 'solved';
		const head = el('div', { style: 'display:flex;justify-content:space-between;align-items:baseline' }, [
			el('div', { style: `font-size:var(--fs-md);font-weight:600;color:${open ? 'var(--accent)' : 'var(--text-muted)'}`, text: '▸ ' + r.name }),
			el('div', { style: 'font-size:var(--fs-2xs);color:var(--text-muted)', text: r.addr })
		]);

		const rooms = el('div', { style: 'display:flex;gap:9px;margin-top:9px;flex-wrap:wrap' });
		if (r.levelIds.length === 0) {
			rooms.appendChild(el('div', { style: 'font-size:var(--fs-2xs);color:var(--text-muted)', text: 'à venir' }));
		} else {
			for (const id of r.levelIds) {
				const lv = LEVEL_BY_ID[id];
				const clickable = open;
				const roomStatus = solved.has(id) ? 'solved' : (clickable ? 'current' : 'locked');
				const card = regionCard({ id, title: lv ? lv.title : id, status: roomStatus });
				const wrap = el('div', { style: `flex:1;min-width:120px;cursor:${clickable ? 'pointer' : 'default'}` }, [card]);
				if (clickable) wrap.addEventListener('click', () => onEnter(id));
				rooms.appendChild(wrap);
			}
		}

		list.appendChild(el('div', {
			style: `background:${open ? 'var(--surface-nested)' : 'var(--surface)'};border:1px ${open ? 'solid var(--accent)' : 'dashed var(--border)'};border-radius:var(--radius-md);padding:11px 13px;opacity:${open ? 1 : 0.6}`
		}, [head, rooms]));
	}
	body.appendChild(list);

	if (onSandbox) {
		const sb = button({ label: 'bac à sable', variant: 'secondary', size: 'sm', glyph: '⌘', onClick: onSandbox });
		body.appendChild(el('div', { style: 'margin-top:14px;display:flex' }, [sb]));
	}

	container.appendChild(terminalWindow({ title: 'forge_memoire — carte.ram — 0x0000…0xFFFF' }, [body]));
}
