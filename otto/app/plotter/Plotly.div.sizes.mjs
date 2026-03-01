export default class PadDivSizes  {
	#threshold;
	#layer;
	#depth;
	#inner;
	#div;
	#pad;

	constructor (pad, threshold, layer, depth, inner, div) {
		this.#layer = layer;
		this.#depth = depth;
		this.#inner = inner;
		this.#div = div;
		this.#threshold = threshold;
		this.#pad = pad;
	}

	// TODO: the stack layer works section.
	#defineDivSameSize(x, y) {
		const z = this.#depth + this.#threshold[2];
		const offX = this.#threshold[0];
		// const offX = lastX || this.#threshold[0];
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2];
		let div = structuredClone(this.#layer);

		x += this.#threshold[0];
		const divisor = {
			div: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: x - this.#threshold[0],
			depth: this.#div[2],
			height: y - 2 * this.#pad[2] - this.#div[2],
			offsetX: this.#threshold[0],
			offsetY: this.#depth + this.#threshold[2] - this.#div[2],
			offsetZ: this.#threshold[2],
			layer: { name: `layer-${++div}`, color: "div" },
		};
		return divisor;
	}

	#setDivSameSize(data = [], filled = { x: 0, y: 0, full: 0}) {
		if (filled.x >= this.#inner[0] && filled.y >= this.#inner[2]) return data;
		let { x, y, full } = filled;
		let lastX = 0;
		let lastY = 0;

		if(x === 0) {
			x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			filled.x = x;
		}
		else if (x < this.#inner[0]) {
			x = this.#inner[0] - x >= this.#div[1] ? this.#div[1] : this.#inner[0] - x;
			lastX = structuredClone(filled.x);
			filled.x += x;
		}
		if(y === 0) {
			y = this.#inner[2] < this.#div[3]
				? this.#inner[2] + this.#pad[2]
				: this.#div[3] + this.#pad[2];
			filled.y = y;
			y += this.#threshold[2] - this.#div[2];
		}
		else if (y < this.#inner[2] && full === 0 && lastX === 0) {
			y = this.#inner[2] - y >= this.#div[3]
				? this.#div[3] + this.#pad[2]
				: this.#inner[2] - y + this.#pad[2];
			lastY = structuredClone(filled.y);
			filled.y += y;
			if (full === 0) {
				filled.full = 1;
				filled.x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			}
		}
		x += lastX;
		y += lastY - this.#div[2];
		data.push(this.#defineDivSameSize(x, y));
		return this.#setDivLayer(data, filled);
	}

	#defineDivSize(x, y, lastX) {
		const z = this.#depth + this.#threshold[2];
		const offX = lastX || this.#threshold[0];
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2];
		let div = structuredClone(this.#layer);

		const divisor = {
			div: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: x - 2 * this.#pad[2],
			depth: this.#div[2],
			height: y - 2 * this.#pad[2] - this.#div[2],
			offsetX: this.#threshold[0],
			offsetY: this.#depth + this.#threshold[2] - this.#div[2],
			offsetZ: this.#threshold[2],
			layer: { name: `layer-${++div}`, color: "div" },
		};
		return divisor;
	}

	#setDivLayer(data = [], filled = { x: 0, y: 0, full: 0}) {
		if (filled.x >= this.#inner[0] && filled.y >= this.#inner[2]) return data;
		let { x, y, full } = filled;
		let lastX = 0;
		let lastY = 0;

		if(x === 0) {
			x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			filled.x = x;
		}
		else if (x < this.#inner[0]) {
			x = this.#inner[0] - x >= this.#div[1] ? this.#div[1] : this.#inner[0] - x;
			lastX = structuredClone(filled.x);
			filled.x += x;
		}
		if(y === 0) {
			y = this.#inner[2] < this.#div[3]
				? this.#inner[2] + this.#pad[2]
				: this.#div[3] + this.#pad[2];
			filled.y = y;
			y += this.#threshold[2] - this.#div[2];
		}
		else if (y < this.#inner[2] && full === 0 && lastX === 0) {
			y = this.#inner[2] - y >= this.#div[3]
				? this.#div[3] + this.#pad[2]
				: this.#inner[2] - y + this.#pad[2];
			lastY = structuredClone(filled.y);
			filled.y += y;
			if (full === 0) {
				filled.full = 1;
				filled.x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			}
		}
		x += lastX;
		y += lastY - this.#div[2];
		data.push(this.#defineDivSize(x, y, lastX));
		return this.#setDivLayer(data, filled);
	}

	#hugeDiv(data = [], filled = { x: 0, y: 0, full: 0}) {
		if (filled.x >= this.#inner[0] && filled.y >= this.#inner[2]) return data;
		let { x, y, full } = filled;
		let lastX = 0;
		let lastY = 0;

		if(x === 0) {
			x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			filled.x = x;
		}
		else if (x < this.#inner[0]) {
			x = this.#inner[0] - x >= this.#div[1] ? this.#div[1] : this.#inner[0] - x;
			lastX = structuredClone(filled.x);
			filled.x += x;
		}
		if(y === 0) {
			y = this.#inner[2] < this.#div[3] ? this.#inner[2] : this.#div[3];
			filled.y = y;
			y += this.#threshold[2] - this.#div[2];
		}
		else if (y < this.#inner[2] && full === 0 && lastX === 0) {
			y = this.#inner[2] - y >= this.#div[3] ? this.#div[3] : this.#inner[2] - y;
			lastY = structuredClone(filled.y);
			filled.y += y;
			if (full === 0) {
				filled.full = 1;
				filled.x = this.#inner[0] < this.#div[1] ? this.#inner[0] : this.#div[1];
			}
		}
		x += lastX;
		y += lastY - this.#div[2];
		data.push(this.#defineDivSize(x, y, lastX));
		return this.#hugeDiv(data, filled);
	}

	get standardDiv() {
		return this.#setDivLayer();
	}

	get sameSizeDiv() {
		return this.#setDivSameSize();
	}

	get hugeDiv() {
		return this.#hugeDiv();
	}
}
