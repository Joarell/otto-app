export default class TraceMaker {
	#edges;
	#data;
	#colors = new Map();

	constructor() {
		[
			// [ 'works', '#BB0056BB' ],
			// [ 'walls', '#555FEF' ],
			// [ 'fill', '#0B8325' ],
			["fill", "#BF5E30"],
			["frame", "#002A3D"],
			["walls", "yellow"],
			["padding", "#FFFFF0"],
			["div", "#002A3D"],
		].map((col) => this.#colors.set(col[0], col[1]));
		this.#edges = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0], // Bottom face
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4], // Top face
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7], // Vertical edges
		];
	}

	#defineHugeShape() {
		const { align, info, coordinates, name, show, sizes } = this.#data;
		const color = this.#colors.get(name.color ?? name) ?? name.color;
		const { dep, high } = sizes;

		this.#edges.forEach((edge, i) => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];
			const cosAngle = Math.cos(dep / high);
			const sinAngle = Math.sin(high / dep);
			const rotX1 = (x, y, z) => [
				x,
				y * cosAngle + z * sinAngle,
				(y * sinAngle - z * cosAngle) + align,
			];
			const rotX2 = (x, y, z) => [
				x,
				z * sinAngle + y * cosAngle + align,
				z * cosAngle - y * sinAngle,
			];
			const first = sinAngle > 0
				? rotX2(v1.x, v1.y, v1.z)
				: rotX1(v1.x, v1.y, v1.z);
			const second = sinAngle > 0
				? rotX2(v2.x, v2.y, v2.z)
				: rotX1(v2.x, v2.y, v2.z);

			info.push({
				x: [first[0], second[0]],
				z: [first[1], second[1]],
				y: [first[2], second[2]],
				name: name.name ?? name,
				mode: "lines",
				type: "scatter3d",
				line: {
					color,
					width: 1.5,
				},
				showlegend: show && i === 0 ? true : false,
				hovertext: name.code ?? name,
				legendgroup: name.name ?? name,
				hovertemplate:
					"L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>" + `Code: ${name.code}`,
				contour: {
					show: show && i === 0 ? true : false,
					color: "#BB0056BB",
					width: 2,
				},
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
					width: 1.5,
				},
				showlegend: show && i === 0,
				hovertext: name.code ?? name,
				legendgroup: name.name ?? name,
				hovertemplate:
					"L: %{x}<br>" + "H: %{z}<br>" + "D: %{y}<br>" + `Code: ${name.code}`,
				contour: {
					show: show && i === 0,
					color: "#BB0056BB",
					width: 2,
				},
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
}
