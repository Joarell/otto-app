import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class BottomCrate {
	#sized;
	#foot;
	#ply;

	constructor(data) {
		const { finalSize } = data;
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));

		this.#foot = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#sized = finalSize;
		this.#foot[1] = +this.#foot[1];
		this.#foot[2] = +this.#foot[2];
		this.#foot[3] = +this.#foot[3];
	}

	#defineFeetSameSize(offZ) {
		const z = this.#foot[2] + offZ;
		const y = this.#foot[3];
		const x = this.#sized[0]
		const divisor = {
			coordinates: [
				{ z: offZ, y: 0, x: 0 }, // Vertex 0
				{ z, y: 0, x: 0 }, // Vertex 1
				{ z, y, x: 0 }, // Vertex 2
				{ z: offZ, y, x: 0 }, // Vertex 3
				{ z: offZ, y: 0, x }, // Vertex 4
				{ z, y: 0, x }, // Vertex 5
				{ z, y, x }, // Vertex 6
				{ z: offZ, y, x }, // Vertex 7
			],
			width: x,
			depth: z - offZ,
			height: y,
			offsetX: 0,
			offsetY: offZ,
			offsetZ: 0,
		};
		return divisor;
	}

	#setSameAllParts(info, counter) {
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		let offZ = 0;

		while(counter--) {
			const {
				coordinates, offsetX, offsetY, offsetZ, width, depth, height
			} = this.#defineFeetSameSize(offZ);

			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false,
			};
			info = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
			};
			info = fill.designSides;
			offZ += this.#sized[1] - +this.#foot[2];
		}
		return info;
	}

	#defineFeet(offX) {
		const x = this.#foot[2] + offX;
		const y = this.#foot[2];
		const z = this.#sized[1];
		const divisor = {
			coordinates: [
				{ x: offX, y: 0, z: 0 }, // Vertex 0
				{ x, y: 0, z: 0 }, // Vertex 1
				{ x, y, z: 0 }, // Vertex 2
				{ x: offX, y, z: 0 }, // Vertex 3
				{ x: offX, y: 0, z }, // Vertex 4
				{ x, y: 0, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: x - offX,
			depth: z,
			height: y,
			offsetX: offX,
			offsetY: 0,
			offsetZ: 0,
		};
		return divisor;
	}

	#setAllParts(info) {
		const feetSpanCm = 100;
		let counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		let offX = 0;

		if(counter === 1) counter++;
		while(counter--) {
			const {
				coordinates, offsetX, offsetY, offsetZ, width, depth, height
			} = this.#defineFeet(offX);

			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false,
			};
			info = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
			};
			info = fill.designSides;
			offX += this.#sized[0] > +this.#ply[1]
				? +this.#ply[1]
				: this.#sized[0];
			if(offX >= this.#sized[0]) offX = this.#sized[0] - +this.#foot[2];
		}
		return info;
	}

	#designBottomSameSize() {
		const feet = 2;
		const countFeet = Math.floor(this.#sized[0] / +this.#ply[1]) + feet;
		const meta = this.#setSameAllParts([], countFeet)

		return meta;
	}

	#designBottom() {
		const feet = 2;
		const countFeet = Math.floor(this.#sized[0] / +this.#ply[1]) + feet;
		const meta = this.#setAllParts([], countFeet)

		return meta;
	}

	get commumSameBottom() {
		if(!this.#foot || !this.#sized) return false;
		return this.#designBottomSameSize();
	}

	get commumBottom() {
		if(!this.#foot || !this.#sized) return false;
		return this.#designBottom();
	}
}
