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
	#baseCrate;
	#angle;
	#depth;
	#height;

	constructor(meta, data) {
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));
		const { finalSize, innerSize } = data;

		if(data.extra) {
			const { baseSize, angle, extraHeight, extraLength } = data.extra;
			this.#baseCrate = baseSize;
			this.#angle = angle;
			this.#depth = extraLength;
			this.#height = extraHeight;
		};
		this.#inner = innerSize;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#crate = finalSize;
		this.#data = meta;
		this.#ply[1] = +this.#ply[1];
		this.#ply[2] = +this.#ply[2];
		this.#ply[3] = +this.#ply[3];
		this.#threshold = [+this.#pine[2], +this.#pine[2], +this.#feet[3]];
	}

	#bluePrintHugeFacesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;

		if (x <= this.#baseCrate[0])
			x += lastX === 0 ? this.#threshold[0] : lastX - this.#ply[2];
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
			height: lastY === 0 ? y - this.#threshold[2] : y - lastY,
			offsetX: offX,
			offsetY: z,
			offsetZ: lastY === 0 ? this.#threshold[2] : lastY,
		};
		return pad;
	}

	#bluePrintFacesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY;

		if (x <= this.#crate[0])
			x += lastX === 0 ? this.#threshold[0] : lastX - this.#ply[2];
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
			width:
				lastX === 0
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

	#bluePrintHugeSidesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 && this.#baseCrate[0] !== x
				? this.#ply[2] + this.#threshold[0]
				: lastX - 2 * this.#ply[2];
		const offZ = 2 * this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;

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
			width: lastX === 0 ? x - this.#threshold[0] - this.#ply[2] : x - lastX,
			depth: z - 2 * this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] : y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#ply[2],
			offsetY: offZ,
			offsetZ: lastY === 0 ? lastY + this.#threshold[2] : offY,
		};
		return pad;
	}

	#bluePrintSidesSchema({ x, y, z }, lastX, lastY) {
		const offX =
			lastX === 0 && this.#crate[0] !== x
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
			width: lastX === 0 ? x - this.#threshold[0] - this.#ply[2] : x - lastX,
			depth: z - 2 * this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] - this.#ply[2] : y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#ply[2],
			offsetY: offZ,
			offsetZ: lastY === 0 ? lastY + this.#threshold[2] + this.#ply[2] : offY,
		};
		return pad;
	}

	#bluePrintHugeUpDownSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : this.#threshold[0] + lastX;
		const offZ = this.#threshold[1];
		const offY =
			lastY === 0
				? this.#threshold[2]
				: this.#baseCrate[2] - this.#pine[2] - this.#ply[2];

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
			width:
				lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0],
			depth: z - this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] : +this.#ply[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ: lastY === 0
				? this.#threshold[2]
				: this.#baseCrate[2] - +this.#pine[2] - +this.#ply[2],
		};
		return pad;
	}

	#bluePrintUpDownSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : this.#threshold[0] + lastX;
		const offZ = this.#threshold[1];
		const offY =
			lastY === 0
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
			width:
				lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0],
			depth: z - this.#ply[2],
			height:
				lastY === 0
					? y - this.#threshold[2] + this.#ply[2]
					: y - lastY - this.#threshold[2] - this.#ply[2] - this.#pine[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ:
				lastY === 0
					? this.#threshold[2]
					: lastY + this.#threshold[2] + this.#ply[2] + this.#pine[2],
		};
		return pad;
	}

	#defineSizingPadFaces(filled) {
		let { x, y, z, faceA } = filled;

		if (x === 0)
			x =
				this.#ply[1] > this.#crate[0]
					? this.#crate[0] - this.#threshold[0] - this.#pine[2]
					: this.#ply[1];
		y =
			this.#crate[2] - y > this.#ply[3]
				? +this.#ply[3].toFixed(3)
				: +(this.#crate[2] - 2 * this.#pine[2]).toFixed(3);
		z =
			faceA === 0
				? this.#ply[2]
				: this.#crate[1] - this.#threshold[1] - this.#ply[2];
		if (filled.x > 0) {
			if (x >= this.#crate[0] && y < this.#crate[2]) {
				filled.x = 0;
				if (y < this.#crate[2] && x >= this.#crate[0]) {
					filled.y += y;
					y =
						this.#crate[2] - filled.y > this.#ply[3]
							? this.#crate[2] - this.#ply[3]
							: +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
				}
			}
			x = this.#crate[0] - x - this.#threshold[0] + this.#ply[2];
		}
		return { x, y, z };
	}

	#defineHugeSizingPlyFaces(filled) {
		let { x, y, z, faceA } = filled;

		if (x === 0)
			x = this.#ply[1] > this.#baseCrate[0]
					? this.#baseCrate[0] - this.#threshold[0] - this.#pine[2]
					: this.#ply[1];
		y = this.#baseCrate[2] - y > this.#ply[3]
				? +this.#ply[3]
				: +(this.#baseCrate[2] - 2 * this.#pine[2]).toFixed(3);
		z = faceA === 0
				? this.#ply[2]
				: this.#baseCrate[1] - this.#threshold[1] - this.#ply[2];
		if (filled.x > 0) {
			if (x >= this.#baseCrate[0] && y < this.#crate[2]) {
				filled.x = 0;
				if (y < this.#baseCrate[2] && x >= this.#crate[0]) {
					filled.y += y;
					y = this.#baseCrate[2] - filled.y > this.#ply[3]
							? this.#ply[3]
							: +(this.#baseCrate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
				}
			}
			x = this.#baseCrate[0] - x - this.#threshold[0] + this.#ply[2];
		}
		return { x, y, z };
	}

	#defineHugeSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;

		x = sideA === 0 ? this.#ply[2] : this.#baseCrate[0] - this.#ply[2];
		if (y === 0)
			y =
				this.#baseCrate[2] - y > +this.#ply[3]
					? +this.#ply[3]
					: +(this.#baseCrate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else
			y +=
				this.#baseCrate[2] - y > this.#ply[3]
					? this.#ply[3]
					: this.#baseCrate[2] - y - this.#pine[2] - this.#ply[2];
		z =
			this.#baseCrate[1] < this.#ply[1]
				? this.#baseCrate[1] - 2 * this.#threshold[1]
				: this.#baseCrate[1] - 2 * this.#ply[1] - z;
		return { x, y, z };
	}

	#defineSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;

		x = sideA === 0 ? this.#ply[2] : this.#crate[0] - this.#ply[2];
		if (y === 0)
			y =
				this.#crate[2] - y > +this.#ply[3]
					? +this.#ply[3]
					: +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else
			y +=
				this.#crate[2] - y > this.#ply[3]
					? this.#ply[3]
					: this.#crate[2] - y - this.#pine[2] - this.#ply[2];
		z =
			this.#crate[1] < this.#ply[1]
				? this.#crate[1] - 2 * this.#threshold[1]
				: this.#crate[1] - 2 * this.#ply[1] - z;
		return { x, y, z };
	}

	#defineHugeSizingPlyUpDown(filled) {
		let { x, y, z } = filled;

		if (x === 0)
			x =
				this.#ply[1] > this.#baseCrate[0]
					? this.#baseCrate[0] - this.#threshold[0] - this.#ply[2]
					: this.#ply[1];
		else x = this.#baseCrate[0] - x - this.#threshold[0] - this.#ply[2];
		y = y === 0 ? this.#ply[2] : this.#baseCrate[2] - this.#pine[2];
		z = this.#baseCrate[1] - this.#threshold[1];
		return { x, y, z };
	}

	#defineSizingPadUpDown(filled) {
		let { x, y, z } = filled;

		if (x === 0)
			x =
				this.#ply[1] > this.#crate[0]
					? this.#crate[0] - this.#threshold[0] - this.#ply[2]
					: this.#ply[1];
		else x = this.#crate[0] - x - this.#threshold[0] - this.#ply[2];
		y = y === 0 ? this.#threshold[2] : this.#crate[2] - this.#pine[2];
		z = this.#crate[1] - this.#threshold[1];
		return { x, y, z };
	}

	#setFrontAndBackFaces(data, filled) {
		const { faceA, faceB } = filled;
		if (faceA === 1 && faceB === 1) return data;
		const sizes = this.#defineSizingPadFaces(filled);

		data.push(this.#bluePrintFacesSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2])
			if (faceA === 0) {
				filled.faceA = 1;
				filled.x = 0;
				filled.y = 0;
			} else filled.faceB = 1;
		return this.#setFrontAndBackFaces(data, filled);
	}

	#setHugeFrontAndBackFaces(data, filled) {
		const { faceA, faceB } = filled;
		if (faceA === 1 && faceB === 1) return data;
		const sizes = this.#defineHugeSizingPlyFaces(filled);

		data.push(this.#bluePrintHugeFacesSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2])
			if (faceA === 0) {
				filled.faceA = 1;
				filled.x = 0;
				filled.y = 0;
			} else filled.faceB = 1;
		return this.#setHugeFrontAndBackFaces(data, filled);
	}

	#setRightAndLeftSides(data, filled) {
		const { sideA, sideB } = filled;
		if (sideA === 1 && sideB === 1) return data;
		const sizes = this.#defineSizingPadSides(filled);

		data.push(this.#bluePrintSidesSchema(sizes, filled.x, filled.y));
		filled.y += sizes.y;
		if (filled.y + this.#pine[2] + this.#ply[2] >= this.#crate[2])
			if (sideA === 0) {
				filled.sideA = 1;
				filled.x = this.#crate[0];
				filled.y = 0;
			} else filled.sideB = 1;
		return this.#setRightAndLeftSides(data, filled);
	}

	#setHugeRightAndLeftSides(data, filled) {
		const { sideA, sideB } = filled;
		if (sideA === 1 && sideB === 1) return data;
		const sizes = this.#defineHugeSizingPadSides(filled);

		data.push(this.#bluePrintHugeSidesSchema(sizes, filled.x, filled.y));
		filled.y += sizes.y;
		if (filled.y + this.#pine[2] + this.#ply[2] >= this.#crate[2])
			if (sideA === 0) {
				filled.sideA = 1;
				filled.x = this.#crate[0];
				filled.y = 0;
			} else filled.sideB = 1;
		return this.#setHugeRightAndLeftSides(data, filled);
	}

	#setHugeTopAndBottom(data, filled) {
		const { top, bottom } = filled;
		if (top === 1 && bottom === 1) return data;
		const sizes = this.#defineHugeSizingPlyUpDown(filled);
		const setY =
			this.#crate[2] -
			2 * this.#ply[2] -
			this.#threshold[2] -
			this.#ply[2] -
			this.#pine[2];

		data.push(this.#bluePrintHugeUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x + this.#ply[2] >= this.#inner[0])
			if (bottom === 0) {
				filled.bottom = 1;
				filled.x = 0;
				filled.y = setY;
			} else filled.top = 1;
		return this.#setHugeTopAndBottom(data, filled);
	}

	#setTopAndBottom(data, filled) {
		const { top, bottom } = filled;
		if (top === 1 && bottom === 1) return data;
		const sizes = this.#defineSizingPadUpDown(filled);
		const setY =
			this.#crate[2] -
			2 * this.#ply[2] -
			this.#threshold[2] -
			this.#ply[2] -
			this.#pine[2];

		data.push(this.#bluePrintUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x + this.#ply[2] >= this.#inner[0])
			if (bottom === 0) {
				filled.bottom = 1;
				filled.x = 0;
				filled.y = setY;
			} else filled.top = 1;
		return this.#setTopAndBottom(data, filled);
	}

	#setupFaces() {
		const faces = [];

		this.#setFrontAndBackFaces(faces, { x: 0, y: 0, z: 0, faceA: 0, faceB: 0 });
		this.#setRightAndLeftSides(faces, { x: 0, y: 0, z: 0, sideA: 0, sideB: 0 });
		this.#setTopAndBottom(faces, { x: 0, y: 0, z: 0, top: 0, bottom: 0 });
		return faces;
	}

	#setupHugeFaces() {
		const faces = [];

		this.#setHugeFrontAndBackFaces(faces, { x: 0, y: 0, z: 0, faceA: 0, faceB: 0 });
		this.#setHugeRightAndLeftSides(faces, { x: 0, y: 0, z: 0, sideA: 0, sideB: 0 });
		this.#setHugeTopAndBottom(faces, { x: 0, y: 0, z: 0, top: 0, bottom: 0 });
		return faces;
	}

	#defineCrateWalls() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const faces = this.#setupFaces();
		let meta = structuredClone(this.#data);
		let show = true;

		if (!this.#ply) return this.#data;
		faces.map((face) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } =
				face;

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

	#defineCrateHugeWalls() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const faces = this.#setupHugeFaces();
		let meta = structuredClone(this.#data);
		let show = true;

		if (!this.#ply) return this.#data;
		faces.map((face) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = face;
			trace.data = {
				info: meta,
				coordinates,
				name: "walls",
				align: this.#depth,
				angle: this.#angle,
				base: this.#height,
				show,
			};
			meta = trace.defineHugeTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "walls",
				angle: this.#angle,
				base: this.#height,
				align: this.#depth,
				offsetX,
				offsetY,
				offsetZ,
			};
			meta = this.#data = fill.largestCanvas;
			show = false;
			return face;
		});
		return meta;
	}

	get setWalls() {
		return this.#defineCrateWalls();
	}

	get setHugeWalls() {
		return this.#defineCrateHugeWalls();
	}
}
