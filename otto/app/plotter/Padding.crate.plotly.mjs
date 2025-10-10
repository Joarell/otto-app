import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class PaddingCrate {
	#data;
	#pine;
	#ply;
	#crate;
	#pad;

	constructor(crate, material, meta) {
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => material.usedMaterials.get(opt));

		this.#crate = crate;
		this.#data = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#pad = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5,
		);
		this.#pad[1] = +this.#pad[1];
		this.#pad[2] = +this.#pad[2];
		this.#pad[3] = +this.#pad[3];
	}

	#cratePadding() {
		const pineDepth = this.#ply[2] + this.#pine[2];
		const facesLength =
			this.#crate[0] - (this.#pine[2] + this.#ply[2] + 2 * this.#ply[2]);
		const facesHeight = this.#crate[2] - pineDepth - this.#pad[2];
		const sideLength = this.#crate[1] - pineDepth;
		const faceLeftLen = this.#crate[0] - pineDepth;
		const side = this.#pine[2] + this.#ply[2] + this.#pad[2];
		const height = 2 * this.#pine[2] + this.#ply[2] + this.#pad[2];
		const thick = this.#crate[1] - this.#pine[2] - this.#ply[2];
		const walls = {
			backFace: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: facesLength, y: 0, z: 0 }, // Vertex 1
				{ x: facesLength, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pad[2] }, // Vertex 4
				{ x: facesLength, y: 0, z: this.#pad[2] }, // Vertex 5
				{ x: facesLength, y: facesHeight, z: this.#pad[2] }, // Vertex 6
				{ x: 0, y: facesHeight, z: this.#pad[2] }, // Vertex 7
			],
			frontFace: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: facesLength, y: 0, z: 0 }, // Vertex 1
				{ x: facesLength, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: sideLength }, // Vertex 4
				{ x: facesLength, y: 0, z: sideLength }, // Vertex 5
				{ x: facesLength, y: facesHeight, z: sideLength }, // Vertex 6
				{ x: 0, y: facesHeight, z: sideLength }, // Vertex 7
			],
			sideRight: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: side, y: 0, z: 0 }, // Vertex 1
				{ x: side, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: sideLength }, // Vertex 4
				{ x: side, y: 0, z: sideLength }, // Vertex 5
				{ x: side, y: facesHeight, z: sideLength }, // Vertex 6
				{ x: 0, y: facesHeight, z: sideLength }, // Vertex 7
			],
			sideLeft: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: faceLeftLen, y: 0, z: 0 }, // Vertex 1
				{ x: faceLeftLen, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: sideLength }, // Vertex 4
				{ x: faceLeftLen, y: 0, z: sideLength }, // Vertex 5
				{ x: faceLeftLen, y: facesHeight, z: sideLength }, // Vertex 6
				{ x: 0, y: facesHeight, z: sideLength }, // Vertex 7
			],
			top: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: faceLeftLen, y: 0, z: 0 }, // Vertex 1
				{ x: faceLeftLen, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: thick }, // Vertex 4
				{ x: faceLeftLen, y: 0, z: thick }, // Vertex 5
				{ x: faceLeftLen, y: facesHeight, z: thick }, // Vertex 6
				{ x: 0, y: facesHeight, z: thick }, // Vertex 7
			],
			bottom: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: faceLeftLen, y: 0, z: 0 }, // Vertex 1
				{ x: faceLeftLen, y: height, z: 0 }, // Vertex 2
				{ x: 0, y: height, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: thick }, // Vertex 4
				{ x: faceLeftLen, y: 0, z: thick }, // Vertex 5
				{ x: faceLeftLen, y: height, z: thick }, // Vertex 6
				{ x: 0, y: height, z: thick }, // Vertex 7
			],
		};
		return walls;
	}

	#defineWalls(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);

		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					data[1].x === 0 ? (data[1].x = x) : 0;
					data[1].y === 0 ? (data[1].y = y) : 0;
					data[1].z === 0 ? (data[1].z = z) : 0;
					return data;
				case 1:
					data[1].y === 0 ? (data[1].y = y) : 0;
					data[1].z === 0 ? (data[1].z = z) : 0;
					return data;
				case 2:
					data[1].z === 0 ? (data[1].z = z) : 0;
					return data;
				case 3:
					data[1].x === 0 ? (data[1].x = x) : 0;
					data[1].z === 0 ? (data[1].z = z) : 0;
					return data;
				case 4:
					data[1].x === 0 ? (data[1].x = x) : 0;
					data[1].y === 0 ? (data[1].y = y) : 0;
					return data;
				case 5:
					data[1].y === 0 ? (data[1].y = y) : 0;
					return data;
				case 7:
					data[1].x === 0 ? (data[1].x = x) : 0;
					return data;
			}
		});
		return change;
	}

	#offsetWalls() {
		const allOffSet = {
			faceBack: {
				type: "backFace",
				x: this.#pine[2] + this.#ply[2] + this.#pad[2],
				y: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
				z: this.#pine[2] + this.#ply[2] + this.#pad[2],
				width:
					this.#crate[0] -
					(2 * this.#pine[2] + 2 * this.#ply[2] + 2 * this.#pad[2]),
				depth: this.#pad[2],
				height:
					this.#crate[2] - 4 * this.#pine[2] - 3 * this.#ply[2] - this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2] + this.#pad[2],
				offsetY: this.#pad[2],
				offsetZ: 3 * this.#pine[2] + 2 * this.#ply[2],
			},
			faceFront: {
				type: "frontFace",
				x: this.#pine[2] + this.#ply[2] + this.#pad[2],
				y: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
				z: this.#crate[1] - this.#pine[2] - this.#ply[2] - this.#pad[2],
				width:
					this.#crate[0] -
					(2 * this.#pine[2] + 2 * this.#ply[2] + 2 * this.#pad[2]),
				depth: this.#pad[2],
				height:
					this.#crate[2] - 4 * this.#pine[2] - 3 * this.#ply[2] - this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2] + this.#pad[2],
				offsetY: this.#crate[1] - 2 * this.#pad[2],
				offsetZ: 3 * this.#pine[2] + 2 * this.#ply[2],
			},
			faceRight: {
				type: "sideRight",
				x: this.#pine[2] + this.#ply[2],
				y: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#pad[2],
				depth: this.#crate[1] - 2 * this.#pine[2] - 2 * this.#pine[2],
				height:
					this.#crate[2] -
					3 * this.#pine[2] -
					2 * this.#ply[2] -
					2 * this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
			},
			faceLeft: {
				type: "sideLeft",
				x: this.#crate[0] - this.#pine[2] - this.#ply[2] - this.#pad[2],
				y: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#pad[2],
				depth: this.#crate[1] - 2 * this.#pine[2] - 2 * this.#pine[2],
				height:
					this.#crate[2] -
					3 * this.#pine[2] -
					2 * this.#ply[2] -
					2 * this.#pad[2],
				offsetX: this.#crate[0] - this.#ply[2] - this.#pine[2] - this.#pad[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: 2 * this.#pine[2] + this.#ply[2] + this.#pad[2],
			},
			top: {
				type: "top",
				x: this.#pine[2] + this.#ply[2],
				y: this.#crate[2] - this.#pine[2] - this.#ply[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#crate[0] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				depth: this.#crate[1] - (this.#pine[2] + this.#ply[2] + this.#pad[2]),
				height: this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: this.#pine[2] + this.#ply[2],
				offsetZ: this.#crate[2] - (2 * this.#pine[2] + 2 * this.#ply[2]),
			},
			bottom: {
				type: "bottom",
				x: this.#pine[2] + this.#ply[2],
				y: 2 * this.#pine[2] + this.#ply[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#crate[0] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				depth: this.#crate[1] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				height: this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: this.#pine[2] + this.#ply[2],
				offsetZ: 2 * this.#pine[2] + this.#ply[2],
			},
		};
		return allOffSet;
	}

	#defineCratePadding() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const padding = this.#cratePadding();
		const offsets = this.#offsetWalls();
		let meta = structuredClone(this.#data);
		let show = true;

		if (!this.#pad) return this.#data;
		Object.entries(offsets).map((part) => {
			const { type, offsetX, offsetY, offsetZ, width, depth, height } = part[1];
			const face = padding[type];
			const defined = this.#defineWalls(part[1], face);

			trace.data = {
				info: meta,
				coordinates: defined,
				name: "padding",
				show,
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "padding",
				offsetX,
				offsetY,
				offsetZ,
			};
			meta = this.#data = fill.designSides;
			show = false;
		});
		return meta;
	}

	get setPadding() {
		return this.#defineCratePadding();
	}
}
