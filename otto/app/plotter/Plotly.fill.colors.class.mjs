export default class DesignWalls {
	#data;
	#colors = new Map();
	#wallDefinitions;

	constructor() {
		[
			// [ 'walls', '#3DDDDD' ],
			// [ 'works', '#BB0056BB' ],
			[ 'frame', 'yellow' ],
			[ 'walls', '#BF5E30' ],
			[ 'padding', '#222725' ],
			[ 'div', '#EFECBBBE' ],
			[ 'fill', '#2DD751' ],
		].map(col => {
			this.#colors.set(col[0], col[1]);
		});
		this.#wallDefinitions = [
			// Front face (z = 0)
			[[0, 1, 2], [0, 2, 3]],
			// Back face (z = depth)
			[[4, 7, 6], [4, 6, 5]],
			// Left face (x = 0)
			[[0, 3, 7], [0, 7, 4]],
			// Right face (x = width)
			[[1, 5, 6], [1, 6, 2]],
			// Bottom face (y = 0)
			[[0, 4, 5], [0, 5, 1]],
			// Top face (y = height)
			[[3, 2, 6], [3, 6, 7]]
		];
	};

	#defineSides() {
		const {
			width, depth, height, offsetX, offsetZ, offsetY, info, name
		} = this.#data;
		const color = this.#colors.get(name.color || name);
		const vertices = [
			[ 0, 0, 0 ],
			[ width, 0, 0 ],
			[ width, depth, 0 ],
			[ 0, depth, 0 ],
			[ 0, 0, height ],
			[ width, 0, height ],
			[ width, depth, height ],
			[ 0, depth, height ],
		];
		const offsetVertices = vertices.map( v => [
			v[0] + offsetX,
			v[1] + offsetY,
			v[2] + offsetZ,
		]);
		const x = offsetVertices.map(v => v[0]);
		const y = offsetVertices.map(v => v[1]);
		const z = offsetVertices.map(v => v[2]);
		const i = [],j = [], k = [];

		this.#wallDefinitions.map(data => {
			data.map(coordinate => {
				i.push(coordinate[0]);
				j.push(coordinate[1]);
				k.push(coordinate[2]);
			});
		});
		info.push({
			x,
			y,
			z,
			i,
			j,
			k,
			name: name.name ?? name,
			type: 'mesh3d',
			color,
			hovertext: name.code ?? name,
			hovertemplate: name.code ?
				'L: %{x}<br>' + 'H: %{z}<br>' + 'D: %{y}<br>' + `Code: ${name.code}`:
				'L: %{x}<br>' + 'H: %{z}<br>' + 'D: %{y}<br>',
			showlegend: false,
			legendgroup: name.name ?? name,
			opacity: 0.2,
			flatshading: true,
			showscale: true,
			contour: {
				show: true,
				color: 'white',
				width: 2,
			},
		});
		return(info);
	};

	/** @param {any} objectData */
	set objectData(objectData) {
		this.#data = objectData;
	};

	get designSides() {
		return(this.#defineSides())
	};
}
