export class RuntimeError extends Error {}

const WORD = 4;
const HEAP_BASE = 5000;

export class Memory {
	constructor(varDefs) {
		this.names = new Map();
		this.cells = new Map();
		this.kinds = new Map();
		this.order = [];
		this.allocated = new Set();
		this.freed = new Set();
		this.changed = new Set();
		this.stdout = [];
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

	// --- Flux de sortie (brique B1 : write(1, &c, 1)) ---
	// write émet un octet. Un caractère est stocké tel quel ; un nombre est un code ASCII.
	writeStdout(value) {
		this.stdout.push(value);
	}

	// Rend le flux comme une chaîne, dans l'ordre d'émission : un nombre est converti en
	// caractère (code ASCII), un caractère est concaténé tel quel.
	outputString() {
		return this.stdout
			.map((v) => (typeof v === 'number' ? String.fromCharCode(v) : String(v)))
			.join('');
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
