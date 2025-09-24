export default class TraceMaker {
	#edges;
	#data;
	#colors = new Map();

	constructor() {
		[
			// [ 'frame', '#BF5E30' ],
			[ 'frame', '#002A3D' ],
 			[ 'walls', '#555FEF' ],
			[ 'padding', '#FFFFF0' ],
			[ 'fill', '#0B8325' ],
			[ 'div', '#002A3D' ],
			[ 'works', '#BB0056BB' ],
		].map(col => {
			this.#colors.set(col[0], col[1]);
		});
		this.#edges = [
			[0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
			[4, 5], [5, 6], [6, 7], [7, 4], // Top face
			[0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
		];
	};

	#defineShape() {
		const { info, coordinates, name, show } = this.#data;
		const color = this.#colors.get(name.color ?? name);

		this.#edges.forEach((edge, i) => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];

			info.push({
				x: [ v1.x, v2.x ],
				z: [ v1.y, v2.y ],
				y: [ v1.z, v2.z ],
				name: name.name ?? name,
				mode: 'lines',
				type: 'scatter3d',
				line: {
					color,
					width: 1.5
				},
				showlegend: show && i === 0 ? true: false,
				hovertext: name.code ?? name,
				legendgroup: name.name ?? name,
				hovertemplate: 'L: %{x}<br>' + 'H: %{z}<br>' + 'D: %{y}<br>' + `Code: ${name.code}`,
				contour: {
					show: show && i === 0 ? true: false,
					color: '#BB0056BB',
					width: 2,
				},
			});
		});
		return(info);
	};

	set data(info) {
		this.#data = info;
	};

	get defineTrace() {
		return(this.#defineShape());
	};
}
