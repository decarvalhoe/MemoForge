export function el(tag, attrs = {}, children = []) {
	const node = document.createElement(tag);
	for (const [k, v] of Object.entries(attrs)) {
		if (v === null || v === undefined || v === false) continue;
		if (k === 'class') node.className = v;
		else if (k === 'text') node.textContent = v;
		else if (k.startsWith('on') && typeof v === 'function')
			node.addEventListener(k.slice(2), v);
		else node.setAttribute(k, v);
	}
	for (const c of [].concat(children))
		if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
	return node;
}

export function clear(node) {
	while (node.firstChild) node.removeChild(node.firstChild);
}
