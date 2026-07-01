import { RuntimeError } from './memory.js';

export class Interpreter {
	constructor(memory, program) {
		this.mem = memory;
		this.program = program;
		this.pc = 0;
		this.error = null;
		this.done = program.length === 0;
	}

	evalExpr(e) {
		const m = this.mem;
		if (e.t === 'lit')
			return e.v;
		if (e.t === 'var')
			return m.getVar(e.name);
		if (e.t === 'addr')
			return m.addrOf(e.name);
		if (e.t === 'deref')
			return m.readAddr(m.getVar(e.name));
		if (e.t === 'malloc')
			return m.allocate(e.size === undefined ? 1 : this.evalExpr(e.size));
		if (e.t === 'strlen')
			return m.strlen(this.evalExpr(e.src));
		if (e.t === 'atoi')
			return m.atoi(this.evalExpr(e.src));
		if (e.t === 'bin')
			return this.evalBin(e);
		throw new RuntimeError('expression inconnue');
	}

	evalBin(e) {
		const a = this.evalExpr(e.a);
		const b = this.evalExpr(e.b);
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
		throw new RuntimeError('opérateur inconnu');
	}

	writePlace(p, value) {
		const m = this.mem;
		if (p.t === 'var') {
			m.setVar(p.name, value);
			return;
		}
		if (p.t === 'deref') {
			const addr = m.getVar(p.name);
			m.writeAddr(addr, value);
			const n = m.nameAt(addr);
			if (n)
				m.changed.add(n);
			return;
		}
		throw new RuntimeError('cible non assignable');
	}

	step() {
		if (this.done || this.error)
			return { done: true, error: this.error, index: this.pc };
		this.mem.clearChanged();
		const instr = this.program[this.pc];
		try {
			const ast = instr.ast;
			if (ast.op === 'free') {
				this.mem.free(this.mem.getVar(ast.ptr));
			} else if (ast.op === 'write') {
				this.mem.emit(ast.fd, this.evalExpr(ast.src), this.evalExpr(ast.count));
			} else if (ast.op === 'putnbr_base') {
				this.mem.putnbrBase(this.evalExpr(ast.n), this.evalExpr(ast.base));
			} else if (ast.op === 'strcpy') {
				this.mem.strcpy(this.evalExpr(ast.dst), this.evalExpr(ast.src));
			} else {
				this.writePlace(ast.lhs, this.evalExpr(ast.rhs));
			}
		} catch (err) {
			this.error = err.message;
			this.done = true;
			return { index: this.pc, error: this.error, done: true };
		}
		this.pc++;
		if (this.pc >= this.program.length)
			this.done = true;
		return { index: this.pc - 1, done: this.done, error: null };
	}

	run() {
		let last = null;
		let guard = 0;
		while (!this.done && guard++ < 1000)
			last = this.step();
		return last;
	}
}
