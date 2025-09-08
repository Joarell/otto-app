import GraphicCrates from "./Plotly.Renderer.Crates.mjs";

export async function openDisplay() {
	const design =		new GraphicCrates();
	const layout =		document.querySelectorAll(".toggle__plotter");
	const plotter = 	document.getElementById('layers');
	let node;

	for(node of layout) {
		if(node.ariaHidden === 'true') {
			node.ariaHidden = 'false';
			plotter.ariaHidden = 'true'
		}
		else if(node.ariaHidden === 'false') {
			node.ariaHidden = 'true';
			plotter.ariaHidden = 'false'
			if(!sessionStorage.getItem('plotter')) {
				design.show;
				sessionStorage.setItem('plotter', 'true');
			};
		};
	};
};
