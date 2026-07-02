import { Memory } from '../engine/memory.js';
import { Interpreter } from '../engine/interpreter.js';
import { LEVELS } from './levels.js';
import { el, clear } from '../ui/dom.js';
import { renderMemory } from '../ui/memoryView.js';
import { renderProgram } from '../ui/programView.js';
import { renderPalette } from '../ui/paletteView.js';
import { renderControls } from '../ui/controls.js';
import { renderRegionMap } from '../ui/regionMapView.js';
import { renderCallStack } from '../ui/callStackView.js';
import { button } from '../ui/components/index.js';
import { explainRun, explainError, explainLeak } from './pitfalls.js';
import { SANDBOX } from './sandbox.js';
import { EXAM } from './exam.js';
import { loadLibft, saveLibft, forge, functionsFor, forgedNames } from './libft.js';
import { renderLibft } from '../ui/libftView.js';
import { WORD } from '../engine/memory.js';
import { valgrindReport, measureLeaks } from './valgrind.js';
import { renderValgrind } from '../ui/valgrindView.js';
import { renderBytes } from '../ui/bytesView.js';

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
		this.mood = 'think';             // humeur de la mascotte GLIF
		this.fails = 0;                  // échecs consécutifs sur le niveau courant
		this._timer = null;              // timer de l'exécution animée
		this.sandboxMode = false;        // bac à sable (niveau sans cible)
		this.examMode = false;           // mode examen (séquence chronométrée)
		this.examIndex = 0;
		this.examSolved = 0;
		this.examStart = 0;
		this.examEndTime = 0;
		this.examDone = false;
		// « Ta libft » : inventaire des ft_ forgées, persistant si un stockage est dispo.
		this._storage = (typeof localStorage !== 'undefined') ? localStorage : null;
		this.libft = loadLibft(this._storage);
	}

	get level() {
		if (this.examMode && !this.examDone) return LEVELS.find((l) => l.id === EXAM.levelIds[this.examIndex]);
		return this.sandboxMode ? SANDBOX : LEVELS[this.levelIndex];
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
		this.elCallStack = el('div', { class: 'callstack' });
		this.elProgram = el('div', { class: 'program' });
		this.elPalette = el('div', { class: 'palette' });
		this.elControls = el('div', { class: 'controls' });
		this.elMainSection = el('div', { class: 'main' }, [
			el('section', { class: 'panel' }, [el('h2', { text: 'mur de casiers' }), this.elMemory, this.elBytes = el('div', { class: 'bytes' }), this.elCallStack, this.elValgrind = el('div', { class: 'valgrind' })]),
			el('aside', { class: 'side' }, [
				el('h2', { text: 'ton programme' }), this.elProgram,
				el('h2', { text: 'palette' }), this.elPalette,
				this.elLibft = el('div', { class: 'libft' })
			])
		]);
		this.elRoom = el('div', { class: 'view-room' }, [this.elMission, this.elMainSection, this.elControls]);

		this.root.append(this.elMap, this.elRoom);
	}

	// ---- navigation carte <-> salle ----
	showMap() {
		clearTimeout(this._timer);
		this.sandboxMode = false;
		this.examMode = false;
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

	enterSandbox() {
		clearTimeout(this._timer);
		this.examMode = false;
		this.sandboxMode = true;
		this.view = 'room';
		this.elMap.style.display = 'none';
		this.elRoom.style.display = '';
		this.program = [];
		this.mood = 'think';
		this.fails = 0;
		this.resetExecState();
		this.render();
	}

	// ---- mode examen (séquence chronométrée, sans indice, avec score) ----
	enterExam() {
		clearTimeout(this._timer);
		this.sandboxMode = false;
		this.examMode = true;
		this.examIndex = 0;
		this.examSolved = 0;
		this.examDone = false;
		this.examStart = Date.now();
		this.view = 'room';
		this.elMap.style.display = 'none';
		this.elRoom.style.display = '';
		this.loadExamLevel();
	}

	loadExamLevel() {
		this.program = [];
		this.mood = 'think';
		this.fails = 0;
		this.resetExecState();
		this.render();
	}

	nextExam(solvedIt) {
		if (solvedIt) this.examSolved += 1;
		this.examIndex += 1;
		if (this.examIndex >= EXAM.levelIds.length) {
			this.examDone = true;
			this.examEndTime = Date.now();
			this.render();
		} else {
			this.loadExamLevel();
		}
	}

	examElapsed() {
		const end = this.examDone ? this.examEndTime : Date.now();
		const s = Math.max(0, Math.floor((end - this.examStart) / 1000));
		return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
	}

	renderMap() {
		renderRegionMap(this.elMap, this.solved, (id) => this.enterRoom(id), () => this.enterSandbox(), () => this.enterExam());
	}

	loadLevel(i) {
		this.sandboxMode = false;
		this.examMode = false;
		this.levelIndex = i;
		this.program = [];
		this.mood = 'think';
		this.fails = 0;
		this.resetExecState();
		this.render();
	}

	// Construit la mémoire du niveau courant + installe ses fichiers éventuels (niveaux B12).
	newMemory() {
		const mem = new Memory(this.level.vars);
		if (this.level.files) {
			for (const [name, content] of Object.entries(this.level.files)) mem.setFile(name, content);
		}
		if (this.level.args) {
			const { argc, argv } = mem.installArgv(this.level.args);
			mem.setVar('argc', argc);
			mem.setVar('argv', argv);
		}
		return mem;
	}

	resetExecState() {
		clearTimeout(this._timer);
		this.memory = this.newMemory();
		this.interp = null;
		this.verdict = null;
		this.valgrind = null;
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

	moveBlock(from, to) {
		if (to < 0 || to >= this.program.length || from === to) return;
		const [item] = this.program.splice(from, 1);
		this.program.splice(to, 0, item);
		this.resetExecState();
		this.render();
	}

	// Niveaux-fonction (Mondes 6-7, cf. docs/GAME-DESIGN.md §4) : le programme du joueur
	// devient le CORPS de level.assembleInto, et l'interpréteur exécute le lanceur
	// verrouillé level.driver. Niveau à plat sinon (comportement historique).
	buildInterp() {
		const lv = this.level;
		// Registre = fonctions de référence du niveau + ft_ forgées par le joueur (les
		// siennes priment). C'est ce qui rend « ta libft » réutilisable de niveau en niveau.
		const functions = functionsFor(this.libft, lv.usesLibft || [], lv.functions || {});
		if (lv.assembleInto) {
			functions[lv.assembleInto] = { name: lv.assembleInto, params: lv.params || [], body: this.program };
			return new Interpreter(this.memory, lv.driver, functions);
		}
		return new Interpreter(this.memory, this.program, functions);
	}

	// Slot du joueur à surligner pour un statut de step(). Dans un niveau-fonction, seul
	// le corps assemblé lui appartient : on ne surligne que dedans (frameIndex > 0).
	activeSlot(r) {
		if (!this.level.assembleInto) return r.index;
		return r.frameIndex > 0 ? r.instrIndex : -1;
	}

	freshInterp() {
		this.memory = this.newMemory();
		this.interp = this.buildInterp();
		this.verdict = null;
		this.activeIndex = -1;
	}

	run() {
		clearTimeout(this._timer);
		this.freshInterp();
		const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			this.interp.run();
			this.activeIndex = -1;
			this.evaluate();
			this.render();
			return;
		}
		this._animate();
	}

	// Exécution pas-à-pas animée : chaque instruction s'exécute avec un délai, le slot actif
	// se met en surbrillance, puis le verdict tombe. Repli instantané si prefers-reduced-motion.
	_animate() {
		if (this.interp.done) {
			this.activeIndex = -1;
			this.evaluate();
			this.render();
			return;
		}
		const r = this.interp.step();
		this.activeIndex = this.activeSlot(r);
		this.render();
		this._timer = setTimeout(() => this._animate(), 480);
	}

	step() {
		clearTimeout(this._timer);
		if (!this.interp || this.interp.done) this.freshInterp();
		const r = this.interp.step();
		this.activeIndex = this.activeSlot(r);
		if (this.interp.done) this.evaluate();
		this.render();
	}

	reset() {
		this.resetExecState();
		this.render();
	}

	evaluate() {
		if (this.level.sandbox) {
			const err = this.interp ? this.interp.error : null;
			const leaks = this.memory.leaks().length;
			this.mood = err ? 'err' : 'think';
			this.fails = 0;
			const feedback = explainError(err) || explainLeak(leaks)
				|| { tone: 'success', title: 'EXÉCUTÉ', hint: 'Aucune cible : observe la mémoire. Provoque une fuite, un double free, un déréf. de NULL…' };
			this.verdict = { passed: false, sandbox: true, message: feedback.title, feedback, stars: [] };
			return;
		}
		const goalMet = this.level.goalCheck
			? this.level.goalCheck(this.memory)
			: Object.entries(this.level.goal)
				.every(([k, v]) => this.memory.getVar(k) === v);
		const error = this.interp ? this.interp.error : null;
		const clean = !error && this.memory.leaks().length === 0;
		const minimal = goalMet && this.program.length <= this.level.par;
		const passed = goalMet && !error;
		const leaks = this.memory.leaks().length;
		const feedback = explainRun({ error, leaks, goalMet });   // message pédagogique (pièges)
		// Verdict façon valgrind sur les niveaux qui touchent au tas (cours M9).
		this.usedHeap = this.memory.heap().length > 0;
		this.valgrind = this.usedHeap ? valgrindReport(measureLeaks(this.memory, WORD, !!error)) : null;
		if (passed) {
			this.solved.add(this.level.id);   // débloque la progression sur la carte
			// Niveau « écris ft_xxx » réussi → la fonction entre dans ta libft (esprit libft).
			if (this.level.assembleInto) {
				this.libft = forge(this.libft, this.level.assembleInto, this.level.params || [], this.program);
				saveLibft(this._storage, this.libft);
			}
			this.mood = 'win';
			this.fails = 0;
		} else {
			this.mood = error ? 'err' : 'think';
			this.fails += 1;
		}
		let message;
		if (error) message = 'Crash : ' + error;
		else if (goalMet) message = 'Réussi !';
		else message = 'Cible non atteinte. Réessaie.';
		this.verdict = {
			passed,
			message,
			feedback,
			stars: [
				{ label: 'cible atteinte', got: goalMet },
				{ label: 'sans erreur ni fuite', got: clean },
				{ label: '≤ ' + this.level.par + ' instructions', got: minimal }
			]
		};
	}

	render() {
		if (this.examMode && this.examDone) { this.renderExamSummary(); return; }
		if (this.elMainSection) this.elMainSection.style.display = '';
		this.elControls.style.display = '';
		const lv = this.level;
		clear(this.elMission);
		const back = button({ label: '← carte', variant: 'ghost', size: 'sm', onClick: () => this.showMap() });
		back.style.marginBottom = '10px';
		let tag;
		if (this.examMode) tag = `examen · Q${this.examIndex + 1}/${EXAM.levelIds.length} · ⏱ ${this.examElapsed()}`;
		else if (lv.sandbox) tag = 'bac à sable';
		else tag = 'niveau ' + (this.levelIndex + 1) + ' / ' + LEVELS.length + ' · ' + lv.world;
		const parts = [
			back,
			el('div', { class: 'mission-tag', text: tag }),
			el('div', { class: 'mission-title', text: lv.title }),
			el('p', { class: 'mission-goal', text: lv.goalText })
		];
		if (lv.driverText) parts.push(el('p', { class: 'mission-goal', text: '⚙ ' + lv.driverText }));
		if (!this.examMode) parts.push(el('p', { class: 'mission-hint', text: 'Indice : ' + lv.hint }));
		this.elMission.append(...parts);
		renderMemory(this.elMemory, this.memory.snapshot(), this.memory.heap(), this.memory.changed, this.memory.output);
		const frames = this.interp && typeof this.interp.frames === 'function' ? this.interp.frames() : null;
		renderCallStack(this.elCallStack, frames);
		renderValgrind(this.elValgrind, this.valgrind);
		renderBytes(this.elBytes, this.memory.snapshot(), lv.showBytes || []);
		renderProgram(this.elProgram, this.program, lv.slots, this.activeIndex, (i) => this.removeBlock(i), (from, to) => this.moveBlock(from, to));
		renderPalette(this.elPalette, lv.bank, this.program.length >= lv.slots, (instr) => this.addBlock(instr));
		renderLibft(this.elLibft, forgedNames(this.libft));
		let onNext = null;
		if (this.examMode) onNext = () => this.nextExam(true);
		else if (!lv.sandbox && this.levelIndex < LEVELS.length - 1) onNext = () => this.loadLevel(this.levelIndex + 1);
		const showHint = !this.examMode && this.fails >= 2 && !(this.verdict && this.verdict.passed);
		renderControls(this.elControls, {
			onRun: () => this.run(),
			onStep: () => this.step(),
			onReset: () => this.reset(),
			onNext,
			onSkip: this.examMode ? () => this.nextExam(false) : null
		}, { verdict: this.verdict, mood: this.mood, hint: showHint ? lv.hint : null });
	}

	renderExamSummary() {
		clear(this.elMission);
		if (this.elMainSection) this.elMainSection.style.display = 'none';
		this.elControls.style.display = 'none';
		const total = EXAM.levelIds.length;
		this.elMission.append(
			el('div', { class: 'mission-tag', text: 'examen terminé' }),
			el('div', { class: 'mission-title', text: `Score : ${this.examSolved} / ${total}` }),
			el('p', { class: 'mission-goal', text: `Temps : ${this.examElapsed()}` }),
			el('div', { style: 'display:flex;gap:8px;margin-top:14px' }, [
				button({ label: 'recommencer', variant: 'primary', onClick: () => this.enterExam() }),
				button({ label: '← carte', variant: 'ghost', onClick: () => this.showMap() })
			])
		);
	}
}
