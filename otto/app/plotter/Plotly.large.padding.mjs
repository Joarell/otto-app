import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class PaddingLargeCrate {
	#data;
	#pine;
	#ply;
	#pad;
	#baseSize
	#feet;
	#angle;
	#depth;
	#height;

	constructor(meta, data) {
		const { extra } = data;
		const { baseSize, angle, extraHeight, extraLength } = extra;
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));

		this.#angle = angle;
		this.#depth = extraLength;
		this.#height = extraHeight;
		this.#baseSize = baseSize;
		this.#data = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#pad = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5,
		);
		this.#pad[1] = +this.#pad[1];
		this.#pad[2] = +this.#pad[2];
		this.#pad[3] = +this.#pad[3];
	}

	#offSetHugeWalls(){
		const allOffSet = {
			faceBack: {
				type: "backFace",
				x: this.#pine[2] + this.#ply[2] + this.#pad[2],
				y: 2 * this.#pad[2] +this.#pine[2],
				z: this.#pine[2] + this.#ply[2] + this.#pad[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2] + 2 * this.#pad[2]),
				depth: this.#pad[2],
				height: this.#baseSize[2] - 5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2] + this.#pad[2],
				offsetY: this.#pad[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2],
			},
			faceFront: {
				type: "frontFace",
				x: this.#pine[2] + this.#ply[2] + this.#pad[2],
				y: 2 * this.#pad[2] + +this.#pine[2],
				z: this.#baseSize[1] - this.#pine[2] - this.#ply[2] - this.#pad[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2] + 2 * this.#pad[2]),
				depth: this.#pad[2],
				height: this.#baseSize[2] - 5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2] + this.#pad[2],
				offsetY: this.#baseSize[1] - 2 * this.#pad[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2],
			},
			faceRight: {
				type: "sideRight",
				x: this.#pine[2] + this.#ply[2],
				y: 2 * this.#pad[2] + +this.#pine[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#pad[2],
				depth: this.#baseSize[1] - 2 * this.#pine[2] - 2 * this.#pine[2],
				height: this.#baseSize[2] - 5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2],
			},
			faceLeft: {
				type: "sideLeft",
				x: this.#baseSize[0] - this.#pine[2] - this.#ply[2] - this.#pad[2],
				y: 2 * this.#pad[2] + +this.#pine[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#pad[2],
				depth: this.#baseSize[1] - 2 * this.#pine[2] - 2 * this.#pine[2],
				height: this.#baseSize[2] -  5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#baseSize[0] - this.#ply[2] - this.#pine[2] - this.#pad[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2],
			},
			top: {
				type: "top",
				x: this.#pine[2] + this.#ply[2],
				y: this.#baseSize[2] - this.#pine[2] - this.#ply[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				depth: this.#baseSize[1] - (this.#pine[2] + this.#ply[2] + this.#pad[2]),
				height: this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: this.#pine[2] + this.#ply[2],
				offsetZ: this.#baseSize[2] - (2 * this.#ply[2] + this.#pad[2]),
			},
			bottom: {
				type: "bottom",
				x: this.#pine[2] + this.#ply[2],
				y: this.#pad[2] +this.#pine[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				depth: this.#baseSize[1] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				height: this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: this.#pine[2] + this.#ply[2],
				offsetZ: +this.#feet[3] + +this.#pine[2],
			},
		};
		return allOffSet;
	}

	#cratePaddingHugeTrace() {
		const pineDepth = this.#ply[2] + +this.#pine[2];
		const facesLength =
			this.#baseSize[0] - (+this.#pine[2] + +this.#ply[2] + 2 * +this.#ply[2]);
		const facesHeight = this.#baseSize[2] - pineDepth - this.#pad[2];
		const sideLength = this.#baseSize[1] - pineDepth;
		const faceLeftLen = this.#baseSize[0] - pineDepth;
		const side = +this.#pine[2] + +this.#ply[2] + this.#pad[2];
		const height = +this.#feet[3] + this.#ply[2] + this.#pad[2];
		const thick = this.#baseSize[1] - this.#pine[2] - +this.#ply[2];
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
					if(data[1].x === 0) data[1].x = x;
					if(data[1].y === 0) data[1].y = y;
					if(data[1].z === 0) data[1].z = z;
					return data;
				case 1:
					if(data[1].y === 0) data[1].y = y;
					if(data[1].z === 0) data[1].z = z;
					return data;
				case 2:
					if(data[1].z === 0) data[1].z = z;
					return data;
				case 3:
					if(data[1].x === 0) data[1].x = x;
					if(data[1].z === 0) data[1].z = z;
					return data;
				case 4:
					if(data[1].x === 0) data[1].x = x;
					if(data[1].y === 0) data[1].y = y;
					return data;
				case 5:
					if(data[1].y === 0) data[1].y = y;
					return data;
				case 7:
					if(data[1].x === 0) data[1].x = x;
					return data;
			}
			return data;
		});
		return change;
	}

	#defineHugeCratePadding() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const padding = this.#cratePaddingHugeTrace();
		const offsets = this.#offSetHugeWalls();
		const sizes = { dep: this.#baseSize[1], high: this.#baseSize[2] };
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
				align: this.#depth,
				angle: this.#angle,
				base: this.#height,
				show,
				sizes,
			};
			meta = trace.defineHugeTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "padding",
				angle: this.#angle,
				base: this.#height,
				align: this.#depth,
				offsetX,
				offsetY,
				offsetZ,
				sizes,
			};
			meta = this.#data = fill.largestCanvas;
			show = false;
			return part;
		});
		return meta;
	}

	get setPaddingHuge() {
		return this.#defineHugeCratePadding();
	}
}
