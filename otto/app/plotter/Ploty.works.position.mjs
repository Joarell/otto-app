export default class WorksPosition {
	#dim;
	#local;
	#depth;
	#threshold;
	#pad;

	constructor(dim, local, depth, threshold, pad) {
		this.#dim = dim;
		this.#local = local;
		this.#depth = depth;
		this.#threshold = threshold;
		this.#pad = pad;
	}

	#tubes() {
		let x =
			this.#dim.length > 4
				? +this.#dim[3] + 2 * this.#threshold[0] - this.#pad[2]
				: +this.#dim[1] + 2 * this.#threshold[0] - this.#pad[2];
		let y =
			this.#dim.length > 4
				? +this.#dim[1] + this.#threshold[2] - 2 * this.#pad[2]
				: +this.#dim[3] + this.#threshold[2] - 2 * this.#pad[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;
		const fillX = 0;
		const fillZ = - this.#pad[2];
		const fillY = 0;

		if (!coordinates.x) x += this.#pad[2]
		else x += this.#pad[2] + coordinates.x;
		if(coordinates.y ) y += coordinates.y;
		const work = {
			coordinates,
			code,
			art: [
				{ x: fillX, y: fillY, z: fillZ }, // Vertex 0
				{ x, y: fillY, z: fillZ }, // Vertex 1
				{ x, y, z: fillZ }, // Vertex 2
				{ x: fillX, y, z: fillZ }, // Vertex 3
				{ x: fillX, y: fillY, z }, // Vertex 4
				{ x, y: fillY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: fillX, y, z }, // Vertex 7
			],
			width: x - this.#threshold[0],
			depth: this.#dim[2] + fillZ,
			height: y - 1.5 * this.#pad[2],
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth + 3 * this.#pad[2],
			offsetZ: coordinates.y
				? this.#threshold[2] + coordinates.y + this.#pad[2]
				: 5 * this.#pad[2],
		};
		return work;
	}

	#sculptures() {
		let x =
			this.#dim.length > 4
				? +this.#dim[3] + this.#threshold[0] - this.#pad[2]
				: +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y =
			this.#dim.length > 4
				? +this.#dim[1] + this.#threshold[2]
				: +this.#dim[3] + this.#threshold[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;
		const fillX = 0;
		const fillZ = 0;
		const fillY = 0;

		if (!coordinates.x) x += this.#pad[2]
		else x += this.#pad[2] + coordinates.x;
		if(coordinates.y ) y += coordinates.y;
		const work = {
			coordinates,
			code,
			art: [
				{ x: fillX, y: fillY, z: fillZ }, // Vertex 0
				{ x, y: fillY, z: fillZ }, // Vertex 1
				{ x, y, z: fillZ }, // Vertex 2
				{ x: fillX, y, z: fillZ }, // Vertex 3
				{ x: fillX, y: fillY, z }, // Vertex 4
				{ x, y: fillY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: fillX, y, z }, // Vertex 7
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2] + fillZ,
			height: coordinates.y
				? y - this.#threshold[2] - coordinates.y + this.#pad[2]
				: y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y
				? this.#threshold[2] + coordinates.y - this.#pad[2]
				: this.#threshold[2],
		};
		return work;
	}

	#largestCanvas() {
		let x =
			this.#dim.length > 4
				? +this.#dim[3] + this.#threshold[0] - this.#pad[2]
				: +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y =
			this.#dim.length > 4
				? +this.#dim[1] + this.#threshold[2] - this.#pad[2]
				: +this.#dim[3] + this.#threshold[2] - this.#pad[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;

		if (!coordinates.x) x += this.#pad[2]
		else x += this.#pad[2] + coordinates.x;
		if(coordinates.y ) y += coordinates.y;
		const work = {
			coordinates,
			code,
			art: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x, y: 0, z: 0 }, // Vertex 1
				{ x, y, z: 0 }, // Vertex 2
				{ x: 0, y, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z }, // Vertex 4
				{ x, y: 0, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: 0, y, z }, // Vertex 7
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2],
			height: coordinates.y
				? y - this.#threshold[2] - coordinates.y + this.#pad[2]
				: y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y
				? this.#threshold[2] + coordinates.y - this.#pad[2]
				: this.#threshold[2],
		};
		return work;
	}

	#diffSizes() {
		let x =
			this.#dim.length > 4
				? +this.#dim[3] + this.#threshold[0] - this.#pad[2]
				: +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y =
			this.#dim.length > 4
				? +this.#dim[1] + this.#threshold[2] - this.#pad[2]
				: +this.#dim[3] + this.#threshold[2] - this.#pad[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;

		if (!coordinates.x) x += this.#pad[2]
		else x += this.#pad[2] + coordinates.x;
		if(coordinates.y ) y += coordinates.y;
		const work = {
			coordinates,
			code,
			art: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x, y: 0, z: 0 }, // Vertex 1
				{ x, y, z: 0 }, // Vertex 2
				{ x: 0, y, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z }, // Vertex 4
				{ x, y: 0, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: 0, y, z }, // Vertex 7
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2],
			height: coordinates.y
				? y - this.#threshold[2] - coordinates.y + this.#pad[2]
				: y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y
				? this.#threshold[2] + coordinates.y - this.#pad[2]
				: this.#threshold[2],
		};
		return work;
	}

	get standardCanvas() {
		return this.#diffSizes();
	}

	get noCanvas() {
		return this.#sculptures();
	}

	get tubes() {
		return this.#tubes();
	}

	get largestCanvas() {
		return this.#largestCanvas();
	}
}
