import { Game } from './game/game.js';

const root = document.getElementById('app');
const game = new Game(root);
game.start();
