export class RuntimeError extends Error {}

const WORD = 4;
const HEAP_BASE = 5000;
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

export class Memory {
	constructor(varDefs) {
		this.names = new Map();
		this.cells = new Map();
		this.kinds = new Map();
		this.order = [];
		this.allocated = new Set();
		this.freed = new Set();
		this.changed = new Set();
		this.output = '';
		this.nextHeap = HEAP_BASE;
		let addr = 1000;
		for (const v of varDefs) {
			this.names.set(v.name, addr);
			this.cells.set(addr, v.value === undefined ? 0 : v.value);
			this.kinds.set(v.name, v.kind || 'int');
			this.order.push(v.name);
			addr += WORD;
		}
	}

	addrOf(name) {
		if (!this.names.has(name))
			throw new RuntimeError(`variable inconnue : ${name}`);
		return this.names.get(name);
	}

	getVar(name) {
		return this.cells.get(this.addrOf(name));
	}

	setVar(name, value) {
		this.cells.set(this.addrOf(name), value);
		this.changed.add(name);
	}

	readAddr(addr) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		if (this.freed.has(addr))
			throw new RuntimeError('lecture dans un casier déjà libéré');
		if (!this.cells.has(addr))
			throw new RuntimeError('adresse invalide');
		return this.cells.get(addr);
	}

	writeAddr(addr, value) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		if (this.freed.has(addr))
			throw new RuntimeError('écriture dans un casier déjà libéré');
		if (!this.cells.has(addr))
			throw new RuntimeError('adresse invalide');
		this.cells.set(addr, value);
	}

	emit(fd, addr, count) {
		if (fd !== 1)
			throw new RuntimeError('flux inconnu (seul fd 1 est géré)');
		let a = addr;
		let n = 0;
		while (n < count) {
			const v = this.readAddr(a);
			this.output += (typeof v === 'string') ? v : String.fromCharCode(v & 0xff);
			a += WORD;
			n += 1;
		}
		return count;
	}

	isTerminator(v) {
		return v === 0 || v === '\0';
	}

	strlen(addr) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		let a = addr;
		let len = 0;
		while (this.cells.has(a) && !this.freed.has(a)) {
			if (this.isTerminator(this.cells.get(a)))
				return len;
			len += 1;
			a += WORD;
		}
		throw new RuntimeError("chaîne sans borne : pas de '\\0'");
	}

	atoi(addr) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		let a = addr;
		const at = () => (this.cells.has(a) && !this.freed.has(a)) ? this.cells.get(a) : undefined;
		const isSpace = (c) => c === ' ' || c === '\t' || c === '\n';
		while (isSpace(at()))
			a += WORD;
		let sign = 1;
		const s = at();
		if (s === '+' || s === '-') {
			if (s === '-')
				sign = -1;
			a += WORD;
		}
		let res = 0;
		let c = at();
		while (typeof c === 'string' && c >= '0' && c <= '9') {
			res = res * 10 + (c.charCodeAt(0) - 48);
			if (sign === 1 && res > INT_MAX)
				throw new RuntimeError('débordement : dépasse INT_MAX');
			if (sign === -1 && -res < INT_MIN)
				throw new RuntimeError('débordement : dépasse INT_MIN');
			a += WORD;
			c = at();
		}
		return sign * res;
	}

	putnbrBase(n, base) {
		if (typeof base !== 'string' || base.length < 2)
			throw new RuntimeError('base invalide (≥ 2 symboles)');
		const b = base.length;
		let x = n;
		if (x < 0) {
			this.output += '-';
			x = -x;
		}
		const digits = [];
		do {
			digits.push(base[x % b]);
			x = Math.floor(x / b);
		} while (x > 0);
		this.output += digits.reverse().join('');
	}

	allocate() {
		const addr = this.nextHeap;
		this.nextHeap += WORD;
		this.cells.set(addr, 0);
		this.allocated.add(addr);
		this.freed.delete(addr);
		return addr;
	}

	free(addr) {
		if (addr === 0 || !this.allocated.has(addr))
			throw new RuntimeError('free invalide (adresse non allouée)');
		this.allocated.delete(addr);
		this.freed.add(addr);
	}

	leaks() {
		return [...this.allocated];
	}

	nameAt(addr) {
		for (const [name, a] of this.names)
			if (a === addr)
				return name;
		return null;
	}

	heap() {
		const addrs = [...new Set([...this.allocated, ...this.freed])].sort((a, b) => a - b);
		return addrs.map((address) => ({
			address,
			value: this.cells.get(address),
			freed: this.freed.has(address)
		}));
	}

	clearChanged() {
		this.changed = new Set();
	}

	snapshot() {
		return this.order.map((name) => ({
			name,
			address: this.names.get(name),
			value: this.cells.get(this.names.get(name)),
			kind: this.kinds.get(name)
		}));
	}
}
