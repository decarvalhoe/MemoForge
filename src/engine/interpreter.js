import { RuntimeError, WORD } from './memory.js';

const MAX_STEPS = 100000;
const MAX_DEPTH = 64;

// En C, un char EST son code ASCII : l'arithmétique et les comparaisons opèrent sur des
// nombres (`c - '0'`, `'a' - 32`, `c <= 'z'`). Le moteur range les chars comme chaînes d'un
// caractère (confort d'affichage) ; on les ramène à leur code pour tout calcul binaire.
export function codeOf(v) {
	return (typeof v === 'string' && v.length === 1) ? v.charCodeAt(0) : v;
}

export class Interpreter {
	constructor(memory, program, functions = {}) {
		this.mem = memory;
		this.functions = functions;
		this.error = null;
		this.steps = 0;
		this.iterStack = [];
		this.frameIndex = 0;
		this.instrIndex = 0;
		this.stack = [{ label: 'main', locals: null, blocks: [{ instrs: program, index: 0, loop: null }] }];
		this.done = program.length === 0;
	}

	// Portée : dans une frame d'appel (locals != null), les variables résolvent d'abord
	// les locales (params + slots déclarés à l'écriture), avec repli sur la mémoire globale
	// en lecture. Les écritures restent locales (une fonction ne mute pas les globales
	// directement — seulement via des adresses/pointeurs, qui passent par la mémoire).
	readVar(name) {
		const top = this.stack[this.stack.length - 1];
		if (top.locals && top.locals.has(name)) {
			// Locale « promue » (son adresse a été prise) : le casier de pile fait foi, pour
			// que name et *(&name) restent d'accord.
			if (top.addrCells && top.addrCells.has(name))
				return this.mem.readAddr(top.addrCells.get(name));
			return top.locals.get(name);
		}
		return this.mem.getVar(name);
	}

	writeVar(name, value) {
		const top = this.stack[this.stack.length - 1];
		if (top.locals) {
			top.locals.set(name, value);
			// Si l'adresse de cette locale a déjà été prise (&local), garder le casier de
			// pile en phase avec la valeur.
			if (top.addrCells && top.addrCells.has(name))
				this.mem.writeAddr(top.addrCells.get(name), value);
			return;
		}
		this.mem.setVar(name, value);
	}

	// Adresse d'une variable : &local matérialise un casier de pile (adressable, mais MORT
	// dès que la frame est dépilée — c'est le dangling pointer du M6). &global inchangé.
	addrOf(name) {
		const top = this.stack[this.stack.length - 1];
		if (top.locals && top.locals.has(name)) {
			if (!top.addrCells)
				top.addrCells = new Map();
			if (!top.addrCells.has(name))
				top.addrCells.set(name, this.mem.allocStack(top.locals.get(name)));
			return top.addrCells.get(name);
		}
		return this.mem.addrOf(name);
	}

	evalExpr(e) {
		const m = this.mem;
		if (e.t === 'lit')
			return e.v;
		if (e.t === 'var')
			return this.readVar(e.name);
		if (e.t === 'addr')
			return this.addrOf(e.name);
		if (e.t === 'deref')
			return m.readAddr(this.readVar(e.name));
		if (e.t === 'malloc')
			return m.allocate(e.size === undefined ? 1 : this.evalExpr(e.size));
		if (e.t === 'strlen')
			return m.strlen(this.evalExpr(e.src));
		if (e.t === 'atoi')
			return m.atoi(this.evalExpr(e.src));
		if (e.t === 'bin')
			return this.evalBin(e);
		if (e.t === 'node')
			return m.createNode(this.evalExpr(e.data));
		if (e.t === 'field')
			return m.nodeField(this.evalExpr(e.node), e.field);
		if (e.t === 'open')
			return m.open(e.name);
		if (e.t === 'read')
			return m.read(this.evalExpr(e.fd), this.evalExpr(e.dst), this.evalExpr(e.count));
		if (e.t === 'load')
			return m.readAddr(this.evalExpr(e.base) + this.evalExpr(e.index) * WORD);
		if (e.t === 'iter')
			return this.currentIter();
		if (e.t === 'fnref')
			return e.name;
		throw new RuntimeError('expression inconnue');
	}

	currentIter() {
		if (this.iterStack.length === 0)
			throw new RuntimeError('iter utilisé hors d\'une boucle');
		return this.iterStack[this.iterStack.length - 1].i;
	}

	evalBin(e) {
		const a = codeOf(this.evalExpr(e.a));
		const b = codeOf(this.evalExpr(e.b));
		if ((e.op === '/' || e.op === '%') && b === 0)
			throw new RuntimeError('division par zéro');
		if (e.op === '+')
			return a + b;
		if (e.op === '-')
			return a - b;
		if (e.op === '*')
			return a * b;
		if (e.op === '/')
			return Math.trunc(a / b);
		if (e.op === '%')
			return a - Math.trunc(a / b) * b;
		if (e.op === '<')
			return a < b ? 1 : 0;
		if (e.op === '<=')
			return a <= b ? 1 : 0;
		if (e.op === '>')
			return a > b ? 1 : 0;
		if (e.op === '>=')
			return a >= b ? 1 : 0;
		if (e.op === '==')
			return a === b ? 1 : 0;
		if (e.op === '!=')
			return a !== b ? 1 : 0;
		throw new RuntimeError('opérateur inconnu');
	}

	writePlace(p, value) {
		const m = this.mem;
		if (p.t === 'var') {
			this.writeVar(p.name, value);
			return;
		}
		if (p.t === 'deref') {
			this.storeAt(this.readVar(p.name), value);
			return;
		}
		if (p.t === 'store') {
			this.storeAt(this.evalExpr(p.base) + this.evalExpr(p.index) * WORD, value);
			return;
		}
		if (p.t === 'field') {
			m.setNodeField(this.evalExpr(p.node), p.field, value);
			return;
		}
		throw new RuntimeError('cible non assignable');
	}

	storeAt(addr, value) {
		this.mem.writeAddr(addr, value);
		const n = this.mem.nameAt(addr);
		if (n)
			this.mem.changed.add(n);
	}

	runOp(ast) {
		const m = this.mem;
		if (ast.op === 'free')
			m.free(m.getVar(ast.ptr));
		else if (ast.op === 'write')
			m.emit(ast.fd, this.evalExpr(ast.src), this.evalExpr(ast.count));
		else if (ast.op === 'putnbr_base')
			m.putnbrBase(this.evalExpr(ast.n), this.evalExpr(ast.base));
		else if (ast.op === 'strcpy')
			m.strcpy(this.evalExpr(ast.dst), this.evalExpr(ast.src));
		else if (ast.op === 'free_node')
			m.freeNode(this.evalExpr(ast.node));
		else if (ast.op === 'close')
			m.close(this.evalExpr(ast.fd));
		else
			this.writePlace(ast.lhs, this.evalExpr(ast.rhs));
	}

	truthy(v) {
		return v !== 0 && v !== '\0' && v !== '' && v !== false && v !== null && v !== undefined;
	}

	loopContinues(loop) {
		if (loop.kind === 'loop')
			return loop.i < loop.n;
		return this.truthy(this.evalExpr(loop.guard));
	}

	enterLoop(frame, loop, body) {
		this.iterStack.push(loop);
		frame.blocks.push({ instrs: body, index: 0, loop });
	}

	// Livre la valeur de retour d'une frame terminée dans la variable `place` de
	// l'appelant, puis fait avancer l'appelant au-delà de son instruction d'appel.
	deliverReturn(finished) {
		this.writePlace(finished.resume.place, finished.ret);
		const caller = this.stack[this.stack.length - 1];
		const block = caller.blocks[caller.blocks.length - 1];
		block.index += 1;
	}

	settle() {
		while (this.stack.length > 0) {
			const frame = this.stack[this.stack.length - 1];
			if (frame.blocks.length === 0) {
				this.stack.pop();
				// Les casiers de pile de la frame (adresses de ses locales) meurent : toute
				// adresse renvoyée devient un dangling pointer.
				if (frame.addrCells)
					for (const a of frame.addrCells.values())
						this.mem.killStack(a);
				if (frame.resume)
					this.deliverReturn(frame);
				continue;
			}
			const block = frame.blocks[frame.blocks.length - 1];
			if (block.index < block.instrs.length)
				return true;
			if (block.loop) {
				block.loop.i += 1;
				if (this.loopContinues(block.loop)) {
					block.index = 0;
					return true;
				}
				this.iterStack.pop();
				frame.blocks.pop();
				const parent = frame.blocks[frame.blocks.length - 1];
				if (parent)
					parent.index += 1;
			} else {
				frame.blocks.pop();
			}
		}
		return false;
	}

	subtreeSize(instr) {
		const ast = instr.ast;
		if (ast.op === 'loop' || ast.op === 'while' || ast.op === 'if') {
			let s = 1;
			for (const b of ast.body)
				s += this.subtreeSize(b);
			return s;
		}
		return 1;
	}

	flatIndex(frame) {
		let flat = 0;
		for (let d = 0; d < frame.blocks.length; d++) {
			const b = frame.blocks[d];
			for (let k = 0; k < b.index; k++)
				flat += this.subtreeSize(b.instrs[k]);
			if (d < frame.blocks.length - 1)
				flat += 1;
		}
		return flat;
	}

	status() {
		return {
			done: this.done,
			error: this.error,
			index: this.instrIndex,
			frameIndex: this.frameIndex,
			instrIndex: this.instrIndex
		};
	}

	// Empile une frame d'appel : lie les paramètres aux valeurs, mémorise la `place` où
	// livrer le retour. On n'avance PAS l'instruction d'appel : elle sera franchie à la
	// livraison du retour (deliverReturn), une fois la callee dépilée.
	pushCall(name, vals, place) {
		const def = this.functions[name];
		if (!def)
			throw new RuntimeError(`fonction inconnue : ${name}`);
		if (this.stack.length > MAX_DEPTH)
			throw new RuntimeError('débordement de pile : récursion sans cas de base');
		const locals = new Map();
		def.params.forEach((p, i) => locals.set(p, vals[i]));
		this.stack.push({
			label: `${name}(${vals.join(', ')})`,
			locals,
			ret: 0,
			resume: { place },
			blocks: [{ instrs: def.body, index: 0, loop: null }]
		});
	}

	// Appel direct (par nom) et appel indirect (via valeur-fonction, B11) : les arguments
	// sont évalués dans la portée de l'appelant, puis une frame est empilée.
	doCall(ast) {
		const vals = ast.args.map((a) => this.evalExpr(a));
		this.pushCall(ast.name, vals, ast.place);
	}

	doApply(ast) {
		const name = this.evalExpr(ast.fn);
		const vals = ast.args.map((a) => this.evalExpr(a));
		this.pushCall(name, vals, ast.place);
	}

	// Retour : fixe la valeur puis vide la frame → settle() la dépile et livre le retour.
	doReturn(frame, ast) {
		frame.ret = this.evalExpr(ast.value);
		frame.blocks = [];
	}

	execInstr(frame, block, ast) {
		if (ast.op === 'loop') {
			const n = this.evalExpr(ast.count);
			if (n > 0)
				this.enterLoop(frame, { kind: 'loop', i: 0, n }, ast.body);
			else
				block.index += 1;
		} else if (ast.op === 'while') {
			if (this.truthy(this.evalExpr(ast.guard)))
				this.enterLoop(frame, { kind: 'while', i: 0, n: null, guard: ast.guard }, ast.body);
			else
				block.index += 1;
		} else if (ast.op === 'if') {
			block.index += 1;
			if (this.truthy(this.evalExpr(ast.guard)))
				frame.blocks.push({ instrs: ast.body, index: 0, loop: null });
		} else if (ast.op === 'call') {
			this.doCall(ast);
		} else if (ast.op === 'apply') {
			this.doApply(ast);
		} else if (ast.op === 'return') {
			this.doReturn(frame, ast);
		} else {
			this.runOp(ast);
			block.index += 1;
		}
	}

	step() {
		if (this.done || this.error)
			return this.status();
		this.steps += 1;
		if (this.steps > MAX_STEPS) {
			this.error = 'boucle infinie : garde de pas dépassée';
			this.done = true;
			return this.status();
		}
		if (!this.settle()) {
			this.done = true;
			return this.status();
		}
		const frame = this.stack[this.stack.length - 1];
		const block = frame.blocks[frame.blocks.length - 1];
		this.frameIndex = this.stack.length - 1;
		this.instrIndex = this.flatIndex(frame);
		this.mem.clearChanged();
		try {
			this.execInstr(frame, block, block.instrs[block.index].ast);
		} catch (err) {
			this.error = err.message;
			this.done = true;
		}
		return this.status();
	}

	localsVars(frame) {
		return [...frame.locals].map(([name, value]) => ({
			name,
			// Locale promue → afficher la valeur du casier de pile (source de vérité).
			value: (frame.addrCells && frame.addrCells.has(name)) ? this.mem.cells.get(frame.addrCells.get(name)) : value,
			kind: 'int'
		}));
	}

	frames() {
		return this.stack.map((frame) => {
			const vars = frame.locals ? this.localsVars(frame) : this.mem.snapshot();
			const out = { label: frame.label, vars };
			for (let d = frame.blocks.length - 1; d >= 0; d--) {
				if (frame.blocks[d].loop) {
					out.loop = { i: frame.blocks[d].loop.i, n: frame.blocks[d].loop.n };
					break;
				}
			}
			return out;
		});
	}

	run() {
		let last = null;
		while (!this.done)
			last = this.step();
		return last;
	}
}
