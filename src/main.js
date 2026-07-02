import { Game } from './game/game.js';

const root = document.getElementById('app');
const game = new Game(root);
game.start();

// Point d'ancrage du harnais de tests visuels (tests/visual, E0-6) : permet de piloter
// les écrans clés de façon déterministe (enterRoom, addBlock, step) sans clics fragiles.
window.__memoforge = game;
