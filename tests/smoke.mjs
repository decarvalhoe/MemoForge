import { Memory } from '../src/engine/memory.js';
import { Interpreter } from '../src/engine/interpreter.js';
import { LEVELS } from '../src/game/levels.js';

let pass = 0;
let fail = 0;

function check(name, cond) {
	if (cond) { pass++; console.log('  ok   ' + name); }
	else { fail++; console.log('  FAIL ' + name); }
}

function runProgram(level, ids) {
	const mem = new Memory(level.vars);
	const program = ids.map((id) => level.bank.find((b) => b.id === id));
	const interp = new Interpreter(mem, program);
	interp.run();
	return { mem, error: interp.error };
}

function goalMet(level, mem) {
	if (level.goalCheck) return level.goalCheck(mem);
	return Object.entries(level.goal).every(([k, v]) => mem.getVar(k) === v);
}

const L = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

console.log('niveau 1-1 : mettre 42 dans n');
let r = runProgram(L['1-1'], ['set-n']);
check('n = 42 atteint la cible', goalMet(L['1-1'], r.mem) && !r.error);
r = runProgram(L['1-1'], ['deref-n']);
check('*n = 42 plante (NULL)', !!r.error);

console.log('niveau 1-2 : via le pointeur');
r = runProgram(L['1-2'], ['p-addr-n', 'star-p-42']);
check('p=&n puis *p=42 atteint la cible', goalMet(L['1-2'], r.mem) && !r.error);
r = runProgram(L['1-2'], ['star-p-42', 'p-addr-n']);
check('mauvais ordre plante (NULL)', !!r.error);

console.log('niveau 1-3 : échange a/b');
r = runProgram(L['1-3'], ['tmp-a', 'a-b', 'b-tmp']);
check('tmp=a; a=b; b=tmp échange bien', goalMet(L['1-3'], r.mem) && !r.error);
r = runProgram(L['1-3'], ['a-b', 'b-a']);
check('a=b; b=a échoue (pas de tmp)', !goalMet(L['1-3'], r.mem));

console.log('niveau 2-1 : inverser le tableau');
r = runProgram(L['2-1'], ['tmp-t0', 't0-t2', 't2-tmp']);
check('swap des bouts inverse le tableau', goalMet(L['2-1'], r.mem) && !r.error);
r = runProgram(L['2-1'], ['t0-t2', 't2-t0']);
check('sans tmp, échoue', !goalMet(L['2-1'], r.mem));

console.log('niveau 3-1 : réserve, écris, libère');
r = runProgram(L['3-1'], ['p-malloc', 'star-p-7', 'free-p']);
check('malloc; *p=7; free → zéro fuite', goalMet(L['3-1'], r.mem) && !r.error);
r = runProgram(L['3-1'], ['p-malloc', 'star-p-7']);
check('oublier free → fuite (cible non atteinte)', !goalMet(L['3-1'], r.mem) && !r.error);
r = runProgram(L['3-1'], ['star-p-7', 'p-malloc', 'free-p']);
check('*p avant malloc → crash NULL', !!r.error);
r = runProgram(L['3-1'], ['p-7-bad', 'star-p-7']);
check('p=7 puis *p → adresse invalide', !!r.error);

console.log('niveau 3-2 : chaque malloc a son free');
r = runProgram(L['3-2'], ['p-malloc', 'q-malloc', 'free-p', 'free-q']);
check('deux malloc, deux free → zéro fuite', goalMet(L['3-2'], r.mem) && !r.error);
r = runProgram(L['3-2'], ['p-malloc', 'free-p', 'free-p2']);
check('double free → crash', !!r.error);

console.log('niveau 4-1 : écrire "Hi"');
r = runProgram(L['4-1'], ['c0-H', 'c1-i', 'c2-nul']);
check("'H','i','\\0' forme la chaîne", goalMet(L['4-1'], r.mem) && !r.error);
r = runProgram(L['4-1'], ['c0-i', 'c1-i', 'c2-nul']);
check('mauvaise lettre → échoue', !goalMet(L['4-1'], r.mem));

console.log('\n' + pass + ' ok, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
