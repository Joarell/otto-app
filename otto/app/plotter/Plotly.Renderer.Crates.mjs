
export default class GraphicCrates {
	#edges;
	#layout;
	#plotly;
	#solvedData;

	constructor(data) {
		const { Plotly } = globalThis;

		this.#plotly = Plotly;
		this.#solvedData = data;
		this.#edges = [
			[0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
			[4, 5], [5, 6], [6, 7], [7, 4], // Top face
			[0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
		];
		this.#layout = {
			title: {
				font: {
					family: 'Saira, sans-serif',
					sizes: 24,
					weight: 900,
					style: "italic",
					color: '#FFFFFFAA'
				},
				x: 0.5,
				xref: 'paper',
				automargin: true,
			},
			legend: {
				title: {
					text: 'Open Layers:',
					font: {
						family: 'Mitr, sans-serif',
						size: 14,
					}
				},
				font: {
					family: 'Mitr, sans-serif',
					sizes: 14,
					color: '#FFFFFFAA'
				},
				x: 0.1,
				y:0.9,
				orientation: 'h'
			},
			margin: { t: 0, l: 0, b: 0, r: 0, pad: 10 },
			scene: {
				xaxis: {
					title: {
						text: 'Length - (cm)'
					},
				},
				yaxis: {
					title: {
						text: 'Depth - (cm)'
					},
				},
				zaxis: {
					title: {
						text: 'Height - (cm)'
					},
				},
				camera: {
					eye: { x: 0.00, y: 2.5, z: 1.00 },
				},
			},
			paper_bgcolor: "#96979C",
			autocolorscale: true,
			autosize: true,
		};
	};

	#defineSides(info, coordinates) {
		const x_coords = [ 0, 1, 1, 0, 0, 1, 1, 0 ]; // x-coordinates of vertices
		const y_coords = [ 0, 0, 1, 1, 0, 0, 1, 1 ]; // y-coordinates of vertices
		const z_coords = [ 0, 0, 0, 0, 1, 1, 1, 1 ]; // z-coordinates of vertices
		const walls = this.#edges.map(vertices => {
			const v1 = coordinates[vertices[0]];
			const v2 = coordinates[vertices[1]];
			const data = {
				x: [v1.x, v2.x],
				z: [v1.y, v2.y],
				y: [v1.z, v2.z],
				i: x_coords,
				j: y_coords,
				k: z_coords,
				name: 'Work',
				type: 'mesh3d',
				color: '#BBBADD',
				showlegend: false,
				opacity: 0.5,
			};
			return(data);
		});

		info.push(walls);
		return(info);
	};

	#defineShape(info, coordinates, colorType) {
		this.#edges.forEach(edge => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];

			info.push({
				x: [v1.x, v2.x],
				y: [v1.y, v2.y],
				z: [v1.z, v2.z],
				name: 'Crate-01',
				mode: 'lines',
				type: 'scatter3d',
				line: {
					color: colorType ? '#555FEF': '#3DDDDD',
					width: 3
				},
				showlegend: false,
				legendgroup: 'sides',
			});
		});
		return(info);
	};

	#moutingCrates() {
		const vertices1 = [
			{ x: 0, y: 0, z: 0 }, // Vertex 0
			{ x: 100, y: 0, z: 0 }, // Vertex 1
			{ x: 100, y: 30, z: 0 }, // Vertex 2
			{ x: 0, y: 30, z: 0 }, // Vertex 3
			{ x: 0, y: 0, z: 100 }, // Vertex 4
			{ x: 100, y: 0, z: 100 }, // Vertex 5
			{ x: 100, y: 30, z: 100 }, // Vertex 6
			{ x: 0, y: 30, z: 100 }  // Vertex 7
		];
		const vertices2 = [
			{ x: 10, y: 10, z: 10 }, // Vertex 0
			{ x: 90, y: 10, z: 10 }, // Vertex 1
			{ x: 90, y: 20, z: 10 }, // Vertex 2
			{ x: 10, y: 20, z: 10 }, // Vertex 3
			{ x: 10, y: 10, z: 90 }, // Vertex 4
			{ x: 90, y: 10, z: 90 }, // Vertex 5
			{ x: 90, y: 20, z: 90 }, // Vertex 6
			{ x: 10, y: 20, z: 90 }  // Vertex 7
		];
		let data = this.#defineShape([], vertices1, 1);

		data = this.#defineShape(data, vertices2, 0);
		return(data);
	};

	get show() {
		const data = this.#moutingCrates();
		return(this.#plotly.newPlot('plotter-display', data, this.#layout, { displaylogo: false }));
	};
};

const dataD = [
	{
		name: 'Crate',
		type: 'volume',
		x: [ 0, 0, 0, 0, 50, 50, 50, 50, ],
		z: [ 0, 30, 0, 30, 0, 30, 0, 30, ],
		y: [ 30, 30, 0, 0, 30, 30, 0, 0, ],
		value: [ 1,2,3,4,5,6,7,8 ],
		marker: {
			color: 'darkred',
		},
		line: {
			color: 'red',
			width: 5,
		},
		isomin: -10,
		isomax: 10,
		colorscale: 0,
		opacity: 0.5,
		text: "Crate-01",
		showlegend: true,
		legendgrouptitle: {
			color: "Red",
		},
		intensity: [0, 0, 0, 0],
		colorscale: 'Viridis',
		showscale: true,
		contour: {
			show: true,
			color: '#3DDDDD',
			width: 3,
		},
		mode: 'lines',
	},
	{
		name: 'Pack Layer',
		type: 'volume',
		x: [ 10, 10, 10, 10, 40, 40, 40, 40 ],
		z: [ 25, 25, 10, 10, 25, 25, 10, 10 ],
		y: [ 5, 25, 5, 25, 5, 25, 5, 25 ],
		value: [1,2,3,4,5,6,7,8],
		isomin: -10,
		isomax: 10,
		colorscale: "Blues",
		opacity: 0.5,
		text: "Crate",
		caps: {
			x: { show: true },
			z: { show: true },
			y: { show: true },
		},
		showlegend: true,
		hovertext: "Pack",
	},
	{
		name: 'Works',
		type: 'volume',
		x: [15, 15, 15, 15, 30, 30, 30, 30],
		z: [20, 20, 15, 15, 20, 20, 15, 15],
		y: [15, 20, 15, 20, 15, 20, 15, 20],
		value: [1,2,3,4,5,6,7,8],
		colorscale: "Greens",
		opacity: 0.5,
		text: "Solver",
		caps: {
			x: { show: true },
			z: { show: true },
			y: { show: true },
		},
		showlegend: true,
		hovertext: "Work",
	},
	{
		name: 'Padding',
		type: 'volume',
		x: [25, 25, 25, 25, 20, 20, 20, 20],
		z: [10, 10, 25, 25, 10, 10, 25, 25],
		y: [25, 10, 25, 10, 25, 10, 25, 10],
		value: [1,2,3,4,5,6,7,8],
		surface: { show: false },
		colorscale: "purle",
		opacity: 0.5,
		text: "Solver",
		caps: {
			x: { show: true },
			z: { show: true },
			y: { show: true },
		},
		showlegend: false,
		hovertext: "Work",
	}
];

const walls = 	{
	name: 'Crate',
	type: 'volume',
	x: [ 0, 0, 0, 0, 50, 50, 50, 50, ],
	z: [ 0, 30, 0, 30, 0, 30, 0, 30, ],
	y: [ 30, 30, 0, 0, 30, 30, 0, 0, ],
	value: [ 1,2,3,4,5,6,7,8 ],
	marker: {
		color: 'darkred',
	},
	line: {
		color: 'red',
		width: 5,
	},
	isomin: -10,
	isomax: 10,
	colorscale: 0,
	opacity: 0.5,
	text: "Crate-01",
	showlegend: true,
	legendgrouptitle: {
		color: "Red",
	},
	intensity: [0, 0, 0, 0],
	colorscale: 'Viridis',
	showscale: true,
	contour: {
		show: true,
		color: '#3DDDDD',
		width: 3,
	},
	mode: 'lines',
};
