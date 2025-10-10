export default class FillGaps {
	#layer;
	#data;

	constructor(data, layer) {
		this.#layer = layer;
		this.#data = data;
	}

	#defineFillSize({ x, y, z }, locate) {
		const offX = this.#data.offset[0] + locate.x;
		const offZ = this.#data.offZ + z;
		const offY = !locate.y
			? y + this.#data.offset[2] - this.#data.pad[2]
			: locate.y + y + this.#data.offset[2] - this.#data.pad[2];
		const setX = x + this.#data.offset[0] + locate.x;
		const setY = !locate.y
			? locate.y + this.#data.offset[2]
			: this.#data.offset[2] + locate.y - this.#data.pad[2];

		const divisor = {
			div: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x: setX, y: offY, z: offZ }, // Vertex 1
				{ x: setX, y: setY, z: offZ }, // Vertex 2
				{ x: offX, y: setY, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z: this.#data.offZ }, // Vertex 4
				{ x: setX, y: offY, z: this.#data.offZ }, // Vertex 5
				{ x: setX, y: setY, z: this.#data.offZ }, // Vertex 6
				{ x: offX, y: setY, z: this.#data.offZ }, // Vertex 7
			],
			width: x,
			depth: z,
			height: locate.y ? y : y - this.#data.pad[2],
			offsetX: offX,
			offsetY: this.#data.offZ,
			offsetZ: locate.y
				? locate.y + this.#data.offset[2] - this.#data.pad[2]
				: this.#data.offset[2] + locate.y,
			layer: { name: `layer-${this.#layer}`, color: "padding" },
		};
		return divisor;
	}

	#defineGapSize(info, lastValues) {
		const X = info[2];
		const Y = info[3];
	}

	#sizesToFill() {
		const innerX = [];
		const innerY = [];
		const lastValues = { lastX: [], lastY: [] };
		let lastX = 0;
		let lastY = 0;
		const { vacuum } = this.#data;
		const len = vacuum.length > 2 ? vacuum.length - 1 : vacuum.length;
		vacuum.map((data, i) => vacuum[i].push(data[0] * data[1]), 0);
		vacuum.sort((a, b) => a.at(-1) - b.at(-1));
		const gaps = vacuum.reverse().map((data, i) => {
			vacuum.length - 1 >= i || vacuum.length === 2
				? this.#defineGapSize(data, lastValues)
				: 0;
		}, 0);
		const sizes = vacuum.map((gap, i) => {
			const check1 = gap[0] === lastX && gap[1] === lastY;
			if (check1 || len === i) return;

			!innerX.length ? innerX.push(gap[0]) : innerX.push(innerX.at(-1) - lastX);
			innerY.push(gap[1]);
			const allLastY = +innerY
				.reverse()
				.reduce((sum, val) => gap[3] - val - sum, 0)
				.toFixed(3);
			const fill = {
				location: {
					x: innerX.at(-1) > 0 ? innerX.at(-1) : gap[0],
					y: innerY.at(-1) > 0 && !innerX.at(-1) ? innerY.at(-1) : gap[1],
				},
				size: {
					x: +(gap[2] - gap[0]).toFixed(3),
					y: gap[1] ? allLastY : innerY.at(-1) - gap[1],
					z:
						this.#data.thickness > this.#data.div[2]
							? this.#data.pad[2]
							: this.#data.div[2],
				},
			};
			lastX = gap[0];
			lastY = gap[1];
			return fill;
		}, 0);
		return sizes.filter((data) => data !== undefined);
	}

	#defineGaps() {
		const allSizes = this.#sizesToFill();
		const gaps = allSizes.map((data) =>
			this.#defineFillSize(data.size, data.location),
		);
		return gaps;
	}

	get fill() {
		return this.#defineGaps();
	}
}
