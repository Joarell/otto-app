export default class DesignWalls {
	#data;
	#colors = new Map();
	#wallDefinitions;

	constructor() {
		[
			// [ 'walls', '#3DDDDD' ],
			// [ 'works', '#BB0056BB' ],
			["frame", "yellow"],
			["walls", "#BF5E30"],
			["padding", "#222725"],
			["div", "#EFECBBBE"],
			["fill", "#2DD751"],
		].map((col) => this.#colors.set(col[0], col[1]));
		this.#wallDefinitions = [
			// Front face (z = 0)
			[
				[0, 1, 2],
				[0, 2, 3],
			],
			// Back face (z = depth)
			[
				[4, 7, 6],
				[4, 6, 5],
			],
			// Left face (x = 0)
			[
				[0, 3, 7],
				[0, 7, 4],
			],
			// Right face (x = width)
			[
				[1, 5, 6],
				[1, 6, 2],
			],
			// Bottom face (y = 0)
			[
				[0, 4, 5],
				[0, 5, 1],
			],
			// Top face (y = height)
			[
				[3, 2, 6],
				[3, 6, 7],
			],
		];
	}

	#createTube() {
		const segments = 100;
		const { width, depth, height, offsetX, offsetZ, offsetY, info, name, next } =
			this.#data;
		const radius = depth / 1.95;
		const color = "#BB0056BB";
		const vertices_x = [];
		const vertices_y = [];
		const vertices_z = [];
		const i_arr = [];
		const j_arr = [];
		const k_arr = [];

		// Direction vector
		const dx = offsetX - width;
		const dy = offsetZ - depth;
		const dz = offsetY - height;
		const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

		// Find two perpendicular vectors
		let ux;
		let uy;
		let uz;
		if (Math.abs(dx) <= Math.abs(dy) && Math.abs(dx) <= Math.abs(dz)) {
			ux = 0;
			uy = -dz;
			uz = dy;
		} else if (Math.abs(dy) <= Math.abs(dz)) {
			ux = dz;
			uy = 0;
			uz = -dx;
		} else {
			ux = -dy;
			uy = dx;
			uz = 0;
		}
		const uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
		ux /= uLen;
		uy /= uLen;
		uz /= uLen;

		// v = cross(d_normalized, u)
		const dnx = dx / len;
		const dny = dy / len;
		const dnz = dz / len;
		const vx = dny * uz - dnz * uy;
		const vy = dnz * ux - dnx * uz;
		const vz = dnx * uy - dny * ux;

		// Generate circle vertices at both ends
		for (let end = 0; end < 2; end++) {
			const px = end === 0 ? width : offsetX;
			const py = end === 0 ? depth : offsetZ;
			const pz = end === 0 ? height : offsetY;
			for (let s = 0; s < segments; s++) {
				// const angle = 180;
				const angle = (2 * Math.PI * s) / segments;
				const cos = Math.cos(angle);
				const sin = Math.sin(angle);

				vertices_x.push(px + radius * (cos * ux + sin * vx));
				vertices_y.push(py + radius * (cos * uy + sin * vy))
				next === 0
				? vertices_z.push(pz + radius * (cos * uz + sin * vz))
				: vertices_z.push(pz + radius * (cos * uz + sin * vz) + height - offsetY)
			}
		}

		// Side faces
		for (let s = 0; s < segments; s++) {
			const next = (s + 1) % segments;
			// Bottom ring: indices 0..segments-1
			// Top ring: indices segments..2*segments-1
			i_arr.push(s, s, next);
			j_arr.push(next, segments + s, segments + s);
			k_arr.push(segments + next, segments + next, segments + next);

			// Two triangles per quad
			i_arr.push(s);
			j_arr.push(segments + s);
			k_arr.push(segments + next);

			i_arr.push(s);
			j_arr.push(segments + next);
			k_arr.push(next);
		}

		info.push({
			x: vertices_x,
			y: vertices_y,
			z: vertices_z,
			i: i_arr,
			j: j_arr,
			k: k_arr,
			name: name.name ?? name,
			type: "mesh3d",
			color,
			hovertext: name.code ?? name,
			hovertemplate: name.code
				? "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>" + `Code: ${name.code}`
				: "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>",
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: 0.2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2,
			},
		});
		return info;
	}

	#defineSides() {
		const { width, depth, height, offsetX, offsetZ, offsetY, info, name } =
			this.#data;
		const color = this.#colors.get(name.color || name);
		const vertices = [
			[0, 0, 0],
			[width, 0, 0],
			[width, depth, 0],
			[0, depth, 0],
			[0, 0, height],
			[width, 0, height],
			[width, depth, height],
			[0, depth, height],
		];
		const offsetVertices = vertices.map((v) => [
			v[0] + offsetX,
			v[1] + offsetY,
			v[2] + offsetZ,
		]);
		const x = offsetVertices.map((v) => v[0]);
		const y = offsetVertices.map((v) => v[1]);
		const z = offsetVertices.map((v) => v[2]);
		const i = [],
			j = [],
			k = [];

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
			hovertemplate: name.code
				? "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>" + `Code: ${name.code}`
				: "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>",
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: 0.2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2,
			},
		});
		return info;
	}

	#defineLargestCrate() {
		const { width, depth, height, offsetX, offsetZ, offsetY, info, name, sizes } =
			this.#data;
		const { dep, high } = sizes;
		const color = this.#colors.get(name.color || name);
		const vertices = [
			[0, 0, 0],
			[width, 0, 0],
			[width, depth, 0],
			[0, depth, 0],
			[0, 0, height],
			[width, 0, height],
			[width, depth, height],
			[0, depth, height],
		];
		const cosAngle = Math.cos(dep / high);
		const sinAngle = Math.sin(high / dep);
		const rotX = (x, y, z) => [
			x, y * cosAngle - z * sinAngle, y * sinAngle + z * cosAngle
		];
		const offsetVertices = vertices.map((v) => [
			v[0] + offsetX,
			v[1] + offsetY,
			v[2] + offsetZ,
		]);
		const values = offsetVertices.map((dim) => rotX(dim[0], dim[1], dim[2]));
		const x = values.map((v) => v[0]);
		const y = values.map((v) => v[1]);
		const z = values.map((v) => v[2]);
		const i = [],
			j = [],
			k = [];
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
			hovertemplate: name.code
				? "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>" + `Code: ${name.code}`
				: "L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>",
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: 0.2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: "white",
				width: 2,
			},
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
}
