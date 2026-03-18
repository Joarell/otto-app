import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class SetCrateWalls {
	#data;
	#pine;
	#ply;
	#crate;
	#feet;
	#threshold;
	#inner;

	constructor(meta, data) {
		const { finalSize, innerSize } = data;
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));

		this.#inner = innerSize;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#crate = finalSize;
		this.#data = meta;
		this.#ply[1] = +this.#ply[1];
		this.#ply[2] = +this.#ply[2];
		this.#ply[3] = +this.#ply[3];
		this.#threshold = [ +this.#pine[2], +this.#pine[2], +this.#feet[3], ];
	}

	#crateWalls() {
		const pineDepth = this.#pine[2] + this.#ply[2];
		const facesLength = this.#crate[0] - this.#pine[2];
		const facesHeight = this.#crate[2] - pineDepth;
		const sideLength = this.#crate[1] - pineDepth;
		const faceLeftLen = this.#crate[0] - pineDepth;
		const side = this.#pine[2] + this.#ply[2];
		const height = 2 * this.#pine[2] + this.#ply[2];
		const thick = this.#crate[1] - this.#pine[2];
		const walls = {
			backFace: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: facesLength, y: 0, z: 0 }, // Vertex 1
				{ x: facesLength, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#ply[2] }, // Vertex 4
				{ x: facesLength, y: 0, z: this.#ply[2] }, // Vertex 5
				{ x: facesLength, y: facesHeight, z: this.#ply[2] }, // Vertex 6
				{ x: 0, y: facesHeight, z: this.#ply[2] }, // Vertex 7
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
				{ x: facesLength, y: 0, z: 0 }, // Vertex 1
				{ x: facesLength, y: facesHeight, z: 0 }, // Vertex 2
				{ x: 0, y: facesHeight, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: thick }, // Vertex 4
				{ x: facesLength, y: 0, z: thick }, // Vertex 5
				{ x: facesLength, y: facesHeight, z: thick }, // Vertex 6
				{ x: 0, y: facesHeight, z: thick }, // Vertex 7
			],
			bottom: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: facesLength, y: 0, z: 0 }, // Vertex 1
				{ x: facesLength, y: height, z: 0 }, // Vertex 2
				{ x: 0, y: height, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: thick }, // Vertex 4
				{ x: facesLength, y: 0, z: thick }, // Vertex 5
				{ x: facesLength, y: height, z: thick }, // Vertex 6
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
				x: this.#pine[2],
				y: 3 * this.#pine[2],
				z: 2 * this.#pine[2],
				width: this.#crate[0] - 2 * this.#pine[2],
				depth: this.#pine[2],
				height: this.#crate[2] - (3 * this.#pine[2] + 2 * this.#ply[2]),
				offsetX: this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: 3 * this.#pine[2],
			},
			faceFront: {
				type: "frontFace",
				x: this.#pine[2],
				y: 3 * this.#pine[2],
				z: this.#crate[1] - this.#pine[2],
				width: this.#crate[0] - 2 * this.#pine[2],
				depth: this.#pine[2],
				height: this.#crate[2] - (3 * this.#pine[2] + 2 * this.#ply[2]),
				offsetX: this.#pine[2],
				offsetY: this.#crate[1] - 2 * this.#pine[2],
				offsetZ: 3 * this.#pine[2],
			},
			faceRight: {
				type: "sideRight",
				x: this.#pine[2],
				y: 3 * this.#pine[2],
				z: 2 * this.#pine[2],
				width: this.#pine[2],
				depth: this.#crate[1] - 4 * this.#pine[2],
				height: this.#crate[2] - (3 * this.#pine[2] + 2 * this.#ply[2]),
				offsetX: this.#pine[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: 3 * this.#pine[2],
			},
			faceLeft: {
				type: "sideLeft",
				x: this.#crate[0] - this.#pine[2],
				y: 3 * this.#pine[2],
				z: 2 * this.#pine[2],
				width: this.#pine[2],
				depth: this.#crate[1] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				height: this.#crate[2] - (3 * this.#pine[2] + 2 * this.#ply[2]),
				offsetX: this.#crate[0] - 2 * this.#pine[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: 3 * this.#pine[2],
			},
			top: {
				type: "top",
				x: this.#pine[2],
				y: this.#crate[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#crate[0] - 2 * this.#pine[2],
				depth: this.#crate[1] - 2 * this.#pine[2],
				height: this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: this.#crate[2] - 2 * this.#pine[2],
			},
			bottom: {
				type: "bottom",
				x: this.#pine[2],
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#crate[0] - 2 * this.#pine[2],
				depth: this.#crate[1] - 2 * this.#pine[2],
				height: this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2],
			},
		};
		return allOffSet;
	}

	#bluePrintFacesSchema({x, y, z,}, lastX, lastY) {
		const offX = lastX === 0
		? this.#threshold[0]
		: lastX + this.#threshold[0]
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2]: lastY;

		if(x <= this.#crate[0])
			x += lastX === 0
				? this.#threshold[0]
				: lastX - this.#ply[2];
		const pad = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: lastX === 0
				? x - this.#threshold[0]
				: x - lastX - this.#threshold[0] - this.#ply[2],
			depth: this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] - this.#ply[2] : y - lastY,
			offsetX: offX,
			offsetY: z,
			offsetZ: lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY,
		};
		return pad;
	}

	#bluePrintSidesSchema({x, y, z,}, lastX, lastY) {
		const offX = lastX === 0 && this.#crate[0] !== x
			? this.#ply[2] + this.#threshold[0]
			: lastX - 2 * this.#ply[2];
		const offZ = 2 * this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY;

		const pad = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: lastX === 0
				? x - this.#threshold[0] - this.#ply[2]
				: x - lastX,
			depth: z - 2 * this.#ply[2],
			height: lastY === 0
				? y - this.#threshold[2] - this.#ply[2]
				: y - offY,
			offsetX: lastX === 0 ? offX: offX + this.#ply[2],
			offsetY: offZ,
			offsetZ: lastY === 0
				? lastY + this.#threshold[2] + this.#ply[2]
				: offY,
		};
		return pad;
	}

	#bluePrintUpDownSchema({x, y, z,}, lastX, lastY) {
		const offX = lastX === 0
			? this.#threshold[0]
			: this.#threshold[0] + lastX;
		const offZ = this.#threshold[1];
		const offY = lastY === 0
			? this.#threshold[2] + this.#ply[2]
			: this.#crate[2] - this.#pine[2] - this.#ply[2];

		x += lastX === 0 ? this.#threshold[0] : lastX + this.#ply[2];
		const pad = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: lastX === 0
				? x - this.#threshold[0]
				: x - lastX - this.#threshold[0],
			depth: z - this.#ply[2],
			height: lastY === 0
				? y - this.#threshold[2] + this.#ply[2]
				: y - lastY - this.#threshold[2] - this.#ply[2] - this.#pine[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ: lastY === 0 ?
				this.#threshold[2]
				: lastY + this.#threshold[2] + this.#ply[2] + this.#pine[2],
		};
		return pad;
	}

	#defineSizingPadFaces(filled) {
		let { x, y, z, faceA } = filled;

		if(x === 0)
			x = this.#ply[1] > this.#crate[0]
				? this.#crate[0] - this.#threshold[0] - this.#pine[2]
				: this.#ply[1];
		y = this.#crate[2] - y > this.#ply[3]
			? +(this.#ply[3]).toFixed(3)
			: +(this.#crate[2] - 2 * this.#pine[2]).toFixed(3)
		z = faceA === 0
			? this.#ply[2]
			: this.#crate[1] - this.#threshold[1] - this.#ply[2];
		if (filled.x > 0) {
			if(x >= this.#crate[0] && y < this.#crate[2]) {
				filled.x = 0;
				if(y < this.#crate[2] && x >= this.#crate[0]) {
					filled.y += y;
					y = this.#crate[2] - filled.y > this.#ply[3]
						? this.#crate[2] - this.#ply[3]
						: +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
				}
			}
			x = this.#crate[0] - x - this.#threshold[0] + this.#ply[2];
		}
		return { x, y, z };
	}

	#defineSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;

		x = sideA === 0 ? this.#ply[2] : this.#crate[0] - this.#ply[2];
		if(y === 0)
			y = this.#crate[2] - y > +this.#ply[3]
				? +this.#ply[3]
				: +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else y += this.#crate[2] - y > this.#ply[3]
			? this.#ply[3]
			: this.#crate[2] - y - this.#pine[2] - this.#ply[2];
		z = this.#crate[1] < this.#ply[1]
			? this.#crate[1] - 2 * this.#threshold[1]
			: this.#crate[1] - 2 * this.#ply[1] - z;
		return { x, y, z };
	}

	#defineSizingPadUpDown(filled) {
		let { x, y, z, } = filled;

		if(x === 0)
			x = this.#ply[1] > this.#crate[0] ?
				this.#crate[0] - this.#threshold[0] - this.#ply[2]
				: this.#ply[1]
		else x = this.#crate[0] - x - this.#threshold[0] - this.#ply[2];
		y = y === 0
			? this.#threshold[2] :
			this.#crate[2] - this.#pine[2]
		z = this.#crate[1] - this.#threshold[1]
		return { x, y, z };
	}

	#setFrontAndBackFaces(data, filled) {
		const { faceA, faceB } = filled;
		if(faceA === 1 && faceB === 1) return data;
		const sizes = this.#defineSizingPadFaces(filled);

		data.push(this.#bluePrintFacesSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if(filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2])
			if(faceA === 0) {
				filled.faceA = 1;
				filled.x = 0;
				filled.y = 0;
			}
			else filled.faceB = 1;
		return this.#setFrontAndBackFaces(data, filled);
	}

	#setRightAndLeftSides(data, filled) {
		const { sideA, sideB } = filled;
		if(sideA === 1 && sideB === 1) return data;
		const sizes = this.#defineSizingPadSides(filled);

		data.push(this.#bluePrintSidesSchema(sizes, filled.x, filled.y));
		filled.y += sizes.y;
		if(filled.y + this.#pine[2] + this.#ply[2]>= this.#crate[2])
			if(sideA === 0) {
				filled.sideA = 1;
				filled.x = this.#crate[0];
				filled.y = 0;
			}
			else filled.sideB = 1;
		return this.#setRightAndLeftSides(data, filled);
	}

	#setTopAndBottom(data, filled) {
		const { top, bottom } = filled;
		if(top === 1 && bottom === 1) return data;
		const sizes = this.#defineSizingPadUpDown(filled);
		const setY = this.#crate[2] - 2 * this.#ply[2] - this.#threshold[2] - this.#ply[2] - this.#pine[2];

		data.push(this.#bluePrintUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if(filled.x + this.#ply[2] >= this.#inner[0])
			if(bottom === 0) {
				filled.bottom = 1;
				filled.x = 0;
				filled.y = setY;
			}
			else filled.top = 1;
		return this.#setTopAndBottom(data, filled);
	}

	#setupFaces() {
		const faces = [];

		this.#setFrontAndBackFaces(faces, { x: 0, y: 0, z: 0, faceA: 0, faceB: 0 });
		this.#setRightAndLeftSides(faces, { x: 0, y: 0, z: 0, sideA: 0, sideB: 0 });
		this.#setTopAndBottom(faces, { x: 0, y: 0, z: 0, top: 0, bottom: 0});
		return faces;
	}

	#defineCrateWalls() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const walls = this.#crateWalls();
		const offsets = this.#offsetWalls();
		const faces = this.#setupFaces();
		let meta = structuredClone(this.#data);
		let show = true;

		if (!this.#ply) return this.#data;
		faces.map((face) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = face;

			trace.data = {
				info: meta,
				coordinates,
				name: "walls",
				show,
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "walls",
				offsetX,
				offsetY,
				offsetZ,
			};
			meta = this.#data = fill.designSides;
			show = false;
			return face;
		});
		return meta;
	}

	get setWalls() {
		return this.#defineCrateWalls();
	}
}
