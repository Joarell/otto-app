import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class BottomCrate {
	#sized;
	#foot;
	#ply;
	#base;
	#pine;

	constructor(sized, material, base = [0, 0, 0]) {
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => material.usedMaterials.get(opt));

		this.#base = base;
		this.#foot = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#sized = [sized[0], sized[1] - base[1], sized[2]]
		this.#foot[1] = +this.#foot[1];
		this.#foot[2] = +this.#foot[2];
		this.#foot[3] = +this.#foot[3];
	}

	#defineFeetSameSize(offZ) {
		const z = this.#foot[2] + offZ;
		const y = this.#foot[2];
		const x = this.#sized[1] - +this.#foot[2];
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

	#defineLargeFeet(offX) {
		const x = this.#foot[2] + offX;
		const y = this.#foot[2];
		const z = - this.#sized[1] - this.#base[1];
		const offZ = - this.#base[1];
		const divisor = {
			coordinates: [
				{ x: offX, y: 0, z, }, // Vertex 0
				{ x, y: 0, z, }, // Vertex 1
				{ x, y, z, }, // Vertex 2
				{ x: offX, y, z, }, // Vertex 3
				{ x: offX, y: 0, z: offZ }, // Vertex 4
				{ x, y: 0, z: offZ }, // Vertex 5
				{ x, y, z: offZ }, // Vertex 6
				{ x: offX, y, z: offZ }, // Vertex 7
			],
			width: x - offX,
			depth: this.#sized[1],
			height: y,
			offsetX: offX,
			offsetY: - this.#sized[1] + offZ,
			offsetZ: 0,
		};
		return divisor;
	}

	#setExtraFeet(offX) {
		const offZ = - this.#base[1];
		const offY = 2 * this.#ply[2] + this.#foot[3];
		const x = this.#foot[2] + offX;
		const y = this.#foot[2] + offY;
		const z = - this.#sized[1] - this.#base[1];
		const foot = {
			coordinates: [
				{ x: offX, y: offY, z, }, // Vertex 0
				{ x, y: offY, z, }, // Vertex 1
				{ x, y, z, }, // Vertex 2
				{ x: offX, y, z, }, // Vertex 3
				{ x: offX, y: offY, z: offZ }, // Vertex 4
				{ x, y: offY, z: offZ }, // Vertex 5
				{ x, y, z: offZ }, // Vertex 6
				{ x: offX, y, z: offZ }, // Vertex 7
			],
			width: x - offX,
			depth: this.#sized[1],
			height: y - offY,
			offsetX: offX,
			offsetY: - this.#sized[1] + offZ,
			offsetZ: offY,
		};
		return foot;
	}

	#defineVerticalPineStructureSupport(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = - this.#sized[1] - this.#base[1] + +this.#pine[3] + offY;
		const x = offX > 0 ? offX - +this.#pine[2]: +this.#pine[2]
		const y = this.#sized[2] - 14 * +this.#pine[2];
		const z = - this.#sized[1] - this.#base[1] + offY;
		const pine = {
			coordinates: [
				{ x: offX, y: offY, z, }, // Vertex 0
				{ x, y: offY, z, }, // Vertex 1
				{ x, y, z, }, // Vertex 2
				{ x: offX, y, z, }, // Vertex 3
				{ x: offX, y: offY, z: offZ }, // Vertex 4
				{ x, y: offY, z: offZ }, // Vertex 5
				{ x, y: y - 4 * +this.#pine[3], z: offZ }, // Vertex 6
				{ x: offX, y: y - 4 * +this.#pine[3], z: offZ }, // Vertex 7
			],
			width: x - offX,
			depth: +this.#pine[3],
			height: 0,
			// height: y - +this.#foot[3] - 2 * +this.#ply[2],
			offsetX: offX,
			offsetY: offZ - +this.#pine[3],
			offsetZ: offY,
		};
		return pine;
	}

	#defineLargeBaseSheet(counter, offX) {
		const offZ = - this.#sized[1] - this.#base[1];
		const offY = counter > 1
			? +this.#ply[2] + +this.#foot[3]
			: +this.#foot[3];
		const x = offX === 0 ? +this.#ply[1] : +((this.#sized[0] - offX) + offX).toFixed(3);
		const y = counter * +this.#ply[2] + +this.#foot[3];
		const z = - this.#base[1];
		const sheet = {
			coordinates: [
				{ x: offX, y: offY, z, }, // Vertex 0
				{ x, y: offY, z, }, // Vertex 1
				{ x, y, z, }, // Vertex 2
				{ x: offX, y, z, }, // Vertex 3
				{ x: offX, y: offY, z: offZ }, // Vertex 4
				{ x, y: offY, z: offZ }, // Vertex 5
				{ x, y, z: offZ }, // Vertex 6
				{ x: offX, y, z: offZ }, // Vertex 7
			],
			width: x - offX,
			depth: - this.#sized[1],
			height: +this.#ply[2],
			offsetX: offX,
			offsetY: z,
			offsetZ: y - +this.#ply[2],
			lastX: x,
		};
		return sheet;
	}

	#setAllParts(info) {
		const feetSpanCm = 100;
		let counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		let offX = 0;

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

	#setSheets(info, counter, offY, nextX = 0) {
		if(counter < 0) return info;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		const {
			coordinates, offsetX, offsetY, offsetZ, width, depth, height, lastX
		} = this.#defineLargeBaseSheet(offY, nextX);

		nextX = lastX;
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
		return this.#setSheets(info, counter - 1, offY, nextX);
	}

	#setBaseSheet(meta) {
		let layers = 2;
		let offY = 1;
		const sheets = this.#sized[0] / +this.#ply[1];

		while(layers--) {
			this.#setSheets(meta, sheets, offY);
			offY++;
		}
		return meta;
	}

	#verticalPines(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;

		while(addFeet++ <= counter) {
			const {
				coordinates, offsetX, offsetY, offsetZ, width, depth, height
			} = this.#defineVerticalPineStructureSupport(offX);

			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
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
			offX += offX + pineSpanCm >= +this.#ply[1]
				? pineSpanCm - half
				: pineSpanCm;
			if(offX >= this.#sized[0] - pineSpanCm)
				offX = this.#sized[0];
		}
		return info;
	}

	#extraFeet(info) {
		const feetSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		const half = +this.#foot[2] / 2;
		let offX = +this.#pine[2];
		let addFeet = 0;

		while(addFeet++ <= counter) {
			const newFoot = this.#sized[0] / (addFeet * feetSpanCm) >= 1;
			const {
				coordinates, offsetX, offsetY, offsetZ, width, depth, height
			} = this.#setExtraFeet(offX);

			if (offX === +this.#pine[2]) offX = 0;
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
			if (newFoot)
				offX += offX + feetSpanCm === +this.#ply[1]
					? feetSpanCm - half
					: feetSpanCm;
			if(offX >= this.#sized[0] - feetSpanCm)
				offX = this.#sized[0] - +this.#foot[2] - +this.#pine[2];
		}
		return info;
	}

	#setAllLargeParts(info, large = false) {
		const feetSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker()
		const fill = new DesignWalls();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;

		while(addFeet++ <= counter) {
			const newFoot = large && this.#sized[0] / (addFeet * feetSpanCm) >= 1;
			const {
				coordinates, offsetX, offsetY, offsetZ, width, depth, height
			} = this.#defineLargeFeet(offX);

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
			if(!large) {
				offX += this.#sized[0] > +this.#ply[1]
					? +this.#ply[1]
					: this.#sized[0];
			}
			else if (newFoot)
				offX += offX + feetSpanCm === +this.#ply[1]
					? feetSpanCm - half
					: feetSpanCm;
			if(offX >= this.#sized[0] - feetSpanCm)
				offX = this.#sized[0] - +this.#foot[2];
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

	#designLargeBottom() {
		const meta = this.#setAllLargeParts([], true);

		this.#setBaseSheet(meta);
		this.#extraFeet(meta);
		this.#verticalPines(meta);
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

	get largeBottom() {
		if(!this.#foot || !this.#sized) return false;
		return this.#designLargeBottom();
	}
}

