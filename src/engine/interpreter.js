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
			return m.allocate();
		throw new RuntimeError('expression inconnue');
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
			if (instr.ast.op === 'free') {
				this.mem.free(this.mem.getVar(instr.ast.ptr));
			} else if (instr.ast.op === 'write') {
				this.mem.writeStdout(this.evalExpr(instr.ast.arg));
			} else {
				const v = this.evalExpr(instr.ast.rhs);
				this.writePlace(instr.ast.lhs, v);
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
