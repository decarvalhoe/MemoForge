export class RuntimeError extends Error {}

const WORD = 4;
const HEAP_BASE = 5000;
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;
const HEAP_CAPACITY = 4096;

export class Memory {
	constructor(varDefs) {
		this.names = new Map();
		this.cells = new Map();
		this.kinds = new Map();
		this.order = [];
		this.allocated = new Set();
		this.freed = new Set();
		this.blocks = new Map();
		this.usedHeap = 0;
		this.refs = new Map();
		this.changed = new Set();
		this.output = '';
		this.files = new Map();
		this.fileSystem = new Map();
		this.nextFd = 3;
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

	allocate(size = 1) {
		if (!Number.isInteger(size) || size <= 0)
			throw new RuntimeError('taille de malloc invalide');
		if (this.usedHeap + size > HEAP_CAPACITY)
			return 0;
		const base = this.nextHeap;
		let k = 0;
		while (k < size) {
			this.cells.set(this.nextHeap, 0);
			this.allocated.add(this.nextHeap);
			this.freed.delete(this.nextHeap);
			this.nextHeap += WORD;
			k += 1;
		}
		this.blocks.set(base, size);
		this.usedHeap += size;
		return base;
	}

	free(addr) {
		const size = this.blocks.get(addr);
		if (addr === 0 || size === undefined)
			throw new RuntimeError('free invalide (adresse non allouée)');
		let k = 0;
		while (k < size) {
			const a = addr + k * WORD;
			this.allocated.delete(a);
			this.freed.add(a);
			k += 1;
		}
		this.blocks.delete(addr);
		this.usedHeap -= size;
	}

	strcpy(dst, src) {
		if (dst === 0 || src === 0)
			throw new RuntimeError('déréférencement de NULL');
		let d = dst;
		let s = src;
		while (true) {
			const c = this.readAddr(s);
			this.writeAddr(d, c);
			if (this.isTerminator(c))
				return dst;
			d += WORD;
			s += WORD;
		}
	}

	createNode(data) {
		const base = this.allocate(2);
		if (base === 0)
			return 0;
		this.cells.set(base, data);
		this.cells.set(base + WORD, 0);
		return base;
	}

	nodeField(addr, field) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		return field === 'next' ? this.readAddr(addr + WORD) : this.readAddr(addr);
	}

	setNodeField(addr, field, value) {
		if (addr === 0)
			throw new RuntimeError('déréférencement de NULL');
		if (field !== 'next') {
			this.writeAddr(addr, value);
			return;
		}
		const old = this.readAddr(addr + WORD);
		if (old !== 0)
			this.refs.set(old, (this.refs.get(old) || 0) - 1);
		this.writeAddr(addr + WORD, value);
		if (value !== 0)
			this.refs.set(value, (this.refs.get(value) || 0) + 1);
	}

	freeNode(addr) {
		if ((this.refs.get(addr) || 0) > 0)
			throw new RuntimeError('libération d\'un nœud encore chaîné (encore référencé)');
		if (this.blocks.get(addr) === undefined)
			throw new RuntimeError('free invalide (adresse non allouée)');
		const next = this.readAddr(addr + WORD);
		if (next !== 0)
			this.refs.set(next, (this.refs.get(next) || 0) - 1);
		this.free(addr);
	}

	setFile(name, content) {
		this.fileSystem.set(name, content);
	}

	open(name) {
		if (!this.fileSystem.has(name))
			return -1;
		const fd = this.nextFd;
		this.nextFd += 1;
		this.files.set(fd, { content: this.fileSystem.get(name), pos: 0, closed: false });
		return fd;
	}

	read(fd, dst, count) {
		const f = this.files.get(fd);
		if (!f)
			throw new RuntimeError('descripteur de fichier invalide');
		if (f.closed)
			throw new RuntimeError('lecture après close');
		let n = 0;
		let a = dst;
		while (n < count && f.pos < f.content.length) {
			this.writeAddr(a, f.content[f.pos]);
			f.pos += 1;
			a += WORD;
			n += 1;
		}
		return n;
	}

	close(fd) {
		const f = this.files.get(fd);
		if (!f)
			throw new RuntimeError('descripteur de fichier invalide');
		if (f.closed)
			throw new RuntimeError('double close');
		f.closed = true;
	}

	openDescriptors() {
		const open = [];
		for (const [fd, f] of this.files)
			if (!f.closed)
				open.push(fd);
		return open;
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
