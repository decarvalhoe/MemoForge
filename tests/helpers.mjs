import { Memory } from '../src/engine/memory.js';
import { Interpreter } from '../src/engine/interpreter.js';
import { LEVELS } from '../src/game/levels.js';

export const byId = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

export function runProgram(level, ids) {
	const mem = new Memory(level.vars);
	const program = ids.map((id) => level.bank.find((b) => b.id === id));
	const interp = new Interpreter(mem, program);
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
