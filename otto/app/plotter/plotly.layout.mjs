export let layout = {
	showlegend: true,
	legend: {
		title: {
			text: 'Crate Layers:',
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
		x: 0.02,
		xanchor: 'left',
		y: 0.99,
		yanchor: 'top',
		orientation: 'v',
		groupclick: 'sides',
	},
	legendgrouptitle: {},
	margin: { t: 0, l: 0, b: 0, r: 0, pad: 10 },
	scene: {
		aspectmode: 'data',
		xaxis: {
			title: {
				text: 'Length - (cm)',
				family: 'Mitr, sans-serif',
			},
			color: 'white',
			thickcolor: 'white',
			ticks: 'outside',
		},
		yaxis: {
			title: {
				text: 'Depth - (cm)',
				family: 'Mitr, sans-serif',
			},
			color: 'white',
			thickcolor: 'white',
			tick: 'outside',
		},
		zaxis: {
			title: {
				text: 'Height - (cm)',
				family: 'Mitr, sans-serif',
			},
			color: 'white',
			thickcolor: 'white',
			tick: 'outside',
		},
		camera: {
			eye: { x: 0.00, y: 3, z: 1.00 },
		},
	},
	// paper_bgcolor: "#243B55",
	paper_bgcolor: "#96979C",
};
