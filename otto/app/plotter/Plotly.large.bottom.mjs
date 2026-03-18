import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class LargeBottomCrate {
	#sized;
	#foot;
	#ply;
	#base;
	#pine;
	#extraDepth;
	#leanPines;
	#angle;

	constructor(data) {
		const { finalSize, extra } = data;
		const { leanSupport, baseSize, extraLength, angle } = extra;
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));

		this.#angle = angle;
		this.#leanPines = leanSupport;
		this.#extraDepth = extraLength;
		this.#base = baseSize;
		this.#foot = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#sized = [finalSize[0], finalSize[1] - baseSize[1], finalSize[2]]
		this.#foot[1] = +this.#foot[1];
		this.#foot[2] = +this.#foot[2];
		this.#foot[3] = +this.#foot[3];
	}

	#setExtraFeet(offX) {
		const offZ = - this.#extraDepth;
		const offY = 2 * this.#ply[2] + this.#foot[3];
		const x = this.#foot[2] + offX;
		const y = this.#foot[2] + offY;
		const z = - this.#sized[1] - this.#base[1];
		const degree = (90 - this.#angle - 2) * Math.PI / 180; //:NOTE: the 2 is just the degree correction.
		const leanCut = - +(+this.#foot[3] / Math.cos(degree)).toFixed(3) - this.#extraDepth + this.#foot[3];
		const foot = {
			coordinates: [
				{ x: offX, y: offY, z, }, // Vertex 0
				{ x, y: offY, z, }, // Vertex 1
				{ x, y, z, }, // Vertex 2
				{ x: offX, y, z, }, // Vertex 3
				{ x: offX, y: offY, z: offZ }, // Vertex 4
				{ x, y: offY, z: offZ }, // Vertex 5
				{ x, y, z: leanCut }, // Vertex 6
				{ x: offX, y, z: leanCut }, // vertex 7
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
		const offZ = - this.#sized[1] - this.#base[1] + +this.#pine[3];
		const x = offX > 0 ? offX - +this.#pine[2]: +this.#pine[2]
		const hipotenusa = (+this.#pine[3] / Math.sin(this.#angle))
		const y = this.#leanPines + offY;
		const extraY = Math.floor(y + Math.sqrt(hipotenusa ** 2 - this.#pine[3] ** 2));

		const z = - this.#sized[1] - this.#base[1];
		const pine = {
			// coordinates: [
			// 	{ x: offX, y: offY, z, }, // Vertex 0
			// 	{ x, y: offY, z, }, // Vertex 1
			// 	{ x, y, z, }, // Vertex 2
			// 	{ x: offX, y, z, }, // Vertex 3
			// 	{ x: offX, y: offY, z: offZ }, // Vertex 4
			// 	{ x, y: offY, z: offZ }, // Vertex 5
			// 	{ x, y: y - 4 * +this.#pine[3], z: offZ }, // Vertex 6
			// 	{ x: offX, y: y - 4 * +this.#pine[3], z: offZ }, // Vertex 7
			// ],
			coordinates: [
				{ x: offX, y: offY, z, }, // Vertex 0
				{ x, y: offY, z, }, // Vertex 1
				{ x, y: extraY, z, }, // Vertex 2
				{ x: offX, y: extraY, z, }, // Vertex 3
				{ x: offX, y: offY, z: offZ }, // Vertex 4
				{ x, y: offY, z: offZ }, // Vertex 5
				{ x, y, z: offZ }, // Vertex 6
				{ x: offX, y, z: offZ }, // Vertex 7
			],
			width: x - offX,
			depth: +this.#pine[3],
			height: 0,
			// height: y - +this.#foot[3] - 2 * +this.#ply[2],
			offsetX: offX,
			offsetY: offZ,
			// offsetY: offZ - +this.#pine[3],
			offsetZ: offY,
		};
		return pine;
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

	#defineLargeFeet(offX) {
		const x = this.#foot[2] + offX;
		const y = this.#foot[2];
		const z = - this.#sized[1] - this.#base[1];
		const offZ = - this.#extraDepth;
		// const offZ = - this.#base[1];
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
			offsetY: - this.#sized[1] - this.#base[1],
			offsetZ: 0,
		};
		return divisor;
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

	#defineLargeBaseSheet(counter, offX) {
		const offZ = - this.#extraDepth;
		const offY = counter > 1 ? +this.#ply[2] + +this.#foot[3] : +this.#foot[3];
		const x = offX === 0 ? +this.#ply[1] : +((this.#sized[0] - offX) + offX).toFixed(3);
		const y = counter * +this.#ply[2] + +this.#foot[3];
		const z = - this.#sized[1] - this.#base[1];
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
			depth: this.#sized[1],
			height: +this.#ply[2],
			offsetX: offX,
			offsetY: - this.#sized[1] - this.#base[1],
			offsetZ: y - +this.#ply[2],
			lastX: x,
		};
		return sheet;
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

	#designLargeBottom() {
		const meta = this.#setAllLargeParts([], true);

		this.#setBaseSheet(meta);
		this.#extraFeet(meta);
		this.#verticalPines(meta);
		return meta;
	}

	get largeBottom() {
		if(!this.#foot || !this.#sized) return false;
		return this.#designLargeBottom();
	}
}
