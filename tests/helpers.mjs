import { Memory } from '../src/engine/memory.js';
import { Interpreter } from '../src/engine/interpreter.js';
import { LEVELS } from '../src/game/levels.js';

export const byId = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

// Construit l'interpréteur d'un niveau comme le runner du jeu (game.js) : niveau à plat
// (le programme est main) ou niveau-fonction (le programme devient le corps de
// level.assembleInto et le lanceur level.driver est exécuté) — cf. docs/GAME-DESIGN.md §4.
export function interpFor(level, program, mem) {
	const functions = { ...(level.functions || {}) };
	if (level.assembleInto) {
		functions[level.assembleInto] = { name: level.assembleInto, params: level.params || [], body: program };
		return new Interpreter(mem, level.driver, functions);
	}
	return new Interpreter(mem, program, functions);
}

export function runProgram(level, ids) {
	const mem = new Memory(level.vars);
	if (level.files)
		for (const [n, c] of Object.entries(level.files)) mem.setFile(n, c);
	if (level.args) {
		const { argc, argv } = mem.installArgv(level.args);
		mem.setVar('argc', argc);
		mem.setVar('argv', argv);
	}
	const program = ids.map((id) => level.bank.find((b) => b.id === id));
	const interp = interpFor(level, program, mem);
	interp.run();
	return { mem, error: interp.error, interp };
}

export function goalMet(level, mem) {
	if (level.goalCheck) return level.goalCheck(mem);
	return Object.entries(level.goal).every(([k, v]) => mem.getVar(k) === v);
}

export function solved(level, ids) {
	const { mem, error } = runProgram(level, ids);
	return goalMet(level, mem) && !error;
}
