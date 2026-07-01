import { Memory } from '../engine/memory.js';
import { Interpreter } from '../engine/interpreter.js';
import { LEVELS } from './levels.js';
import { el, clear } from '../ui/dom.js';
import { renderMemory } from '../ui/memoryView.js';
import { renderProgram } from '../ui/programView.js';
import { renderPalette } from '../ui/paletteView.js';
import { renderControls } from '../ui/controls.js';
import { renderRegionMap } from '../ui/regionMapView.js';
import { button } from '../ui/components/index.js';

export class Game {
	constructor(root) {
		this.root = root;
		this.levelIndex = 0;
		this.program = [];
		this.interp = null;
		this.verdict = null;
		this.activeIndex = -1;
		this.view = 'map';               // 'map' | 'room'
		this.solved = new Set();         // ids de niveaux résolus (débloque les régions)
	}

	get level() {
		return LEVELS[this.levelIndex];
	}

	start() {
		this.buildSkeleton();
		this.showMap();
	}

	buildSkeleton() {
		clear(this.root);
		this.elMap = el('div', { class: 'view-map' });

		this.elMission = el('header', { class: 'mission' });
		this.elMemory = el('div', { class: 'memory' });
		this.elProgram = el('div', { class: 'program' });
		this.elPalette = el('div', { class: 'palette' });
		this.elControls = el('div', { class: 'controls' });
		const main = el('div', { class: 'main' }, [
			el('section', { class: 'panel' }, [el('h2', { text: 'mur de casiers' }), this.elMemory]),
			el('aside', { class: 'side' }, [
				el('h2', { text: 'ton programme' }), this.elProgram,
				el('h2', { text: 'palette' }), this.elPalette
			])
		]);
		this.elRoom = el('div', { class: 'view-room' }, [this.elMission, main, this.elControls]);

		this.root.append(this.elMap, this.elRoom);
	}

	// ---- navigation carte <-> salle ----
	showMap() {
		this.view = 'map';
		this.elMap.style.display = '';
		this.elRoom.style.display = 'none';
		this.renderMap();
	}

	enterRoom(levelId) {
		const i = LEVELS.findIndex((l) => l.id === levelId);
		if (i < 0) return;
		this.view = 'room';
		this.elMap.style.display = 'none';
		this.elRoom.style.display = '';
		this.loadLevel(i);
	}

	renderMap() {
		renderRegionMap(this.elMap, this.solved, (id) => this.enterRoom(id));
	}

	loadLevel(i) {
		this.levelIndex = i;
		this.program = [];
		this.resetExecState();
		this.render();
	}

	resetExecState() {
		this.memory = new Memory(this.level.vars);
		this.interp = null;
		this.verdict = null;
		this.activeIndex = -1;
	}

	addBlock(instr) {
		if (this.program.length >= this.level.slots) return;
		this.program.push(instr);
		this.resetExecState();
		this.render();
	}

	removeBlock(i) {
		this.program.splice(i, 1);
		this.resetExecState();
		this.render();
	}

	freshInterp() {
		this.memory = new Memory(this.level.vars);
		this.interp = new Interpreter(this.memory, this.program);
		this.verdict = null;
		this.activeIndex = -1;
	}

	run() {
		this.freshInterp();
		this.interp.run();
		this.activeIndex = -1;
		this.evaluate();
		this.render();
	}

	step() {
		if (!this.interp || this.interp.done) this.freshInterp();
		const r = this.interp.step();
		this.activeIndex = r.index;
		if (this.interp.done) this.evaluate();
		this.render();
	}

	reset() {
		this.resetExecState();
		this.render();
	}

	evaluate() {
		const goalMet = this.level.goalCheck
			? this.level.goalCheck(this.memory)
			: Object.entries(this.level.goal)
				.every(([k, v]) => this.memory.getVar(k) === v);
		const error = this.interp ? this.interp.error : null;
		const clean = !error && this.memory.leaks().length === 0;
		const minimal = goalMet && this.program.length <= this.level.par;
		const passed = goalMet && !error;
		if (passed) this.solved.add(this.level.id);   // débloque la progression sur la carte
		let message;
		if (error) message = 'Crash : ' + error;
		else if (goalMet) message = 'Réussi !';
		else message = 'Cible non atteinte. Réessaie.';
		this.verdict = {
			passed,
			message,
			stars: [
				{ label: 'cible atteinte', got: goalMet },
				{ label: 'sans erreur ni fuite', got: clean },
				{ label: '≤ ' + this.level.par + ' instructions', got: minimal }
			]
		};
	}

	render() {
		const lv = this.level;
		clear(this.elMission);
		const back = button({ label: '← carte', variant: 'ghost', size: 'sm', onClick: () => this.showMap() });
		back.style.marginBottom = '10px';
		this.elMission.append(
			back,
			el('div', { class: 'mission-tag', text: 'niveau ' + (this.levelIndex + 1) + ' / ' + LEVELS.length + ' · ' + lv.world }),
			el('div', { class: 'mission-title', text: lv.title }),
			el('p', { class: 'mission-goal', text: lv.goalText }),
			el('p', { class: 'mission-hint', text: 'Indice : ' + lv.hint })
		);
		renderMemory(this.elMemory, this.memory.snapshot(), this.memory.heap(), this.memory.changed);
		renderProgram(this.elProgram, this.program, lv.slots, this.activeIndex, (i) => this.removeBlock(i));
		renderPalette(this.elPalette, lv.bank, this.program.length >= lv.slots, (instr) => this.addBlock(instr));
		renderControls(this.elControls, {
			onRun: () => this.run(),
			onStep: () => this.step(),
			onReset: () => this.reset(),
			onNext: this.levelIndex < LEVELS.length - 1 ? () => this.loadLevel(this.levelIndex + 1) : null
		}, { verdict: this.verdict });
	}
}
