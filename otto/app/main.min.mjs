//#region app/plotter/Plotly.fill.colors.class.mjs
var DesignWalls = class {
	#data;
	#colors = /* @__PURE__ */ new Map();
	#wallDefinitions;
	constructor() {
		[
			["frame", "yellow"],
			["walls", "#FF5252"],
			["padding", "#222725"],
			["div", "#EFECBBBE"],
			["fill", "#2DD751"]
		].map((col) => this.#colors.set(col[0], col[1]));
		this.#wallDefinitions = [
			[[
				0,
				1,
				2
			], [
				0,
				2,
				3
			]],
			[[
				4,
				7,
				6
			], [
				4,
				6,
				5
			]],
			[[
				0,
				3,
				7
			], [
				0,
				7,
				4
			]],
			[[
				1,
				5,
				6
			], [
				1,
				6,
				2
			]],
			[[
				0,
				4,
				5
			], [
				0,
				5,
				1
			]],
			[[
				3,
				2,
				6
			], [
				3,
				6,
				7
			]]
		];
	}
	#createTube() {
		const segments = 100;
		const { width, depth, height, offsetX, offsetZ, offsetY, info, name } = this.#data;
		const radius = depth / 2;
		const color = "#BB0056BB";
		const vertices_x = [];
		const vertices_y = [];
		const vertices_z = [];
		const i_arr = [];
		const j_arr = [];
		const k_arr = [];
		for (let end = 0; end < 2; end++) {
			const x = end === 0 ? -width / 2 : width / 2;
			for (let s = 0; s < segments; s++) {
				const angle = 2 * Math.PI * s / segments;
				vertices_x.push(x - offsetX);
				vertices_y.push(radius * Math.cos(angle) + offsetY);
				vertices_z.push(radius * Math.sin(angle) + offsetZ);
			}
		}
		for (let s = 0; s < segments; s++) {
			const next = (s + 1) % segments;
			i_arr.push(s, s);
			j_arr.push(segments + s, segments + next);
			k_arr.push(segments + next, next);
		}
		info.push({
			x: vertices_x,
			y: vertices_y,
			z: vertices_z,
			i: i_arr,
			j: j_arr,
			k: k_arr,
			name: name.code ?? name,
			type: "mesh3d",
			color,
			hovertext: name.code ?? name,
			hovertemplate: name.code ? `L: %{x}<br>H: %{z}<br>D: %{y}<br>Code: ${name.code}` : "L: %{x}<br>H: %{z}<br>D: %{y}<br>",
			showlegend: true,
			legendgroup: name.code ?? name,
			opacity: .5,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2
			}
		});
		return info;
	}
	#defineSides() {
		const { width, depth, height, offsetX, offsetZ, offsetY, info, name } = this.#data;
		const color = this.#colors.get(name.color || name);
		const offsetVertices = [
			[
				0,
				0,
				0
			],
			[
				width,
				0,
				0
			],
			[
				width,
				depth,
				0
			],
			[
				0,
				depth,
				0
			],
			[
				0,
				0,
				height
			],
			[
				width,
				0,
				height
			],
			[
				width,
				depth,
				height
			],
			[
				0,
				depth,
				height
			]
		].map((v) => [
			v[0] + offsetX,
			v[1] + offsetY,
			v[2] + offsetZ
		]);
		const x = offsetVertices.map((v) => v[0]);
		const y = offsetVertices.map((v) => v[1]);
		const z = offsetVertices.map((v) => v[2]);
		const i = [], j = [], k = [];
		this.#wallDefinitions.map((data) => {
			data.map((coordinate) => {
				i.push(coordinate[0]);
				j.push(coordinate[1]);
				k.push(coordinate[2]);
				return coordinate;
			});
			return data;
		});
		info.push({
			x,
			y,
			z,
			i,
			j,
			k,
			name: name.name ?? name,
			type: "mesh3d",
			color,
			hovertext: name.code ?? name,
			hovertemplate: name.code ? `L: %{x}<br>H: %{z}<br>D: %{y}<br>Code: ${name.code}` : "L: %{x}<br>H: %{z}<br>D: %{y}<br>",
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: .2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2
			}
		});
		return info;
	}
	#defineLargestCrate() {
		const { angle, align, width, depth, height, offsetX, offsetZ, offsetY, info, name, base } = this.#data;
		const color = this.#colors.get(name.color || name);
		const vertices = [
			[
				0,
				0,
				0
			],
			[
				width,
				0,
				0
			],
			[
				width,
				depth,
				0
			],
			[
				0,
				depth,
				0
			],
			[
				0,
				0,
				height
			],
			[
				width,
				0,
				height
			],
			[
				width,
				depth,
				height
			],
			[
				0,
				depth,
				height
			]
		];
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		const rotX1 = (x, y, z) => [
			x,
			z * sinAngle - y * cosAngle - align,
			z * cosAngle + y * sinAngle + base
		];
		const rotX2 = (x, y, z) => [
			x,
			y * cosAngle - z * sinAngle - align,
			y * sinAngle + z * cosAngle + base
		];
		const offsetVertices = vertices.map((v) => [
			v[0] + offsetX,
			v[1] + offsetY,
			v[2] + offsetZ
		]);
		const values = sinAngle > 0 ? offsetVertices.map((dim) => rotX2(dim[0], dim[1], dim[2])) : offsetVertices.map((dim) => rotX1(dim[0], dim[1], dim[2]));
		const x = values.map((v) => v[0]);
		const y = values.map((v) => v[1]);
		const z = values.map((v) => v[2]);
		const i = [], j = [], k = [];
		this.#wallDefinitions.map((data) => {
			data.map((coordinate) => {
				i.push(coordinate[0]);
				j.push(coordinate[1]);
				k.push(coordinate[2]);
				return coordinate;
			});
			return data;
		});
		info.push({
			x,
			y,
			z,
			i,
			j,
			k,
			name: name.name ?? name,
			type: "mesh3d",
			color,
			hovertext: name.code ?? name,
			hovertemplate: name.code ? `L: %{x}<br>H: %{z}<br>D: %{y}<br>Code: ${name.code}` : "L: %{x}<br>H: %{z}<br>D: %{y}<br>",
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: .2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2
			}
		});
		return info;
	}
	/** @param {any} objectData */
	set objectData(objectData) {
		this.#data = objectData;
	}
	get designSides() {
		return this.#defineSides();
	}
	get designTubes() {
		return this.#createTube();
	}
	get largestCanvas() {
		return this.#defineLargestCrate();
	}
};
//#endregion
//#region app/plotter/Plotly.trace.class.mjs
var TraceMaker = class {
	#edges;
	#data;
	#colors = /* @__PURE__ */ new Map();
	constructor() {
		[
			["fill", "#BF5E30"],
			["frame", "#002A3D"],
			["walls", "yellow"],
			["padding", "#FFFFF0"],
			["div", "#002A3D"]
		].map((col) => this.#colors.set(col[0], col[1]));
		this.#edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7]
		];
	}
	#defineHugeShape() {
		const { angle, align, info, coordinates, name, show, base } = this.#data;
		const color = this.#colors.get(name.color ?? name) ?? name.color;
		this.#edges.forEach((edge, i) => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];
			const cosAngle = Math.cos(angle);
			const sinAngle = Math.sin(angle);
			const rotX1 = (x, y, z) => [
				x,
				y * cosAngle + z * sinAngle + base,
				y * sinAngle - z * cosAngle - align
			];
			const rotX2 = (x, y, z) => [
				x,
				z * sinAngle + y * cosAngle + base,
				z * cosAngle - y * sinAngle - align
			];
			const first = sinAngle > 0 ? rotX2(v1.x, v1.y, v1.z) : rotX1(v1.x, v1.y, v1.z);
			const second = sinAngle > 0 ? rotX2(v2.x, v2.y, v2.z) : rotX1(v2.x, v2.y, v2.z);
			info.push({
				x: [first[0], second[0]],
				z: [first[1], second[1]],
				y: [first[2], second[2]],
				name: name.name ?? name,
				mode: "lines",
				type: "scatter3d",
				line: {
					color,
					width: 1.5
				},
				showlegend: show && i === 0 ? true : false,
				hovertext: name.code ?? name,
				legendgroup: name.name ?? name,
				hovertemplate: `L: %{x}<br>H: %{z}<br>D: %{y}<br>Code: ${name.code}`,
				contour: {
					show: show && i === 0 ? true : false,
					color: "#BB0056BB",
					width: 2
				}
			});
		});
		return info;
	}
	#defineShape() {
		const { info, coordinates, name, show } = this.#data;
		const color = this.#colors.get(name.color ?? name) ?? name.color;
		this.#edges.forEach((edge, i) => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];
			info.push({
				x: [v1.x, v2.x],
				z: [v1.y, v2.y],
				y: [v1.z, v2.z],
				name: name.name ?? name,
				mode: "lines",
				type: "scatter3d",
				line: {
					color,
					width: 1.5
				},
				showlegend: show && i === 0,
				hovertext: name.code ?? name,
				legendgroup: name.name ?? name,
				hovertemplate: `L: %{x}<br>H: %{z}<br>D: %{y}<br>Code: ${name.code}`,
				contour: {
					show: show && i === 0,
					color: "#BB0056BB",
					width: 2
				}
			});
		});
		return info;
	}
	set data(info) {
		this.#data = info;
	}
	get defineTrace() {
		return this.#defineShape();
	}
	get defineHugeTrace() {
		return this.#defineHugeShape();
	}
};
//#endregion
//#region app/plotter/Crate.walls.plotly.class.mjs
var SetCrateWalls = class {
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
		const { finalSize, innerSize, extra } = data;
		const { baseSize, angle, extraHeight, extraLength } = extra;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		this.#baseCrate = baseSize;
		this.#angle = angle;
		this.#depth = extraLength;
		this.#height = extraHeight;
		this.#inner = innerSize;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#crate = finalSize;
		this.#data = meta;
		this.#ply[1] = +this.#ply[1];
		this.#ply[2] = +this.#ply[2];
		this.#ply[3] = +this.#ply[3];
		this.#threshold = [
			+this.#pine[2],
			+this.#pine[2],
			+this.#feet[3]
		];
	}
	#bluePrintHugeFacesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;
		if (x <= this.#baseCrate[0]) x += lastX === 0 ? this.#threshold[0] : lastX - this.#ply[2];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0] - this.#ply[2],
			depth: this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] : y - lastY,
			offsetX: offX,
			offsetY: z,
			offsetZ: lastY === 0 ? this.#threshold[2] : lastY
		};
	}
	#bluePrintFacesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY;
		if (x <= this.#crate[0]) x += lastX === 0 ? this.#threshold[0] : lastX - this.#ply[2];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0] - this.#ply[2],
			depth: this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] - this.#ply[2] : y - lastY,
			offsetX: offX,
			offsetY: z,
			offsetZ: lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY
		};
	}
	#bluePrintHugeSidesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 && this.#baseCrate[0] !== x ? this.#ply[2] + this.#threshold[0] : lastX - 2 * this.#ply[2];
		const offZ = 2 * this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] - this.#ply[2] : x - lastX,
			depth: z - 2 * this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] : y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#ply[2],
			offsetY: offZ,
			offsetZ: lastY === 0 ? lastY + this.#threshold[2] : offY
		};
	}
	#bluePrintSidesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 && this.#crate[0] !== x ? this.#ply[2] + this.#threshold[0] : lastX - 2 * this.#ply[2];
		const offZ = 2 * this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2] : lastY;
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] - this.#ply[2] : x - lastX,
			depth: z - 2 * this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] - this.#ply[2] : y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#ply[2],
			offsetY: offZ,
			offsetZ: lastY === 0 ? lastY + this.#threshold[2] + this.#ply[2] : offY
		};
	}
	#bluePrintHugeUpDownSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : this.#threshold[0] + lastX;
		const offZ = this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : this.#baseCrate[2] - this.#pine[2] - this.#ply[2];
		x += lastX === 0 ? this.#threshold[0] : lastX + this.#ply[2];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0],
			depth: z - this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] : +this.#ply[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ: lastY === 0 ? this.#threshold[2] : this.#baseCrate[2] - +this.#pine[2] - +this.#ply[2]
		};
	}
	#bluePrintUpDownSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] : this.#threshold[0] + lastX;
		const offZ = this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] + this.#ply[2] : this.#crate[2] - this.#pine[2] - this.#ply[2];
		x += lastX === 0 ? this.#threshold[0] : lastX + this.#ply[2];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] : x - lastX - this.#threshold[0],
			depth: z - this.#ply[2],
			height: lastY === 0 ? y - this.#threshold[2] + this.#ply[2] : y - lastY - this.#threshold[2] - this.#ply[2] - this.#pine[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ: lastY === 0 ? this.#threshold[2] : lastY + this.#threshold[2] + this.#ply[2] + this.#pine[2]
		};
	}
	#defineSizingPadFaces(filled) {
		let { x, y, z, faceA } = filled;
		if (x === 0) x = this.#ply[1] > this.#crate[0] ? this.#crate[0] - this.#threshold[0] - this.#pine[2] : this.#ply[1];
		y = this.#crate[2] - y > this.#ply[3] ? +this.#ply[3].toFixed(3) : +(this.#crate[2] - 2 * this.#pine[2]).toFixed(3);
		z = faceA === 0 ? this.#ply[2] : this.#crate[1] - this.#threshold[1] - this.#ply[2];
		if (filled.x > 0) {
			if (x >= this.#crate[0] && y < this.#crate[2]) {
				filled.x = 0;
				if (y < this.#crate[2] && x >= this.#crate[0]) {
					filled.y += y;
					y = this.#crate[2] - filled.y > this.#ply[3] ? this.#crate[2] - this.#ply[3] : +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
				}
			}
			x = this.#crate[0] - x - this.#threshold[0] + this.#ply[2];
		}
		return {
			x,
			y,
			z
		};
	}
	#defineHugeSizingPlyFaces(filled) {
		let { x, y, z, faceA } = filled;
		if (x === 0) x = this.#ply[1] > this.#baseCrate[0] ? this.#baseCrate[0] - this.#threshold[0] - this.#pine[2] : this.#ply[1];
		y = this.#baseCrate[2] - y > this.#ply[3] ? +this.#ply[3] : +(this.#baseCrate[2] - 2 * this.#pine[2]).toFixed(3);
		z = faceA === 0 ? this.#ply[2] : this.#baseCrate[1] - this.#threshold[1] - this.#ply[2];
		if (filled.x > 0) {
			if (x >= this.#baseCrate[0] && y < this.#crate[2]) {
				filled.x = 0;
				if (y < this.#baseCrate[2] && x >= this.#crate[0]) {
					filled.y += y;
					y = this.#baseCrate[2] - filled.y > this.#ply[3] ? this.#ply[3] : +(this.#baseCrate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
				}
			}
			x = this.#baseCrate[0] - x - this.#threshold[0] + this.#ply[2];
		}
		return {
			x,
			y,
			z
		};
	}
	#defineHugeSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;
		x = sideA === 0 ? this.#ply[2] : this.#baseCrate[0] - this.#ply[2];
		if (y === 0) y = this.#baseCrate[2] - y > +this.#ply[3] ? +this.#ply[3] : +(this.#baseCrate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else y += this.#baseCrate[2] - y > this.#ply[3] ? this.#ply[3] : this.#baseCrate[2] - y - this.#pine[2] - this.#ply[2];
		z = this.#baseCrate[1] < this.#ply[1] ? this.#baseCrate[1] - 2 * this.#threshold[1] : this.#baseCrate[1] - 2 * this.#ply[1] - z;
		return {
			x,
			y,
			z
		};
	}
	#defineSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;
		x = sideA === 0 ? this.#ply[2] : this.#crate[0] - this.#ply[2];
		if (y === 0) y = this.#crate[2] - y > +this.#ply[3] ? +this.#ply[3] : +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else y += this.#crate[2] - y > this.#ply[3] ? this.#ply[3] : this.#crate[2] - y - this.#pine[2] - this.#ply[2];
		z = this.#crate[1] < this.#ply[1] ? this.#crate[1] - 2 * this.#threshold[1] : this.#crate[1] - 2 * this.#ply[1] - z;
		return {
			x,
			y,
			z
		};
	}
	#defineHugeSizingPlyUpDown(filled) {
		let { x, y, z } = filled;
		if (x === 0) x = this.#ply[1] > this.#baseCrate[0] ? this.#baseCrate[0] - this.#threshold[0] - this.#ply[2] : this.#ply[1];
		else x = this.#baseCrate[0] - x - this.#threshold[0] - this.#ply[2];
		y = y === 0 ? this.#ply[2] : this.#baseCrate[2] - this.#pine[2];
		z = this.#baseCrate[1] - this.#threshold[1];
		return {
			x,
			y,
			z
		};
	}
	#defineSizingPadUpDown(filled) {
		let { x, y, z } = filled;
		if (x === 0) x = this.#ply[1] > this.#crate[0] ? this.#crate[0] - this.#threshold[0] - this.#ply[2] : this.#ply[1];
		else x = this.#crate[0] - x - this.#threshold[0] - this.#ply[2];
		y = y === 0 ? this.#threshold[2] : this.#crate[2] - this.#pine[2];
		z = this.#crate[1] - this.#threshold[1];
		return {
			x,
			y,
			z
		};
	}
	#setFrontAndBackFaces(data, filled) {
		const { faceA, faceB } = filled;
		if (faceA === 1 && faceB === 1) return data;
		const sizes = this.#defineSizingPadFaces(filled);
		data.push(this.#bluePrintFacesSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2]) if (faceA === 0) {
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
		if (filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2]) if (faceA === 0) {
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
		if (filled.y + this.#pine[2] + this.#ply[2] >= this.#crate[2]) if (sideA === 0) {
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
		if (filled.y + this.#pine[2] + this.#ply[2] >= this.#crate[2]) if (sideA === 0) {
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
		const setY = this.#crate[2] - 2 * this.#ply[2] - this.#threshold[2] - this.#ply[2] - this.#pine[2];
		data.push(this.#bluePrintHugeUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x + this.#ply[2] >= this.#inner[0]) if (bottom === 0) {
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
		const setY = this.#crate[2] - 2 * this.#ply[2] - this.#threshold[2] - this.#ply[2] - this.#pine[2];
		data.push(this.#bluePrintUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x + this.#ply[2] >= this.#inner[0]) if (bottom === 0) {
			filled.bottom = 1;
			filled.x = 0;
			filled.y = setY;
		} else filled.top = 1;
		return this.#setTopAndBottom(data, filled);
	}
	#setupFaces() {
		const faces = [];
		this.#setFrontAndBackFaces(faces, {
			x: 0,
			y: 0,
			z: 0,
			faceA: 0,
			faceB: 0
		});
		this.#setRightAndLeftSides(faces, {
			x: 0,
			y: 0,
			z: 0,
			sideA: 0,
			sideB: 0
		});
		this.#setTopAndBottom(faces, {
			x: 0,
			y: 0,
			z: 0,
			top: 0,
			bottom: 0
		});
		return faces;
	}
	#setupHugeFaces() {
		const faces = [];
		this.#setHugeFrontAndBackFaces(faces, {
			x: 0,
			y: 0,
			z: 0,
			faceA: 0,
			faceB: 0
		});
		this.#setHugeRightAndLeftSides(faces, {
			x: 0,
			y: 0,
			z: 0,
			sideA: 0,
			sideB: 0
		});
		this.#setHugeTopAndBottom(faces, {
			x: 0,
			y: 0,
			z: 0,
			top: 0,
			bottom: 0
		});
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
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = face;
			trace.data = {
				info: meta,
				coordinates,
				name: "walls",
				show
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
				offsetZ
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
				show
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
				offsetZ
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
};
//#endregion
//#region app/plotter/Plotly.large.crate.frame.mjs
var LargeCratesFrame = class {
	#angle;
	#sized;
	#pine;
	#meta;
	#feet;
	#ply;
	#depth;
	#heightExtra;
	constructor(meta, data) {
		const { extra } = data;
		const { angle, extraHeight, baseSize, extraLength } = extra;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		const parser = (data) => data.map((info, i) => {
			if (i === 1 || i === 2 || i === 3) data[i] = +data[i];
			return info;
		});
		this.#angle = angle;
		this.#heightExtra = extraHeight;
		this.#meta = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#sized = baseSize;
		parser(this.#feet);
		parser(this.#ply);
		parser(this.#pine);
		this.#depth = extraLength;
	}
	#offsetFrame() {
		const structOffset = 0;
		return {
			offsetFacesRightBackV: {
				type: "faceV",
				x: this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3]
			},
			offsetFacesLeftBackV: {
				type: "faceVR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3]
			},
			offsetFacesRightFrontV: {
				type: "faceVB",
				x: this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset + this.#pine[3]
			},
			offsetFacesLeftFrontV: {
				type: "faceVBR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset + this.#pine[3]
			},
			offsetSidesRightVUp: {
				type: "sideHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2])
			},
			offsetSidesLeftVUp: {
				type: "sideLeftHUp",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2])
			},
			offsetSidesRightHDown: {
				type: "sideHDown",
				x: 0,
				y: structOffset,
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: structOffset
			},
			offsetSidesLeftHDown: {
				type: "sideLeftHDown",
				x: this.#sized[0],
				y: structOffset,
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: structOffset
			},
			offsetFacesBackUpH: {
				type: "faceHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3])
			},
			offsetFacesBackDownH: {
				type: "faceH",
				x: 0,
				y: structOffset,
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: structOffset
			},
			offsetFacesFrontUpH: {
				type: "faceHBackUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3])
			},
			offsetFacesFrontDownH: {
				type: "faceHBackDown",
				x: 0,
				y: structOffset,
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset
			},
			offsetSidesRightVBack: {
				type: "sideV",
				x: 0,
				y: structOffset + this.#pine[3],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3]
			},
			offsetSidesRightVFront: {
				type: "sideRightFrontV",
				x: 0,
				y: structOffset + this.#pine[3],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: structOffset + this.#pine[3]
			},
			offsetSidesLeftVBack: {
				type: "sideLeftV",
				x: this.#sized[0],
				y: structOffset + this.#pine[3],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3]
			},
			offsetSidesLeftVFront: {
				type: "sideLeftFrontV",
				x: this.#sized[0],
				y: structOffset + this.#pine[3],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: structOffset + this.#pine[3]
			},
			offsetBottomFrontH: {
				type: "bottomFace",
				x: this.#pine[3],
				y: 0,
				z: 0,
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: 0,
				offsetZ: 0
			},
			offsetBottomBackH: {
				type: "bottomComp",
				x: this.#pine[3],
				y: 0,
				z: this.#sized[1],
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 0
			},
			offsetTopFrontH: {
				type: "topFace",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetTopBackH: {
				type: "topComp",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetBottomRight: {
				type: "bottomFeet",
				x: 0,
				y: 0,
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: 0
			},
			offsetBottomLeft: {
				type: "bottomLeftFeet",
				x: this.#sized[0],
				y: 0,
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: 0
			},
			offsetTopRight: {
				type: "topFeet",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetTopLeft: {
				type: "topLeftFeet",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			}
		};
	}
	#defineFrameComponents() {
		const offSetFeet = 0;
		const vertical = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const rightFeet = this.#sized[0] - this.#pine[3];
		const vDepth = this.#sized[1] - this.#pine[2];
		const upFace = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const tinySide = this.#sized[1] - this.#pine[2];
		const tinyRightSide = this.#sized[0] - this.#pine[2];
		const sideComp = this.#pine[3] + this.#pine[2];
		const rightComp = this.#sized[0] - this.#pine[3] - this.#pine[2];
		const topZ = this.#sized[2];
		const bottomZ = this.#pine[2];
		const topzComp = this.#sized[1] - this.#pine[3];
		return {
			faceV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: sideComp,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: sideComp,
					y: vertical,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: vertical,
					z: this.#pine[2]
				}
			],
			faceVR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: rightComp,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: rightComp,
					y: vertical,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: vertical,
					z: this.#pine[2]
				}
			],
			faceVB: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: sideComp,
					y: 0,
					z: vDepth
				},
				{
					x: sideComp,
					y: vertical,
					z: vDepth
				},
				{
					x: 0,
					y: vertical,
					z: vDepth
				}
			],
			faceVBR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: rightComp,
					y: 0,
					z: vDepth
				},
				{
					x: rightComp,
					y: vertical,
					z: vDepth
				},
				{
					x: 0,
					y: vertical,
					z: vDepth
				}
			],
			faceH: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + offSetFeet,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: this.#pine[2]
				}
			],
			faceHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[2]
				}
			],
			faceHBackUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: vDepth
				},
				{
					x: 0,
					y: upFace,
					z: vDepth
				}
			],
			faceHBackDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + offSetFeet,
					z: vDepth
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: vDepth
				}
			],
			sideHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: vertical,
					z: tinySide
				},
				{
					x: 0,
					y: vertical,
					z: tinySide
				}
			],
			sideLeftHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: vertical,
					z: tinySide
				},
				{
					x: 0,
					y: vertical,
					z: tinySide
				}
			],
			sideHDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: this.#pine[3] + offSetFeet,
					z: tinySide
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: tinySide
				}
			],
			sideLeftHDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: this.#pine[3] + offSetFeet,
					z: tinySide
				},
				{
					x: 0,
					y: this.#pine[3] + offSetFeet,
					z: tinySide
				}
			],
			sideV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: this.#pine[2],
					y: 0,
					z: this.#pine[3]
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[3]
				}
			],
			sideRightFrontV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[2],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFace,
					z: this.#sized[1]
				}
			],
			sideLeftV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: tinyRightSide,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[3]
				}
			],
			sideLeftFrontV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: tinyRightSide,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFace,
					z: this.#sized[1]
				}
			],
			bottomFace: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: bottomZ,
					z: this.#pine[3]
				}
			],
			bottomComp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: topzComp
				},
				{
					x: 0,
					y: bottomZ,
					z: topzComp
				}
			],
			topFace: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: topZ,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: topZ,
					z: this.#pine[3]
				}
			],
			topComp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: topZ,
					z: topzComp
				},
				{
					x: 0,
					y: topZ,
					z: topzComp
				}
			],
			bottomFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: bottomZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: bottomZ,
					z: this.#sized[1]
				}
			],
			bottomLeftFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: bottomZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: bottomZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: bottomZ,
					z: this.#sized[1]
				}
			],
			topFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: topZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: topZ,
					z: this.#sized[1]
				}
			],
			topLeftFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: topZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: topZ,
					z: this.#sized[1]
				}
			]
		};
	}
	#definePosition(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);
		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					if (data[1].x === 0) data[1].x = +x;
					if (data[1].y === 0) data[1].y = +y;
					if (data[1].z === 0) data[1].z = +z;
					break;
				case 1:
					if (data[1].y === 0) data[1].y = +y;
					if (data[1].z === 0) data[1].z = +z;
					break;
				case 2:
					if (data[1].z === 0) data[1].z = +z;
					break;
				case 3:
					if (data[1].x === 0) data[1].x = +x;
					if (data[1].z === 0) data[1].z = +z;
					break;
				case 4:
					if (data[1].x === 0) data[1].x = +x;
					if (data[1].y === 0) data[1].y = +y;
					break;
				case 5:
					if (data[1].y === 0) data[1].y = +y;
					break;
				case 7:
					if (data[1].x === 0) data[1].x = +x;
					break;
			}
			return data;
		});
		return change;
	}
	#bluePrintExtraPineHorizontal({ x, y, z }, lastX) {
		const offX = lastX === 0 && this.#sized[0] !== x ? this.#pine[3] + this.#pine[2] : lastX - 2 * this.#pine[3];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1] - this.#pine[2];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#pine[3] - this.#pine[2] : x - lastX,
			depth: z === this.#pine[3] ? z : -offZ + z,
			height: y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#pine[3],
			offsetY: z === this.#pine[2] ? offZ : this.#sized[1] - this.#pine[2],
			offsetZ: offY
		};
	}
	#bluePrintExtraPineDepth({ x, y, z }, lastX) {
		const offX = lastX === 0 ? 0 : this.#sized[0];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);
		const offZ = this.#pine[3];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? this.#pine[2] : lastX - this.#pine[2],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX,
			offsetY: offZ,
			offsetZ: offY
		};
	}
	#bluePrintExtraPineVertical({ x, y, z }, lastX, lastY) {
		const offX = lastX + +this.#ply[1] - +this.#pine[3] / 2 + this.#pine[2];
		const offY = lastY === 0 ? this.#pine[3] : this.#sized[2] - this.#pine[3] - this.#pine[2];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: this.#pine[3],
			depth: this.#pine[2],
			height: y - offY,
			offsetX: offX,
			offsetY: z === this.#pine[2] ? offZ : z,
			offsetZ: offY
		};
	}
	#bluePrintExtraPineTop({ x, y, z }, bottom) {
		const offX = +this.#ply[1] + +this.#ply[2] + this.#pine[3] / 2;
		const offY = bottom === 0 ? 0 : this.#sized[2] - this.#pine[2];
		const offZ = this.#pine[3];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: this.#pine[3],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX - this.#pine[3],
			offsetY: offZ,
			offsetZ: offY
		};
	}
	#setFacesExtraPineHorizontal(data) {
		let { x, y, z, faceA } = data;
		if (x === 0) x = this.#pine[1] > this.#sized[0] ? this.#sized[0] - this.#pine[3] - this.#pine[2] : this.#pine[1] + this.#pine[3] + this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = faceA === 0 ? this.#pine[2] : this.#sized[1];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return {
			x,
			y,
			z
		};
	}
	#setFacesExtraPineVertical(data) {
		let { x, y, z, faceA } = data;
		x += +this.#ply[1] - this.#pine[3] / 2 + this.#pine[3] + this.#pine[2];
		y = y === 0 ? +this.#ply[3] - this.#pine[3] / 2 : y + this.#pine[3];
		z = faceA === 0 ? this.#pine[2] : this.#sized[1] - this.#pine[2];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return {
			x,
			y,
			z
		};
	}
	#setBottomTopExtraPine(data) {
		let { x, y, z, bottom } = data;
		x = +this.#ply[1] - this.#pine[3] / 2 + this.#pine[2];
		y = bottom === 0 ? this.#pine[2] : this.#sized[2];
		z = this.#sized[1] - this.#pine[3];
		return {
			x,
			y,
			z
		};
	}
	#setFacesExtraPineSides(data) {
		let { x, y, z, right } = data;
		if (right === 0) x = this.#pine[2];
		else x = this.#sized[0] - this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = this.#sized[1] - this.#pine[3];
		return {
			x,
			y,
			z
		};
	}
	#frontAndBackFacesPineJoinVertical(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineVertical(join);
		data.push(this.#bluePrintExtraPineVertical(extraPine, join.x, join.y));
		join.y += extraPine.y;
		if (join.y >= this.#sized[2] && faceA === 0) {
			join.faceA = 1;
			join.y = 0;
		} else if (faceA === 1 && join.y >= this.#sized[2]) join.faceB = 1;
		return this.#frontAndBackFacesPineJoinVertical(data, join);
	}
	#frontAndBackFacesPineJoinHorizontal(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineHorizontal(join);
		data.push(this.#bluePrintExtraPineHorizontal(extraPine, join.x));
		if (faceA === 0) join.faceA = 1;
		else join.faceB = 1;
		return this.#frontAndBackFacesPineJoinHorizontal(data, join);
	}
	#sidePineJoin(data, join) {
		const { right, left } = join;
		if (right === 1 && left === 1) return data;
		const extraPine = this.#setFacesExtraPineSides(join);
		data.push(this.#bluePrintExtraPineDepth(extraPine, join.x, join.y));
		join.x += extraPine.x;
		if (right === 0) join.right = 1;
		else join.left = 1;
		return this.#sidePineJoin(data, join);
	}
	#topAndBottomJoinExtrapine(data, join) {
		const { top, bottom } = join;
		if (top === 1 && bottom === 1) return data;
		const extraPine = this.#setBottomTopExtraPine(join);
		data.push(this.#bluePrintExtraPineTop(extraPine, bottom));
		if (bottom === 0) join.bottom = 1;
		else join.top = 1;
		return this.#topAndBottomJoinExtrapine(data, join);
	}
	#setJoins(data) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const align = this.#depth;
		const show = false;
		data.map((part) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = part;
			trace.data = {
				info: this.#meta,
				coordinates,
				name: "frame",
				show,
				align,
				angle: this.#angle,
				base: this.#heightExtra
			};
			this.#meta = trace.defineHugeTrace;
			fill.objectData = {
				align,
				width,
				depth,
				height,
				info: this.#meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
				angle: this.#angle,
				base: this.#heightExtra
			};
			this.#meta = fill.largestCanvas;
			return part;
		});
	}
	#extraPainForPlyJoins() {
		const lengthSize = this.#sized[0] > +this.#ply[1];
		const heightSize = this.#sized[2] > +this.#ply[3] - +this.#feet[3];
		const pineJoins = [];
		if (lengthSize) {
			this.#frontAndBackFacesPineJoinVertical(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0
			});
			this.#topAndBottomJoinExtrapine(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				top: 0,
				bottom: 0
			});
		}
		if (heightSize) {
			this.#frontAndBackFacesPineJoinHorizontal(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0
			});
			this.#sidePineJoin(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				right: 0,
				left: 0
			});
		}
		if (pineJoins.length > 0) this.#setJoins(pineJoins);
	}
	#setAllParts(meta, component, offsets) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let show = true;
		Object.entries(offsets).map((part) => {
			const { type, offsetX, offsetY, offsetZ, width, depth, height } = part[1];
			const design = component[type];
			const defined = this.#definePosition(part[1], design);
			trace.data = {
				info: meta,
				coordinates: defined,
				name: "frame",
				show,
				align: this.#depth,
				angle: this.#angle,
				base: this.#heightExtra
			};
			meta = trace.defineHugeTrace;
			fill.objectData = {
				align: this.#depth,
				width,
				depth,
				height,
				info: meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
				angle: this.#angle,
				base: this.#heightExtra
			};
			meta = fill.largestCanvas;
			show = false;
			return part;
		});
		return meta;
	}
	#designFrame() {
		const components = this.#defineFrameComponents();
		const offset = this.#offsetFrame();
		this.#meta = this.#setAllParts(this.#meta, components, offset);
		this.#extraPainForPlyJoins();
		return this.#meta;
	}
	get setFrame() {
		return this.#designFrame();
	}
};
//#endregion
//#region app/plotter/Plotly.large.padding.mjs
var PaddingLargeCrate = class {
	#data;
	#pine;
	#ply;
	#pad;
	#baseSize;
	#feet;
	#angle;
	#depth;
	#height;
	constructor(meta, data) {
		const { extra } = data;
		const { baseSize, angle, extraHeight, extraLength } = extra;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		this.#angle = angle;
		this.#depth = extraLength;
		this.#height = extraHeight;
		this.#baseSize = baseSize;
		this.#data = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#pad = used.find((list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5);
		this.#pad[1] = +this.#pad[1];
		this.#pad[2] = +this.#pad[2];
		this.#pad[3] = +this.#pad[3];
	}
	#offSetHugeWalls() {
		return {
			faceBack: {
				type: "backFace",
				x: this.#pine[2] + this.#ply[2] + this.#pad[2],
				y: 2 * this.#pad[2] + this.#pine[2],
				z: this.#pine[2] + this.#ply[2] + this.#pad[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2] + 2 * this.#pad[2]),
				depth: this.#pad[2],
				height: this.#baseSize[2] - 5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2] + this.#pad[2],
				offsetY: this.#pad[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2]
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
				offsetZ: this.#pine[2] + 4 * this.#ply[2]
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
				offsetZ: this.#pine[2] + 4 * this.#ply[2]
			},
			faceLeft: {
				type: "sideLeft",
				x: this.#baseSize[0] - this.#pine[2] - this.#ply[2] - this.#pad[2],
				y: 2 * this.#pad[2] + +this.#pine[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#pad[2],
				depth: this.#baseSize[1] - 2 * this.#pine[2] - 2 * this.#pine[2],
				height: this.#baseSize[2] - 5 * this.#ply[2] - 2 * this.#pad[2],
				offsetX: this.#baseSize[0] - this.#ply[2] - this.#pine[2] - this.#pad[2],
				offsetY: 2 * this.#pine[2],
				offsetZ: this.#pine[2] + 4 * this.#ply[2]
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
				offsetZ: this.#baseSize[2] - (2 * this.#ply[2] + this.#pad[2])
			},
			bottom: {
				type: "bottom",
				x: this.#pine[2] + this.#ply[2],
				y: this.#pad[2] + this.#pine[2],
				z: this.#pine[2] + this.#ply[2],
				width: this.#baseSize[0] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				depth: this.#baseSize[1] - (2 * this.#pine[2] + 2 * this.#ply[2]),
				height: this.#pad[2],
				offsetX: this.#pine[2] + this.#ply[2],
				offsetY: this.#pine[2] + this.#ply[2],
				offsetZ: +this.#feet[3] + +this.#pine[2]
			}
		};
	}
	#cratePaddingHugeTrace() {
		const pineDepth = this.#ply[2] + +this.#pine[2];
		const facesLength = this.#baseSize[0] - (+this.#pine[2] + +this.#ply[2] + 2 * +this.#ply[2]);
		const facesHeight = this.#baseSize[2] - pineDepth - this.#pad[2];
		const sideLength = this.#baseSize[1] - pineDepth;
		const faceLeftLen = this.#baseSize[0] - pineDepth;
		const side = +this.#pine[2] + +this.#ply[2] + this.#pad[2];
		const height = +this.#feet[3] + this.#ply[2] + this.#pad[2];
		const thick = this.#baseSize[1] - this.#pine[2] - +this.#ply[2];
		return {
			backFace: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: facesLength,
					y: 0,
					z: 0
				},
				{
					x: facesLength,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pad[2]
				},
				{
					x: facesLength,
					y: 0,
					z: this.#pad[2]
				},
				{
					x: facesLength,
					y: facesHeight,
					z: this.#pad[2]
				},
				{
					x: 0,
					y: facesHeight,
					z: this.#pad[2]
				}
			],
			frontFace: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: facesLength,
					y: 0,
					z: 0
				},
				{
					x: facesLength,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: sideLength
				},
				{
					x: facesLength,
					y: 0,
					z: sideLength
				},
				{
					x: facesLength,
					y: facesHeight,
					z: sideLength
				},
				{
					x: 0,
					y: facesHeight,
					z: sideLength
				}
			],
			sideRight: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: side,
					y: 0,
					z: 0
				},
				{
					x: side,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: sideLength
				},
				{
					x: side,
					y: 0,
					z: sideLength
				},
				{
					x: side,
					y: facesHeight,
					z: sideLength
				},
				{
					x: 0,
					y: facesHeight,
					z: sideLength
				}
			],
			sideLeft: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: sideLength
				},
				{
					x: faceLeftLen,
					y: 0,
					z: sideLength
				},
				{
					x: faceLeftLen,
					y: facesHeight,
					z: sideLength
				},
				{
					x: 0,
					y: facesHeight,
					z: sideLength
				}
			],
			top: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: facesHeight,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: thick
				},
				{
					x: faceLeftLen,
					y: 0,
					z: thick
				},
				{
					x: faceLeftLen,
					y: facesHeight,
					z: thick
				},
				{
					x: 0,
					y: facesHeight,
					z: thick
				}
			],
			bottom: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: 0,
					z: 0
				},
				{
					x: faceLeftLen,
					y: height,
					z: 0
				},
				{
					x: 0,
					y: height,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: thick
				},
				{
					x: faceLeftLen,
					y: 0,
					z: thick
				},
				{
					x: faceLeftLen,
					y: height,
					z: thick
				},
				{
					x: 0,
					y: height,
					z: thick
				}
			]
		};
	}
	#defineWalls(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);
		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 1:
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 2:
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 3:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 4:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 5:
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 7:
					if (data[1].x === 0) data[1].x = x;
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
		const sizes = {
			dep: this.#baseSize[1],
			high: this.#baseSize[2]
		};
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
				sizes
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
				sizes
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
};
//#endregion
//#region app/plotter/Plotly.crate.gaps.mjs
var FillGaps = class {
	#layer;
	#data;
	constructor(data, layer) {
		this.#layer = layer;
		this.#data = data;
	}
	#defineFillSize({ x, y, z }, locate) {
		const offX = this.#data.offset[0] + locate.x;
		const offZ = this.#data.offZ + z;
		const offY = !locate.y ? y + this.#data.offset[2] - this.#data.pad[2] : locate.y + y + this.#data.offset[2] - this.#data.pad[2];
		const setX = x + this.#data.offset[0] + locate.x;
		const setY = !locate.y ? locate.y + this.#data.offset[2] : this.#data.offset[2] + locate.y - this.#data.pad[2];
		return {
			div: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x: setX,
					y: offY,
					z: offZ
				},
				{
					x: setX,
					y: setY,
					z: offZ
				},
				{
					x: offX,
					y: setY,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z: this.#data.offZ
				},
				{
					x: setX,
					y: offY,
					z: this.#data.offZ
				},
				{
					x: setX,
					y: setY,
					z: this.#data.offZ
				},
				{
					x: offX,
					y: setY,
					z: this.#data.offZ
				}
			],
			width: x,
			depth: z,
			height: locate.y ? y : y - this.#data.pad[2],
			offsetX: offX,
			offsetY: this.#data.offZ,
			offsetZ: locate.y ? locate.y + this.#data.offset[2] - this.#data.pad[2] : this.#data.offset[2] + locate.y,
			layer: {
				name: `layer-${this.#layer}`,
				color: "padding"
			}
		};
	}
	#defineGapSize(info, lastValues) {
		info[2];
		info[3];
	}
	#sizesToFill() {
		const innerX = [];
		const innerY = [];
		const lastValues = {
			lastX: [],
			lastY: []
		};
		let lastX = 0;
		let lastY = 0;
		const { vacuum } = this.#data;
		const len = vacuum.length > 2 ? vacuum.length - 1 : vacuum.length;
		vacuum.map((data, i) => vacuum[i].push(data[0] * data[1]), 0);
		vacuum.sort((a, b) => a.at(-1) - b.at(-1));
		vacuum.reverse().map((data, i) => {
			(vacuum.length - 1 >= i || vacuum.length === 2) && this.#defineGapSize(data, lastValues);
		}, 0);
		return vacuum.map((gap, i) => {
			if (gap[0] === lastX && gap[1] === lastY || len === i) return;
			!innerX.length ? innerX.push(gap[0]) : innerX.push(innerX.at(-1) - lastX);
			innerY.push(gap[1]);
			const allLastY = +innerY.reverse().reduce((sum, val) => gap[3] - val - sum, 0).toFixed(3);
			const fill = {
				location: {
					x: innerX.at(-1) > 0 ? innerX.at(-1) : gap[0],
					y: innerY.at(-1) > 0 && !innerX.at(-1) ? innerY.at(-1) : gap[1]
				},
				size: {
					x: +(gap[2] - gap[0]).toFixed(3),
					y: gap[1] ? allLastY : innerY.at(-1) - gap[1],
					z: this.#data.thickness > this.#data.div[2] ? this.#data.pad[2] : this.#data.div[2]
				}
			};
			lastX = gap[0];
			lastY = gap[1];
			return fill;
		}, 0).filter((data) => data !== void 0);
	}
	#defineGaps() {
		return this.#sizesToFill().map((data) => this.#defineFillSize(data.size, data.location));
	}
	get fill() {
		return this.#defineGaps();
	}
};
//#endregion
//#region app/plotter/Ploty.works.position.mjs
var WorksPosition = class {
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
		const x = +this.#dim[1] + 2 * this.#threshold[0];
		const y = +this.#dim[3] + this.#threshold[2];
		const z = this.#depth + this.#threshold[2];
		const { coordinates, code } = this.#local;
		const fillX = 0;
		const fillZ = -this.#pad[2];
		const fillY = 0;
		return {
			coordinates,
			code,
			art: [
				{
					x: fillX,
					y: fillY,
					z: fillZ
				},
				{
					x,
					y: fillY,
					z: fillZ
				},
				{
					x,
					y,
					z: fillZ
				},
				{
					x: fillX,
					y,
					z: fillZ
				},
				{
					x: fillX,
					y: fillY,
					z
				},
				{
					x,
					y: fillY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: fillX,
					y,
					z
				}
			],
			width: x - this.#threshold[1],
			depth: coordinates.z,
			height: y - this.#pad[2] - this.#threshold[2],
			offsetX: -x / 2,
			offsetY: this.#threshold[1],
			offsetZ: this.#depth + this.#threshold[2]
		};
	}
	#sculptures() {
		let x = this.#dim.length > 4 ? +this.#dim[3] + this.#threshold[0] - this.#pad[2] : +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y = this.#dim.length > 4 ? +this.#dim[1] + this.#threshold[2] : +this.#dim[3] + this.#threshold[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;
		const fillX = 0;
		const fillZ = 0;
		const fillY = 0;
		if (!coordinates.x) x += this.#pad[2];
		else x += this.#pad[2] + coordinates.x;
		if (coordinates.y) y += coordinates.y;
		return {
			coordinates,
			code,
			art: [
				{
					x: fillX,
					y: fillY,
					z: fillZ
				},
				{
					x,
					y: fillY,
					z: fillZ
				},
				{
					x,
					y,
					z: fillZ
				},
				{
					x: fillX,
					y,
					z: fillZ
				},
				{
					x: fillX,
					y: fillY,
					z
				},
				{
					x,
					y: fillY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: fillX,
					y,
					z
				}
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2] + fillZ,
			height: coordinates.y ? y - this.#threshold[2] - coordinates.y + this.#pad[2] : y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y ? this.#threshold[2] + coordinates.y - this.#pad[2] : this.#threshold[2]
		};
	}
	#largestCanvas() {
		let x = this.#dim.length > 4 ? +this.#dim[3] + this.#threshold[0] - this.#pad[2] : +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y = this.#dim.length > 4 ? +this.#dim[1] + this.#threshold[2] : +this.#dim[3] + this.#threshold[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;
		if (!coordinates.x) x += this.#pad[2];
		else x += this.#pad[2] + coordinates.x;
		if (coordinates.y) y += coordinates.y;
		return {
			coordinates,
			code,
			art: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x,
					y: 0,
					z: 0
				},
				{
					x,
					y,
					z: 0
				},
				{
					x: 0,
					y,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z
				},
				{
					x,
					y: 0,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: 0,
					y,
					z
				}
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2],
			height: coordinates.y ? y - this.#threshold[2] - coordinates.y + this.#pad[2] : y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y ? this.#threshold[2] + coordinates.y - this.#pad[2] : this.#threshold[2]
		};
	}
	#standardCanvas() {
		let x = this.#dim.length > 4 ? +this.#dim[3] + this.#threshold[0] - this.#pad[2] : +this.#dim[1] + this.#threshold[0] - this.#pad[2];
		let y = this.#dim.length > 4 ? +this.#dim[1] + this.#threshold[2] : +this.#dim[3] + this.#threshold[2];
		const z = this.#depth + this.#threshold[1];
		const { coordinates, code } = this.#local;
		if (!coordinates.x) x += this.#pad[2];
		else x += this.#pad[2] + coordinates.x;
		if (coordinates.y) y += coordinates.y;
		return {
			coordinates,
			code,
			art: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x,
					y: 0,
					z: 0
				},
				{
					x,
					y,
					z: 0
				},
				{
					x: 0,
					y,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z
				},
				{
					x,
					y: 0,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: 0,
					y,
					z
				}
			],
			width: x - this.#threshold[0] - coordinates.x,
			depth: this.#dim[2],
			height: coordinates.y ? y - this.#threshold[2] - coordinates.y + this.#pad[2] : y - this.#threshold[2] - coordinates.y,
			offsetX: this.#threshold[0] + coordinates.x,
			offsetY: this.#threshold[1] + this.#depth,
			offsetZ: coordinates.y ? this.#threshold[2] + coordinates.y - this.#pad[2] : this.#threshold[2]
		};
	}
	get standardCanvas() {
		return this.#standardCanvas();
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
};
//#endregion
//#region app/plotter/Plotly.div.sizes.mjs
var PadDivSizes = class {
	#threshold;
	#layer;
	#depth;
	#inner;
	#div;
	#pad;
	constructor(pad, threshold, layer, depth, inner, div) {
		this.#layer = layer;
		this.#depth = depth;
		this.#inner = inner;
		this.#div = div;
		this.#threshold = threshold;
		this.#pad = pad;
	}
	#defineDivSameSize(x, y) {
		const z = this.#depth + this.#threshold[2];
		const offX = this.#threshold[0];
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2];
		let div = structuredClone(this.#layer);
		x += this.#threshold[0];
		y += this.#threshold[2];
		return {
			div: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: x - this.#threshold[0],
			depth: this.#div[2],
			height: y - 2 * this.#pad[2] - this.#div[2],
			offsetX: this.#threshold[0],
			offsetY: this.#depth + this.#threshold[2] - this.#div[2],
			offsetZ: this.#threshold[2],
			layer: {
				name: `layer-${++div}`,
				color: "div"
			}
		};
	}
	#setDivSameSize(data = [], filled = {
		x: 0,
		y: 0,
		full: false
	}) {
		if (filled.full) return data;
		let { x, y } = filled;
		if (x === 0) x = this.#div[1] > this.#inner[0] ? this.#inner[0] : this.#div[1];
		y = this.#inner[2] - y > this.#div[3] ? this.#div[3] - 2 * this.#pad[2] : this.#inner[2] - y;
		if (!filled.full && filled.x > 0) {
			if (x >= this.#inner[0] && y < this.#inner[2]) {
				filled.x = 0;
				if (y < this.#inner[2] && x >= this.#inner[0]) {
					filled.y += y;
					y = this.#inner[2] - y > this.#div[3] ? this.#div[3] - 2 * this.#pad[2] : this.#inner[2] - y - 2 * this.#pad[2];
				}
			}
			x = this.#inner[0] - x === 0 ? this.#div[1] : this.#inner[0] - x;
		}
		const lastX = structuredClone(x);
		data.push(this.#defineDivSameSize(x, y, filled.x, filled.y));
		filled.x += lastX;
		if (filled.x === this.#inner[0] && filled.y + y === this.#inner[2]) filled.full = true;
		return this.#setDivSameSize(data, filled);
	}
	#defineDivSize(x, y, lastX, lastY) {
		const z = this.#depth + this.#threshold[2];
		const offX = lastX === 0 ? this.#threshold[0] : lastX + this.#threshold[0];
		const offZ = this.#depth + this.#threshold[2] - this.#div[2];
		const offY = this.#threshold[2] + lastY;
		let div = this.#layer;
		x = x + lastX === this.#inner[0] ? x + offX - this.#threshold[0] : x + offX;
		y = y + lastY === this.#inner[2] ? y + offY - 2 * this.#pad[2] : y + offY;
		return {
			div: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: x - offX,
			depth: this.#div[2],
			height: y - offY,
			offsetX: offX,
			offsetY: offZ,
			offsetZ: offY,
			layer: {
				name: `layer-${++div}`,
				color: "div"
			}
		};
	}
	#setDivLayer(data = [], filled = {
		x: 0,
		y: 0,
		full: 0
	}) {
		if (filled.full) return data;
		let { x, y } = filled;
		if (x === 0) x = this.#div[1] > this.#inner[0] ? this.#inner[0] : this.#div[1];
		y = this.#inner[2] - y > this.#div[3] ? this.#div[3] - 2 * this.#pad[2] : this.#inner[2] - y;
		if (!filled.full && filled.x > 0) {
			if (x >= this.#inner[0] && y < this.#inner[2]) {
				filled.x = 0;
				if (y < this.#inner[2] && x >= this.#inner[0]) {
					filled.y += y;
					y = this.#inner[2] - y > this.#div[3] ? this.#div[3] - this.#threshold[2] - 2 * this.#pad[2] : this.#inner[2] - y - 2 * this.#pad[2];
				}
			}
			x = this.#inner[0] - x === 0 ? this.#div[1] : this.#inner[0] - x;
		}
		const lastX = structuredClone(x);
		data.push(this.#defineDivSize(x, y, filled.x, filled.y));
		filled.x += lastX;
		if (filled.x === this.#inner[0] && filled.y + y === this.#inner[2]) filled.full = true;
		return this.#setDivLayer(data, filled);
	}
	get standardDiv() {
		return this.#setDivLayer();
	}
	get sameSizeDiv() {
		return this.#setDivSameSize();
	}
};
//#endregion
//#region app/plotter/Plotly.works.label.mjs
var WorksLabel = class {
	#data;
	#config;
	constructor() {
		this.#config = {
			type: "scatter3d",
			mode: "text",
			x: [],
			y: [],
			z: [],
			text: [],
			textposition: "middle center",
			showlegend: false,
			hoverinfo: "none"
		};
	}
	#defineHugeLabel() {
		const { x, y, z, info, code, name, angle, align, base } = this.#data;
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		const rotX = {
			valY: y * cosAngle - z * sinAngle + base,
			valZ: y * sinAngle + z * cosAngle + align
		};
		this.#config.x.push(x);
		this.#config.y.push(rotX.valY);
		this.#config.z.push(rotX.valZ);
		this.#config.text.push(code);
		this.#config.legendgroup = name;
		info.push(this.#config);
		return info;
	}
	#defineLabel() {
		const { x, y, z, info, code, name } = this.#data;
		this.#config.x.push(x);
		this.#config.y.push(y);
		this.#config.z.push(z);
		this.#config.text.push(code);
		this.#config.legendgroup = name;
		this.#config.name = name;
		info.push(this.#config);
		return info;
	}
	get setLabel() {
		return this.#defineLabel();
	}
	get setHugeLabel() {
		return this.#defineHugeLabel();
	}
	set data(info) {
		this.#data = info;
	}
};
//#endregion
//#region app/plotter/Plotly.design.works.mjs
var DesignPlotter = class {
	#data;
	#list;
	#angle;
	#depth;
	#height;
	#baseSize;
	constructor(list, data, baseSize, info = false) {
		if (info) {
			const { angle, baseSize, extraHeight, extraLength } = info;
			this.#angle = angle;
			this.#depth = extraLength;
			this.#height = extraHeight;
			this.#baseSize = baseSize;
		} else {
			this.#baseSize = baseSize;
			this.#data = data;
		}
		this.#data = data;
		this.#list = list;
	}
	#buildTraceAndFillTubes() {
		let meta = structuredClone(this.#data);
		const fill = new DesignWalls();
		const label = new WorksLabel();
		let tmp;
		this.#list.map((info) => {
			info.map((data, i) => {
				const { div, layer, offsetX, offsetY, offsetZ, width, depth, height, code } = data;
				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
					next: i
				};
				meta = fill.designTubes;
				if (code) {
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 6,
						z: offsetZ + height / 6,
						code
					};
					meta = label.setLabel;
				}
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			}, 0);
			return info;
		});
		return meta;
	}
	#buildTraceAndFillHuge() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const label = new WorksLabel();
		let tmp;
		this.#list.map((info) => {
			info.map((data) => {
				const { div, layer, art, offsetX, offsetY, offsetZ, width, depth, height, code } = data;
				trace.data = {
					info: this.#data,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
					angle: this.#angle,
					base: this.#height,
					align: this.#depth
				};
				this.#data = trace.defineHugeTrace;
				if (code) {
					label.data = {
						angle: this.#angle,
						align: this.#depth,
						base: this.#height,
						info: this.#data,
						x: offsetX + width / 2,
						y: -this.#depth,
						z: offsetZ + height / 2,
						code
					};
					this.#data = label.setHugeLabel;
				}
				fill.objectData = {
					width,
					depth,
					height,
					info: this.#data,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
					angle: this.#angle,
					align: this.#depth,
					base: this.#height
				};
				this.#data = fill.largestCanvas;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return this.#data;
	}
	#buildTraceAndFill() {
		let meta = structuredClone(this.#data);
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let tmp;
		this.#list.map((info) => {
			info.map((data) => {
				const { div, layer, art, offsetX, offsetY, offsetZ, width, depth, height, code } = data;
				trace.data = {
					info: meta,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true
				};
				meta = trace.defineTrace;
				if (code) {
					const label = new WorksLabel();
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 2,
						z: offsetZ + height / 2,
						name: layer.name,
						code
					};
					meta = label.setLabel;
				}
				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ
				};
				meta = fill.designSides;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return meta;
	}
	get tubesDesign() {
		return this.#buildTraceAndFillTubes();
	}
	get squaredDesign() {
		return this.#buildTraceAndFill();
	}
	get hugeDesign() {
		return this.#buildTraceAndFillHuge();
	}
};
//#endregion
//#region app/plotter/Plotly.layer.position.work.class.mjs
var PositionWorksInSideCrate = class {
	#crate;
	#data;
	#info;
	#threshold;
	#div;
	#pad;
	#inner;
	#type;
	#pine;
	constructor(data, meta, type = "standardCrate") {
		const { finalSize, innerSize } = data;
		this.#type = type;
		this.#crate = {
			sized: finalSize,
			innerSize,
			type
		};
		this.#data = meta;
		this.#info = data;
		this.#threshold = [];
		this.#inner = innerSize;
	}
	/**
	* @method - selected woods for crating
	* @param { Array: String: Number } materials all wood types
	*/
	#woodUsedMaterials(materials) {
		[
			materials.find((list) => list.at(-1) === "Pinewood"),
			materials.find((list) => list.at(-1) === "Wooden Post"),
			materials.find((list) => list.at(-1) === "Plywood")
		].map((wood) => {
			if (wood.at(-1) === "Wooden Post") {
				this.#threshold[2] += wood[3];
				return wood;
			} else if (wood.at(-1) === "Pinewood") {
				this.#threshold[0] += wood[2];
				this.#threshold[1] += wood[2];
				this.#pine = wood;
				return wood;
			}
			this.#threshold[0] += wood[2];
			this.#threshold[1] += wood[2];
			this.#threshold[2] += this.#type === "huge" && wood.at(-1) === "Plywood" ? wood[2] * 3 : wood[2];
			return wood;
		});
	}
	/**
	* @method - fill all material used to each crate side
	* @param { Array:String } used - all selected materials to the crate
	*/
	#fillCrateThresholdData(used) {
		this.#pad = used.find((list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5);
		this.#div = used.find((list) => list.at(-1) === "Foam Sheet" && list[2] <= 2.5);
		this.#threshold[0] = this.#pad[2];
		this.#threshold[1] = this.#pad[2];
		this.#threshold[2] = this.#pad[2];
		this.#div[1] = +this.#div[1];
		this.#div[2] = +this.#div[2];
		this.#div[3] = +this.#div[3];
		this.#woodUsedMaterials(used);
	}
	#traceColor() {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
		return color;
	}
	#worksOffset(works, depth, layer) {
		Object.entries(works).map((data) => {
			const { coordinates, code, art } = data[1];
			const offY = coordinates.y - this.#pad[2];
			const x = this.#threshold[0];
			const y = coordinates.y ? this.#threshold[2] + offY : this.#threshold[2];
			const z = this.#threshold[1] + coordinates.z + depth;
			data[1].layer = {
				code,
				name: `layer-${layer}`,
				color: this.#traceColor()
			};
			art.map((info, i) => {
				switch (i) {
					case 0:
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.y === 0) info.y = y;
						if (info.z === 0) info.z = z;
						return info;
					case 1:
						if (info.y === 0) info.y = y;
						if (info.z === 0) info.z = z;
						return info;
					case 2:
						if (info.z === 0) info.z = z;
						return info;
					case 3:
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.z === 0) info.z = z;
						return info;
					case 4:
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.y === 0) info.y = y;
						return info;
					case 5:
						if (info.y === 0) info.y = y;
						return art;
					case 7:
						if (info.x === 0) info.x = x + coordinates.x;
						return info;
				}
				return info;
			}, 0);
			return data;
		});
		return works;
	}
	#populateLayerTubeCrate() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		const gap = 10;
		let heightSum = 0;
		let thickness = 0;
		switch (layers.length) {
			case 2:
				this.#threshold[1] += 3 * this.#pad[2];
				this.#threshold[2] += 2 * this.#pine[2] + 2 * this.#pad[2];
				break;
			case 3:
				this.#threshold[1] *= 2;
				this.#threshold[2] = 2 * this.#threshold[2] + this.#pine[2];
				break;
			default:
				this.#threshold[1] += this.#pad[2];
				this.#threshold[2] += 2 * this.#pine[2] + this.#pad[2];
		}
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(info.work, artLocation.get(info.work[0]), heightSum, this.#threshold, this.#pad);
				heightSum += +info.work[3] + gap;
				return position.tubes;
			});
			const checkGap = vacuum.length > 1;
			onLayers.push(this.#worksOffset(allWorks, heightSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) new FillGaps({
				vacuum,
				maxZ: fillGaps,
				offZ: +(heightSum + this.#threshold[2]).toFixed(3),
				pad: this.#pad,
				div: 0,
				offset: this.#threshold
			}, i + 1).fill;
			thickness = 0;
			return data;
		}, 0);
		return new DesignPlotter(onLayers, this.#data).tubesDesign;
	}
	#populateLayerNotCanvas() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				return new WorksPosition(info.work, artLocation.get(info.work[0]), depthSum, this.#threshold, this.#pad).noCanvas;
			});
			const checkGap = vacuum.length > 1;
			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) new FillGaps({
				vacuum,
				maxZ: fillGaps,
				offZ: +(depthSum + this.#threshold[1]).toFixed(3),
				pad: this.#pad,
				div: this.#div,
				offset: this.#threshold
			}, i + 1).fill;
			depthSum += +thickness.toFixed(3);
			thickness = 0;
			return data;
		}, 0);
		return new DesignPlotter(onLayers, this.#data).squaredDesign;
	}
	#populateLayerHugeCanvas() {
		const { layers, fillGaps, artLocation, finalSize, extra } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				return new WorksPosition(info.work, artLocation.get(info.work[0]), depthSum, this.#threshold, this.#pad).largestCanvas;
			});
			const checkGap = vacuum.length > 1;
			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) new FillGaps({
				vacuum,
				maxZ: fillGaps,
				offZ: +(depthSum + this.#threshold[1]).toFixed(3),
				pad: this.#pad,
				div: this.#div,
				offset: this.#threshold
			}, i + 1).fill;
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(this.#pad, this.#threshold, i + 1, depthSum, structuredClone(this.#inner), this.#div);
				onLayers.push(div.standardDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		return new DesignPlotter(onLayers, this.#data, finalSize, extra).hugeDesign;
	}
	#populateLayerSameSizes() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				return new WorksPosition(info.work, artLocation.get(info.work[0]), depthSum, this.#threshold, this.#pad).standardCanvas;
			});
			const checkGap = vacuum.length > 1;
			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) new FillGaps({
				vacuum,
				maxZ: fillGaps,
				offZ: +(depthSum + this.#threshold[1]).toFixed(3),
				pad: this.#pad,
				div: this.#div,
				offset: this.#threshold
			}, i + 1).fill;
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(this.#pad, this.#threshold, i + 1, depthSum, structuredClone(this.#inner), this.#div);
				onLayers.push(div.sameSizeDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		return new DesignPlotter(onLayers, this.#data).squaredDesign;
	}
	#populateLayerStandard() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				return new WorksPosition(info.work, artLocation.get(info.work[0]), depthSum, this.#threshold, this.#pad).standardCanvas;
			});
			const checkGap = vacuum.length > 1;
			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) new FillGaps({
				vacuum,
				maxZ: fillGaps,
				offZ: +(depthSum + this.#threshold[1]).toFixed(3),
				pad: this.#pad,
				div: this.#div,
				offset: this.#threshold
			}, i + 1).fill;
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(this.#pad, this.#threshold, i + 1, depthSum, structuredClone(this.#inner), this.#div);
				onLayers.push(div.standardDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		return new DesignPlotter(onLayers, this.#data).squaredDesign;
	}
	#defineWorksLocation() {
		switch (this.#crate.type) {
			case "tubeCrate": return this.#populateLayerTubeCrate();
			case "sameSizeCrate": return this.#populateLayerSameSizes();
			case "largestCrate": return this.#populateLayerHugeCanvas();
			case "noCanvasCrate": return this.#populateLayerNotCanvas();
			case "standardCrate": return this.#populateLayerStandard();
		}
	}
	get arrange() {
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => this.#info.usedMaterials.get(opt));
		this.#fillCrateThresholdData(used);
		return this.#defineWorksLocation();
	}
};
//#endregion
//#region app/plotter/Plotly.large.bottom.mjs
var LargeBottomCrate = class {
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
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		this.#angle = angle;
		this.#leanPines = leanSupport;
		this.#extraDepth = extraLength;
		this.#base = structuredClone(baseSize);
		this.#foot = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#sized = [
			finalSize[0],
			finalSize[1] - baseSize[1],
			finalSize[2]
		];
		this.#foot[1] = +this.#foot[1];
		this.#foot[2] = +this.#foot[2];
		this.#foot[3] = +this.#foot[3];
	}
	#setExtraFeet(offX) {
		const offZ = -this.#extraDepth;
		const offY = 2 * this.#ply[2] + this.#foot[3];
		const x = this.#foot[2] + offX;
		const y = this.#foot[2] + offY;
		const z = -this.#sized[1] - this.#base[1];
		const adjacent = +(+this.#foot[3] / Math.cos(this.#angle)).toFixed(5);
		const angleTan = +Math.atan(this.#foot[3] / adjacent).toFixed(5);
		const realAngle = Math.PI / 180 * 90 - angleTan;
		const leanCut = -Math.ceil(+this.#foot[3] / Math.cos(realAngle)) + this.#foot[3] + offZ;
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				},
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: leanCut
				},
				{
					x: offX,
					y,
					z: leanCut
				}
			],
			width: 0,
			depth: 0,
			height: 0,
			offsetX: 0,
			offsetY: 0,
			offsetZ: 0
		};
	}
	#defineVerticalPineStructureSupport(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = -this.#sized[1] - this.#base[1] + +this.#pine[3];
		const x = offX > 0 ? offX - +this.#pine[2] : +this.#pine[2];
		const hipotenusa = +this.#pine[3] / Math.sin(this.#angle);
		const y = this.#leanPines - this.#foot[3];
		const extraY = Math.floor(y + Math.sqrt(hipotenusa ** 2 - this.#pine[3] ** 2));
		const z = -this.#sized[1] - this.#base[1];
		return { coordinates: [
			{
				x: offX,
				y: offY,
				z
			},
			{
				x,
				y: offY,
				z
			},
			{
				x,
				y: extraY,
				z
			},
			{
				x: offX,
				y: extraY,
				z
			},
			{
				x: offX,
				y: offY,
				z: offZ
			},
			{
				x,
				y: offY,
				z: offZ
			},
			{
				x,
				y,
				z: offZ
			},
			{
				x: offX,
				y,
				z: offZ
			}
		] };
	}
	#defineHorizontalPineStructureSupport(lastY, lastZ) {
		const baseOffSet = 2 * +this.#foot[3] + 2 * +this.#ply[2];
		const angleRad = Math.PI / 180 * (90 / 2);
		const offY = lastZ === 0 ? Math.floor(this.#pine[3] * Math.sin(angleRad)) + baseOffSet + lastY : baseOffSet + lastY;
		const offZ = -this.#sized[1] - this.#base[1] + +this.#pine[3] - lastZ;
		const x = this.#sized[0];
		const y = lastZ === 0 ? +this.#pine[3] + offY : offY + +this.#pine[3];
		const z = -this.#sized[1] - this.#base[1] + +this.#pine[3] + +this.#pine[2] - lastZ;
		return {
			coordinates: [
				{
					x: 0,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: 0,
					y,
					z
				},
				{
					x: 0,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: 0,
					y,
					z: offZ
				}
			],
			lastY: +this.#pine[3]
		};
	}
	#defineVerticalPineStructureSupportEnforcement(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = -this.#sized[1] - this.#base[1] + 2 * +this.#pine[3];
		const x = offX > 0 ? offX - +this.#pine[2] : +this.#pine[2];
		const y = offY + this.#foot[3];
		const angleRad = Math.PI / 180 * (90 / 2);
		const extraY = Math.floor(this.#pine[3] * Math.sin(angleRad)) + y;
		const z = -this.#sized[1] - this.#base[1] + +this.#pine[3];
		return { coordinates: [
			{
				x: offX,
				y: offY,
				z
			},
			{
				x,
				y: offY,
				z
			},
			{
				x,
				y: extraY,
				z
			},
			{
				x: offX,
				y: extraY,
				z
			},
			{
				x: offX,
				y: offY,
				z: offZ
			},
			{
				x,
				y: offY,
				z: offZ
			},
			{
				x,
				y,
				z: offZ
			},
			{
				x: offX,
				y,
				z: offZ
			}
		] };
	}
	#defineSecondVerticalPineStructureSupportEnforcement(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = -this.#extraDepth;
		const x = offX > 0 ? offX - +this.#pine[2] : +this.#pine[2];
		const hipotenusa = +this.#pine[3] / Math.sin(this.#angle);
		const y = offY;
		const extraY = Math.floor(y + Math.sqrt(hipotenusa ** 2 - this.#pine[3] ** 2));
		const z = -this.#extraDepth - this.#pine[3];
		return { coordinates: [
			{
				x: offX,
				y: offY,
				z
			},
			{
				x,
				y: offY,
				z
			},
			{
				x,
				y: extraY,
				z
			},
			{
				x: offX,
				y: extraY,
				z
			},
			{
				x: offX,
				y: offY,
				z: offZ
			},
			{
				x,
				y: offY,
				z: offZ
			},
			{
				x,
				y,
				z: offZ
			},
			{
				x: offX,
				y,
				z: offZ
			}
		] };
	}
	#defineThirdVerticalPineStructureSupportEnforcement(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = -this.#extraDepth - this.#pine[3];
		const x = offX > 0 ? offX - +this.#pine[2] : +this.#pine[2];
		const hipotenusa = +this.#pine[3] / Math.sin(this.#angle);
		const y = offY;
		const extraY = Math.floor(y + Math.sqrt(hipotenusa ** 2 - this.#pine[3] ** 2));
		const z = -this.#extraDepth - 2 * this.#pine[3];
		return { coordinates: [
			{
				x: offX,
				y: offY,
				z
			},
			{
				x,
				y: offY,
				z
			},
			{
				x,
				y,
				z
			},
			{
				x: offX,
				y,
				z
			},
			{
				x: offX,
				y: offY,
				z: offZ
			},
			{
				x,
				y: offY,
				z: offZ
			},
			{
				x,
				y: extraY,
				z: offZ
			},
			{
				x: offX,
				y: extraY,
				z: offZ
			}
		] };
	}
	#defineSecondVerticalPineStructureSupport(offX) {
		const offY = +this.#foot[3] + 2 * +this.#ply[2];
		const offZ = -this.#sized[1] - this.#base[1] + 3 * +this.#pine[3];
		const x = offX > 0 ? offX - +this.#pine[2] : +this.#pine[2];
		const hipotenusa = +this.#pine[3] / Math.sin(this.#angle);
		const catectOpp = this.#sized[1] - this.#extraDepth - +this.#pine[3];
		const y = Math.ceil(catectOpp / Math.sin(this.#angle)) + this.#foot[3];
		const extraY = Math.floor(y + Math.sqrt(hipotenusa ** 2 - this.#pine[3] ** 2));
		const z = -this.#sized[1] - this.#base[1] + 2 * +this.#pine[3];
		return { coordinates: [
			{
				x: offX,
				y: offY,
				z
			},
			{
				x,
				y: offY,
				z
			},
			{
				x,
				y: extraY,
				z
			},
			{
				x: offX,
				y: extraY,
				z
			},
			{
				x: offX,
				y: offY,
				z: offZ
			},
			{
				x,
				y: offY,
				z: offZ
			},
			{
				x,
				y,
				z: offZ
			},
			{
				x: offX,
				y,
				z: offZ
			}
		] };
	}
	#verticalPinesEnforcement(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const { coordinates } = this.#defineVerticalPineStructureSupportEnforcement(offX);
			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
			offX += offX + pineSpanCm >= +this.#ply[1] ? pineSpanCm - half : pineSpanCm;
			if (offX >= this.#sized[0] - pineSpanCm) offX = this.#sized[0];
		}
		return info;
	}
	#thirdVerticalPinesEnforcement(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const { coordinates } = this.#defineThirdVerticalPineStructureSupportEnforcement(offX);
			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
			offX += offX + pineSpanCm >= +this.#ply[1] ? pineSpanCm - half : pineSpanCm;
			if (offX >= this.#sized[0] - pineSpanCm) offX = this.#sized[0];
		}
		return info;
	}
	#secondVerticalPinesEnforcement(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const { coordinates } = this.#defineSecondVerticalPineStructureSupportEnforcement(offX);
			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
			offX += offX + pineSpanCm >= +this.#ply[1] ? pineSpanCm - half : pineSpanCm;
			if (offX >= this.#sized[0] - pineSpanCm) offX = this.#sized[0];
		}
		return info;
	}
	#secondVerticalPines(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const { coordinates } = this.#defineSecondVerticalPineStructureSupport(offX);
			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
			offX += offX + pineSpanCm >= +this.#ply[1] ? pineSpanCm - half : pineSpanCm;
			if (offX >= this.#sized[0] - pineSpanCm) offX = this.#sized[0];
		}
		return info;
	}
	#horizontalPinesEnforcement(info) {
		const trace = new TraceMaker();
		const enforcements = {
			enforce1: 0,
			enforce2: 0
		};
		let offY = 0;
		let offZ = 0;
		while (enforcements.enforce1 < 2 || enforcements.enforce2 < 2) {
			const { coordinates, lastY } = this.#defineHorizontalPineStructureSupport(offY, offZ);
			enforcements.enforce1 < 2 ? enforcements.enforce1++ : enforcements.enforce2++;
			offY = lastY;
			if (enforcements.enforce1 === 2 && enforcements.enforce2 === 0) {
				offY = 0;
				offZ = -2 * +this.#pine[3];
			} else offY = lastY;
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
		}
		return info;
	}
	#verticalPines(info) {
		const pineSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / pineSpanCm) + 1;
		const trace = new TraceMaker();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const { coordinates } = this.#defineVerticalPineStructureSupport(offX);
			if (offX === 0) offX = +this.#foot[2] + +this.#pine[2];
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
			};
			info = trace.defineTrace;
			offX += offX + pineSpanCm >= +this.#ply[1] ? pineSpanCm - half : pineSpanCm;
			if (offX >= this.#sized[0] - pineSpanCm) offX = this.#sized[0];
		}
		return info;
	}
	#extraFeet(info) {
		const feetSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const half = +this.#foot[2] / 2;
		let offX = +this.#pine[2];
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const newFoot = this.#sized[0] / (addFeet * feetSpanCm) >= 1;
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = this.#setExtraFeet(offX);
			if (offX === +this.#pine[2]) offX = 0;
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
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
				offsetZ
			};
			info = fill.designSides;
			if (newFoot) offX += offX + feetSpanCm === +this.#ply[1] ? feetSpanCm - half : feetSpanCm;
			if (offX >= this.#sized[0] - feetSpanCm) offX = this.#sized[0] - +this.#foot[2] - +this.#pine[2];
		}
		return info;
	}
	#defineLargeFeet(offX) {
		const x = this.#foot[2] + offX;
		const y = this.#foot[2];
		const z = -this.#sized[1] - this.#base[1];
		const offZ = -this.#extraDepth;
		return {
			coordinates: [
				{
					x: offX,
					y: 0,
					z
				},
				{
					x,
					y: 0,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				},
				{
					x: offX,
					y: 0,
					z: offZ
				},
				{
					x,
					y: 0,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				}
			],
			width: x - offX,
			depth: this.#sized[1],
			height: y,
			offsetX: offX,
			offsetY: -this.#sized[1] - this.#base[1],
			offsetZ: 0
		};
	}
	#setAllLargeParts(info, large = false) {
		const feetSpanCm = 100;
		const counter = Math.floor(this.#sized[0] / feetSpanCm) + 1;
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const half = +this.#foot[2] / 2;
		let offX = 0;
		let addFeet = 0;
		while (addFeet++ <= counter) {
			const newFoot = large && this.#sized[0] / (addFeet * feetSpanCm) >= 1;
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = this.#defineLargeFeet(offX);
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
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
				offsetZ
			};
			info = fill.designSides;
			if (!large) offX += this.#sized[0] > +this.#ply[1] ? +this.#ply[1] : this.#sized[0];
			else if (newFoot) offX += offX + feetSpanCm === +this.#ply[1] ? feetSpanCm - half : feetSpanCm;
			if (offX >= this.#sized[0] - feetSpanCm) offX = this.#sized[0] - +this.#foot[2];
		}
		return info;
	}
	#defineLargeBaseSheet(counter, offX) {
		const offZ = -this.#extraDepth;
		const offY = counter > 1 ? +this.#ply[2] + +this.#foot[3] : +this.#foot[3];
		const x = offX === 0 ? +this.#ply[1] : +(this.#sized[0] - offX + offX).toFixed(3);
		const y = counter * +this.#ply[2] + +this.#foot[3];
		const z = -this.#sized[1] - this.#base[1];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				},
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				}
			],
			width: x - offX,
			depth: this.#sized[1],
			height: +this.#ply[2],
			offsetX: offX,
			offsetY: -this.#sized[1] - this.#base[1],
			offsetZ: y - +this.#ply[2],
			lastX: x
		};
	}
	#setSheets(info, counter, offY, nextX = 0) {
		if (counter < 0) return info;
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const { coordinates, offsetX, offsetY, offsetZ, width, depth, height, lastX } = this.#defineLargeBaseSheet(offY, nextX);
		nextX = lastX;
		trace.data = {
			info,
			coordinates,
			name: "frame",
			show: false
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
			offsetZ
		};
		info = fill.designSides;
		return this.#setSheets(info, counter - 1, offY, nextX);
	}
	#setBaseSheet(meta) {
		let layers = 2;
		let offY = 1;
		const sheets = this.#sized[0] / +this.#ply[1];
		while (layers--) {
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
		this.#secondVerticalPines(meta);
		this.#verticalPinesEnforcement(meta);
		this.#secondVerticalPinesEnforcement(meta);
		this.#thirdVerticalPinesEnforcement(meta);
		this.#horizontalPinesEnforcement(meta);
		return meta;
	}
	get largeBottom() {
		if (!this.#foot || !this.#sized) return false;
		return this.#designLargeBottom();
	}
};
//#endregion
//#region app/plotter/Largest.Canvas.Render.class.mjs
var largestCrateRender = class {
	#crates;
	#layout;
	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	}
	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				let meta = new LargeBottomCrate(data.at(-1)[0]).largeBottom;
				meta = new LargeCratesFrame(meta, data.at(-1)[0]).setFrame;
				meta = new SetCrateWalls(meta, data.at(-1)[0]).setHugeWalls;
				meta = new PaddingLargeCrate(meta, data.at(-1)[0]).setPaddingHuge;
				meta = new PositionWorksInSideCrate(data.at(-1)[0], meta, "largestCrate").arrange;
				return meta;
			}
			return data;
		}, 0);
		return result.length ? {
			result: result[0],
			meta: this.#layout
		} : false;
	}
	get composeCrate() {
		return this.#startDrawing();
	}
};
//#endregion
//#region app/plotter/Frame.crate.graphic.mjs
var CratesFrame = class {
	#sized;
	#pine;
	#feet;
	#meta;
	#ply;
	constructor(meta, data) {
		const { finalSize } = data;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		this.#meta = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#sized = finalSize;
		this.#pine[1] = +this.#pine[1];
		this.#pine[2] = +this.#pine[2];
		this.#pine[3] = +this.#pine[3];
	}
	#offsetFrame() {
		return {
			offsetFacesRightBackV: {
				type: "faceV",
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: 0,
				offsetZ: +this.#feet[3] + this.#pine[3]
			},
			offsetFacesLeftBackV: {
				type: "faceVR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: 0,
				offsetZ: +this.#feet[3] + this.#pine[3]
			},
			offsetFacesRightFrontV: {
				type: "faceVB",
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: +this.#feet[3] + this.#pine[3]
			},
			offsetFacesLeftFrontV: {
				type: "faceVBR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: +this.#feet[3] + this.#pine[3]
			},
			offsetSidesRightVUp: {
				type: "sideHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2])
			},
			offsetSidesLeftVUp: {
				type: "sideLeftHUp",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2])
			},
			offsetSidesRightHDown: {
				type: "sideHDown",
				x: 0,
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2]
			},
			offsetSidesLeftHDown: {
				type: "sideLeftHDown",
				x: this.#sized[0],
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2]
			},
			offsetFacesBackUpH: {
				type: "faceHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3])
			},
			offsetFacesBackDownH: {
				type: "faceH",
				x: 0,
				y: 2 * this.#pine[2],
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: 2 * this.#pine[2]
			},
			offsetFacesFrontUpH: {
				type: "faceHBackUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3])
			},
			offsetFacesFrontDownH: {
				type: "faceHBackDown",
				x: 0,
				y: 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: 2 * this.#pine[2]
			},
			offsetSidesRightVBack: {
				type: "sideV",
				x: 0,
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3]
			},
			offsetSidesRightVFront: {
				type: "sideRightFrontV",
				x: 0,
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3]
			},
			offsetSidesLeftVBack: {
				type: "sideLeftV",
				x: this.#sized[0],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3]
			},
			offsetSidesLeftVFront: {
				type: "sideLeftFrontV",
				x: this.#sized[0],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3]
			},
			offsetTopFrontH: {
				type: "topFace",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetTopBackH: {
				type: "topComp",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetTopRight: {
				type: "topFeet",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			},
			offsetTopLeft: {
				type: "topLeftFeet",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2]
			}
		};
	}
	#defineFrameComponents() {
		const upFeet = 2 * this.#pine[2];
		const vertical = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const rightFeet = this.#sized[0] - this.#pine[3];
		const vDepth = this.#sized[1] - this.#pine[2];
		const upFace = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const tinySide = this.#sized[1] - this.#pine[2];
		const tinyRightSide = this.#sized[0] - this.#pine[2];
		const sideComp = this.#pine[3] + this.#pine[2];
		const rightComp = this.#sized[0] - this.#pine[3] - this.#pine[2];
		const topZ = this.#sized[2];
		const topzComp = this.#sized[1] - this.#pine[3];
		return {
			feet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: this.#pine[2],
					z: 0
				},
				{
					x: 0,
					y: this.#pine[2],
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: this.#pine[2],
					z: this.#sized[1]
				},
				{
					x: 0,
					y: this.#pine[2],
					z: this.#sized[1]
				}
			],
			feetR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: this.#pine[2],
					z: 0
				},
				{
					x: 0,
					y: this.#pine[2],
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: this.#pine[2],
					z: this.#sized[1]
				},
				{
					x: 0,
					y: this.#pine[2],
					z: this.#sized[1]
				}
			],
			feetUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: upFeet,
					z: 0
				},
				{
					x: 0,
					y: upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: upFeet,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFeet,
					z: this.#sized[1]
				}
			],
			feetUpR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: upFeet,
					z: 0
				},
				{
					x: 0,
					y: upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: upFeet,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFeet,
					z: this.#sized[1]
				}
			],
			faceV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: sideComp,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: sideComp,
					y: vertical,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: vertical,
					z: this.#pine[2]
				}
			],
			faceVR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: rightComp,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: rightComp,
					y: vertical,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: vertical,
					z: this.#pine[2]
				}
			],
			faceVB: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: 0,
					z: 0
				},
				{
					x: sideComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: sideComp,
					y: 0,
					z: vDepth
				},
				{
					x: sideComp,
					y: vertical,
					z: vDepth
				},
				{
					x: 0,
					y: vertical,
					z: vDepth
				}
			],
			faceVBR: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: 0,
					z: 0
				},
				{
					x: rightComp,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: rightComp,
					y: 0,
					z: vDepth
				},
				{
					x: rightComp,
					y: vertical,
					z: vDepth
				},
				{
					x: 0,
					y: vertical,
					z: vDepth
				}
			],
			faceH: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + upFeet,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: this.#pine[2]
				}
			],
			faceHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: 0,
					z: this.#pine[2]
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: this.#pine[2]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[2]
				}
			],
			faceHBackUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: upFace,
					z: vDepth
				},
				{
					x: 0,
					y: upFace,
					z: vDepth
				}
			],
			faceHBackDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: 0,
					z: 0
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: 0,
					z: vDepth
				},
				{
					x: this.#sized[0],
					y: this.#pine[3] + upFeet,
					z: vDepth
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: vDepth
				}
			],
			sideHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: vertical,
					z: tinySide
				},
				{
					x: 0,
					y: vertical,
					z: tinySide
				}
			],
			sideLeftHUp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: vertical,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: vertical,
					z: tinySide
				},
				{
					x: 0,
					y: vertical,
					z: tinySide
				}
			],
			sideHDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: 0,
					z: tinySide
				},
				{
					x: this.#pine[2],
					y: this.#pine[3] + upFeet,
					z: tinySide
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: tinySide
				}
			],
			sideLeftHDown: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: 0,
					z: tinySide
				},
				{
					x: tinyRightSide,
					y: this.#pine[3] + upFeet,
					z: tinySide
				},
				{
					x: 0,
					y: this.#pine[3] + upFeet,
					z: tinySide
				}
			],
			sideV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: this.#pine[2],
					y: 0,
					z: this.#pine[3]
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[3]
				}
			],
			sideRightFrontV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[2],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[2],
					y: upFace,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFace,
					z: this.#sized[1]
				}
			],
			sideLeftV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: tinyRightSide,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: upFace,
					z: this.#pine[3]
				}
			],
			sideLeftFrontV: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: 0,
					z: 0
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: upFace,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: tinyRightSide,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: tinyRightSide,
					y: upFace,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: upFace,
					z: this.#sized[1]
				}
			],
			topFace: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#pine[3]
				},
				{
					x: rightFeet,
					y: topZ,
					z: this.#pine[3]
				},
				{
					x: 0,
					y: topZ,
					z: this.#pine[3]
				}
			],
			topComp: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: 0,
					z: topzComp
				},
				{
					x: rightFeet,
					y: topZ,
					z: topzComp
				},
				{
					x: 0,
					y: topZ,
					z: topzComp
				}
			],
			topFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: 0,
					z: 0
				},
				{
					x: this.#pine[3],
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: 0,
					z: this.#sized[1]
				},
				{
					x: this.#pine[3],
					y: topZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: topZ,
					z: this.#sized[1]
				}
			],
			topLeftFeet: [
				{
					x: 0,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: 0,
					z: 0
				},
				{
					x: rightFeet,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: topZ,
					z: 0
				},
				{
					x: 0,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: 0,
					z: this.#sized[1]
				},
				{
					x: rightFeet,
					y: topZ,
					z: this.#sized[1]
				},
				{
					x: 0,
					y: topZ,
					z: this.#sized[1]
				}
			]
		};
	}
	#definePosition(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);
		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 1:
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 2:
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 3:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 4:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 5:
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 7:
					if (data[1].x === 0) data[1].x = x;
					return data;
			}
			return data;
		});
		return change;
	}
	#bluePrintExtraPineHorizontal({ x, y, z }, lastX) {
		const offX = lastX === 0 && this.#sized[0] !== x ? this.#pine[3] + this.#pine[2] : lastX - 2 * this.#pine[3];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1] - this.#pine[2];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#pine[3] - this.#pine[2] : x - lastX,
			depth: z === this.#pine[3] ? z : -offZ + z,
			height: y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#pine[3],
			offsetY: z === this.#pine[2] ? offZ : this.#sized[1] - this.#pine[2],
			offsetZ: offY
		};
	}
	#bluePrintExtraPineDepth({ x, y, z }, lastX) {
		const offX = lastX === 0 ? 0 : this.#sized[0];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);
		const offZ = this.#pine[3];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? this.#pine[2] : lastX - this.#pine[2],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX,
			offsetY: offZ,
			offsetZ: offY
		};
	}
	#bluePrintExtraPineVertical({ x, y, z }, lastX, lastY) {
		const offX = lastX + +this.#ply[1] - +this.#pine[3] / 2 + this.#pine[2];
		const offY = lastY === 0 ? +this.#feet[3] + this.#pine[3] : this.#sized[2] - this.#pine[3] - this.#pine[2];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: this.#pine[3],
			depth: this.#pine[2],
			height: y - offY,
			offsetX: offX,
			offsetY: z === this.#pine[2] ? offZ : z,
			offsetZ: offY
		};
	}
	#bluePrintExtraPineTop({ x, y, z }) {
		const offX = +this.#ply[1] + +this.#ply[2] + this.#pine[3] / 2;
		const offY = this.#sized[2] - this.#pine[2];
		const offZ = this.#pine[3];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: this.#pine[3],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX - this.#pine[3],
			offsetY: offZ,
			offsetZ: offY
		};
	}
	#setFacesExtraPineHorizontal(data) {
		let { x, y, z, faceA } = data;
		if (x === 0) x = this.#pine[1] > this.#sized[0] ? this.#sized[0] - this.#pine[3] - this.#pine[2] : this.#pine[1] + this.#pine[3] + this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = faceA === 0 ? this.#pine[2] : this.#sized[1];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return {
			x,
			y,
			z
		};
	}
	#setFacesExtraPineVertical(data) {
		let { x, y, z, faceA } = data;
		x += +this.#ply[1] - this.#pine[3] / 2 + this.#pine[3] + this.#pine[2];
		y = y === 0 ? +this.#ply[3] - this.#pine[3] / 2 : y + this.#pine[3];
		z = faceA === 0 ? this.#pine[2] : this.#sized[1] - this.#pine[2];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return {
			x,
			y,
			z
		};
	}
	#setTopExtraPine(data) {
		let { x, y, z } = data;
		x = +this.#ply[1] - this.#pine[3] / 2 + this.#pine[2];
		y = this.#sized[2];
		z = this.#sized[1] - this.#pine[3];
		return {
			x,
			y,
			z
		};
	}
	#setFacesExtraPineSides(data) {
		let { x, y, z, right } = data;
		if (right === 0) x = this.#pine[2];
		else x = this.#sized[0] - this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = this.#sized[1] - this.#pine[3];
		return {
			x,
			y,
			z
		};
	}
	#frontAndBackFacesPineJoinVertical(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineVertical(join);
		data.push(this.#bluePrintExtraPineVertical(extraPine, join.x, join.y));
		join.y += extraPine.y;
		if (join.y >= this.#sized[2] && faceA === 0) {
			join.faceA = 1;
			join.y = 0;
		} else if (faceA === 1 && join.y >= this.#sized[2]) join.faceB = 1;
		return this.#frontAndBackFacesPineJoinVertical(data, join);
	}
	#frontAndBackFacesPineJoinHorizontal(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineHorizontal(join);
		data.push(this.#bluePrintExtraPineHorizontal(extraPine, join.x));
		if (faceA === 0) join.faceA = 1;
		else join.faceB = 1;
		return this.#frontAndBackFacesPineJoinHorizontal(data, join);
	}
	#sidePineJoin(data, join) {
		const { right, left } = join;
		if (right === 1 && left === 1) return data;
		const extraPine = this.#setFacesExtraPineSides(join);
		data.push(this.#bluePrintExtraPineDepth(extraPine, join.x, join.y));
		join.x += extraPine.x;
		if (right === 0) join.right = 1;
		else join.left = 1;
		return this.#sidePineJoin(data, join);
	}
	#topJoinExtrapine(data, join) {
		const extraPine = this.#setTopExtraPine(join);
		data.push(this.#bluePrintExtraPineTop(extraPine));
		join.y += extraPine.x + this.#pine[3];
		if (join.y >= this.#sized[2]) join.top = 1;
		return data;
	}
	#setJoins(data) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const show = false;
		data.map((part) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = part;
			trace.data = {
				info: this.#meta,
				coordinates,
				name: "frame",
				show
			};
			this.#meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: this.#meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ
			};
			this.#meta = fill.designSides;
			return part;
		});
	}
	#extraPainForPlyJoins() {
		const lengthSize = this.#sized[0] > +this.#ply[1];
		const heightSize = this.#sized[2] > +this.#ply[3] - +this.#feet[3];
		const pineJoins = [];
		if (lengthSize) {
			this.#frontAndBackFacesPineJoinVertical(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0
			});
			this.#topJoinExtrapine(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				top: 0
			});
		}
		if (heightSize) {
			this.#frontAndBackFacesPineJoinHorizontal(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0
			});
			this.#sidePineJoin(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				right: 0,
				left: 0
			});
		}
		if (pineJoins.length > 0) this.#setJoins(pineJoins);
	}
	#setAllParts(meta, component, offsets) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let show = true;
		Object.entries(offsets).map((part) => {
			const { type, offsetX, offsetY, offsetZ, width, depth, height } = part[1];
			const design = component[type];
			const defined = this.#definePosition(part[1], design);
			trace.data = {
				info: meta,
				coordinates: defined,
				name: "frame",
				show
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ
			};
			meta = fill.designSides;
			show = false;
			return part;
		});
		return meta;
	}
	#designFrame() {
		const components = this.#defineFrameComponents();
		const offset = this.#offsetFrame();
		this.#meta = this.#setAllParts(this.#meta, components, offset);
		this.#extraPainForPlyJoins();
		return this.#meta;
	}
	get setFrame() {
		return this.#designFrame();
	}
};
//#endregion
//#region app/plotter/Padding.crate.plotly.mjs
var PaddingCrate = class {
	#data;
	#pine;
	#ply;
	#crate;
	#pad;
	#baseSize;
	#feet;
	#threshold;
	#inner;
	constructor(meta, data) {
		const { finalSize, baseSize, innerSize } = data;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
		this.#inner = innerSize;
		this.#baseSize = baseSize;
		this.#crate = finalSize;
		this.#data = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#pad = used.find((list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5);
		this.#pad[1] = +this.#pad[1];
		this.#pad[2] = +this.#pad[2];
		this.#pad[3] = +this.#pad[3];
		this.#threshold = [
			+this.#pine[2] + +this.#ply[2],
			+this.#pine[2] + +this.#ply[2],
			+this.#ply[2] + +this.#feet[3]
		];
	}
	#bluePrintFacesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX + this.#threshold[0] + this.#pad[2];
		const offZ = z + this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;
		if (x <= this.#inner[0]) x += lastX === 0 ? this.#threshold[0] + this.#pad[2] : lastX;
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] - this.#pad[2] : x - lastX - this.#threshold[0] - this.#pad[2],
			depth: this.#pad[2],
			height: lastY === 0 ? y - this.#threshold[2] : y - lastY,
			offsetX: offX,
			offsetY: z,
			offsetZ: lastY === 0 ? this.#threshold[2] : lastY
		};
	}
	#bluePrintSidesSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 && this.#inner[0] !== x ? this.#pad[2] + this.#threshold[0] : lastX - 2 * this.#pad[2];
		const offZ = this.#threshold[1];
		const offY = lastY === 0 ? this.#threshold[2] : lastY;
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] - this.#pad[2] : x - lastX,
			depth: z - this.#pad[2],
			height: lastY === 0 ? y - this.#threshold[2] : y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#pad[2],
			offsetY: offZ,
			offsetZ: lastY === 0 ? this.#threshold[2] : offY
		};
	}
	#bluePrintUpDownSchema({ x, y, z }, lastX, lastY) {
		const offX = lastX === 0 ? this.#threshold[0] + this.#pad[2] : this.#threshold[0] + lastX;
		const offZ = this.#threshold[1] + this.#pad[2];
		const offY = lastY === 0 ? lastY + this.#threshold[2] + this.#pad[2] : this.#crate[2] - this.#pad[2] - this.#pine[2] - this.#ply[2];
		x += lastX === 0 ? this.#threshold[0] : lastX + this.#pad[2];
		return {
			coordinates: [
				{
					x: offX,
					y: offY,
					z: offZ
				},
				{
					x,
					y: offY,
					z: offZ
				},
				{
					x,
					y,
					z: offZ
				},
				{
					x: offX,
					y,
					z: offZ
				},
				{
					x: offX,
					y: offY,
					z
				},
				{
					x,
					y: offY,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: lastX === 0 ? x - this.#threshold[0] - this.#pad[2] : x - lastX - this.#threshold[0],
			depth: z - 2 * this.#pad[2],
			height: lastY === 0 ? y - this.#threshold[2] + this.#pad[2] : y - lastY - this.#threshold[2] - this.#pad[2],
			offsetX: offX,
			offsetY: offZ,
			offsetZ: lastY === 0 ? this.#threshold[2] : lastY + this.#threshold[2] + this.#pad[2]
		};
	}
	#defineSizingPadFaces(filled) {
		let { x, y, z, faceA } = filled;
		if (x === 0) x = this.#pad[1] > this.#inner[0] ? this.#crate[0] - this.#threshold[0] - this.#pad[2] : this.#pad[1] + this.#pad[2];
		y = this.#inner[2] - y > this.#pad[3] ? +this.#pad[3].toFixed(3) : +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		z = faceA === 0 ? this.#pad[2] : this.#crate[1] - this.#threshold[1] - this.#pad[2];
		if (filled.x > 0) {
			if (x >= this.#inner[0] && y < this.#inner[2]) {
				filled.x = 0;
				if (y < this.#inner[2] && x >= this.#inner[0]) {
					filled.y += y;
					y = this.#crate[2] - filled.y > this.#pad[3] ? this.#crate[2] - this.#pad[3] : this.#pad[3];
				}
			}
			x = this.#crate[0] - x - this.#threshold[0] - this.#pad[2];
		}
		return {
			x,
			y,
			z
		};
	}
	#defineSizingPadSides(filled) {
		let { x, y, z, sideA } = filled;
		x = sideA === 0 ? this.#pad[2] : this.#crate[0] - this.#pad[2];
		if (y === 0) y = this.#inner[2] - y > this.#pad[3] ? this.#pad[3] : +(this.#crate[2] - this.#ply[2] - this.#pine[2]).toFixed(3);
		else y += this.#inner[2] - y > this.#pad[3] ? this.#pad[3] : this.#crate[2] - y - this.#pine[2] - this.#ply[2];
		z = this.#crate[1] < this.#pad[1] ? this.#crate[1] - this.#threshold[1] : this.#crate[1] - this.#pad[1] - z;
		return {
			x,
			y,
			z
		};
	}
	#defineSizingPadUpDown(filled) {
		let { x, y, z } = filled;
		if (x === 0) x = this.#pad[1] > this.#inner[0] ? this.#crate[0] - this.#threshold[0] - 2 * this.#pad[2] : this.#pad[1] + this.#pad[2];
		else x = this.#crate[0] - x - this.#threshold[0] - 2 * this.#pad[2];
		y = y === 0 ? this.#threshold[2] : this.#crate[2] - this.#pine[2] - this.#ply[2];
		z = this.#crate[1] - this.#threshold[1] - this.#pad[2];
		return {
			x,
			y,
			z
		};
	}
	#setFrontAndBackFaces(data, filled) {
		const { faceA, faceB } = filled;
		if (faceA === 1 && faceB === 1) return data;
		const sizes = this.#defineSizingPadFaces(filled);
		data.push(this.#bluePrintFacesSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x >= this.#inner[0] && filled.y + sizes.y >= this.#inner[2]) if (faceA === 0) {
			filled.faceA = 1;
			filled.x = 0;
			filled.y = 0;
		} else filled.faceB = 1;
		return this.#setFrontAndBackFaces(data, filled);
	}
	#setRightAndLeftSides(data, filled) {
		const { sideA, sideB } = filled;
		if (sideA === 1 && sideB === 1) return data;
		const sizes = this.#defineSizingPadSides(filled);
		data.push(this.#bluePrintSidesSchema(sizes, filled.x, filled.y));
		filled.y += sizes.y;
		if (filled.y >= this.#inner[2]) if (sideA === 0) {
			filled.sideA = 1;
			filled.x = this.#crate[0];
			filled.y = 0;
		} else filled.sideB = 1;
		return this.#setRightAndLeftSides(data, filled);
	}
	#setTopAndBottom(data, filled) {
		const { top, bottom } = filled;
		if (top === 1 && bottom === 1) return data;
		const sizes = this.#defineSizingPadUpDown(filled);
		const setY = this.#crate[2] - 2 * this.#pad[2] - this.#threshold[2] - this.#ply[2] - this.#pine[2];
		data.push(this.#bluePrintUpDownSchema(sizes, filled.x, filled.y));
		filled.x += sizes.x;
		if (filled.x >= this.#inner[0]) if (bottom === 0) {
			filled.bottom = 1;
			filled.x = 0;
			filled.y = setY;
		} else filled.top = 1;
		return this.#setTopAndBottom(data, filled);
	}
	#defineWalls(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);
		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 1:
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 2:
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 3:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 4:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 5:
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 7:
					if (data[1].x === 0) data[1].x = x;
					return data;
			}
			return data;
		});
		return change;
	}
	#setupFaces() {
		const pads = [];
		this.#setFrontAndBackFaces(pads, {
			x: 0,
			y: 0,
			z: 0,
			faceA: 0,
			faceB: 0
		});
		this.#setRightAndLeftSides(pads, {
			x: 0,
			y: 0,
			z: 0,
			sideA: 0,
			sideB: 0
		});
		this.#setTopAndBottom(pads, {
			x: 0,
			y: 0,
			z: 0,
			top: 0,
			bottom: 0
		});
		return pads;
	}
	#defineCratePaddingTubes() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const faces = this.#setupFaces();
		let meta = structuredClone(this.#data);
		let show = true;
		if (!this.#pad) return this.#data;
		faces.map((pads) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = pads;
			trace.data = {
				info: this.#data,
				coordinates,
				name: "padding",
				show
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: this.#data,
				name: "padding",
				offsetX,
				offsetY,
				offsetZ
			};
			this.#data = this.#data = fill.designSides;
			show = false;
			return pads;
		});
		return meta;
	}
	#defineCratePadding() {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const faces = this.#setupFaces();
		let meta = structuredClone(this.#data);
		let show = true;
		if (!this.#pad) return this.#data;
		faces.map((pads) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = pads;
			trace.data = {
				info: this.#data,
				coordinates,
				name: "padding",
				show
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: this.#data,
				name: "padding",
				offsetX,
				offsetY,
				offsetZ
			};
			this.#data = this.#data = fill.designSides;
			show = false;
			return pads;
		});
		return meta;
	}
	get setPadding() {
		return this.#defineCratePadding();
	}
	get setPaddingTubes() {
		return this.#defineCratePaddingTubes();
	}
};
//#endregion
//#region app/plotter/Plotly.bottomCrate.render.mjs
var BottomCrate = class {
	#sized;
	#foot;
	#ply;
	constructor(data) {
		const { finalSize } = data;
		const used = JSON.parse(localStorage.getItem("crating")).map((opt) => data.usedMaterials.get(opt));
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
		const x = this.#sized[0];
		return {
			coordinates: [
				{
					z: offZ,
					y: 0,
					x: 0
				},
				{
					z,
					y: 0,
					x: 0
				},
				{
					z,
					y,
					x: 0
				},
				{
					z: offZ,
					y,
					x: 0
				},
				{
					z: offZ,
					y: 0,
					x
				},
				{
					z,
					y: 0,
					x
				},
				{
					z,
					y,
					x
				},
				{
					z: offZ,
					y,
					x
				}
			],
			width: x,
			depth: z - offZ,
			height: y,
			offsetX: 0,
			offsetY: offZ,
			offsetZ: 0
		};
	}
	#setSameAllParts(info, counter) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let offZ = 0;
		while (counter--) {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = this.#defineFeetSameSize(offZ);
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
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
				offsetZ
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
		return {
			coordinates: [
				{
					x: offX,
					y: 0,
					z: 0
				},
				{
					x,
					y: 0,
					z: 0
				},
				{
					x,
					y,
					z: 0
				},
				{
					x: offX,
					y,
					z: 0
				},
				{
					x: offX,
					y: 0,
					z
				},
				{
					x,
					y: 0,
					z
				},
				{
					x,
					y,
					z
				},
				{
					x: offX,
					y,
					z
				}
			],
			width: x - offX,
			depth: z,
			height: y,
			offsetX: offX,
			offsetY: 0,
			offsetZ: 0
		};
	}
	#setAllParts(info) {
		let counter = Math.floor(this.#sized[0] / 100) + 1;
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let offX = 0;
		if (counter === 1) counter++;
		while (counter--) {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } = this.#defineFeet(offX);
			trace.data = {
				info,
				coordinates,
				name: "frame",
				show: false
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
				offsetZ
			};
			info = fill.designSides;
			offX += this.#sized[0] > +this.#ply[1] ? +this.#ply[1] : this.#sized[0];
			if (offX >= this.#sized[0]) offX = this.#sized[0] - +this.#foot[2];
		}
		return info;
	}
	#designBottomSameSize() {
		const countFeet = Math.floor(this.#sized[0] / +this.#ply[1]) + 2;
		return this.#setSameAllParts([], countFeet);
	}
	#designBottom() {
		const countFeet = Math.floor(this.#sized[0] / +this.#ply[1]) + 2;
		return this.#setAllParts([], countFeet);
	}
	get commumSameBottom() {
		if (!this.#foot || !this.#sized) return false;
		return this.#designBottomSameSize();
	}
	get commumBottom() {
		if (!this.#foot || !this.#sized) return false;
		return this.#designBottom();
	}
};
//#endregion
//#region app/plotter/Not.Canvas.Render.class.mjs
var notCanvasCrateRender = class {
	#crates;
	#layout;
	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	}
	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				let meta = new BottomCrate(data.at(-1)[0]).commumBottom;
				meta = new CratesFrame(meta, data.at(-1)[0]).setFrame;
				meta = new SetCrateWalls(meta, data.at(-1)[0]).setWalls;
				meta = new PaddingCrate(meta, data.at(-1)[0]).setPadding;
				meta = new PositionWorksInSideCrate(data.at(-1)[0], meta, "noCanvasCrate").arrange;
				return meta;
			}
			return data;
		}, 0);
		return result.length ? {
			result: result[0],
			meta: this.#layout
		} : false;
	}
	get composeCrate() {
		return this.#startDrawing();
	}
};
//#endregion
//#region app/plotter/plotly.layout.mjs
const layout = {
	showlegend: true,
	legend: {
		title: {
			text: "Proto crate:",
			font: {
				family: "Mitr, sans-serif",
				size: 14
			}
		},
		font: {
			family: "Mitr, sans-serif",
			sizes: 14,
			color: "#FFFFFFAA"
		},
		x: .02,
		xanchor: "left",
		y: .99,
		yanchor: "top",
		orientation: "v",
		groupclick: "sides"
	},
	margin: {
		t: 0,
		l: 0,
		b: 0,
		r: 0,
		pad: 10
	},
	scene: {
		aspectmode: "data",
		xaxis: {
			title: {
				text: "Length - (cm)",
				family: "Mitr, sans-serif"
			},
			color: "white",
			thickcolor: "white",
			ticks: "outside"
		},
		yaxis: {
			title: {
				text: "Depth - (cm)",
				family: "Mitr, sans-serif"
			},
			color: "white",
			thickcolor: "white",
			tick: "outside"
		},
		zaxis: {
			title: {
				text: "Height - (cm)",
				family: "Mitr, sans-serif"
			},
			color: "white",
			thickcolor: "white",
			tick: "outside"
		},
		camera: { eye: {
			x: 0,
			y: 3,
			z: 1
		} }
	},
	paper_bgcolor: "#96979C"
};
//#endregion
//#region app/plotter/Same.Size.Render.class.mjs
var sameSizeCrateRender = class {
	#crates;
	#layout;
	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	}
	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				let meta = new BottomCrate(data.at(-1)[0]).commumSameBottom;
				meta = new CratesFrame(meta, data.at(-1)[0]).setFrame;
				meta = new SetCrateWalls(meta, data.at(-1)[0]).setWalls;
				meta = new PaddingCrate(meta, data.at(-1)[0]).setPadding;
				meta = new PositionWorksInSideCrate(data.at(-1)[0], meta, "sameSizeCrate").arrange;
				return meta;
			}
			return data;
		}, 0);
		return result.length ? {
			result: result[0],
			meta: this.#layout
		} : false;
	}
	get composeCrate() {
		return this.#startDrawing();
	}
};
//#endregion
//#region app/plotter/Standard.Render.class.mjs
var standardCrateRender = class {
	#crates;
	#layout;
	constructor(data, setup) {
		this.#crates = data;
		this.#layout = setup;
	}
	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				let meta = new BottomCrate(data.at(-1)[0]).commumBottom;
				meta = new CratesFrame(meta, data.at(-1)[0]).setFrame;
				meta = new SetCrateWalls(meta, data.at(-1)[0]).setWalls;
				meta = new PaddingCrate(meta, data.at(-1)[0]).setPadding;
				meta = new PositionWorksInSideCrate(data.at(-1)[0], meta, "standardCrate").arrange;
				return meta;
			}
			return data;
		}, 0);
		return result.length ? {
			result: result[0],
			meta: this.#layout
		} : false;
	}
	get composeCrate() {
		return this.#startDrawing();
	}
};
//#endregion
//#region app/plotter/Tube.Render.class.mjs
var tubeCrateRender = class {
	#crates;
	#layout;
	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	}
	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				let meta = new BottomCrate(data.at(-1)[0]).commumBottom;
				meta = new CratesFrame(meta, data.at(-1)[0]).setFrame;
				meta = new SetCrateWalls(meta, data.at(-1)[0]).setWalls;
				meta = new PaddingCrate(meta, data.at(-1)[0]).setPaddingTubes;
				meta = new PositionWorksInSideCrate(data.at(-1)[0], meta, "tubeCrate").arrange;
				return meta;
			}
			return data;
		}, 0);
		return result.length ? {
			result: result[0],
			meta: this.#layout
		} : false;
	}
	get composeCrate() {
		return this.#startDrawing();
	}
};
//#endregion
//#region app/plotter/Plotly.Renderer.Crates.mjs
var GraphicCrates = class {
	#plotly;
	#edges;
	#crates;
	constructor() {
		const { Plotly } = globalThis;
		this.#crates = [
			"tubeCrate",
			"largestCrate",
			"sameSizeCrate",
			"noCanvasCrate",
			"standardCrate"
		];
		this.#edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7]
		];
		this.#plotly = Plotly;
	}
	/**
	* @method - catch the solved results.
	*/
	async #grabArtWorksOnIDB() {
		const ref = localStorage.getItem("refNumb");
		const WORKER = new Worker(new URL("../panels/worker.IDB.crates.mjs", import.meta.url), { type: "module" });
		WORKER.postMessage(ref);
		return await new Promise((resolve, reject) => {
			WORKER.onmessage = (res) => {
				const { data } = res;
				data?.reference === ref ? resolve(data) : reject(res);
			};
		});
	}
	#populatePlotter(list) {
		let alterLayout = structuredClone(layout);
		return {
			result: this.#crates.map((crate) => {
				const data = list.get(crate);
				const draw = new Map([
					["tubeCrate", new tubeCrateRender(data, alterLayout)],
					["largestCrate", new largestCrateRender(data, alterLayout)],
					["sameSizeCrate", new sameSizeCrateRender(data, alterLayout)],
					["noCanvasCrate", new notCanvasCrateRender(data, alterLayout)],
					["standardCrate", new standardCrateRender(data, alterLayout)]
				]).get(crate);
				if (data) {
					const { result, meta } = draw.composeCrate;
					alterLayout = meta;
					return result;
				}
				return crate;
			}).filter((info) => Array.isArray(info)).flat(),
			alterLayout
		};
	}
	async #cratesTriage() {
		const { crates } = await this.#grabArtWorksOnIDB() || false;
		const allCrates = /* @__PURE__ */ new Map();
		const designs = sessionStorage.getItem("graphics") || false;
		if (designs) return JSON.parse(designs)[sessionStorage.getItem("crate").split("/")[0]];
		if (crates) {
			Object.entries(crates).map((data) => {
				if (this.#crates.includes(data[0])) allCrates.set(data[0], data[1]);
				return data;
			});
			const finished = this.#populatePlotter(allCrates);
			globalThis.sessionStorage.setItem("crate", `1/${crates.allCrates.length}`);
			globalThis.sessionStorage.setItem("graphics", JSON.stringify(finished.designs));
			document.getElementById("layer-count").innerText = `Courrent crate: 1 / ${crates.allCrates.length}`;
			return finished;
		}
		return true;
	}
	/**
	* @method starts the drawing all graphic crates.
	*/
	async #moutingCrates() {
		const { result, alterLayout } = await this.#cratesTriage();
		this.#plotly.newPlot("plotter-display", result, alterLayout, { displaylogo: false });
	}
	get show() {
		return this.#moutingCrates();
	}
};
//#endregion
//#region app/plotter/layer.controller.mjs
async function openDisplay() {
	const design = new GraphicCrates();
	const layout = document.querySelectorAll(".toggle__plotter");
	const plotter = document.getElementById("layers");
	let node;
	for (node of layout) if (node.ariaHidden === "true") {
		node.ariaHidden = "false";
		plotter.ariaHidden = "true";
	} else if (node.ariaHidden === "false") {
		node.ariaHidden = "true";
		plotter.ariaHidden = "false";
		if (!sessionStorage.getItem("plotter")) {
			design.show;
			sessionStorage.setItem("plotter", "true");
		}
	}
}
//#endregion
//#region app/core2/Converter.class.mjs
var Converter = class {
	#values;
	constructor(...args) {
		this.#values = [...args];
	}
	get cmConvert() {
		return inConvert.call(this.#values);
	}
	get inConvert() {
		return cmConvert.call(this.#values);
	}
};
function checkValues() {
	const checker = this.filter((val) => {
		if (Number(val)) return val;
		else if (typeof val === "string" && val) return +val.trim();
		else return;
	});
	try {
		if (!checker || checker.length < 1) throw new TypeError("Please, provide a value to be converted.");
	} catch (err) {
		return err;
	}
	return checker;
}
function cmConvert() {
	const trimmer = checkValues.call(this);
	if (Array.isArray(trimmer)) {
		const INCH = 2.54;
		return this.map((val) => {
			return +(val / INCH).toFixed(3);
		});
	}
	return trimmer;
}
function inConvert() {
	const trimmer = checkValues.call(this);
	if (Array.isArray(trimmer)) {
		const INCH = 2.54;
		return this.map((val) => {
			return +(val * INCH).toFixed(0);
		});
	}
	return trimmer;
}
//#endregion
//#region app/core2/Regex.class.mjs
var RegexChecker = class {
	#values;
	constructor(...args) {
		this.#values = [...args];
	}
	get regexSizes() {
		return regexWorks.call(this.#values);
	}
};
function regexWorks() {
	try {
		const regx = this.map((val) => {
			const reg = /[0-9]{1,3}/.test(val);
			return Number.isNaN(val) ? false : reg;
		});
		const error = "Not a valid entry to RegexChecker!";
		if (regx.includes(false)) throw new TypeError(error);
	} catch (err) {
		console.error(err);
		return err;
	}
}
//#endregion
//#region app/core2/CubCalc.class.mjs
var CubCalc = class {
	#x;
	#z;
	#y;
	constructor(x, z, y) {
		this.#x = +x;
		this.#z = +z;
		this.#y = +y;
	}
	get cubCalcAir() {
		return CubCalcAir(this.#x, this.#z, this.#y);
	}
	get cubArea() {
		return CubArea(this.#x, this.#z, this.#y);
	}
};
function CubCalcAir(x, z, y) {
	const regex = new RegexChecker(x, z, y).regexSizes;
	if (typeof regex === "object") return regex;
	return +(x * z * y / 6e3).toFixed(3);
}
function CubArea(x, z, y) {
	const regex = new RegexChecker(x, z, y).regexSizes;
	if (typeof regex === "object") return regex;
	return +(x * z * y / 1e6).toFixed(3);
}
//#endregion
//#region app/core2/Hexaedro.class.mjs
var Hexaedro = class {
	constructor(x, z, y) {
		try {
			const error = "Please, provide a correct x, z or y value.";
			if (!x || !z || !y) throw new TypeError(error);
		} catch (err) {
			return err;
		}
		this.x = +x;
		this.z = +z;
		this.y = +y;
	}
};
//#endregion
//#region app/core2/ArtWork.class.mjs
var ArtWork = class extends Hexaedro {
	coordinates;
	packMaterials;
	code;
	#x;
	#z;
	#y;
	/**
	* @param { String } code
	* @param { Number } x
	* @param { Number } z
	* @param { Number } y
	* @typedef { [Array: Number | String] } Materials
	* @param { Materials } pack
	*/
	constructor(code, x, z, y, pack) {
		super(x, z, y);
		try {
			if (!code || code.trim() <= 0) {
				const error = `Please, provide a valid code. Current: ${code}`;
				throw new TypeError(error);
			}
		} catch (err) {
			return err;
		}
		this.code = "" + code;
		this.#x = +x;
		this.#z = +z;
		this.#y = +y;
		this.packMaterials = pack;
	}
	/**
	* @method - returns the artworks plus the packing materials
	*/
	#packedWorkSizes() {
		const dimensions = {
			x: structuredClone(this.#x),
			z: structuredClone(this.#z),
			y: structuredClone(this.#y)
		};
		const { packMaterials } = structuredClone(this);
		if (packMaterials?.length) packMaterials.map((item) => {
			dimensions.x += item[2] * 2;
			dimensions.z += item[2] * 2;
			dimensions.y += item[2] * 2;
			return item;
		});
		return [
			this.code,
			+dimensions.x.toFixed(3),
			+dimensions.z.toFixed(3),
			+dimensions.y.toFixed(3)
		];
	}
	/**
	* @method - returns the packing material percent needed to wrap the artwork.
	* @param { Array } area the material total area in meters.
	* @param { number } demand the artworks total area in meters.
	*/
	#packingTypeMaterial(area, demand) {
		const { packMaterials } = structuredClone(this);
		return area.map((info, i) => {
			const result = [packMaterials[i][0]];
			result.push(+(demand * 100 / info).toFixed(0));
			return result;
		}, 0);
	}
	/**
	* @method - returns the packing material units needed to wrap the artwork.
	* @param { Array } percent the material total area in percentile.
	*/
	#materialQuantityApplied(percent) {
		const { packMaterials } = structuredClone(this);
		return percent.map((val, i) => {
			if (packMaterials[i][5] === "Roll") return [val[0], +(val[1] / 100).toFixed(2)];
			return [val[0], Math.ceil(val[1] / 100)];
		}, 0);
	}
	/**
	* @method - returns the rest of the percent used material.
	* @param { Array } percent the material total area in percentile.
	*/
	#residualPacking(percent) {
		return percent.map((percent) => {
			return 1 - +(percent[1] / 100).toFixed(3) % 1;
		});
	}
	/**
	* @method - returns the quantity needed of all materials applied to the artwork.
	*/
	#packingData() {
		const demand = this.packingDemanded;
		const { packMaterials } = structuredClone(this);
		const packArea = packMaterials.map((item) => item[1] * item[3] / 100);
		const percent = this.#packingTypeMaterial(packArea, demand);
		const reuse = packArea.map((data, i) => [percent[i][0], data > demand], 0);
		const residual = this.#residualPacking(percent);
		const prices = packMaterials.map((values) => values[4]);
		return {
			demand,
			percent,
			reuse,
			residual,
			types: packMaterials.map((kind, i) => [
				kind[5],
				packArea[i],
				kind[0]
			], 0),
			cost: prices.map((val, i) => {
				const value = +(percent[i][1] / 100 * val).toFixed(2);
				return [
					percent[i][0],
					value,
					+val
				];
			}, 0),
			quantity: this.#materialQuantityApplied(percent, residual)
		};
	}
	/**
	* @field - returns the artworks info as an Array.
	*/
	get arr() {
		return [
			this.code,
			this.#x,
			this.#z,
			this.#y
		];
	}
	/**
	* @field - returns the cube area as the air companies does the calculation.
	*/
	get cAir() {
		return new CubCalc(this.#x, this.#z, this.#y).cubCalcAir;
	}
	/**
	* @field - returns the cube area as normal math calculation
	*/
	get cubed() {
		return new CubCalc(this.#x, this.#z, this.#y).cubArea;
	}
	/**
	* @field - convert the art work sizes to inches from centimeters.
	*/
	get autoConvert() {
		let { x, z, y } = this;
		const CMVALUES = new Converter(x, z, y).cmConvert;
		x = CMVALUES[0];
		z = CMVALUES[1];
		y = CMVALUES[2];
		return [
			this.code,
			x,
			z,
			y
		];
	}
	/**
	* @field - returns all materials and artworks data.
	*/
	get data() {
		return {
			code: this.code,
			x: this.#x,
			z: this.#z,
			y: this.#y,
			packing: this.packMaterials
		};
	}
	/**
	* @field - returns the total area needed to cover packing.
	*/
	get packingDemanded() {
		const { x, z, y } = this;
		return +(2 * (x * y + x * z + y * z) / 100).toFixed(5);
	}
	/**
	* @field - store the crate position of the artwork.
	*/
	get cratePosition() {
		return this.coordinates;
	}
	/**
	* @field - returns the artwork sizes after all packing applied.
	*/
	get packedSized() {
		return this.#packedWorkSizes();
	}
	/**
	* @field - returns all packing materials data applied to the artwork.
	*/
	get packInfo() {
		return this.#packingData();
	}
	/**
	*  @param { Object } values
	*/
	set defCoordinate(values) {
		this.coordinates = values;
	}
};
//#endregion
//#region app/core2/Arranger.largest.works.mjs
var ArrangerLargestCanvas = class {
	#list;
	constructor(list) {
		this.#list = list;
	}
	#finder() {
		const MAXHEIGHT = 217.5;
		const largestCanvas = this.filter((work) => {
			return work.x >= MAXHEIGHT && work.y >= MAXHEIGHT ? work : 0;
		});
		return largestCanvas.length ? largestCanvas : false;
	}
	#largest() {
		const { sorted } = this.#list;
		const finder = this.#finder.call(sorted);
		finder && finder.map((canvas) => {
			canvas && this.#list.sorted.splice(this.#list.sorted.indexOf(canvas), 1);
			return canvas;
		});
		if (finder) this.#list.largest = finder;
		return this.#list;
	}
	get makeArrange() {
		return this.#largest();
	}
};
//#endregion
//#region app/core2/Arranger.no.canvas.mjs
var ArrangerNoCanvas = class {
	#peces;
	constructor(list) {
		this.#peces = list;
	}
	#removePeces(peces) {
		peces.map((element) => {
			this.sorted.splice(this.sorted.indexOf(element), 1);
			return element;
		});
	}
	#noCanvasOut() {
		let { sorted, sameSize } = this.#peces;
		const MAXDEPTH = 15;
		let checkerOne = sorted.filter((pece) => pece.z > MAXDEPTH);
		let checkerTwo = sameSize.filter((pece) => pece.z > MAXDEPTH);
		const found = [];
		checkerOne.map((pece) => found.push(pece));
		this.#removePeces.call(this.#peces, checkerOne);
		checkerTwo.map((pece) => found.push(pece));
		this.#removePeces.call(this.#peces, checkerTwo);
		sorted = null;
		sameSize = null;
		checkerOne = null;
		checkerTwo = null;
		this.#peces.noCanvas = found;
		return this.#peces;
	}
	#noCanvas() {
		return this.#noCanvasOut();
	}
	get makeArrange() {
		return this.#noCanvas();
	}
};
//#endregion
//#region app/core2/Arranger.same.size.class.mjs
var ArrangerSameSize = class {
	#list;
	constructor({ sorted }) {
		this.#list = sorted;
	}
	#trailOne() {
		const MAXDEPTH = 10;
		const getter = [];
		const checker = (a, b) => a.cubed <= b.cubed && a.code !== b.code;
		let sameSized;
		this.map((work) => {
			let i = 0;
			let checked;
			if (work.z <= MAXDEPTH) for (i in this) {
				sameSized = this[i].x === work.x && this[i].y === work.y;
				checked = checker(this[i], work);
				if (!getter.includes(this[i]) && checked) getter.push(this[i]);
				else if (!checked && sameSized && !getter.includes(this[i])) getter.push(this[i]);
			}
			return work;
		});
		return getter;
	}
	#checker(art, work) {
		const x = work.x;
		const y = work.y;
		const cub = work.cubed;
		return art.x === x && art.y === y && art.cubed <= cub;
	}
	#trailTwo(list) {
		const sameSize = [];
		list.map((work) => {
			let getter = [];
			let i = 0;
			for (i in list) if (this.#checker(list[i], work) && !sameSize.includes(list[i])) getter.push(list[i]);
			if (getter.length >= 4) getter.map((element) => {
				sameSize.push(element);
				return element;
			});
			getter = null;
			return work;
		});
		return sameSize;
	}
	#sameSizeTrail() {
		const pathOne = this.#trailOne.call(this.#list);
		const pathTwo = this.#trailTwo(pathOne);
		pathTwo.map((art) => {
			this.#list.splice(this.#list.indexOf(art), 1);
			return art;
		});
		return {
			sorted: this.#list,
			sameSize: pathTwo
		};
	}
	get makeArrange() {
		return this.#sameSizeTrail();
	}
};
//#endregion
//#region app/core2/Arranger.starter.class.mjs
var ArrangerStarter = class {
	#list;
	constructor(works) {
		this.#list = works;
	}
	#addCubValueToEachWork() {
		return this.#list.map((work) => {
			const arrWork = work.arr;
			arrWork.push(work.cubed);
			return arrWork;
		});
	}
	#quickS(list, pos) {
		if (list.length <= 1) return list;
		const left = [];
		const pivot = list.splice(0, 1);
		const right = [];
		list.map((work) => {
			work[pos] <= pivot[0][pos] ? left.push(work) : right.push(work);
			return work;
		});
		return this.#quickS(left, pos).concat(pivot, this.#quickS(right, pos));
	}
	#starter() {
		const arrCubedList = this.#addCubValueToEachWork();
		const inOrder = this.#quickS(arrCubedList, 4);
		const sorted = [];
		inOrder.map((work) => {
			this.#list.find((art) => work[0] === art.code ? sorted.push(art) : 0);
			return work;
		});
		return { sorted };
	}
	get prepare() {
		return this.#starter();
	}
};
//#endregion
//#region app/core2/Arranger.tube.class.mjs
var ArrangerTube = class {
	#list;
	constructor(list) {
		this.#list = list;
	}
	#findTubesOnTheList() {
		const { noCanvas } = this.#list;
		const tubes = [];
		noCanvas.filter((piece) => {
			const MAXDIM = 35;
			const LIMIT = piece.z < MAXDIM && piece.y < MAXDIM;
			const CHECK = piece.z === piece.y;
			if (LIMIT && CHECK) {
				if (piece.x !== piece.y && CHECK) tubes.push(piece);
			}
			return piece;
		});
		tubes.map((art) => {
			this.#list.noCanvas.splice(this.#list.noCanvas.indexOf(art), 1);
			return art;
		});
		this.#list.tubes = tubes;
		return this.#list;
	}
	get makeArrange() {
		return this.#findTubesOnTheList();
	}
};
//#endregion
//#region app/core2/Arranger.class.mjs
var Arranger = class Arranger {
	#works;
	constructor(list) {
		this.#works = list;
	}
	#solver() {
		this.#manySizes();
		this.#sameSizeTrail();
		this.#noCanvasTrail();
		this.#largestCanvasTrail();
		this.#findTubes();
	}
	#checkData() {
		try {
			const check = (val) => val.length === 0 || !val;
			if (!Array.isArray(this.#works) || check(this.#works)) throw new TypeError(`Please, provide a type of 'ArtWork' object.`);
			if (this.#works.map((work) => {
				return work.constructor.name === "ArtWork";
			}).includes(false)) throw new TypeError(`Some work is not of the type 'ArtWork' object.`);
		} catch (err) {
			return err;
		}
	}
	#manySizes() {
		this.#works = new ArrangerStarter(this.#works).prepare;
	}
	#sameSizeTrail() {
		this.#works = new ArrangerSameSize(this.#works).makeArrange;
	}
	#noCanvasTrail() {
		this.#works = new ArrangerNoCanvas(this.#works).makeArrange;
	}
	#largestCanvasTrail() {
		this.#works = new ArrangerLargestCanvas(this.#works).makeArrange;
	}
	#findTubes() {
		this.#works = new ArrangerTube(this.#works).makeArrange;
	}
	get start() {
		const dataChecker = this.#checkData();
		if (dataChecker && dataChecker.constructor.name === "TypeError") return dataChecker;
		this.#solver();
		return Object.assign(Arranger, { list: this.#works });
	}
};
//#endregion
//#region app/core2/Crate.maker.mjs
var CrateMaker = class {
	#layers;
	#workStack;
	#materials;
	constructor(layers, materials, opt = false) {
		if (layers) {
			this.#materials = materials;
			this.#layers = layers;
			this.#workStack = opt;
		}
	}
	/**
	* @method - sums all materials to each crate side.
	* @param { Array } materials - all materials available to the crate.
	*/
	#stablishCrateSizes(materials) {
		const wood = [
			"Pinewood",
			"Plywood",
			"Wooden Post"
		];
		const woods = materials.filter((item) => wood.includes(item[5]));
		const separator = materials.filter((foam) => foam[5] === "Foam Sheet");
		const DIVISION = separator.find((sep) => sep[2] < 5).flat();
		let x = 0;
		let z = 0;
		let y = 0;
		let div = 0;
		let pad = 0;
		woods.map((item) => {
			if (item.at(-1) !== "Wooden Post") {
				x += +item[2] * 2;
				z += +item[2] * 2;
			}
			y += item.at(-1) === "Pinewood" || item.at(-1) === "Wooden Post" ? +item[2] : +item[2] * 2;
			return item;
		});
		if (separator?.length) separator.map((foam) => {
			if (this.#layers > 1 && +foam[2] <= +DIVISION[2]) {
				if (this.#workStack) {
					this.#workStack = false;
					y += +foam[2];
				}
				div = +foam[2];
				z += +foam[2] * (this.#layers - 1);
				return foam;
			}
			if (this.#layers === 1 && +foam[2] <= +DIVISION[2]) return foam;
			x += +foam[2] * 2;
			z += +foam[2] * 2;
			y += +foam[2] * 2;
			if (+foam[2] > +DIVISION[2]) pad = 2 * foam[2];
			return foam;
		});
		return {
			x,
			z,
			y,
			div,
			pad
		};
	}
	/**
	* @method - take all materials to apply to the crate.
	*/
	#crateMaterialsDefined() {
		const { materials, cratesOnly } = this.#materials;
		const crateMaterials = [];
		cratesOnly.map((item) => {
			const material = materials.find((opts) => opts[0] === item);
			material && crateMaterials.push(material);
			return item;
		});
		if (!crateMaterials.length) return {
			x: 0,
			z: 0,
			y: 0
		};
		return this.#stablishCrateSizes(crateMaterials);
	}
	get outSizes() {
		if (!this.#layers) return false;
		return this.#crateMaterialsDefined();
	}
};
//#endregion
//#region app/core2/Crater.coordinates.mjs
var WorksCoordinates = class {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#packedList;
	#centerWork;
	#packing;
	#lastTry;
	#newBaseSize;
	constructor(size = false, materials) {
		if (size && materials) {
			this.#lastTry = [];
			this.#sizes = [
				+size[0].toFixed(3),
				+size[1].toFixed(3),
				+size[2].toFixed(3)
			];
			this.#packing = materials;
			this.#layerMapObject();
			this.#coordinates = this.#crateTemplate();
		}
	}
	#crateTemplate() {
		const { materials, cratesOnly } = this.#packing;
		const template = {
			emptyArea: [],
			artLocation: /* @__PURE__ */ new Map(),
			baseSize: this.#sizes,
			usedMaterials: /* @__PURE__ */ new Map(),
			innerSize: [],
			finalSize: [],
			layers: [],
			get reset() {
				this.emptyArea = [[
					0,
					0,
					this.baseSize[0],
					this.baseSize[2]
				]];
				return this.emptyArea;
			},
			get fillGaps() {
				const data = [];
				const highZ = (works, thick = 0) => {
					works.map((art) => {
						if (!thick) thick = [art.work[0], art.work[2]];
						return thick;
					});
					return thick;
				};
				const calc = (gaps, total = 0, sizes = []) => {
					gaps.map((pos) => {
						if (pos[0] === pos[2] && pos[1] === pos[3]) return pos;
						let gapX = pos[2] - pos[0];
						let gapY = pos[3] - pos[1];
						if (!gapX && gapY) gapX = pos[0];
						if (gapX && !gapY) gapY = pos[1];
						sizes.push([+gapX.toFixed(2), +gapY.toFixed(2)]);
						total += +(gapX * gapY).toFixed(3);
						return pos;
					});
					return {
						total,
						sizes
					};
				};
				this.layers.map((info) => {
					const { vacuum, works } = info;
					const Z = highZ(works);
					const { total, sizes } = calc(vacuum);
					data.push({
						highestZ: Z,
						total,
						sizes
					});
					return data;
				});
				return data;
			},
			set defineLayer(info) {
				const vacuum = structuredClone(this.emptyArea);
				const works = structuredClone(info[1]);
				this.layers.push({
					vacuum,
					works
				});
				this.reset;
			},
			get fillMaterials() {
				materials.map((info) => cratesOnly.includes(info[0]) ? this.usedMaterials.set(info[0], info) : 0);
				return materials;
			}
		};
		template.reset;
		template.fillMaterials;
		return template;
	}
	/**
	* @method removes the obsolete locations
	* @param { Array:Number:String } gaps possible locations
	*/
	async #cleanObsoleteLocations(gaps) {
		const minGap = 10;
		const removes = [];
		gaps.map((data, i) => {
			const check = data[2] - data[0] < minGap || data[3] - data[1] < minGap;
			if (data && check) removes.push(i);
			else this.#rawList.map((info) => {
				if (info?.coordinates) {
					const { x, y } = info.coordinates;
					if (data[0] === x && data[1] === y) removes.push(i);
				}
				return info;
			});
			return data;
		});
		removes.map((index, i) => gaps.splice(index + i, 1), 0);
		return gaps;
	}
	/**
	* @method - update all coordinates based on the gap size.
	* @param { Array:Array:number } gaps
	*/
	async #updateAllLocations(gaps) {
		if (!this.#centerWork?.center) return gaps;
		const { x, y, center } = this.#centerWork;
		const X = center.length > 4 ? center[3] : center[1];
		const Y = center.length > 4 ? center[1] : center[3];
		const shiftCenter = x.get(center[0]).sum >= X && y.get(center[0]).sum >= Y;
		const updater = (axis) => {
			let art;
			for (art of axis) {
				const rand = center ? Math.floor(Math.random() * center[1]) : Math.floor(Math.random() * 1e4);
				if (center[0] === art[0] && shiftCenter) {
					let pos;
					let properX = 0;
					let properY = 0;
					for (pos of gaps) {
						const valX = pos[0] > 0 && pos[1] > 0 && pos[0] < pos[2];
						const valY = pos[1] > 0 && pos[0] > 0 && pos[1] < pos[3];
						if (!pos[4] && valX && properY < pos[1]) properY = pos[1];
						if (!pos[4] && valX && properY > pos[1]) pos.splice(5, 1, `${rand}-y`);
						if (pos[4] && valY && properX < pos[0]) properX = pos[0];
						if (pos[4] && valY && properX > pos[0]) pos.splice(5, 1, `${rand}-x`);
					}
					this.#centerWork.center = false;
				}
			}
		};
		updater(x);
		updater(y);
		return await this.#cleanObsoleteLocations(gaps);
	}
	/**
	* @method - define the inner location.
	* @param { object } data all information needed to define new coordinates.
	*/
	#theEdgeLocations(data) {
		const { prevWork, local, onAxis, x, y } = data;
		const xThread = this.#centerWork.x.get(prevWork[0]);
		const yThread = this.#centerWork.y.get(prevWork[0]);
		const onCenter = this.#centerWork?.center ? this.#centerWork?.center : prevWork;
		const X = local[2];
		const Y = local[3];
		const sumX = +(local[0] + x).toFixed(3) <= X ? +(local[0] + x).toFixed(3) : prevWork.length === 4 ? prevWork[1] + local[0] : prevWork[3] + local[0];
		const sumY = +(local[1] + y).toFixed(3) <= Y ? +(local[1] + y).toFixed(3) : prevWork.length === 4 ? prevWork[3] + local[1] : prevWork[1] + local[1];
		const properX = sumY >= onCenter[3] && onAxis ? sumX : xThread.sum;
		const properY = sumX >= onCenter[1] && !onAxis ? sumY : yThread.sum;
		const random = xThread.sum < local[2] || yThread.sum < local[3] ? ~~(Math.random() * x) : false;
		let extra = random ? yThread.sum < local[3] ? {
			x: local[0],
			y: sumY,
			random: `${random}-y`
		} : {
			x: sumX,
			y: local[1],
			random: `${random}-x`
		} : false;
		let postX;
		let postY;
		let newX = 0;
		let newY = 0;
		if (onAxis) {
			postX = sumY >= onCenter[3] ? sumX : properX;
			postY = sumX >= onCenter[1] ? properY : sumY;
			newX = sumX < X ? postX : prevWork[1];
			newY = sumY < Y ? local[1] > 0 ? sumY : postY : prevWork[3];
		} else {
			postX = local[0] === 0 && sumY < Y ? 0 : sumX;
			postY = local[1] === 0 && sumX < X ? 0 : sumY;
			newX = sumX < X && x >= prevWork[1] || !postX ? local[0] > 0 ? sumX : postX : local[0];
			newY = sumY < Y && y >= prevWork[3] || !postY ? postY : prevWork[3];
		}
		if (extra?.x === newX && extra?.y === newY) extra = void 0;
		if (extra?.x === newX && extra?.y === newY) extra = void 0;
		return {
			newX,
			newY,
			extra
		};
	}
	/**
	* @param { boolean } onAxis
	* @param { number } x
	* @param { number } y
	* @param { Array:Number } local
	* @param { Array:Array:Number } emptyArea
	* @param { Object } prevWork
	*/
	#nextLocationGap(onAxis, x, y, local, prevWork) {
		const X = local[2];
		const Y = local[3];
		const sumX = +(local[0] + x).toFixed(3) <= X ? +(local[0] + x).toFixed(3) : prevWork[1];
		const sumY = +(local[1] + y).toFixed(3) <= Y ? +(local[1] + y).toFixed(3) : prevWork[3];
		const { newX, newY, extra } = this.#theEdgeLocations({
			prevWork,
			local,
			onAxis,
			x,
			y
		});
		return {
			newX,
			newY,
			sumX,
			sumY,
			extra
		};
	}
	/**
	* @param { boolean } axisXorY
	* @param { Array:Number } local
	* @param { Array: Number } emptyArea
	* @param { string } code
	*/
	#defineNewCoordinates(axisXorY, local, { x, y }, emptyArea, code) {
		const astro = local.length === 8 ? local.at(-2) : local.at(-1);
		const prevWork = this.#packedList.find((work) => work[0] === astro);
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const axis = axisXorY && y < Y ? 0 : 1;
		const { newX, newY, sumX, sumY, extra } = this.#nextLocationGap(axisXorY, x, y, local, prevWork);
		let plus;
		let nextX = axisXorY && local[1] === 0 ? [
			sumX,
			0,
			X,
			Y,
			axis,
			false,
			local.at(-1),
			code
		] : [
			sumX,
			newY,
			X,
			Y,
			axis,
			false,
			local.at(-1),
			code
		];
		let nextY = !axisXorY && local[0] === 0 ? [
			0,
			sumY,
			X,
			Y,
			axis,
			false,
			local.at(-1),
			code
		] : [
			newX,
			sumY,
			X,
			Y,
			axis,
			false,
			local.at(-1),
			code
		];
		const minGap = 10;
		if (extra && extra.x < X && extra.y < Y) {
			const extraAxis = extra.random.split("-")[1];
			plus = [
				extra.x,
				extra.y,
				X,
				Y,
				axis,
				extra.random,
				local.at(-1),
				code
			];
			extraAxis === "x" ? nextX.splice(5, 1, extra.random) : nextY.splice(5, 1, extra.random);
			if (X - plus[0] > minGap && Y - plus[1] > minGap) {
				if (nextX[0] === plus[0] || nextX[1] === plus[1]) {
					nextX = plus;
					plus = false;
				}
				if (nextY[0] === plus[0] || nextY[1] === plus[1]) {
					nextY = plus;
					plus = false;
				}
			}
		}
		if (nextX[0] >= X || nextX[1] >= Y) nextX = false;
		else if (X - nextX[0] < minGap || Y - nextX[1] < minGap) nextX = false;
		if (nextY[0] >= X || nextY[1] >= Y) nextY = false;
		else if (X - nextY[0] < minGap || Y - nextY[1] < minGap) nextX = false;
		if (nextX[0] === nextY[0] && nextX[1] === nextY[1]) nextY = false;
		return {
			nextX,
			nextY,
			plus
		};
	}
	/**
	* @param { boolean } axisXorY
	* @param { Array:Number } emptyArea
	* @@param { Object } opts
	*/
	async #addingNewCoordinates({ nextX, nextY, plus }, emptyArea) {
		if (!nextX && !nextY && !plus) return emptyArea;
		const existX = emptyArea.some((data) => data[0] === nextX[0] && data[1] === nextX[1]);
		const existY = emptyArea.some((data) => data[0] === nextY[0] && data[1] === nextY[1]);
		const addX = !existX && nextX && nextX[3] > nextX[1];
		const addY = !existY && nextY && nextY[2] > nextY[0];
		const totalX = nextX[0] + nextX[1];
		const totalY = nextY[0] + nextY[1];
		let includedX = 0;
		let includedY = 0;
		const existGap = (setup) => emptyArea.some((gap) => gap[0] === setup[0] && gap[1] === setup[1]);
		if (addX && addY) {
			if (totalX < totalY) {
				emptyArea.push(nextX);
				includedX++;
			} else if (!includedY && totalY > totalX) {
				emptyArea.push(nextY);
				includedY++;
			}
			if (!includedX) emptyArea.push(nextX);
			if (!includedY) emptyArea.push(nextY);
		} else if (addX && !includedX && !existGap(nextX)) emptyArea.push(nextX);
		else if (addY && !includedY && !existGap(nextY)) emptyArea.push(nextY);
		if (plus && !existGap(plus)) emptyArea.push(plus);
		return this.#centerWork?.center ? await this.#updateAllLocations(emptyArea) : emptyArea;
	}
	/**
	* @method - updates the axis of the work attached to.
	* @param { boolean } onAxis
	* @param { string } newWork
	* @param { string } lastWork
	*/
	#setLastWorkAxis(attached, newWork, onAxis) {
		if (attached === newWork[0]) return;
		const { center } = this.#centerWork;
		const x = this.#centerWork.x.get(attached);
		const y = this.#centerWork.y.get(attached);
		const newX = newWork.length > 4 ? newWork[3] : newWork[1];
		const newY = newWork.length > 4 ? newWork[1] : newWork[3];
		const artFlip = center.length > 4;
		if (onAxis && x && y) {
			if (artFlip && !x.codes.includes(newWork[0])) {
				y.sum += newX;
				y.codes.push(newWork[0]);
			} else if (!y.codes.includes(newWork[0])) {
				x.sum += newX;
				x.codes.push(newWork[0]);
			}
		} else if (artFlip && !y.codes.includes(newWork[0])) {
			x.sum += newY;
			x.codes.push(newWork[0]);
		} else if (!x.codes.includes(newWork[0])) {
			y.sum += newY;
			y.codes.push(newWork[0]);
		}
		if (x && y) {
			this.#centerWork.x.set(attached, x);
			this.#centerWork.y.set(attached, y);
		}
	}
	/**
	* @method - adds a new work to the thread sequence.
	* @param { string } work
	* @param { Array:Number:String } local
	*/
	#newAttachedWork(work, local) {
		const art = this.#packedList.find((info) => info[0] === work);
		const X = art.length > 4 ? art[3] : art[1];
		const Y = art.length > 4 ? art[1] : art[3];
		const sumX = Y >= local[3] || Y === local[2] ? X : 0;
		const sumY = X >= local[2] || X === local[3] ? Y : 0;
		this.#centerWork.center = art;
		this.#centerWork.x.set(work, {
			sum: sumX,
			codes: []
		});
		this.#centerWork.y.set(work, {
			sum: sumY,
			codes: []
		});
	}
	/**
	* @method - updates the adjacent previous work.
	* @param { boolean } onAxis
	* @param { string } newWork
	* @param { string } thread
	*/
	#upDateLatestWork(thread, newArt, onAxis) {
		const { x, y, center } = this.#centerWork;
		const updateLinkedWorks = [];
		const updating = (axis, pos) => {
			let info;
			for (info of axis) {
				const { sum, codes } = info[1];
				const work = this.#packedList.find((data) => data[0] === info[0]);
				const X = work.length > 4 ? work[3] : work[1];
				const Y = work.length > 4 ? work[1] : work[3];
				const checkBeforeLast = codes?.includes(thread.at(-1)) && info[0] === thread.at(-2) && !codes?.includes(newArt);
				const foundOnCenter = updateLinkedWorks.length ? updateLinkedWorks.some((data) => codes.includes(data)) && !codes?.includes(newArt) : false;
				if (pos !== onAxis ? pos === 0 ? sum < X : sum < Y : false) {
					if (checkBeforeLast && !updateLinkedWorks.includes(info[0])) {
						updateLinkedWorks.push(info[0]);
						this.#setLastWorkAxis(info[0], newArt, pos);
					}
					if (foundOnCenter && !updateLinkedWorks.includes(info[0])) {
						updateLinkedWorks.push(info[0]);
						this.#setLastWorkAxis(center[0], newArt, pos);
					}
				}
			}
		};
		updating(x, 0);
		updating(y, 1);
	}
	/**
	* @method - updates the x and y axis thread with works attached to its own axis.
	* @param { string } code
	* @param { Object } work
	* @param { boolean } onAxis
	* @param { string } center
	* @param { string } newWork
	* @param { String } closeTo
	*/
	#attachingWorksOrder(onAxis, closeTo, newWork, local) {
		const newArt = this.#packedList.find((art) => art[0] === newWork);
		this.#setLastWorkAxis(closeTo, newArt, onAxis);
		this.#newAttachedWork(newWork, local);
		if (!this.#centerWork.works.includes(closeTo)) this.#centerWork.works.push(closeTo);
		if (local && local.length > 7) this.#upDateLatestWork(local, newArt, onAxis);
	}
	/**
	* @method - used when there is only one option to select.
	* @param { number } x axis.
	* @param { number } y axis.
	* @param { string } prev last art work code.
	* @param { Array:Number:String } emptyArea available positions.
	*/
	#onOnePosition(emptyArea, x, y, prev) {
		const lastWork = this.#packedList.find((work) => work[0] === prev);
		const lastX = lastWork.length > 4 ? lastWork[3] : lastWork[1];
		const lastY = lastWork.length > 4 ? lastWork[1] : lastWork[3];
		const minGap = 10;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const firstWork = emptyArea[0].length > 4;
		const fullX = x === X || X - (x + emptyArea[0][0]) < minGap;
		const fullY = y === Y || Y - (y + emptyArea[0][1]) < minGap;
		let nextX;
		let nextY;
		if (!emptyArea[0][0] && !emptyArea[0[0]]) {
			nextX = x + lastX < X ? x + lastX : 0;
			nextY = y + lastY < Y ? y + lastY : 0;
		} else {
			nextX = x + lastX < X ? x + lastX : x;
			nextY = y + lastY < Y ? y + lastY : y;
		}
		const firstX = firstWork ? [
			nextX,
			emptyArea[0][1],
			X,
			Y,
			0,
			false,
			emptyArea[0].at(-1),
			prev
		] : [
			emptyArea[0][0] + x,
			emptyArea[0][1],
			X,
			Y,
			0,
			false,
			prev
		];
		const firstY = firstWork ? [
			emptyArea[0][0],
			nextY,
			X,
			Y,
			1,
			false,
			emptyArea[0].at(-1),
			prev
		] : [
			nextX,
			emptyArea[0][1] + y,
			X,
			Y,
			1,
			false,
			prev
		];
		if (fullX && fullY) {
			emptyArea[0] = [
				X,
				Y,
				X,
				Y
			];
			return emptyArea;
		}
		if (y >= Y) firstX[4] = 1;
		if (x >= X) firstY[4] = 0;
		if (x < X && X - firstX[0] > minGap && Y - firstX[1] > minGap) emptyArea.push(firstX);
		if (y < Y && X - firstY[0] > minGap && Y - firstY[1] > minGap) emptyArea.push(firstY);
		if (emptyArea.length > 1 && !emptyArea[0][0] && !emptyArea[0][1]) emptyArea.splice(0, 1);
		if (firstWork) emptyArea.splice(0, 1);
		return emptyArea;
	}
	/**
	* @method - update the available coordinates possible to feat the work
	* @param { Number } pos the array index to be removed from the possibilities.
	* @param { Array } local the position with the coordinates to place the work.
	*/
	async #updateLayerAvailableCoordinates(pos, { x, y }, code) {
		const { emptyArea } = this.#coordinates;
		const closeTo = emptyArea[pos].length > 4 ? emptyArea[pos].at(-1) : code;
		const onAxis = emptyArea[pos][4];
		this.#attachingWorksOrder(onAxis, closeTo, code, emptyArea[pos]);
		if (emptyArea.length > 1) {
			const options = this.#defineNewCoordinates(onAxis, emptyArea[pos], {
				x,
				y
			}, emptyArea, code);
			emptyArea.splice(pos, 1);
			return await this.#addingNewCoordinates(options, emptyArea);
		}
		this.#onOnePosition(emptyArea, x, y, code);
		await this.#updateAllLocations(emptyArea);
	}
	/**
	* @method - find the feasible position to the work into the crate.
	* @param { Array } art the artwork dimensions and ID.
	* @param { Array } coordinate the empty possibilities to feat the work in.
	* @param { Object: boolean } values for match position of the work in side the crate.
	*/
	#checkLimitSet(art, coordinate, values) {
		if (!values.check01 && !values.check02) return values;
		const limit = coordinate[5] ? coordinate[5]?.split("-")[1] : false;
		if (limit === "x" || limit === "y") {
			if (this.#centerWork?.center) this.#attachingWorksOrder(0, coordinate.at(-1), art[0], coordinate);
			const { center } = this.#centerWork;
			const featness = limit === "x" ? center[1] - coordinate[0] : center[3] - coordinate[1];
			const avoidPos = coordinate[0] === center[1] || coordinate[1] === center[3];
			values.check01 = values.check01 && avoidPos && featness > 0 ? limit === "x" ? featness >= art[1] : featness >= art[3] : values.check01;
			values.check02 = values.check02 && avoidPos && featness > 0 ? limit === "x" ? featness >= art[1] : featness >= art[3] : values.check02;
		}
		return values;
	}
	/**
	* @method - find the feasible position to the work into the crate.
	* @param { Array } art the artwork dimensions and ID.
	* @param { Array } coordinate the empty possibilities to feat the work in.
	*/
	#workMatchLayer(art, coordinate) {
		const X = coordinate[2];
		const Y = coordinate[3];
		const x1 = art[1] + coordinate[0] <= X && coordinate[0] < X;
		const y1 = art[3] + coordinate[1] <= Y && coordinate[1] < Y;
		const x2 = art[3] + coordinate[0] <= X && coordinate[0] < X;
		const y2 = art[1] + coordinate[1] <= Y && coordinate[1] < Y;
		const check01 = x1 && y1;
		const check02 = x2 && y2;
		return this.#checkLimitSet(art, coordinate, {
			check01,
			check02
		});
	}
	/**
	* @method - find the feasible position to the work into the crate.
	* @param { Array } art the artwork dimensions and ID.
	* @param { Array } coordinate the empty possibilities to feat the work in.
	*/
	#checkExtendSizeToFeatWork(art, coordinate) {
		const EXPAND = 10;
		const limitX = coordinate[2] <= 285 ? 285 : 585;
		const limitY = coordinate[3] <= 145 ? 145 : 225;
		const sumX = +(art[1] + coordinate[0]).toFixed(3);
		const sumY = +(art[3] + coordinate[1]).toFixed(3);
		const diffX = coordinate[0] === 0 ? true : sumX <= coordinate[2] ? true : Math.abs(+(sumX - coordinate[2]).toFixed(3)) <= EXPAND;
		const diffY = coordinate[1] === 0 ? true : sumY <= coordinate[3] ? true : Math.abs(+(sumY - coordinate[3]).toFixed(3)) <= EXPAND;
		const pointX1 = sumX <= coordinate[2] || sumX <= coordinate[2] + EXPAND;
		const pointY1 = sumY <= coordinate[3] || sumY <= coordinate[3] + EXPAND;
		const pointX2 = sumX <= coordinate[3] || sumX <= coordinate[3] + EXPAND;
		const pointY2 = sumY <= coordinate[2] || sumY <= coordinate[2] + EXPAND;
		const checkX = coordinate[2] <= sumX && diffX && diffY;
		const checkY = coordinate[3] <= sumY && diffY && diffX;
		const edge = sumX <= limitX && sumY <= limitY;
		const check01 = pointX1 && pointY1 && edge;
		const check02 = pointX2 && pointY2 && edge;
		const extraX = checkX ? sumX : 0;
		const extraY = checkY ? sumY : 0;
		return this.#checkLimitSet(art, coordinate, {
			check01,
			check02,
			extraX,
			extraY
		});
	}
	/**
	* @method - analyses all empty and available positions/coordinates to each work.
	* @param { Array } emptyArea - available empty coordinates.
	* @param { boolean } found - changes when a space is matched to the work.
	* @param { Array } art - the work sizes and code.
	* @param { Number } ind - the rawList location to the work.
	* @param { Number } pos the @emptyArea index.
	*/
	#onFoundDefineLocation(data, art, emptyArea, pos) {
		const { check01, check02, extraX, extraY } = data;
		const ind = this.#rawList.findIndex((data) => data.code === art[0]);
		const ICON = `<i class="nf nf-oct-sync"></i>`;
		const thickness = 14;
		let found = false;
		let x;
		let y;
		const fillSpace = (turn, x, y) => {
			found = true;
			if (turn && x !== y && art[2] <= thickness) {
				art.push(ICON);
				this.#packedList.find((work) => work[0] === art[0] ? work.push(ICON) : 0);
			}
			this.#rawList[ind].defCoordinate = {
				x: structuredClone(emptyArea[pos][0]),
				z: art[2],
				y: structuredClone(emptyArea[pos][1])
			};
			if (extraX || extraY) {
				const checkSizes = extraX > this.#newBaseSize[2] || extraY > this.#newBaseSize[3];
				emptyArea.map((info) => {
					if (extraX > 0) info[2] = extraX;
					if (extraY > 0) info[3] = extraY;
					return info;
				});
				if (checkSizes) {
					if (extraX > this.#newBaseSize[2]) this.#newBaseSize.splice(2, 1, extraX);
					if (extraY > this.#newBaseSize[3]) this.#newBaseSize.push(extraX);
					this.#newBaseSize.splice(3, 1, extraX);
				}
			}
		};
		if (check01 && !check02) {
			x = art[1];
			y = art[3];
			fillSpace(false, x, y);
		} else if (check02) {
			x = art[3];
			y = art[1];
			fillSpace(true, x, y);
		}
		if (found) {
			this.#updateLayerAvailableCoordinates(pos, {
				x,
				y
			}, art[0]);
			this.#lastTry = null;
			this.#lastTry = [];
		}
		return found;
	}
	/**
	* @method - analyses all empty and available positions/coordinates to each work.
	* @param { Array } emptyArea - available empty coordinates.
	* @param { boolean } found - changes when a space is matched to the work.
	* @param { Array } art - the work sizes and code.
	* @param { Number } ind - the rawList location to the work.
	* @param { Number } pos the @emptyArea index.
	*/
	async #secondCheckExtension(art, pos, emptyArea, found) {
		if (found || pos < 0) return found;
		const coordinate = emptyArea[pos];
		const checker = this.#checkExtendSizeToFeatWork(art, coordinate);
		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos);
		if (!found) pos--;
		return this.#secondCheckExtension(art, pos, emptyArea, found);
	}
	/**
	* @method - analyses all empty and available positions/coordinates to each work.
	* @param { Array } param0.emptyArea - available empty coordinates.
	* @param { boolean } param0.found - changes when a space is matched to the work.
	* @param { Array } param0.art - the work sizes and code.
	* @param { Number } param0.ind - the rawList location to the work.
	* @param { Number } param0.pos the @emptyArea index.
	*/
	#featRecursionLayer({ emptyArea, found, art, pos }) {
		const filled = emptyArea.length && emptyArea[0][0] === emptyArea[0][2] && emptyArea[0][1] === emptyArea[0][3];
		if (found || pos < 0 || filled) return found;
		const coordinates = emptyArea[pos];
		const checker = this.#workMatchLayer(art, coordinates);
		if (checker.check01 || checker.check02) found = this.#onFoundDefineLocation(checker, art, emptyArea, pos);
		if (!found) pos--;
		return this.#featRecursionLayer({
			emptyArea,
			found,
			art,
			pos
		});
	}
	/**
	* @method - select the best candidate for match to the art work.
	* @param { Array:Array: Number | String } emptyArea
	*/
	#selectPositionCandidate(emptyArea, art) {
		const zerOption = {
			x: null,
			y: null
		};
		let location = false;
		let position;
		let pos;
		let index = 0;
		let posCandidate = 0;
		for (pos of emptyArea) {
			const gapX = pos[0] < pos[2] ? pos[2] - pos[0] : false;
			const gapY = pos[1] < pos[3] ? pos[3] - pos[1] : false;
			const validLocation = gapX && gapX >= art[1] && gapY && gapY >= art[3] || gapX && gapX >= art[3] && gapY && gapY >= art[1];
			const checkValidIndex = this.#lastTry.includes(index);
			const checker = emptyArea[posCandidate][0] + emptyArea[posCandidate][1];
			if (validLocation) location = index;
			if (!pos[0]) zerOption.x = index;
			if (!pos[1]) zerOption.y = index;
			if (checker > pos[0] + pos[1] && !checkValidIndex) posCandidate = index;
			index++;
		}
		if (location && !this.#lastTry.includes(location)) position = location;
		else if (zerOption.y !== null) position = zerOption.y;
		else if (zerOption.x !== null) position = zerOption.x;
		else if (!location && posCandidate !== void 0) position = posCandidate;
		else position = emptyArea.length - 1;
		this.#lastTry.push(position);
		return position;
	}
	#layerMapObject() {
		let onCenter;
		if (this.#centerWork?.center) {
			const { x, y, center } = this.#centerWork;
			const X = center.length > 4 ? center[3] : center[1];
			const Y = center.length > 4 ? center[1] : center[3];
			const sumX = x.get(center[0]);
			const sumY = y.get(center[0]);
			onCenter = sumX?.sum >= X || sumY?.sum >= Y ? false : center;
		}
		this.#centerWork = null;
		this.#centerWork = {
			center: onCenter,
			works: [],
			linked: [],
			x: /* @__PURE__ */ new Map(),
			y: /* @__PURE__ */ new Map()
		};
	}
	/**
	* @method - the recursion caller to find a match empty space into the crate.
	* @param { Number } len - the list index.
	* @param { Object } info - the crate base size and saver to crate layers arrangement.
	* @param { Array } list - the artworks relation.
	*/
	#fillCrateRecursion(info, list, len) {
		const check = info.emptyArea[0] === void 0 && info.emptyArea[1] === void 0;
		const filledX = info.emptyArea.length ? info.emptyArea[0][0] === info.emptyArea[0][2] : true;
		const filledY = info.emptyArea.length ? info.emptyArea[0][1] === info.emptyArea[0][3] : true;
		if (check || !list[len] || filledX && filledY) {
			this.#layerMapObject();
			return info;
		}
		const { emptyArea, feat } = info;
		const art = list[len];
		const pos = this.#selectPositionCandidate(emptyArea, art);
		const baseObject = {
			emptyArea,
			found: false,
			art,
			pos
		};
		let result = this.#featRecursionLayer(baseObject);
		let tmp;
		if (!result) result = this.#secondCheckExtension(art, pos, emptyArea, result);
		if (result) {
			const raw = this.#rawList.findIndex((data) => data.code === art[0]);
			tmp = list.splice(len, 1).flat();
			feat.push({
				work: tmp,
				list: len,
				raw
			});
		}
		return this.#fillCrateRecursion(info, list, len - 1);
	}
	/**
	* @field - returns the crate template to be fulfilled
	*/
	get bluePrintCoordinates() {
		return this.#coordinates;
	}
	/**
	* @field - Call the fulfillment of the crate.
	*/
	get fillLayer() {
		const { info, list, len, raw } = this.#info;
		this.#newBaseSize = info.newBase;
		this.#rawList = raw;
		this.#packedList = structuredClone(list);
		const arrange = this.#fillCrateRecursion(info, list, len);
		arrange.newBase = this.#newBaseSize;
		return arrange;
	}
	/** @param { Object } data  */
	set fillPreparing(data) {
		this.#info = data;
	}
};
//#endregion
//#region app/core2/Crater.largest.canvas.mjs
var CraterPythagoras = class {
	#list;
	#largest;
	#rawList;
	#coordinates;
	#materials;
	constructor(canvas, materials) {
		if (canvas && canvas.length > 0) {
			this.#materials = materials;
			this.#rawList = canvas;
			this.#largest = canvas.map((art) => art.packedSized);
			this.#list = structuredClone(this.#largest);
		}
	}
	#worksInPlace(list, arranger, layers, i = 1) {
		if (!list.length && !layers) return this.#coordinates;
		const { emptyArea } = this.#coordinates;
		arranger.fillPreparing = {
			info: {
				emptyArea,
				feat: []
			},
			list,
			len: list.length - 1,
			raw: this.#rawList
		};
		const { feat } = arranger.fillLayer;
		this.#coordinates.defineLayer = [i, feat];
		return this.#worksInPlace(list, arranger, layers - 1, i + 1);
	}
	#setWorksCoordinates(base, layers, div, pad) {
		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		this.#worksInPlace(this.#list, coordinates, layers);
		this.#rawList.map((work) => this.#coordinates.artLocation.set(work.code, work));
		this.#coordinates.innerSize = [
			base[0] + pad,
			div + pad,
			base[2] + pad
		];
	}
	#setPadding(innerCrate, layers) {
		const pine = this.#materials?.materials.find((opts) => opts[5] === "Pinewood");
		const crate = new CrateMaker(layers, this.#materials).outSizes;
		const x = +(innerCrate[0] + crate.x).toFixed(3);
		const z = +(innerCrate[1] + crate.z).toFixed(3);
		const y = +(innerCrate[2] + crate.y + +pine[2]).toFixed(3);
		const X = x % 1 > 0 ? x : +x.toFixed(3);
		const Z = z % 1 > 0 ? z : +z.toFixed(3);
		const Y = y % 1 > 0 ? y : +y.toFixed(3);
		const div = crate.div && layers.length > 1 ? innerCrate[1] + crate.div * (layers - 1) : crate.div;
		this.#setWorksCoordinates(innerCrate, layers, div, crate.pad);
		return [
			+X,
			+Z,
			+Y
		];
	}
	#extraStructureData(depth, crate, hypo, extraHeight) {
		const MAXHEIGHT = 240;
		const RAD = Math.PI / 180;
		const angleFirstTriangle = +Math.acos(depth / hypo).toFixed(5);
		const angleUp = +Math.atan2(hypo, crate[1]).toFixed(10);
		const angleSecondTriangle = angleFirstTriangle - +(RAD * 90 - angleUp).toFixed(5);
		const angle = +(RAD * 90 - angleSecondTriangle).toFixed(5);
		const angleHeight = Math.ceil(crate[1] * Math.sin(angle));
		const extraLength = Math.ceil(crate[1] * Math.cos(angle));
		const extension = +(crate[2] * Math.sin(angle)).toFixed(1) + extraLength;
		const leanSupport = Math.ceil(crate[2] * Math.cos(angle) - (angleHeight - extraHeight));
		this.#coordinates.finalSize = [
			crate[0],
			extension,
			MAXHEIGHT
		];
		this.#coordinates.extra = {
			extraHeight,
			leanSupport,
			extraLength,
			baseSize: crate,
			angle
		};
	}
	#pitagorasTheorem(crate) {
		const ply = this.#materials?.materials.find((opts) => opts[5] === "Plywood");
		const feet = this.#materials?.materials.find((opts) => opts[5] === "Wooden Post");
		const BASE = 2 * +ply[2] + +feet[3];
		const MAXHEIGHT = 240 - BASE;
		const hypotenusa = +Math.sqrt(crate[1] ** 2 + crate[2] ** 2).toFixed(0);
		const z = Math.floor(Math.cos(Math.asin(MAXHEIGHT / hypotenusa)) * hypotenusa);
		this.#extraStructureData(z, crate, hypotenusa, BASE);
		return [...this.#coordinates.finalSize];
	}
	#defineCrate(canvas) {
		let x = 0;
		let z = 0;
		let y = 0;
		canvas.map((work) => {
			if (x < work[1]) x = work[1];
			if (z < work[2]) z = work[2];
			if (y < work[3]) y = work[3];
			return work;
		});
		return x >= y ? this.#setPadding([
			x,
			z,
			y
		], canvas.length) : this.#setPadding([
			y,
			z,
			x
		], canvas.length);
	}
	#crateInterface(works) {
		let crate;
		const FLIP = `<i class="nf nf-oct-sync"></i>`;
		crate = this.#defineCrate(works);
		works.map((art) => {
			art[1] <= crate[2] && art[3] > crate[2] && art.push(FLIP);
			return art;
		});
		return this.#pitagorasTheorem(crate);
	}
	#largestCrateTrail() {
		const MAXCANVAS = 3;
		const crates = [];
		let canvas;
		while (this.#largest.length) {
			canvas = this.#largest.splice(0, MAXCANVAS);
			crates.push(this.#crateInterface(canvas));
			crates.push({ works: canvas });
		}
		crates[0].push(this.#coordinates);
		return crates;
	}
	#pitagorasCrater() {
		if (!this.#rawList || this.#rawList.length === 0) return { largest: false };
		const crates = this.#largestCrateTrail();
		delete this.#coordinates.defineLayer;
		return { crates };
	}
	get makeCrate() {
		return this.#pitagorasCrater();
	}
};
//#endregion
//#region app/core2/Crater.standard.crate.mjs
/**
* @class Class to comping the Crater class as a method towards solve canvas with different sizes.
*/
var CraterStandard = class {
	#rawList;
	#list;
	#maxLayers;
	#coordinates;
	#thresholdX;
	#materials;
	#layers = 0;
	#recheck;
	/**
	* @param {Array} canvas - The list to be solved.
	* @param {Array} backUp - The backUp from the first solved tried.
	* @param {Number} maxLayer - The max number of layers to the crate.
	* @param {Boolean} recheck - The option reset crates sizes.
	*/
	constructor(canvas, materials, maxLayer, recheck) {
		if (canvas && canvas.length > 0) {
			this.#materials = materials;
			this.#rawList = canvas;
			this.#list = canvas.map((work) => work.packedSized);
			this.#maxLayers = maxLayer ?? 4;
			this.#recheck = recheck;
		}
	}
	#startCrate(ARTS = []) {
		if (!this.#rawList || this.#rawList.length === 0) return { standard: false };
		switch (this.#recheck) {
			case false:
				ARTS = this.#selectTheBestSolution();
				return { crates: ARTS };
			case true:
				ARTS = this.#provideCrate([], 1, structuredClone(this.#list));
				return { crates: ARTS };
		}
	}
	#checkEqualLengths(list1, list2) {
		let check1;
		let check2;
		let check3;
		let check4;
		let opt1 = 0;
		let opt2 = 0;
		let pos;
		for (pos in list1) {
			check1 = list1[pos][0] > list2[pos][0];
			check2 = list1[pos][0] !== list2[pos][0];
			check3 = list1[pos][2] > list2[pos][2];
			check4 = list1[pos][2] !== list2[pos][2];
			if (check1 && check2) {
				const quarterSize = list1[pos][0] * .25;
				if (list1[pos][0] - list2[pos][0] > quarterSize) opt1 += 1;
			} else if (check2) opt2 += 1;
			if (check3 && check4) {
				const quarterSize = list1[pos][2] * .25;
				if (list1[pos][2] - list2[pos][2] > quarterSize) opt1 += 1;
			} else if (check4) opt2 += 1;
		}
		return {
			opt1,
			opt2
		};
	}
	#checkBestAirportOptions(list1, list2) {
		const MAXx = 300;
		const MAXy = 160;
		let pax1 = 0;
		let pax2 = 0;
		let cargo1 = 0;
		let cargo2 = 0;
		let bestArrange = 2;
		list1.map((crate) => crate[0] <= MAXx && crate[2] <= MAXy ? pax1++ : cargo1++);
		list2.map((crate) => crate[0] <= MAXx && crate[2] <= MAXy ? pax2++ : cargo2++);
		if (cargo1 === cargo2) bestArrange = pax1 <= pax2 ? 1 : 2;
		else if (cargo1 < cargo2) bestArrange = pax1 >= pax2 ? 1 : 2;
		return { bestArrange };
	}
	#selectTheBestSolution() {
		const copy1 = structuredClone(this.#list);
		const copy2 = structuredClone(this.#list);
		const results = {
			opt1: this.#provideCrate([], 0, copy1),
			opt2: this.#provideCrate([], 1, copy2)
		};
		const crates1 = [];
		const crates2 = [];
		const GC = /* @__PURE__ */ new WeakSet();
		Object.entries(results).map((solution) => {
			solution[0] === "opt1" ? solution[1].map((crate, i) => i % 2 === 0 ? crates1.push(crate) : 0, 0) : solution[1].map((crate, i) => i % 2 === 0 ? crates2.push(crate) : 0, 0);
			return solution;
		});
		const equalCrates = crates1.length === crates2.length;
		let count;
		let bestOne;
		if (equalCrates) count = this.#checkEqualLengths(crates1, crates2);
		else count = this.#checkBestAirportOptions(crates1, crates2);
		if (Object.hasOwn(count, "bestArrange")) bestOne = count.bestArrange;
		else bestOne = count.opt1 <= count.opt2 ? 1 : 2;
		GC.add(count);
		return bestOne === 1 ? results.opt1 : results.opt2;
	}
	#quickSort(arts) {
		if (arts.length <= 1) return arts;
		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];
		arts.map((work) => {
			work.at(-1) <= pivot[0].at(-1) ? left.push(work) : right.push(work);
			return work;
		});
		return this.#quickSort(left).concat(pivot, this.#quickSort(right));
	}
	#defineFinalSize(innerSize, works) {
		let z = 0;
		let i = 0;
		let tmp = 0;
		const crate = new CrateMaker(this.#layers, this.#materials).outSizes;
		if (this.#layers > 1) for (i in works) Object.entries(works[i]).map((canvas) => {
			if (canvas.includes("status")) return canvas;
			canvas[1].map((art) => {
				if (art[2] > tmp) tmp = art[2];
				return art;
			});
			z += tmp;
			tmp = 0;
			return canvas;
		});
		tmp = crate.div * (this.#layers - 1) + z;
		this.#coordinates.innerSize = [
			innerSize[0],
			+tmp.toFixed(3),
			innerSize[2]
		];
		crate.x += innerSize[0];
		crate.z += !tmp ? innerSize[1] : tmp;
		crate.y += innerSize[2];
		const X = crate.x % 1 > 0 ? crate.x.toFixed(3) : crate.x.toFixed(0);
		const Z = crate.z % 1 > 0 ? crate.z.toFixed(3) : crate.z.toFixed(0);
		const Y = crate.y % 1 > 0 ? crate.y.toFixed(3) : crate.y.toFixed(0);
		this.#rawList.map((work) => this.#coordinates.artLocation.set(work.code, work));
		this.#coordinates.finalSize = [
			+X,
			+Z,
			+Y
		];
		return [
			+X,
			+Z,
			+Y,
			structuredClone(this.#coordinates)
		];
	}
	#setLayer(crate, works) {
		switch (this) {
			case 1:
				Array.isArray(works[0]) ? crate.push({ layer1: works }) : crate.push({ layer1: [works] });
				break;
			case 2:
				Array.isArray(works[0]) ? crate.push({ layer2: works }) : crate.push({ layer2: [works] });
				break;
			case 3:
				Array.isArray(works[0]) ? crate.push({ layer3: works }) : crate.push({ layer3: [works] });
				break;
			case 4:
				Array.isArray(works[0]) ? crate.push({ layer4: works }) : crate.push({ layer4: [works] });
				break;
			case 5:
				Array.isArray(works[0]) ? crate.push({ layer5: works }) : crate.push({ layer5: [works] });
				break;
			default: return;
		}
		return crate;
	}
	#fillCrate(measure, list) {
		const coordinates = new WorksCoordinates(measure, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		if (!this.#coordinates) return;
		const crate = [];
		let greb = [];
		let info;
		let i = 0;
		let getter;
		let copy;
		const updateSize = (filled) => {
			const { newBase } = filled;
			if (newBase[2] > 0 || newBase[3] > 0) {
				measure[0] = newBase[2];
				measure[2] = newBase[3];
				this.#coordinates.baseSize = newBase;
			}
		};
		while (i++ < this.#maxLayers && list.length) {
			const { emptyArea } = this.#coordinates;
			info = {
				emptyArea,
				feat: [],
				newBase: [
					0,
					0,
					0,
					0
				]
			};
			coordinates.fillPreparing = {
				info,
				list,
				len: list.length - 1,
				raw: this.#rawList
			};
			getter = coordinates.fillLayer;
			updateSize(getter);
			copy = structuredClone(getter);
			greb = copy.feat.map((info) => {
				const art = this.#rawList.find((item) => item.code === info.work[0]).arr;
				const work = structuredClone(info.work);
				work[1] = art[1];
				work[2] = art[2];
				work[3] = art[3];
				return work;
			});
			this.#setLayer.call(i, crate, greb);
			this.#coordinates.defineLayer = [i, getter.feat];
			greb = null;
			getter = null;
			info = null;
			greb = [];
		}
		this.#layers = i - 1;
		delete this.#coordinates.defineLayer;
		delete this.#coordinates.reset;
		return {
			crate,
			measure,
			list
		};
	}
	#composeCrateSizes(crate, list, len) {
		if (len < 0) {
			if (crate.x < crate.y) [crate.x, crate.y] = [crate.y, crate.x];
			return crate;
		}
		const THRESHOLDY = 140;
		const x = list[len][1] > list[len][3] ? list[len][1] : list[len][3];
		const y = list[len][3] > list[len][1] ? list[len][1] : list[len][3];
		const pos1 = crate.x >= x;
		const pos2 = crate.y >= y;
		crate.x = pos1 ? crate.x : list[len][1];
		crate.x = pos1 && crate.x + x <= this.#thresholdX ? crate.x + x : crate.x;
		crate.z = list[len][2] > crate.z ? list[len][2] : crate.z;
		crate.y = pos2 ? crate.y : y;
		crate.y = pos2 && crate.y + y <= THRESHOLDY ? crate.y + y : crate.y;
		return this.#composeCrateSizes(crate, list, len - 1);
	}
	#defineSizeBaseCrate(list) {
		const { x, z, y } = this.#composeCrateSizes({
			x: 0,
			z: 0,
			y: 0
		}, list, list.length - 1);
		return [
			x,
			z,
			y
		];
	}
	/**
	* @method - check all sizes to define the best crate size.
	* @param { Array } works
	*/
	#weightSizesToThreshold(list) {
		const weights = [];
		const THEWEIGHT = list.at(-1)[1] * list.at(-1)[3];
		const TIMESIZE = 5;
		const copyList = structuredClone(list);
		let sum = 0;
		let art = 0;
		let extraSize = false;
		copyList.pop();
		for (art of copyList) {
			weights.push(~~(art[1] * art[3]));
			const check1 = art[1] > list.at(-1)[1] || art[3] > list.at(-1)[1];
			const check2 = art[1] > list.at(-1)[3] || art[3] > list.at(-1)[3];
			if (check1 || check2) extraSize = true;
		}
		sum = weights.reduce((add, val) => add + val, 0);
		return sum > ~~(THEWEIGHT * TIMESIZE) || extraSize;
	}
	#addXandYtimes(list) {
		if (list.length === 1) return list;
		let procList = [];
		list.map((art) => {
			if (Array.isArray(art)) procList.push([
				art[0],
				art[1],
				art[2],
				art[3],
				art[1] + art[3]
			]);
			return art;
		});
		procList = this.#quickSort(procList);
		procList.map((data) => data.pop());
		return procList;
	}
	/**
	* @method - start solver procedures.
	*/
	#provideCrate(crates, setup, works) {
		if (!works.length) return crates;
		works = this.#addXandYtimes(works);
		const extension = this.#weightSizesToThreshold(works);
		this.#thresholdX = !setup ? 270 : 600;
		const size = extension ? this.#defineSizeBaseCrate(works) : works.at(-1)[1] > works.at(-1)[3] ? [
			works.at(-1)[1],
			works.at(-1)[2],
			works.at(-1)[3]
		] : [
			works.at(-1)[3],
			works.at(-1)[2],
			works.at(-1)[1]
		];
		const { crate, measure, list } = this.#fillCrate(size, works);
		crates.push(this.#defineFinalSize(measure, crate));
		crates.push({ works: crate });
		return this.#provideCrate(crates, setup, list);
	}
	get makeCrate() {
		return this.#startCrate();
	}
};
//#endregion
//#region app/core2/Crater.last.check.mjs
var CraterLastCheckReArranger = class {
	#cratesDone;
	#materials;
	constructor(crates, materials) {
		this.#materials = materials;
		this.#cratesDone = crates;
	}
	#quickSort(arts, pos) {
		if (arts.length <= 1) return arts;
		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];
		let j = 0;
		for (j in arts) arts[j][pos] <= pivot[0][pos] ? left.push(arts[j]) : right.push(arts[j]);
		return this.#quickSort(left, pos).concat(pivot, this.#quickSort(right, pos));
	}
	#removeCrate(crate, pos, list) {
		const { works } = crate[pos];
		works.map((layer) => {
			Object.entries(layer).map((arts) => {
				arts[1].map((data) => {
					!Array.isArray(data[0]) ? list.push(data) : data.map((work) => Array.isArray(work[0]) ? list.push(work[0]) : 0);
					return data;
				});
				return arts;
			});
			return layer;
		});
		return list.map((canvas) => {
			const { code, x, y, z, packing } = JSON.parse(localStorage.getItem(canvas[0]));
			return new ArtWork(code, x, z, y, packing);
		});
	}
	#processingCratesList(listCrates, attCrate) {
		const GC = /* @__PURE__ */ new WeakSet();
		const LEN = attCrate.works.length;
		const CUBPOS = 4;
		const MAXLAYER = 5;
		let i = 0;
		let bool = true;
		let result;
		while (i++ < listCrates.length && bool) if (i % 2 === 1) {
			result = LEN === 1 ? structuredClone(attCrate.works[0]) : structuredClone(attCrate.works);
			result = this.#removeCrate(listCrates, i, result);
			result = this.#quickSort(result, CUBPOS);
			result = new CraterStandard(result, this.#materials, MAXLAYER, true).makeCrate;
			if (result?.crates?.length === listCrates.length) {
				listCrates.splice(i, 1, result.crates[1]);
				listCrates.splice(i - 1, 1, result.crates[0]);
				bool = false;
			}
			GC.add(result);
		}
		return !bool;
	}
	#consolidationTrail(standard, sameSizes, pos) {
		if (pos < 0) return sameSizes;
		if (pos % 2 === 1) {
			if (this.#processingCratesList(standard, sameSizes[pos])) {
				sameSizes.splice(pos - 1, 2);
				pos = sameSizes.length;
			}
		}
		return this.#consolidationTrail(standard, sameSizes, pos - 1);
	}
	#extractTheFifthLayer(data) {
		let works;
		let info;
		let i = 0;
		for (info in data) {
			if (i++ % 2 === 1) {
				if (data[info].works.length === 5) works = data[info].works[4].layer5;
			}
			if (works) break;
		}
		return works ? {
			info,
			works
		} : false;
	}
	#newCrateSet(works, layers) {
		const CUBPOS = 4;
		const newList = [];
		Object.entries(layers).map((arr) => {
			arr[1].map((data) => {
				let info;
				for (info in data) if (data[info].length > 0 && Array.isArray(data[info])) data[info].map((art) => newList.push(art));
				return data;
			});
			return arr;
		});
		works.map((art) => newList.push(art));
		return this.#quickSort(newList, CUBPOS);
	}
	#updatesCrates(crates, pos, newCrate, target) {
		const PAD = this.#materials.find((opt) => opt.at(-1) === "Foam Sheet" && opt[2] > 2.5);
		crates[target].works.pop();
		crates[target - 1][1] -= PAD[2];
		crates.splice(pos - 1, 1, newCrate.crates[0]);
		crates.splice(pos, 1, newCrate.crates[1]);
		return crates;
	}
	#removeTheFifthLayer() {
		const { crates } = this.#cratesDone.standardCrate;
		const list = this.#extractTheFifthLayer(crates);
		const LIMITLAYER = 5;
		let count = 0;
		let newList;
		let newCrate;
		let check;
		let layers;
		if (!list) return;
		for (layers in crates) {
			if (!Array.isArray(crates[layers]) && count !== +list.info) {
				newList = this.#newCrateSet(list.works, crates[layers]);
				newCrate = new CraterStandard(newList, false, LIMITLAYER, true).makeCrate;
				check = newCrate.crates.length === 2;
				if (check) {
					this.#updatesCrates(crates, count, newCrate, list.info);
					break;
				}
			}
			count++;
		}
	}
	#consolidationStarted() {
		if (!this.#cratesDone) return;
		const sameSize = this.#cratesDone?.sameSizeCrate?.crates;
		const standard = this.#cratesDone?.standardCrate?.crates;
		if (!sameSize || !standard) return;
		const sameLen = sameSize.length;
		this.#consolidationTrail(standard, sameSize, sameLen);
		this.#removeTheFifthLayer();
		if (this.#cratesDone.sameSizeCrate.crates.length === 0) delete this.#cratesDone?.sameSizeCrate;
		return this.#cratesDone;
	}
	get reduceCrates() {
		return this.#consolidationStarted();
	}
};
//#endregion
//#region app/core2/Crater.no.canvas.mjs
var CraterNotCanvas = class {
	#pieces;
	#rawList;
	#coordinates;
	#materials;
	#list;
	constructor(list, materials) {
		if (list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#pieces = list.map((art) => art.arr);
			this.#list = list.map((art) => art.arr);
		}
	}
	#quickSort(arts, pos) {
		if (arts.length <= 1) return arts;
		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];
		arts.map((work) => {
			work[pos] <= pivot[0][pos] ? left.push(work) : right.push(work);
			return work;
		});
		return this.#quickSort(left, pos).concat(pivot, this.#quickSort(right, pos));
	}
	#setWorksCoordinates(base) {
		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = {
			emptyArea,
			feat: []
		};
		const len = this.#list.length - 1;
		const separator = this.#materials.materials.filter((foam) => foam[5] === "Foam Sheet" && foam[2] < 5).flat();
		let lastX = 0;
		coordinates.fillPreparing = {
			info,
			list: this.#list,
			len,
			raw: this.#rawList
		};
		const { feat } = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, feat];
		this.#rawList.map((work, i) => {
			work.coordinates = {
				x: i > 0 ? i * separator[2] + lastX : 0,
				y: 0,
				z: work.z
			};
			this.#coordinates.artLocation.set(work.code, work);
			lastX += work.x;
			return work;
		}, 0);
	}
	#setPadding(innerCrate) {
		const crate = new CrateMaker(this.#rawList.length, this.#materials).outSizes;
		const div = crate.div ? crate.div * (this.#rawList.length - 1) : 0;
		const x = +(innerCrate[0] + crate.x + div).toFixed(3);
		const z = +(innerCrate[1] + crate.z - crate.div).toFixed(3);
		const y = +(innerCrate[2] + crate.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(3);
		const Z = z % 1 > 0 ? z : z.toFixed(3);
		const Y = y % 1 > 0 ? y : y.toFixed(3);
		this.#setWorksCoordinates(structuredClone([
			+X,
			+Z,
			+Y
		]));
		this.#coordinates.innerSize = innerCrate;
		this.#coordinates.finalSize = [
			+X,
			+Z,
			+Y
		];
		return [...this.#coordinates.finalSize, this.#coordinates];
	}
	#splitCrate(works) {
		let x = 0;
		let z = 0;
		let newX = 0;
		let newZ = 0;
		let aux;
		aux = works.length / 2;
		works.map((item) => {
			if (aux-- > 0) {
				x += item[1];
				if (z < item[2]) z = item[2];
			}
			newX = item[1];
			if (newZ < item[2]) newZ = item[2];
			return item;
		});
		if (newX < x) newX = x;
		newZ += z;
		return {
			newX,
			newZ
		};
	}
	#defCrate(pieces) {
		const LENLIMIT = 277;
		const SPLIT = pieces.length > 4 && pieces.length % 2 === 0;
		let x = 0;
		let z = 0;
		let y = 0;
		let split;
		pieces.map((item) => {
			x += item[1];
			z = item[2] > z ? item[2] : z;
			y = item[3] > y ? item[3] : y;
			return item;
		});
		if (x > LENLIMIT || SPLIT) {
			split = this.#splitCrate(pieces);
			x = split.newX;
			z = split.newZ;
		}
		return this.#setPadding([
			x,
			z,
			y
		]);
	}
	#validationComp(val1, val2) {
		const MAXLEN = 277;
		const MAXDEPTH = 177;
		const MAXHEIGHT = 132;
		const compareX = val1[1] === val2[1] && val1[1] < MAXLEN;
		const compareZ = val1[2] === val2[2] && val1[2] < MAXDEPTH;
		const compareY = val1[3] <= MAXHEIGHT;
		return compareX && compareZ && compareY;
	}
	#validationSizes(x, z, equals, items) {
		const MAXLEN = 554;
		const MAXDEPTH = 177;
		if (items.length % 2 === 0) {
			if (x > MAXLEN && z * 2 < MAXDEPTH) return items.length;
		}
		return equals === 0 || items[0][1] > MAXLEN ? 1 : equals;
	}
	#defineMaxPeces(items) {
		let x = items.length;
		let z = 0;
		let equals = 0;
		const workRef = items[0];
		items.map((art) => {
			const compare = this.#validationComp(art, workRef);
			const bool1 = art[2] - workRef[2];
			const bool2 = workRef[2] - art[2];
			if (compare === true || bool1 > 0 || bool2 > 0) {
				equals++;
				x += art[1];
				z += art[3];
			}
			return art;
		});
		return this.#validationSizes(x, z, equals, items);
	}
	#addXandZtimes(canvas) {
		if (!Array.isArray(canvas)) return canvas;
		let procList = canvas.map((art) => {
			art.push(art[1] * art[2]);
			return art;
		});
		procList = this.#quickSort(procList, 5);
		procList = procList.map((art) => {
			art.pop();
			return art;
		});
		this.#pieces = procList;
	}
	#noCanvasTrail() {
		if (!this.#rawList || this.#rawList.length === 0) return { noCanvas: false };
		const crate = [];
		let peces;
		this.#addXandZtimes(this.#pieces);
		while (this.#pieces.length > 0) {
			peces = this.#defineMaxPeces(this.#pieces);
			peces = this.#pieces.splice(0, peces);
			if (peces.length > 0) {
				crate.push(this.#defCrate(peces));
				crate.push({ works: peces });
			} else {
				crate.push(this.#defCrate(this.#pieces.splice(0, 1)));
				crate.push({ works: peces });
			}
		}
		return { crates: crate };
	}
	get makeCrate() {
		return this.#noCanvasTrail();
	}
};
//#endregion
//#region app/core2/Crater.same.size.mjs
var CraterSameSize = class {
	#pieces;
	#packageSize;
	#rawList;
	#coordinates;
	#materials;
	constructor(list, materials) {
		if (list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#pieces = list.map((art) => art.packedSized);
			this.#packageSize = list[0].packedSized;
		}
	}
	#worksInPlace(list, arranger, i = 1) {
		if (!list.length) return this.#coordinates;
		const { emptyArea } = this.#coordinates;
		arranger.fillPreparing = {
			info: {
				emptyArea,
				feat: []
			},
			list,
			len: list.length - 1,
			raw: this.#rawList
		};
		const result = arranger.fillLayer;
		this.#coordinates.defineLayer = [i, result.feat];
		return this.#worksInPlace(list, arranger, i + 1);
	}
	#setWorksCoordinates(base, stack) {
		const { materials, cratesOnly } = this.#materials;
		const check = (a, b) => a === b[0] && b[2] < 5 && b[5] === "Foam Sheet";
		let padLayer;
		cratesOnly.map((item) => {
			const padding = materials.filter((opt) => check(item, opt));
			if (padding.length) padLayer = padding.flat();
			return item;
		});
		if (stack) base[2] = +padLayer[2];
		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		coordinates.fillPreparing = {
			info: {
				emptyArea,
				feat: []
			},
			list: this.#pieces,
			len: this.#pieces.length - 1,
			raw: this.#rawList
		};
		const { feat } = coordinates.fillLayer;
		const list = structuredClone(this.#pieces);
		this.#coordinates.defineLayer = [1, feat];
		this.#rawList.map((work) => this.#coordinates.artLocation.set(work.code, work));
		this.#worksInPlace(list, coordinates);
		this.#rawList.map((work) => this.#coordinates.artLocation.set(work.code, work));
		delete this.#coordinates.defineLayer;
		delete this.#coordinates.reset;
		return base;
	}
	#setPad(innerCrate, layersUp) {
		const crater = new CrateMaker(this.#pieces.length, this.#materials, layersUp).outSizes;
		const x = +(innerCrate[0] + crater.x).toFixed(3);
		const z = innerCrate[1] + crater.z;
		const y = +(innerCrate[2] + crater.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(0);
		const Z = z % 1 > 0 ? z : z.toFixed(0);
		const Y = y % 1 > 0 ? y : y.toFixed(0);
		this.#setWorksCoordinates(innerCrate, layersUp);
		this.#coordinates.innerSize = [
			innerCrate[0],
			crater.z,
			innerCrate[2]
		];
		this.#coordinates.finalSize = [
			+X,
			+Z,
			+Y
		];
		return [...this.#coordinates.finalSize, this.#coordinates];
	}
	#checkComp(getter, test, baseLayer) {
		const checker = getter.map((value) => {
			const checkX = value[0] + test[0] <= baseLayer[0];
			const checkZ = value[1] + test[1] <= baseLayer[1];
			const checkY = value[2] + test[2] <= baseLayer[2];
			if (checkX && checkZ && checkY) return value;
			return value;
		});
		if (checker[0] !== void 0) checker.map((size) => getter.splice(getter.indexOf(size), 1));
		return checker[0] !== void 0;
	}
	#composeLayer(baseSize, list) {
		const getter = [];
		return list.map((size) => {
			const X = size[0] === baseSize[0][0];
			const Y = size[2] === baseSize[0][2];
			const secondX = size[0] === baseSize[0][0] - this.#packageSize[1];
			const secondY = size[2] === baseSize[0][2] - this.#packageSize[3];
			if (X && Y || secondX && secondY) return size;
			if (getter.length > 0) {
				if (this.#checkComp(getter, size, baseSize)) return size;
			} else getter.push(size);
			return size;
		})[0] !== void 0;
	}
	#orderSizes(base, art) {
		const STACK = base.shift();
		const LEN = art.length;
		let x;
		let z = this.#pieces.reduce((val, sum) => sum[2] + val, 0);
		let y;
		if (STACK) {
			LEN % 2 + LEN / 2;
			x = base[0];
			z /= 2;
			y = base[2];
		} else {
			x = base[0];
			y = base[2];
		}
		return this.#setPad([
			x,
			z,
			y
		], STACK);
	}
	#sizeStacking(base, newBase) {
		const extraSizes = newBase.length > 3 ? [
			newBase[0][1],
			newBase[0][2],
			newBase[0][3]
		] : newBase;
		const LIMIT = 132;
		let x = base[0];
		const z = base[1];
		let y = base[2] + extraSizes[2];
		let stack = false;
		if (y > LIMIT && x < LIMIT) {
			[y, x] = [x, y];
			stack = true;
		} else if (y > base[2]) stack = true;
		return [stack, [
			x,
			z,
			y
		]];
	}
	#solveList(list) {
		const LIMITWORKS = 10;
		let comp;
		let baseCrate = list.splice(0, 1).flat();
		let works = list.splice(0, 1).flat();
		if (list.length > 0) comp = this.#composeLayer(baseCrate, list);
		if (comp) {
			baseCrate = this.#sizeStacking(baseCrate, list.splice(0, 1));
			list[0].map((val) => works[0][0].push(val));
			list.splice(0, list[0].length);
		} else if (works[0].length > LIMITWORKS && works[0].length % 2 === 0) baseCrate = this.#sizeStacking(baseCrate, works[0]);
		else baseCrate.unshift(false);
		if (Array.isArray(works[0][0])) works = works.flat();
		return {
			crate: this.#orderSizes(baseCrate.flat(), works),
			works
		};
	}
	#compCrate(list) {
		const crate = [];
		let solver;
		while (list.length) {
			solver = this.#solveList(list);
			crate.push(solver.crate);
			crate.push({ works: solver.works });
		}
		return crate;
	}
	#countWorks() {
		const MAXDEPTH = 14;
		let x = this.#pieces[0][1];
		let z = this.#pieces[0][2];
		let y = this.#pieces[0][3];
		const sizes = [[
			x,
			z,
			y
		]];
		let works = [];
		this.#pieces.map((work) => {
			if (work[2] <= MAXDEPTH) {
				if (work[1] !== x && work[3] !== y) {
					sizes.push([works]);
					x = work[1];
					z = work[2];
					y = work[3];
					sizes.push([
						x,
						z,
						y
					]);
					works = [];
				}
				works.push(work);
			}
			return work;
		});
		sizes.push(works);
		return sizes[1][0].length >= 4 ? sizes : null;
	}
	#startCrateTrail() {
		if (!this.#rawList || this.#rawList.length === 0) return { sameSize: false };
		let countDiffSizes = this.#countWorks();
		if (countDiffSizes === null) return null;
		const crates = this.#compCrate(countDiffSizes);
		countDiffSizes = null;
		return { crates };
	}
	get makeCrate() {
		return this.#startCrateTrail();
	}
};
//#endregion
//#region app/core2/Crater.tube.crate.mjs
var CraterTube = class {
	#tubes;
	#DIAMETER;
	#coordinates;
	#rawList;
	#materials;
	constructor(list, materials) {
		if (list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#tubes = list.map((art) => art.arr);
			this.#DIAMETER = 35;
		}
	}
	#crateMaker() {
		if (!this.#rawList || this.#rawList.length === 0) return { tube: false };
		if (this.#tubes.filter((item) => {
			return item[2] < this.#DIAMETER ? item : false;
		}).find((data) => !Array.isArray(data))) return { tube: false };
		return this.#possibleCrates();
	}
	#worksInPlace(list, arranger, i = 1) {
		if (!list.length) return this.#coordinates;
		const { emptyArea } = this.#coordinates;
		arranger.fillPreparing = {
			info: {
				emptyArea,
				feat: []
			},
			list,
			len: list.length - 1,
			raw: this.#rawList
		};
		const result = arranger.fillLayer;
		this.#coordinates.defineLayer = [i, result.feat];
		return this.#worksInPlace(list, arranger, i + 1);
	}
	#setWokdCoordinates(innerSize, list) {
		const coordinates = new WorksCoordinates(innerSize, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = {
			emptyArea,
			feat: []
		};
		const len = Array.isArray(list[0]) ? list.length - 1 : 0;
		const spanPad = 10;
		let sumY = 0;
		coordinates.fillPreparing = {
			info,
			list,
			len,
			raw: this.#rawList
		};
		const { feat } = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, feat];
		this.#worksInPlace(list, coordinates);
		this.#rawList.map((work, i) => {
			if (i > 0) sumY += spanPad;
			this.#coordinates.artLocation.set(work.code, work);
			return work;
		}, 0);
		this.#coordinates.innerSize = [
			innerSize[0],
			innerSize[1],
			innerSize[2] + sumY
		];
	}
	#sizeComposer(list) {
		let x = list[0][1];
		let z = list[0][2];
		let y = 0;
		list.map((tube, i) => {
			x = tube[1] > x ? tube[1] : x;
			z = tube[2] > z ? tube[2] : z;
			y += i > 0 ? tube[3] + 10 : tube[3];
			return tube;
		}, 0);
		return [
			x,
			z,
			y
		];
	}
	#setPaddings(base, list) {
		const outSizes = new CrateMaker(1, this.#materials).outSizes;
		const x = +(base[0] + outSizes.x).toFixed(3);
		const z = +(base[1] + outSizes.z).toFixed(3);
		const y = +(base[2] + outSizes.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(0);
		const Z = z % 1 > 0 ? z : z.toFixed(0);
		const Y = y % 1 > 0 ? y : y.toFixed(0);
		this.#setWokdCoordinates(base, structuredClone(list));
		this.#coordinates.finalSize = [
			+X,
			+Z,
			+Y
		];
		return [...this.#coordinates.finalSize];
	}
	#tubeCrate(works) {
		const baseSize = this.#sizeComposer(works);
		return this.#setPaddings(baseSize, works);
	}
	#hugeTubes(tubes) {
		const result = [];
		const MAXCONTENT = 3;
		let getter;
		while (tubes.length >= MAXCONTENT) {
			getter = tubes.splice(0, MAXCONTENT);
			result.push(this.#tubeCrate(getter.length));
			result.push({ works: getter });
		}
		console.log("🗣️", result);
		return result;
	}
	#checkHugeTubes() {
		const getter = [];
		this.#tubes.filter((tube) => {
			if (tube[2] > this.#DIAMETER) getter.push(tube);
			return tube;
		});
		getter.map((roll) => {
			this.#tubes.splice(this.#tubes.indexOf(roll), 1);
			return roll;
		});
		return getter;
	}
	#possibleCrates() {
		let reduce;
		let tubes;
		const crates = [];
		const MAXCONTENT = 3;
		const biggest = this.#checkHugeTubes();
		if (biggest.length > 0 || biggest.length > MAXCONTENT) crates.push(this.#hugeTubes(biggest));
		while (this.#tubes.length) {
			tubes = this.#tubes.splice(0, MAXCONTENT);
			reduce = structuredClone(tubes);
			crates.push(this.#tubeCrate(reduce));
			crates[0].push(this.#coordinates);
			crates.push({ works: tubes });
		}
		if (this.#tubes.length >= 1) {
			tubes = this.#tubes.splice(0, MAXCONTENT);
			reduce = structuredClone(tubes);
			crates.push(this.#tubeCrate(reduce));
			crates[0].push(this.#coordinates);
			crates.push({ works: tubes });
		}
		return { crates };
	}
	get makeCrate() {
		return this.#crateMaker();
	}
};
//#endregion
//#region app/core2/Crater.class.mjs
var Crater = class {
	#materials;
	#works;
	#crates;
	constructor(procList, materials) {
		if (procList === Arranger) {
			this.#materials = materials;
			this.#works = procList.list;
			this.#crates = [];
		}
	}
	#startCrateList() {
		if (!this.#works) return false;
		let key = 0;
		const CRATES = [
			"tubeCrate",
			"largestCrate",
			"sameSizeCrate",
			"noCanvasCrate",
			"standardCrate"
		];
		try {
			this.#tubeCrate();
			this.#LargestCanvas();
			this.#sameSizeCrate();
			this.#noCanvasCrate();
			this.#standardCrates();
			this.#lastCheckArrangerSameSizeToStandard();
			for (key in this.#crates) if (!(this.#crates[key]?.hasOwnProperty("crates") && CRATES.includes(key))) delete this.#crates[key];
			this.#allCrates();
			this.#cubAir();
			this.#totalCub();
			this.#whichAirPort();
			if (Array.isArray(this.#crates?.sameSizeCrate?.backUp)) {
				this.#totalCubBackUp();
				this.#whichAirPortBackUp();
				this.#allCratesBackUp();
			}
			return { crates: this.#crates };
		} catch (e) {
			console.error("Crater Failed:", e);
		}
	}
	#tubeCrate() {
		if (this.#works?.tubes?.length > 0) {
			const tubeCrate = new CraterTube(this.#works?.tubes, this.#materials);
			this.#crates.tubeCrate = tubeCrate.makeCrate;
		}
	}
	#LargestCanvas() {
		if (this.#works?.largest?.length > 0) {
			const largestcrates = new CraterPythagoras(this.#works?.largest, this.#materials);
			this.#crates.largestCrate = largestcrates.makeCrate;
		}
	}
	#sameSizeCrate() {
		if (this.#works?.sameSize?.length > 0) {
			const sameMeasure = new CraterSameSize(this.#works?.sameSize, this.#materials);
			this.#crates.sameSizeCrate = sameMeasure.makeCrate;
		}
	}
	#noCanvasCrate() {
		if (this.#works?.noCanvas?.length > 0) {
			const noCanvas = new CraterNotCanvas(this.#works?.noCanvas, this.#materials);
			this.#crates.noCanvasCrate = noCanvas.makeCrate;
		}
	}
	#standardCrates() {
		if (this.#works?.sorted?.length > 0) {
			const std = new CraterStandard(this.#works?.sorted, this.#materials, 4, false);
			this.#crates.standardCrate = std.makeCrate;
		}
	}
	#lastCheckArrangerSameSizeToStandard() {
		const check1 = Object.entries(this.#crates).some((data) => data[0] === "sameSizeCrate");
		const check2 = Object.entries(this.#crates).some((data) => data[0] === "standardCrate");
		if (check1 && check2) this.#crates = new CraterLastCheckReArranger(this.#crates, this.#materials).reduceCrates;
	}
	#allCrates() {
		let key = 0;
		const CRATES = [];
		const filterCrates = (data) => {
			Array.isArray(data) && CRATES.push(data);
		};
		for (key in this.#crates) this.#crates[key]?.crates?.map(filterCrates);
		this.#crates.allCrates = CRATES;
	}
	#allCratesBackUp() {
		let check1;
		let check2;
		let key = 0;
		const CRATES = [];
		const filterCrates = (data) => {
			Array.isArray(data) && CRATES.push(data);
		};
		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";
			if (check1 || check2) this.#crates[key]?.backUp?.map(filterCrates);
			this.#crates[key]?.crates?.map(filterCrates);
		}
		this.#crates.allCratesBackUp = CRATES;
	}
	#cubAir() {
		let key = 0;
		const setCub = (sizes) => {
			if (Array.isArray(sizes) && sizes.length >= 3) {
				const X = sizes[0];
				const Z = sizes[1];
				const Y = sizes[2];
				const cubCrate = new CubCalc(X, Z, Y).cubCalcAir;
				const data = sizes.length === 4 ? sizes.splice(3, 1, cubCrate) : sizes.push(cubCrate);
				Array.isArray(data) && sizes.push(data);
			}
		};
		for (key in this.#crates) this.#crates[key]?.crates?.map(setCub);
		if (Array.isArray(this.#crates?.sameSizeCrate?.backUp)) {
			this.#crates?.sameSizeCrate?.backUp?.map(setCub);
			this.#crates?.standardCrate?.backUp?.map(setCub);
		}
	}
	#totalCub() {
		let key = 0;
		let total = [];
		const setTotalCub = (crate) => {
			Array.isArray(crate) && total.push(crate[3]);
		};
		for (key in this.#crates) this.#crates[key]?.crates?.map(setTotalCub);
		total = total.reduce((sum, val) => sum + val, 0);
		this.#crates.airCubTotal = total.toFixed(3);
	}
	#totalCubBackUp() {
		let check1;
		let check2;
		let total = [];
		let key = 0;
		const setTotalCub = (crate) => {
			if (Array.isArray(crate)) total.push(crate[3]);
		};
		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";
			if (check1 || check2) this.#crates[key]?.backUp?.map(setTotalCub);
			else if (!(check1 || check2)) this.#crates[key]?.crates?.map(setTotalCub);
		}
		total = total.reduce((sum, val) => +(sum + val).toFixed(3), 0);
		this.#crates.airCubTotalBackUp = total;
	}
	#airPortOptions(crate) {
		const MAXX = 300;
		const MAXZ = 200;
		const MAXY = 160;
		if (Array.isArray(crate)) {
			const X = crate[0];
			const Z = crate[1];
			const Y = crate[2];
			return !(X > MAXX || Z > MAXZ || Y > MAXY) ? "PAX" : "CARGO";
		}
	}
	#whichAirPort() {
		let pax = 0;
		let cargo = 0;
		let key = 0;
		let tmp;
		for (key in this.#crates) this.#crates[key]?.crates?.map((crate) => {
			tmp = this.#airPortOptions(crate);
			tmp === "PAX" ? pax++ : tmp === "CARGO" && cargo++;
		});
		this.#crates.whichAirPort = [{ PAX: pax }, { CARGO: cargo }];
	}
	#whichAirPortBackUp() {
		let check1;
		let check2;
		let tmp;
		let key = 0;
		let pax = 0;
		let cargo = 0;
		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";
			if (check1 || check2) this.#crates[key]?.backUp?.map((crate) => {
				tmp = this.#airPortOptions(crate);
				tmp === "PAX" ? pax++ : tmp === "CARGO" && cargo++;
			});
			else if (!(check1 || check2)) this.#crates[key]?.crates?.map((crate) => {
				tmp = this.#airPortOptions(crate);
				tmp === "PAX" ? pax++ : tmp === "CARGO" && cargo++;
			});
		}
		this.#crates.whichAirPortBackUp = [{ PAX: pax }, { CARGO: cargo }];
	}
	get makeCrate() {
		return this.#startCrateList();
	}
};
//#endregion
//#region app/core2/Unit.Adapter.class.mjs
var UnitAdapter = class {
	#list;
	#unit;
	#materials;
	constructor(works, unit) {
		this.#materials = {
			materials: JSON.parse(localStorage.getItem("materials")),
			cratesOnly: JSON.parse(localStorage.getItem("crating"))
		};
		this.#list = works;
		this.#unit = unit;
		return this.#definePath();
	}
	#checkInput() {
		try {
			if (!Array.isArray(this.#list)) throw new TypeError(`Please, provide a valid list.`);
			if (this.#list.some((art) => {
				return art.constructor.name !== "ArtWork";
			})) throw new TypeError(`Please, provide a type of 'ArtWork' object list.`);
			if (this.#unit !== "cm" && this.#unit !== "in") throw new TypeError(`Please, provide a valid unit.`);
		} catch (err) {
			return err;
		}
		return "pass";
	}
	async #definePath() {
		let result;
		const checker = this.#checkInput();
		switch (checker !== "pass" ? "error" : this.#unit === "cm" ? "cm" : "in") {
			case "error": return checker;
			case "cm":
				result = await this.#cmPath();
				return result;
			case "in":
				result = await this.#inPath();
				return result;
		}
	}
	#reversionUnit(data) {
		const CHECK1 = data?.hasOwnProperty("crates");
		const CHECK2 = data?.hasOwnProperty("backUp");
		if (Array.isArray(data)) return data = data.map(swapUnitReversion);
		else if (!data?.hasOwnProperty("crates")) return data;
		else if (CHECK1 || CHECK2) {
			data.crates = data.crates.map((info) => {
				if (info.length === 4) return info = swapUnitReversion(info);
				Array.isArray(info.works[0]) ? info.works = info.works.map(swapUnitReversion) : info.works = info.works.map(layerInterface);
				return info;
			});
			console.log(data.crates);
		}
		return data;
	}
	#convertToCM() {
		return this.#list.map((art) => {
			const converted = art.autoConvert;
			const code = converted[0];
			const x = converted[1];
			const z = converted[2];
			const y = converted[3];
			return new ArtWork(code, x, z, y);
		});
	}
	#convertToIN(crates) {
		const CUBCONST = .061023;
		let key = 0;
		for (key in crates) if (Object.hasOwn(crates[key], "crates")) crates[key] = this.#reversionUnit(crates[key]);
		if (crates.sameSizeCrate?.hasOwnProperty("backUp")) {
			crates.airCubTotalBackUp = +(crates.airCubTotalBackUp * CUBCONST).toFixed(3);
			crates.allCratesBackUp = this.#reversionUnit(crates.allCratesBackUp);
		}
		crates.allCrates = this.#reversionUnit(crates.allCrates);
		return crates;
	}
	async #cmPath() {
		return await Promise.resolve(new Arranger(this.#list).start).then((procList) => new Crater(procList, this.#materials).makeCrate).then((cratesDone) => cratesDone.crates).catch((err) => err);
	}
	async #inPath() {
		return await Promise.resolve(this.#convertToCM()).then((list) => new Arranger(list).start).then((procList) => new Crater(procList, this.#materials).makeCrate).then((cratesDone) => this.#convertToIN(cratesDone.crates)).catch((err) => err);
	}
};
function swapUnitReversion(sizes) {
	const CUBCONST = .061023;
	let tmp;
	let x;
	let z;
	let y;
	console.log(sizes);
	switch (sizes.length) {
		case 4:
			x = sizes[0];
			z = sizes[1];
			y = sizes[2];
			tmp = Array.from(new Converter(x, z, y).inConvert);
			tmp.push(+(sizes[3] * CUBCONST).toFixed(3));
			sizes = tmp;
			return sizes;
		case 5:
			x = sizes[1];
			z = sizes[2];
			y = sizes[3];
			tmp = Array.from(new Converter(x, z, y).inConvert);
			tmp.unshift(sizes[0]);
			tmp.push(+(sizes[3] * CUBCONST).toFixed(3));
			sizes = tmp;
			return sizes;
		case 6:
			x = sizes[1];
			z = sizes[2];
			y = sizes[3];
			tmp = Array.from(new Converter(x, z, y).inConvert);
			tmp.unshift(sizes[0]);
			tmp.push(+(sizes[3] * CUBCONST).toFixed(3));
			tmp.push(sizes[5]);
			sizes = tmp;
			return sizes;
	}
}
function layerInterface(layer) {
	let key;
	for (key in layer) Array.isArray(layer[key][0][0][0]) ? layer[key][0].map((work) => work.splice(0, 1, swapUnitReversion(work[0]))) : layer[key] = [swapUnitReversion(layer[key][0])];
	return layer;
}
//#endregion
//#region app/front-modules/bridge.link.web.db.mjs
/**
* @param {String} doc The reference/document code estimate when the page is offline.
*/
function setOfflineRef(doc) {
	const STORAGE = localStorage;
	const offList = STORAGE.getItem("offResults");
	const list = offList !== void 0 ? JSON.parse(offList) : false;
	if (list) {
		list.push(doc);
		STORAGE.removeItem("offResults");
		STORAGE.setItem("offResults", JSON.stringify(list));
	} else STORAGE.setItem("offResults", JSON.stringify([doc]));
}
/**
* @param {Crater} content The solved list result from the algorithm.
*/
async function getNewTokens(content) {
	const url = "/api/v1/shift/tokens";
	const HEADER = { "Content-Type": "application/json; charset=UTF-8" };
	try {
		const result = await fetch(url, {
			method: "POST",
			headers: HEADER
		}).then((code) => code.status).catch((err) => console.error(`ALERT ${err}`));
		postDataFromClientSide(content);
		console.log(result);
	} catch (err) {
		alert(`ATTENTION: ${err}`);
	}
}
/**
* @param {Number} code HTTP code.
* @param {String} info The server answer about the user access token.
* @param {Crater} data The crater object result serialized.
* @param {Object} header Object header to HTTP request.
*/
function checkStatusCode(code, info, data, header) {
	switch (code) {
		case 409:
			upDateEstimateClient(data, header, info);
			break;
		case 403:
			getNewTokens(info);
			break;
	}
}
/**
* @param {Object} solve the solved list with new crates sizes
*/
async function upDateCrateSizes(solved) {
	const HEADER = { "Content-Type": "application/json; charset=UTF-8" };
	const url = "/api/v1/update/estimates";
	const { reference, list, crates } = solved;
	const INFO = {
		reference,
		list,
		crates: Object.assign({}, crates)
	};
	try {
		await fetch(url, {
			method: "PUT",
			body: JSON.stringify(INFO),
			headers: HEADER
		}).then((code) => code.status).catch((err) => console.error(`ALERT ${err}`));
	} catch (err) {
		alert(`ATTENTION: ${err}`);
	} finally {
		return "updated";
	}
}
/**
* @param {String} content The server answer about the user access token.
* @param {Crater} data The crater object result serialized.
* @param {Object} header Object header to HTTP request.
*/
async function upDateEstimateClient(data, header, content) {
	if (confirm("This estimate already exist. Would you like to update it?")) {
		const url = "/api/v1/update/estimates";
		try {
			const result = await fetch(url, {
				method: "PUT",
				body: data,
				headers: header
			}).then((code) => code.status).catch((err) => console.error(`ALERT ${err}`));
			result === 403 && checkStatusCode(result, content);
		} catch (err) {
			alert(`ATTENTION: ${err}`);
		}
	} else alert(`Not updated!`);
}
/**
* @param {Crater} content The solved list result from the algorithm.
*/
async function postDataFromClientSide(content) {
	const DATA = JSON.stringify(content);
	const url = `/api/v1/newEstimate`;
	const HEADER = { "Content-Type": "application/json; charset=UTF-8" };
	if (globalThis.navigator.onLine) try {
		checkStatusCode(await fetch(url, {
			method: "POST",
			body: DATA,
			headers: HEADER
		}).then((code) => code.status).catch((err) => console.error(`ALERT ${err}`)), content, DATA, HEADER);
	} catch (err) {
		alert(`ATTENTION: ${err}`);
	}
	else setOfflineRef(content.reference);
}
/**
* @param {String} estimate The algorithm solved result.
*/
async function saveTheCurrentEstimate(estimate) {
	const { reference, list, crates } = estimate;
	await postDataFromClientSide({
		reference,
		list,
		crates: Object.assign({}, crates)
	});
}
//#endregion
//#region app/front-modules/link.storage.mjs
/**
* @function Creates a new indexedDB table in the browser for all crate results.
*/
function createIDB() {
	const dataName = "Results";
	const request = globalThis.indexedDB.open(dataName);
	request.onerror = (event) => {
		alert(`ATTENTION! ${event.target.errorCode}`);
	};
	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		let object;
		object = db.createObjectStore(dataName, { keyPath: "reference" });
		object.createIndex("reference", "reference", { unique: true });
	};
}
/**
* @function Creates a new indexedDB table in the browser for all Materials results.
*/
function createIDBMaterials() {
	const dataName = "Materials";
	const request = globalThis.indexedDB.open(dataName);
	request.onerror = (event) => {
		alert(`ATTENTION! ${event.target.errorCode}`);
	};
	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		let object;
		object = db.createObjectStore(dataName, { keyPath: "materials" });
		object.createIndex("materials", "materials", { unique: true });
	};
}
/**
* @function Creates a new indexedDB table in the browser for all off-line results.
*/
function createOffLineIDB() {
	const dataName = "off_line_results";
	const request = globalThis.indexedDB.open(dataName);
	request.onerror = (event) => {
		alert(`ATTENTION! ${event.target.errorCode}`);
	};
	request.onupgradeneeded = (event) => {
		const db = event.target.result;
		let object;
		object = db.createObjectStore(dataName, { keyPath: "reference" });
		object.createIndex("reference", "reference", { unique: true });
	};
}
/**
* @param {Crater} works The list to add in indexed DB when the page is off-line.
*/
function addNewWorksToIndexedDBOffLine(works, fetched) {
	const dataName = "off_line_results";
	const list = document.getElementById("input_estimate").value;
	const request = globalThis.indexedDB.open(dataName);
	request.onerror = (event) => {
		alert(`ERROR: ${event.target.errorCode}`);
	};
	request.onsuccess = async (event) => {
		const object = event.target.result.transaction(dataName, "readwrite").objectStore(dataName);
		const existsInIDB = object.get(works.reference);
		existsInIDB.onsuccess = () => {
			existsInIDB.result === void 0 ? object.add(works) : object.delete(existsInIDB.result.reference) && object.add(works);
			movingDataToSesseionStorage(list, fetched);
		};
	};
}
/**
* @param {Crater} works The list to add in indexedDB when all crates is done.
*/
function addNewWorksToIndexedDB(works, fetched = false) {
	const reference = localStorage.getItem("refNumb");
	const dataName = "Results";
	const request = globalThis.indexedDB.open(dataName);
	const onLine = globalThis.navigator.onLine;
	request.onerror = (event) => {
		alert(`ERROR: ${event.target.errorCode}`);
	};
	request.onsuccess = async (event) => {
		const object = event.target.result.transaction(dataName, "readwrite").objectStore(dataName);
		const existsInIDB = object.get(works.reference);
		existsInIDB.onsuccess = async () => {
			existsInIDB.result === void 0 ? object.add(works) : await Promise.resolve(object.delete(existsInIDB.result.reference)).then(object.add(works));
			movingDataToSesseionStorage(reference, fetched);
		};
		onLine || addNewWorksToIndexedDBOffLine(works);
	};
}
/**
* @param {String} reference The code/reference to the crates process.
*/
async function movingDataToSesseionStorage(reference, fetched = false) {
	const request = globalThis.indexedDB.open("Results");
	request.onerror = (event) => {
		alert(`WARNING: ${event.target.errorCode}`);
	};
	request.onsuccess = () => {
		const db = request.result.transaction("Results").objectStore("Results").get(reference);
		db.onsuccess = async () => {
			const reference = localStorage.getItem("refNumb");
			const obj = db.result;
			globalThis.sessionStorage.setItem(reference, JSON.stringify(obj));
			fetched === false && await saveTheCurrentEstimate(db.result);
			fetched === "crate" && await upDateCrateSizes(db.result);
		};
	};
}
//#endregion
//#region app/front-modules/functions.front.end.mjs
globalThis.onstorage = () => {
	displayCub();
	displayAirCub();
	countWorks();
};
async function countWorks() {
	const result = await parseArtWork();
	const counter = document.getElementById("count");
	result && result.length > 0 && document.getElementById("statusList").setAttribute("content", result.length);
	counter.innerText = result ? "Counting: " + result?.length : "Counting 0";
	return counter;
}
async function displayCub() {
	let result;
	const COMA = 1e3;
	const element = document.getElementById("cub-meter");
	result = await parseArtWork();
	result = result?.reduce((sum, val) => {
		return sum + val.cubed;
	}, 0) ?? 0;
	element.innerText = "Cub: " + (result * COMA / COMA).toFixed(3) + "m³";
	return element;
}
async function displayAirCub() {
	let result;
	let element;
	let std_msg;
	const COMA = 1e3;
	std_msg = "Air-Cub: ";
	element = document.getElementById("cub-air");
	result = await parseArtWork();
	result = result?.reduce((sum, val) => {
		return sum + val.cAir;
	}, 0) ?? 0;
	element.innerText = std_msg + (result * COMA / COMA).toFixed(3);
	return element;
}
function setPanels() {
	const fragment1 = new DocumentFragment();
	const fragment2 = new DocumentFragment();
	const pane1 = document.createElement("panel-info");
	const pane2 = document.createElement("panel-info");
	const firstPane = document.getElementById("first_pane");
	const secondPane = document.getElementById("second_pane");
	while (firstPane.firstChild) firstPane.removeChild(firstPane.firstChild);
	while (secondPane.firstChild) secondPane.removeChild(secondPane.firstChild);
	pane1.id = "first-pane";
	pane2.id = "second-pane";
	pane1.setAttribute("name", "pane1");
	pane2.setAttribute("name", "pane2");
	fragment1.append(pane1);
	fragment2.append(pane2);
	firstPane.append(fragment1);
	secondPane.append(fragment2);
}
async function crate$1(fetched = false) {
	const estimate = {};
	const weak = /* @__PURE__ */ new WeakSet();
	const e_code = localStorage.getItem("refNumb") ?? document.getElementById("input_estimate").value;
	const grant = document.cookie.split("=")[1];
	let list;
	const cratesAsCm = await checkMetric();
	const root = document.querySelector(":root");
	const material = document.querySelector(".update-materials");
	const upPanel = document.querySelector(".materials");
	if (fetched || confirm("Ready to crate all works?") && cratesAsCm) {
		setPanels();
		estimate.reference = e_code;
		list = await parseArtWork();
		estimate.list = list.map((art) => art.data);
		estimate.crates = cratesAsCm;
		addNewWorksToIndexedDB(estimate, fetched);
		material.setAttribute("name", "materials-used");
		upPanel.setAttribute("name", "packed-works");
		upPanel.setAttribute("content", "crates");
		(grant === "FULL" || grant === "PLOTTER" || !grant) && (document.getElementById("crate-layers").disabled = false);
		root.style.setProperty("--layer-state", "block");
		sessionStorage.removeItem("crate");
		sessionStorage.removeItem("plotter");
		sessionStorage.removeItem("graphics");
	}
	weak.add(estimate);
	return "Crated";
}
async function cleanInputs(fetched = false) {
	document.getElementById("input_code").value = "";
	document.getElementById("input_length").value = "";
	document.getElementById("input_depth").value = "";
	document.getElementById("input_height").value = "";
	const RENDER = document.getElementById("show-layer");
	const dialog = document.querySelectorAll("padding-dialog").length;
	const root = document.querySelector(":root");
	const packs = document.querySelector(".update-materials");
	let granted = document.cookie;
	granted = granted.split("=")[1];
	RENDER && RENDER.hasChildNodes() && openDisplay();
	globalThis.document.getElementById("input_estimate").select();
	globalThis.document.getElementById("input_code").select();
	packs.getAttribute("name") !== "update-materials" && packs.setAttribute("name", "update-materials");
	countWorks();
	displayCub();
	displayAirCub();
	dialog > 0 && sessionStorage.setItem("CLOSED", "NOW");
	root.style.setProperty("--layer-state", "none");
}
async function parseArtWork() {
	const DB = localStorage;
	const temp = [];
	let works;
	const avoid = [
		"doneList",
		"mode",
		"storage",
		"currency",
		"metrica",
		"refNumb",
		"offResults",
		"FETCHED",
		"materials",
		"packing",
		"crating"
	];
	Object.entries(DB).map((data) => {
		!avoid.includes(data[0]) && temp.push(JSON.parse(data[1]));
		return data;
	});
	if (temp.length > 0) works = temp.map((work) => {
		const { code, x, z, y, packing } = work;
		return new ArtWork(code, x, z, y, packing);
	});
	return works ? works : void 0;
}
async function checkMetric() {
	const UNIT = localStorage.getItem("metrica") === "cm - centimeters" ? "cm" : "in";
	const list = await parseArtWork();
	let crates;
	if (list.length === 0) return alert("Oops! Sounds like you do not added any work yet. Please, try again!");
	crates = await Promise.resolve(new UnitAdapter(list, UNIT));
	return crates;
}
//#endregion
//#region app/front-modules/checkout.mjs
globalThis.onload = async () => {
	const color = localStorage.getItem("mode");
	const statusFrame = document.getElementById("status-frame");
	const list = document.getElementById("statusList");
	sessionStorage.removeItem("onCrate");
	sessionStorage.removeItem("plotter");
	sessionStorage.removeItem("graphics");
	sessionStorage.removeItem("crate");
	list ? list.setAttribute("content", "reload") : statusFrame.append(addPanelInfo());
	browserStoragePrepare();
	color === null && localStorage.setItem("mode", "light");
	setCheckRadio();
	setModeColor();
	populateRightPanels();
};
async function populateRightPanels() {
	const fragment1 = new DocumentFragment();
	const fragment2 = new DocumentFragment();
	const materials = document.createElement("pack-up");
	const report = document.createElement("pack-down");
	const paneUp = document.getElementById("contents1");
	const packDown = document.getElementById("contents2");
	materials.setAttribute("name", "select-materials");
	materials.className = "materials";
	materials.ariaHidden = "false";
	report.setAttribute("name", "update-materials");
	report.setAttribute("content", "0");
	report.className = "update-materials";
	fragment1.appendChild(materials);
	fragment2.appendChild(report);
	paneUp.appendChild(fragment1);
	packDown.appendChild(fragment2);
}
function addPanelInfo() {
	const fragment = new DocumentFragment();
	const status = document.createElement("panel-info");
	status.setAttribute("name", "status");
	status.id = "statusList";
	status.class = "addedStatus";
	status.setAttribute("content", 0);
	return fragment.appendChild(status);
}
if (!localStorage.getItem("metrica")) {
	const metrica = document.getElementById("cm").value;
	localStorage.setItem("metrica", metrica);
}
function setUnit() {
	const measure = localStorage.getItem("metrica");
	const check = confirm("Attention! You are going to change the measurement of the works.");
	if (!measure || measure === void 0) localStorage.setItem("metrica", document.getElementById("cm").value);
	else if (check) {
		measure === "cm - centimeters" ? localStorage.setItem("metrica", "in - inches") : localStorage.setItem("metrica", "cm - centimeters");
		sessionStorage.setItem("clean", "reload");
	}
	setCheckRadio();
}
const crate = () => {
	browserStoragePrepare();
	crate$1();
	const element = document.querySelector(".result");
	if (sessionStorage.getItem("codes")) {
		element && element.ariaHidden === "true" && openDisplay();
		setTimeout(() => globalThis.scroll({
			top: 300,
			behavior: "smooth"
		}), 1e3);
	}
};
function clearBrowserStorage() {
	const { mode, metrica, materials } = localStorage;
	if (mode && metrica && materials) {
		localStorage.clear();
		sessionStorage.clear();
		localStorage.setItem("mode", mode);
		localStorage.setItem("metrica", metrica);
		localStorage.setItem("materials", materials);
	}
	countWorks();
	displayCub();
	displayAirCub();
}
const clearAll = () => {
	const status = document.getElementById("statusList");
	const statusFrame = document.getElementById("status-frame");
	const pane1 = document.getElementById("first_pane");
	const pane2 = document.getElementById("second_pane");
	const closeDialog = document.querySelector(".side-menu");
	if (confirm("Do you really want to delete the whole list?")) {
		clearBrowserStorage();
		cleanInputs(true);
		globalThis.document.getElementById("input_estimate").value = "";
		globalThis.document.getElementById("input_estimate").select();
		status.setAttribute("content", void 0);
		statusFrame.removeChild(document.getElementById("statusList"));
		pane1.firstChild && pane1.removeChild(document.getElementById("first-pane"));
		pane2.firstChild && pane2.removeChild(document.getElementById("second-pane"));
		statusFrame.append(addPanelInfo());
		closeDialog.getElementsByTagName("panel-info").length > 0 && document.querySelector(".side-menu").lastElementChild.setAttribute("name", "close");
		document.querySelector(".materials").setAttribute("name", "select-materials");
		sessionStorage.removeItem("plotter");
		sessionStorage.removeItem("graphics");
		sessionStorage.removeItem("crate");
	}
};
function browserStoragePrepare() {
	const ref = localStorage.getItem("refNumb");
	let grants = document.cookie;
	grants = grants.split("=")[1];
	if (ref) document.getElementById("input_estimate").value = ref;
	createIDB();
	createIDBMaterials();
	if (grants === "OFF" || grants === "FULL") createOffLineIDB();
	return displayCub() && displayAirCub() && countWorks();
}
function setCheckRadio() {
	switch (localStorage.getItem("metrica")) {
		case "cm - centimeters":
			document.getElementById("cm").checked = true;
			break;
		case "in - inches":
			document.getElementById("in").checked = true;
			break;
	}
}
function setModeColor() {
	const color = localStorage.getItem("mode");
	const body = document.body;
	switch (color) {
		case "light":
			document.getElementById("light-mode").checked = true;
			body.classList.remove("dark-mode");
			body.classList.toggle("light-mode");
			break;
		case "dark":
			document.getElementById("dark-mode").checked = true;
			body.classList.remove("light-mode");
			body.classList.toggle("dark-mode");
			break;
	}
}
//#endregion
//#region app/front-modules/logout.mjs
function cleanCacheSW() {
	globalThis.navigator.serviceWorker.ready.then(async (registration) => {
		await caches.delete("craterCache_v1");
		await caches.delete("status_V1");
		await caches.delete("pane1_v1");
		await caches.delete("pane2_v1");
		await registration.unregister();
	});
}
async function logout() {
	/**
	* @constant {url}
	*/
	const url = "/api/v1/logout";
	if (confirm("Are you sure to logout?")) await fetch(url, { method: "GET" }).then(cleanCacheSW).then((res) => globalThis.location.assign(res.url)).catch(async () => {
		await Promise.resolve(cleanCacheSW).then(globalThis.location.replace("https://ottocratesolver.com/login"));
	});
}
//#endregion
//#region app/front-modules/mode.color.mjs
function switchMode(mode) {
	localStorage.setItem("mode", mode);
	changeMode(mode);
}
function changeMode(color) {
	const body = document.body.classList;
	body.remove("light-mode");
	body.remove("dark-mode");
	return color === "dark" ? body.add("dark-mode") : body.add("light-mode");
}
//#endregion
//#region app/front-modules/start.front.mjs
function definedPackingMaterials() {
	const packs = JSON.parse(localStorage.getItem("packing"));
	const materials = JSON.parse(localStorage.getItem("materials"));
	const filtered = [];
	if (!packs || packs.length === 0) return false;
	packs.filter((type) => {
		filtered.push(materials.find((opts) => opts[0] === type).flat());
		return type;
	});
	return filtered;
}
function checkWork(work) {
	const checked = regValid([
		+work[1],
		+work[2],
		+work[3]
	].map((size) => parseInt(size)));
	const regex = /[^-a-z-A-Z-0-9]/g;
	const estimate = document.getElementById("input_estimate").value;
	const materials = definedPackingMaterials();
	let i = 0;
	if (!materials) {
		alert("Please, select some packing material to apply to the artwork.");
		return "material";
	}
	if (regex.test(work[0]) || regex.test(estimate)) {
		alert(`Found special character NOT allowed on "Work code",\
		or "Estimate" input. Please, try again!`);
		return false;
	}
	for (i in localStorage.key(i)) if (work[0] === localStorage.key(i)) {
		alert(`${work[0]} already added to the list. Please, try again`);
		return false;
	}
	checkReference();
	return Array.isArray(checked) ? new ArtWork(work[0], checked[0], checked[1], checked[2], structuredClone(materials)) : false;
}
function regValid(sizesParsed) {
	let i = 2;
	const regex = /^[0-9.0-9]{1,7}$/;
	while (--i >= 0) if (!regex.test(sizesParsed[i])) switch (i) {
		case 2:
			alert(`The provide HEIGHT is not a valid number.\
					Please, try again!`);
			return false;
		case 1:
			alert(`The provide DEPTH is not a valid number.\
					Please, try again!`);
			return false;
		case 0:
			alert(`The provide LENGTH is not a valid number.\
					Please, try again!`);
			return false;
	}
	return sizesParsed;
}
function selectEmptyinput() {
	const IDS = [
		"input_estimate",
		"input_code",
		"input_length",
		"input_depth",
		"input_height"
	];
	let aux = false;
	IDS.find((field) => {
		const input = document.getElementById(field);
		if (!input.value && !aux) {
			aux = true;
			return input.select();
		}
		return field;
	});
}
async function catchWork() {
	const estimate = document.getElementById("input_estimate").value;
	const cod = document.getElementById("input_code").value;
	const length = document.getElementById("input_length").value;
	const depth = document.getElementById("input_depth").value;
	const height = document.getElementById("input_height").value;
	let tmp;
	if (!estimate) return alert("Attention! Please, add the \"Doc:\" reference field!");
	switch (cod && length && depth && height) {
		case "":
			alert(`Oops! Do not forget to fill each field. Please, try again!`);
			return selectEmptyinput();
	}
	tmp = checkWork([
		cod,
		length,
		depth,
		height
	]);
	if (tmp && tmp !== "material") {
		await orderWorks(tmp.data);
		localStorage.setItem(tmp.data.code, JSON.stringify(tmp.data));
		localStorage.setItem("storage", "art-work");
		countWorks();
		displayAirCub();
		displayCub();
		cleanInputs();
	}
	return !tmp || tmp === "material" ? 0 : cleanInputs();
}
function catchRemove() {
	const work = prompt("Please enter the work code to be removed split by spaces:", "code?");
	const toRemove = work ? work.split(" ") : false;
	if (!toRemove) return cleanInputs();
	toRemove.map((art) => {
		if (localStorage.getItem(art)) {
			orderRemove(art);
			localStorage.removeItem(work);
		} else if (!art) return cleanInputs();
		else alert(`"${art}" was not found in the list. Please, try again!`);
		countWorks();
		displayAirCub();
		displayCub();
		return art;
	});
	localStorage.setItem("storage", "art-work");
	return cleanInputs();
}
function checkReference() {
	const ref = localStorage.getItem("refNumb");
	const actual = document.getElementById("input_estimate").value;
	if (ref) {
		if (ref !== actual) if (confirm("ATTENTION! The refNumb has changed")) {
			localStorage.removeItem("refNumb");
			localStorage.setItem("refNumb", actual);
			document.getElementById("input_estimate").value = actual;
		} else document.getElementById("input_estimate").value = ref;
	}
	localStorage.setItem("refNumb", actual);
}
async function orderWorks({ code }) {
	const storage = sessionStorage;
	const array = JSON.parse(storage.getItem("codes"));
	let num;
	if (!array) return storage.setItem("codes", JSON.stringify([[0, code]]));
	num = Number.parseInt(array[array.length - 1]);
	num = num + 1;
	array.push([num, code]);
	return storage.setItem("codes", JSON.stringify(array));
}
function orderRemove(code) {
	const session = sessionStorage;
	const codes = JSON.parse(session.getItem("codes"));
	let i = 0;
	while (codes[i][1] !== code && i <= codes.length) i++;
	codes.splice(i, 1);
	session.setItem("codes", JSON.stringify(codes));
}
//#endregion
//#region app/installation.handler.mjs
async function installer() {
	globalThis.hideInstallPromotion();
	globalThis.deferredPrompt.prompt();
	const { outcome } = await deferredPrompt.userChoice;
	console.log(`User response to the install prompt: ${outcome}`);
	globalThis.deferredPrompt = null;
}
//#endregion
//#region app/panels/clip.board.formatter.mjs
function extractWorksLayers({ works }) {
	const arts = [];
	(Array.isArray(works[0][0]) ? works[0] : works)?.map((data) => {
		let layer;
		if (Array.isArray(data)) return arts.push(data);
		for (layer in data) {
			arts.push(layer);
			data[layer].length === 1 ? arts.push(data[layer][0]) : !Array.isArray(data[0]) ? data[layer].map((work) => arts.push(work)) : data[layer][0].map((work) => arts.push(work));
		}
	});
	return arts;
}
function findCratesAndWorks({ crates }) {
	const polygons = [];
	let key;
	let tmp;
	for (key in crates) if (Object.hasOwn(crates[key], "crates")) crates[key].crates.map((info, j) => {
		switch (j % 2) {
			case 0:
				polygons.push(info);
				break;
			case 1:
				tmp = extractWorksLayers(info);
				tmp.map((arts) => polygons.push(arts));
				tmp = null;
				break;
		}
	}, 0);
	sessionStorage.setItem("copy2", "done!");
	return formatterClipBoard(polygons);
}
function findCrates({ crates }) {
	sessionStorage.setItem("copy1", "done!");
	return formatterClipBoard(crates.allCrates);
}
function formatterClipBoard(data) {
	if (!data) return "There is no crates. Please, try again!";
	const unit = localStorage.getItem("metrica") === "cm - centimeters" ? "cm" : "in";
	const formatted = data.map((info) => {
		let line;
		if (typeof info === "string") return `LAYER layer ${info?.at(-1)}:`;
		if (info.length >= 5) {
			line = `CODE: ${info[0]} - ${info[1]} x ${info[2]} x ${info[3]} - ${unit}`;
			return line;
		} else if (info.length === 4) {
			line = `CRATE: ${info[0]} x ${info[1]} x ${info[2]} - ${unit}`;
			return line;
		}
	});
	const copyFinished = charRemover(JSON.stringify(formatted), formatted.length);
	navigator.clipboard.writeText(copyFinished);
}
function charRemover(target, len) {
	while (len--) {
		target = target.replace("LAYER", "	");
		target = target.replace("CODE: ", "		");
		target = target.replace("\"", "");
		target = target.replace("\"", "");
		target = target.replace(",", "\n");
	}
	target = target.replace("[", "");
	target = target.replace("]", "");
	return target;
}
//#endregion
//#region app/panels/clip.board.caller.mjs
function copyButton1() {
	const crates = new Worker(new URL("./panels/worker.IDB.crates.mjs", import.meta.url), { type: "module" });
	const estimate = document.getElementById("input_estimate").value;
	if (!sessionStorage.getItem(estimate)) return alert(`Please, press the "Crate" button if already added works.`);
	crates.postMessage(estimate);
	crates.onmessage = (test) => {
		(Array.isArray(test.data.crates) || Object.hasOwn(test.data, "crates")) && findCrates(test.data);
	};
}
function copyButton2() {
	const crates = new Worker(new URL("./panels/worker.IDB.crates.mjs", import.meta.url), { type: "module" });
	const estimate = document.getElementById("input_estimate").value;
	if (!sessionStorage.getItem(estimate)) return alert(`Please, press the "Crate" button if already added works.`);
	crates.postMessage(estimate);
	crates.onmessage = (res) => {
		return findCratesAndWorks(res.data);
	};
}
//#endregion
//#region app/side-menu/interactive.menu.mjs
function accordionController(event) {
	const activePanel = event.target.closest(".accordion-panel");
	if (event.target.id === "body-app") return closeMenu();
	if (!activePanel) return;
	toggleAccordion(activePanel);
}
function closeMenu() {
	const element = document.querySelector(".accordion-panel");
	let menu;
	let buttons;
	let panel;
	for (menu in element) {
		buttons = element.parentElement.querySelectorAll("button");
		panel = element.parentElement.querySelectorAll(".menu__input");
		buttons.forEach((button) => {
			button.setAttribute("aria-expanded", false);
		});
		panel.forEach((aria) => {
			aria.setAttribute("aria-hidden", true);
		});
	}
}
function toggleAccordion(clicked) {
	const buttons = clicked.parentElement.querySelectorAll("button");
	const panel = clicked.parentElement.querySelectorAll(".menu__input");
	buttons.forEach((button) => {
		button.setAttribute("aria-expanded", false);
	});
	panel.forEach((aria) => {
		aria.setAttribute("aria-hidden", true);
	});
	openPanel(clicked);
}
function openPanel(panel) {
	panel.querySelector("button").setAttribute("aria-expanded", true);
	panel.querySelector(".menu__input").setAttribute("aria-hidden", false);
	globalThis.document.getElementById("estimate_getter").select();
}
//#endregion
//#region app/side-menu/core.currency.mjs
function currencyName(list) {
	const fragment = document.createDocumentFragment();
	list.map((name) => {
		const option = document.createElement("option");
		option.textContent = name;
		fragment.appendChild(option);
	});
	return fragment;
}
async function populateCoins() {
	const coins = JSON.parse(sessionStorage.getItem("currency"));
	const select1 = document.getElementById("coin1");
	const select2 = document.getElementById("coin2");
	const coinNames = Object.keys(coins);
	if (!coins) return "Error";
	select1.appendChild(currencyName(coinNames));
	select2.appendChild(currencyName(coinNames));
}
function conversionCurrency(opt1, opt2, val1, val2) {
	const list = JSON.parse(sessionStorage.getItem("currency"));
	const COMA = 1e3;
	const shiftInput1 = Number.parseFloat(val1.value) === list[opt1];
	const shiftInput2 = Number.parseFloat(val2.value) === list[opt2];
	if (opt1 === opt2) return shiftInput1 ? val2.value : val1.value;
	else if (shiftInput1 && shiftInput2) return ~~(list[opt1] * list[opt2] * COMA) / COMA;
	else if (list[opt1] < list[opt2]) return shiftInput1 === true ? ~~(val2.value / list[opt2] * list[opt1] * COMA) / COMA : ~~(val1.value * list[opt2] / list[opt1] * COMA) / COMA;
	return shiftInput2 === true ? ~~(val1.value * list[opt2] / list[opt1] * COMA) / COMA : ~~(val2.value / list[opt2] * list[opt1] * COMA) / COMA;
}
async function getCurrencyValue() {
	const { rates } = (await fetch("/api/v1/currencies", { method: "GET" }).then(async (values) => await values.json()).catch((err) => alert(`CurrencyError: ${err}!`))).response;
	const storage = globalThis.sessionStorage;
	return rates && storage.setItem("currency", JSON.stringify(rates));
}
function setValues(coin, place) {
	const currency = JSON.parse(sessionStorage.getItem("currency"));
	if (!currency) return false;
	place.value = currency[coin];
}
//#endregion
//#region app/side-menu/menu.currency.conversion.mjs
async function coins() {
	await getCurrencyValue();
	await populateCoins();
}
async function exchangeHeader() {
	const storageCurrency = sessionStorage.getItem("currency");
	const coin1 = JSON.parse(sessionStorage.getItem("coin1"));
	const coin2 = JSON.parse(sessionStorage.getItem("coin2"));
	const opt1 = document.getElementById("coin1");
	const opt2 = document.getElementById("coin2");
	coin1 !== null && (opt1.value = coin1);
	coin2 !== null && (opt2.value = coin2);
	storageCurrency === null && await getCurrencyValue();
}
function coinInputOne() {
	const coin = document.getElementById("coin1").value;
	const input = document.getElementById("coin1-input");
	sessionStorage.setItem("coin1", JSON.stringify(coin));
	setValues(coin, input);
}
function coinInputTwo() {
	const coin = document.getElementById("coin2").value;
	const input = document.getElementById("coin2-input");
	sessionStorage.setItem("coin2", JSON.stringify(coin));
	setValues(coin, input);
}
function getInputOne() {
	const opt1 = document.getElementById("coin1").value;
	const opt2 = document.getElementById("coin2").value;
	const value1 = document.getElementById("coin1-input");
	const value2 = document.getElementById("coin2-input");
	setValues(opt2, value2);
	value2.value = `$ ${conversionCurrency(opt1, opt2, value1, value2)}`;
}
function getInputTwo() {
	const opt1 = document.getElementById("coin1").value;
	const opt2 = document.getElementById("coin2").value;
	const value1 = document.getElementById("coin1-input");
	const value2 = document.getElementById("coin2-input");
	setValues(opt1, value1);
	value1.value = `$ ${conversionCurrency(opt1, opt2, value1, value2)}`;
}
//#endregion
//#region app/side-menu/core.units.mjs
function unitConversion(input1, input2, value1, value2) {
	return input1 === "centimeters" ? centimetersShift(input1, input2, value1, value2) : input1 === "inches" ? inchesShift(input1, input2, value1, value2) : metersShift(input1, input2, value1, value2);
}
function measureSetupCheckout(option1, option2) {
	return {
		checked1: option1 === "centimeters" && option2 === "inches",
		checked2: option1 === "inches" && option2 === "centimeters",
		checked3: option1 === "meters" && option2 === "centimeters"
	};
}
function resolveConversion(input1, input2, unit, type) {
	const roundDecimal = 1e3;
	if (type !== "m") return input1.value > input2.value ? ~~(input1.value / unit * roundDecimal) / roundDecimal : ~~(input2.value * unit * roundDecimal) / roundDecimal;
	return input1.value < input2.value ? ~~(input2.value / unit * roundDecimal) / roundDecimal : ~~(input1.value * unit * roundDecimal) / roundDecimal;
}
function centimetersShift(unit1, unit2, measure1, measure2) {
	const inches = 2.54;
	const meters = .01;
	const cmpSetup = measureSetupCheckout(unit1, unit2);
	if (unit1 === unit2) return measure1.value > measure2.value ? measure1.value : measure2.value;
	else if (cmpSetup.checked1) return resolveConversion(measure1, measure2, inches, "in");
	return resolveConversion(measure1, measure2, meters, "m");
}
function inchesShift(unit1, unit2, measure1, measure2) {
	const centimeters = .393;
	const meters = .0254;
	const cmpSetup = measureSetupCheckout(unit1, unit2);
	if (unit1 === unit2) return measure1.value > measure2.value ? measure1.value : measure2.value;
	else if (cmpSetup.checked2) return resolveConversion(measure1, measure2, centimeters, "cm");
	return resolveConversion(measure1, measure2, meters, "m");
}
function metersShift(unit1, unit2, measure1, measure2) {
	const centimeters = .01;
	const inches = .0254;
	const cmpSetup = measureSetupCheckout(unit1, unit2);
	if (unit1 === unit2) return measure1.value > measure2.value ? measure1.value : measure2.value;
	else if (cmpSetup.checked3) return resolveConversion(measure1, measure2, centimeters, "cm");
	return resolveConversion(measure1, measure2, inches, "in");
}
//#endregion
//#region app/side-menu/menu.units.mjs
function getUnitOne() {
	const selected1 = globalThis.document.getElementById("units1").value;
	const selected2 = globalThis.document.getElementById("units2").value;
	const input1 = globalThis.document.getElementById("input-unit1");
	const input2 = globalThis.document.getElementById("input-unit2");
	input2.value = 0;
	input2.value = unitConversion(selected1, selected2, input1, input2);
}
function getUnitTwo() {
	const selected1 = globalThis.document.getElementById("units1").value;
	const selected2 = globalThis.document.getElementById("units2").value;
	const input1 = globalThis.document.getElementById("input-unit1");
	const input2 = globalThis.document.getElementById("input-unit2");
	input1.value = 0;
	input1.value = unitConversion(selected1, selected2, input1, input2);
}
function setUnitOne() {
	const input1 = globalThis.document.getElementById("input-unit1");
	const input2 = globalThis.document.getElementById("input-unit2");
	input1.value = 0;
	input2.value = 0;
}
function setUnitTwo() {
	const input1 = globalThis.document.getElementById("input-unit1");
	const input2 = globalThis.document.getElementById("input-unit2");
	input1.value = 0;
	input2.value = 0;
}
//#endregion
//#region app/side-menu/search.menu.mjs
function addPanelFetched() {
	const status = document.getElementById("statusList");
	const statusFrame = document.getElementById("status-frame");
	const closeDialog = document.querySelector(".side-menu");
	statusFrame.removeChild(document.getElementById("statusList"));
	statusFrame.append(addPanelInfo());
	status.setAttribute("content", "FETCHED");
	closeDialog.getElementsByTagName("panel-info").length > 0 && document.querySelector(".side-menu").lastElementChild.setAttribute("name", "close");
	displayCub();
	displayAirCub();
	countWorks();
}
/**
* @param {String} doc The reference/document with artwork list.
*/
async function checkBrowserDB(doc) {
	const workerDB = new Worker(new URL("./panels/worker.IDB.crates.mjs", import.meta.url), { type: "module" });
	const checkIDB = await new Promise((resolve, reject) => {
		workerDB.postMessage(doc);
		workerDB.onmessage = (result) => {
			result !== void 0 ? resolve(result.data) : reject(void 0);
		};
	});
	if (checkIDB) {
		document.getElementById("input_estimate").value = doc;
		sessionStorage.setItem("FETCHED", JSON.stringify(checkIDB));
		addPanelFetched();
		setDBFetched([checkIDB]);
		return "IDB data Found.";
	}
	return false;
}
/**
* @param {Crater} result The Crater object with the solved list from DB.
*/
async function setDBFetched(result) {
	try {
		if (result?.hasOwnProperty("crates")) {
			document.getElementById("input_estimate").value = result.reference;
			globalThis.sessionStorage.clear();
			globalThis.sessionStorage.setItem("FETCHED", JSON.stringify(result, null));
			const { materials } = localStorage;
			sessionStorage.clear();
			sessionStorage.setItem("FETCHED", JSON.stringify(result, null));
			localStorage.setItem("materials", materials);
			return addPanelFetched();
		}
		throw new TypeError("Data not found!");
	} catch (err) {
		return err;
	}
}
/**
* @param {String} doc The reference/document with artwork list.
*/
async function fetchDB(doc) {
	const url = `/api/v1/estimates/${doc}`;
	const headers = { "Content-Type": "application/json; charset=UTF-8" };
	if (globalThis.navigator.onLine) return await fetch(url, {
		method: "GET",
		headers
	}).then(async (estimate) => await estimate.json()).then(setDBFetched).catch((e) => alert(`Search ERROR! \n ${e}`));
}
/**
* @param {String} doc The reference/document with artwork list.
*/
function regexChecker(data) {
	switch (/[^-a-z-A-Z-0-9]/g.test(data)) {
		case true:
			alert(`Found special character NOT allowed. Please, try again!`);
			return true;
		case false: return false;
	}
}
/**
* @function Gets the reference/document number from the page in order to search.
*/
async function searchEstimate() {
	const docEstimate = document.getElementById("estimate_getter").value;
	const update = memoization(document.getElementById("input_estimate").value);
	if (!regexChecker(docEstimate)) {
		const data = [checkBrowserDB(docEstimate), fetchDB(docEstimate)];
		await Promise.all(data).then(async (val) => {
			!val[0] && val[1]?.length === 0 ? alert(`Document not found! Please, try again.`) : await Promise.resolve(update(docEstimate)).then(async () => {
				if (val[1]?.length > 0) addNewWorksToIndexedDB({
					reference: val[1][0].reference_id,
					crates: val[1][0].crates.crates,
					list: val[1][0].works.list
				}, true);
				else crate$1(true);
			});
		});
	}
}
/**
* @function check if the fetch to doc/reference was successful and updates the app status.
*/
function memoization(before) {
	return async (after) => {
		before && before !== after && cleanInputs(true);
	};
}
//#endregion
//#region app/main.mjs
globalThis.onkeydown = (push) => {
	const task1 = push.key === "Enter" && push.ctrlKey === true;
	const task2 = push.ctrlKey === true && push.altKey === true && push.key === "c";
	const task3 = push.key === "Escape";
	task1 && crate();
	task2 && openDisplay();
	task3 && closeMenu();
	push.stopImmediatePropagation();
};
globalThis.onafterprint = () => {
	const { shadowRoot } = document.querySelector(".update-materials");
	[...shadowRoot.querySelectorAll("[aria-hidden]")].map((node) => node.ariaHidden = "false");
};
globalThis.onbeforeprint = () => {
	const { shadowRoot } = document.querySelector(".update-materials");
	[...shadowRoot.querySelectorAll("[aria-hidden]")].map((node) => node.ariaHidden = "false");
};
globalThis.document.getElementById("main-app").addEventListener("click", (element) => {
	const up = document.querySelector(".materials");
	const down = document.querySelector(".update-materials");
	const crates = sessionStorage.getItem("crate");
	let cratesNum = crates ? +crates.split("/")[0] : 0;
	const cratesTotal = crates ? +crates.split("/")[1] : 0;
	const plotter = new GraphicCrates();
	const crateDisplay = document.getElementById("layer-count");
	let { id, className, attributes } = element.target;
	{
		const { shadowRoot } = up;
		const shadow = shadowRoot.querySelector(".upPane");
		shadow?.addEventListener("click", (e) => {
			const { id, className, tagName } = e.target;
			const composeEvent = new CustomEvent("open-crate", {
				bubbles: true,
				composed: true,
				detail: {
					id,
					className,
					tagName
				}
			});
			shadow.dispatchEvent(composeEvent);
		}, true);
	}
	{
		const { shadowRoot } = down;
		const shadow = shadowRoot.querySelector(".data-update");
		shadow?.addEventListener("click", (e) => {
			const { id, className } = e.target;
			const composeEvent = new CustomEvent("update-materials-info", {
				bubbles: true,
				composed: true,
				detail: {
					id,
					className
				}
			});
			shadow.dispatchEvent(composeEvent);
			e.stopImmediatePropagation();
		});
	}
	attributes.content === "crates" && (className = "crates");
	switch (!id ? id = className : id) {
		case "body-app":
			accordionController(element);
			break;
		case "buttonInstall":
			installer();
			break;
		case "add-btn":
			catchWork();
			break;
		case "remove-btn":
			catchRemove();
			break;
		case "clear-btn":
			clearAll();
			break;
		case "crate-btn":
			crate();
			break;
		case "crate_btn":
			crate();
			break;
		case "copy-pane1":
			copyButton1();
			break;
		case "copy-pane2":
			copyButton2();
			break;
		case "logout":
			logout();
			break;
		case "logout-btn":
			logout();
			break;
		case "seek-btn":
			accordionController(element);
			break;
		case "search-header":
			accordionController(element);
			break;
		case "exchange-header":
			coins();
			exchangeHeader();
			accordionController(element);
			break;
		case "units-header":
			accordionController(element);
			break;
		case "button-seek":
			accordionController(element);
			break;
		case "search-btn":
			accordionController(element);
			break;
		case "ex-btn":
			coins();
			accordionController(element);
			break;
		case "exchange-btn":
			coins();
			accordionController(element);
			break;
		case "unit-btn":
			accordionController(element);
			break;
		case "units-btn":
			accordionController(element);
			break;
		case "fetch-btn":
			searchEstimate();
			break;
		case "crate-layers":
			openDisplay();
			break;
		case "layer-crate":
			openDisplay();
			break;
		case "previous":
			if (cratesNum > 1) {
				cratesNum -= 1;
				sessionStorage.setItem("crate", `${cratesNum}/${cratesTotal}`);
				crateDisplay.innerText = `Current crate: ${cratesNum} / ${cratesTotal}`;
				plotter.show;
			}
			break;
		case "layer-prev":
			if (cratesNum > 1) {
				cratesNum -= 1;
				sessionStorage.setItem("crate", `${cratesNum}/${cratesTotal}`);
				crateDisplay.innerText = `Current crate: ${cratesNum} / ${cratesTotal}`;
				plotter.show;
			}
			break;
		case "next":
			if (cratesNum < cratesTotal) {
				cratesNum += 1;
				sessionStorage.setItem("crate", `${cratesNum}/${cratesTotal}`);
				crateDisplay.innerText = `Current crate: ${cratesNum} / ${cratesTotal}`;
				plotter.show;
			}
			break;
		case "layer-next":
			if (cratesNum < cratesTotal) {
				cratesNum += 1;
				sessionStorage.setItem("crate", `${cratesNum}/${cratesTotal}`);
				crateDisplay.innerText = `Current crate: ${cratesNum} / ${cratesTotal}`;
				plotter.show;
			}
			break;
		case "settings-content":
			className !== "update-materials" && className !== "new-material" && up.setAttribute("content", "settings-content");
			break;
		case "packages":
			className !== "update-materials" && className !== "select-materials" && up.setAttribute("content", "packages");
			break;
		case "select-materials":
			className !== "update-materials" && className !== "select-materials" && up.setAttribute("content", "select-materials");
			break;
		case "materials":
			className !== "update-materials" && className !== "select-materials" && up.setAttribute("content", "confirm-save");
			break;
		case "report":
			up.setAttribute("name", "packages");
			break;
		case "report":
			up.setAttribute("name", "packages");
			break;
		case "pack-opts":
			up.setAttribute("name", "works-packed");
			break;
		case "works-packed":
			up.setAttribute("name", "works-packed");
			break;
		case "reset-sizes":
			up.setAttribute("name", "reset-sizes");
			break;
		case "reset-szs":
			up.setAttribute("name", "reset-szs");
			break;
		case "adding-material":
			up.setAttribute("name", "adding-material");
			break;
		case "add__new__field":
			up.setAttribute("name", "add__new__field");
			break;
		case "cancel-remove":
			up.setAttribute("name", "cancel-remove");
			break;
		case "new-material":
			up.setAttribute("name", "new-material");
			break;
		case "confirm-save":
			up.setAttribute("name", "confirm-save");
			break;
		case "printer-icon":
			globalThis.print();
			break;
		case "printer-btn":
			globalThis.print();
			break;
		case "printer-svg":
			globalThis.print();
			break;
		case "printer":
			globalThis.print();
			break;
	}
}, true);
globalThis.document.getElementById("main-app").addEventListener("change", (element) => {
	element.preventDefault();
	switch (element.target.id) {
		case "input_estimate":
			createIDB();
			break;
		case "in":
			setUnit();
			break;
		case "cm":
			setUnit();
			break;
		case "dark-mode":
			switchMode("dark");
			break;
		case "light-mode":
			switchMode("light");
			break;
		case "coin1":
			coinInputOne();
			break;
		case "coin2":
			coinInputTwo();
			break;
		case "units1":
			setUnitOne();
			break;
		case "units2":
			setUnitTwo();
			break;
		case "selected-crate":
			openDisplay();
			break;
		default:
	}
}, true);
globalThis.document.getElementById("main-app").addEventListener("input", (element) => {
	let { id, className } = element.target;
	switch (!id ? id = className : id) {
		case "coin1-input":
			getInputOne();
			break;
		case "coin2-input":
			getInputTwo();
			break;
		case "input-unit1":
			getUnitOne();
			break;
		case "input-unit2":
			getUnitTwo();
			break;
		default:
	}
}, true);
globalThis.onsubmit = (event) => {
	event.preventDefault();
};
globalThis.document.getElementById("main-app").addEventListener("open-crate", (e) => {
	const { id, className, tagName } = e.detail;
	const up = document.querySelector(".materials");
	tagName === "A" && up.setAttribute("content", `${id}-${className}`);
}, true);
globalThis.document.getElementById("main-app").addEventListener("update-materials-info", (e) => {
	const { id } = e.detail;
	const down = document.querySelector(".update-materials");
	e.stopImmediatePropagation();
	id === "update-info" && down.setAttribute("name", "update");
}, true);
globalThis.document.getElementById("estimate_getter").addEventListener("keypress", (event) => {
	event.key === "Enter" && searchEstimate();
});
globalThis.addEventListener("beforeinstallprompt", (event) => {
	event.preventDefault();
	console.log("👍", "beforeinstallprompt", event);
	globalThis.deferredPrompt = event;
});
//#endregion
