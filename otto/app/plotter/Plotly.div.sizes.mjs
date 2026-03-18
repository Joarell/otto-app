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
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2];
		let div = structuredClone(this.#layer);

		x += this.#threshold[0];
		y += this.#threshold[2];
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

	#setDivSameSize(data = [], filled = { x: 0, y: 0, full: false}) {
		if(filled.full) return data;
		let { x, y } = filled;

		if(x === 0) x = this.#div[1] > this.#inner[0]
			? this.#inner[0]
			: this.#div[1];
		y = this.#inner[2] - y > this.#div[3]
			? this.#div[3] - 2 * this.#pad[2]
			: this.#inner[2] - y;
		if (!filled.full && filled.x > 0) {
			if(x >= this.#inner[0] && y < this.#inner[2]) {
				filled.x = 0;
				if(y < this.#inner[2] && x >= this.#inner[0]) {
					filled.y += y;
					y = this.#inner[2] - y > this.#div[3]
						? this.#div[3] - 2 * this.#pad[2]
						: this.#inner[2] - y - 2 * this.#pad[2];
				}
			}
			x = this.#inner[0] - x === 0
				? this.#div[1]
				: this.#inner[0] - x;
		}
		const lastX = structuredClone(x);
		data.push(this.#defineDivSameSize(x, y, filled.x, filled.y));
		filled.x += lastX;
		if(filled.x === this.#inner[0] && filled.y + y === this.#inner[2])
			filled.full = true;
		return this.#setDivSameSize(data, filled);
	}

	#defineDivSize(x, y, lastX, lastY) {
		const z = this.#depth + this.#threshold[2];
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2] + lastY
		let div = this.#layer;

		x = x + lastX === this.#inner[0] ? x + offX - this.#threshold[0] : x + offX;
		y = y + lastY === this.#inner[2] ? y + offY - 2 * this.#pad[2] : y + offY;
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
			width: x - offX,
			depth: this.#div[2],
			height: y - offY,
			offsetX: offX,
			offsetY: offZ,
			offsetZ: offY,
			layer: { name: `layer-${++div}`, color: "div" },
		};
		return divisor;
	}

	#setDivLayer(data = [], filled = { x: 0, y: 0, full: 0}) {
		if(filled.full) return data;
		let { x, y } = filled;

		if(x === 0) x = this.#div[1] > this.#inner[0]
			? this.#inner[0]
			: this.#div[1];
		y = this.#inner[2] - y > this.#div[3]
			? this.#div[3] - 2 * this.#pad[2]
			: this.#inner[2] - y;
		if (!filled.full && filled.x > 0) {
			if(x >= this.#inner[0] && y < this.#inner[2]) {
				filled.x = 0;
				if(y < this.#inner[2] && x >= this.#inner[0]) {
					filled.y += y;
					y = this.#inner[2] - y > this.#div[3]
						? this.#div[3] - this.#threshold[2] - 2 * this.#pad[2]
						: this.#inner[2] - y - 2 * this.#pad[2];
				}
			}
			x = this.#inner[0] - x === 0
				? this.#div[1]
				: this.#inner[0] - x;
		}
		const lastX = structuredClone(x);
		data.push(this.#defineDivSize(x, y, filled.x, filled.y));
		filled.x += lastX;
		if(filled.x === this.#inner[0] && filled.y + y === this.#inner[2])
			filled.full = true;
		return this.#setDivLayer(data, filled);
	}

	get standardDiv() {
		return this.#setDivLayer();
	}

	get sameSizeDiv() {
		return this.#setDivSameSize();
	}
}
