import { Game } from './game/game.js';
import { initLang, setLang, getLang, t } from './game/i18n.js';

initLang(); // applique la langue sauvegardée (FR par défaut) avant le premier rendu
// A11y : refléter la langue courante sur <html lang> (lecteurs d'écran, prononciation).
if (typeof document !== 'undefined') document.documentElement.lang = getLang();

const root = document.getElementById('app');
const game = new Game(root);
game.start();

// Bascule de langue (E9-3) : recharge pour ré-appliquer la surcharge partout. Le libellé
// montre la langue vers laquelle on bascule.
const langBtn = document.getElementById('lang-toggle');
if (langBtn) {
	langBtn.textContent = getLang() === 'en' ? 'FR' : 'EN';
	langBtn.addEventListener('click', () => {
		setLang(getLang() === 'en' ? 'fr' : 'en');
		location.reload();
	});
}
// Traduit la tagline statique de l'accueil.
const tagline = document.querySelector('.tagline');
if (tagline) tagline.textContent = t(tagline.textContent.trim());

// Point d'ancrage du harnais de tests visuels (tests/visual, E0-6) : permet de piloter
// les écrans clés de façon déterministe (enterRoom, addBlock, step) sans clics fragiles.
window.__memoforge = game;
