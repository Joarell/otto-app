import GraphicCrates from "./Plotly.Renderer.Crates.mjs";
import { displayClean, populateOptions } from "./select.menu.mjs";

export function openCloseDisplay (element, template) {
	element.map(plotter => {
		if (plotter) {
			plotter.setAttribute("aria-hidden", false);
			plotter.setAttribute("aria-expanded", true);
		};
	})
};


function closeDisplay(element, display) {
	element.map(plotter => {
		plotter.setAttribute("aria-hidden", true);
		plotter.setAttribute("aria-expanded", false);
		while(display.firstChild)
			display.removeChild(display.firstChild);
	});
};


function togglePlotter() {
	const design =		new GraphicCrates();
	const layout =		document.querySelectorAll(".toggle__plotter");
	const plotter = 	document.getElementById('layers');
	const graphic =		sessionStorage.getItem('plotter') ?? false;
	let node;

	for(node of layout) {
		if(node.ariaHidden === 'true') {
			node.ariaHidden = 'false';
			plotter.ariaHidden = 'true'
		}
		else if(node.ariaHidden === 'false') {
			node.ariaHidden = 'true';
			plotter.ariaHidden = 'false'
			if(!graphic) {
				design.show;
				sessionStorage.setItem('plotter', 'true');
	0		};
		};
	};
};


export async function openDisplay() {
	togglePlotter();
};

// ╭─────────────────────────────────────────╮
// │ Functions to preparete rendering works. │
// ╰─────────────────────────────────────────╯
export function renderLayer() {
	const display =	document.getElementById('layers');
	const crate =	getCurrentCrate();
	const layer =	+sessionStorage.getItem('numLayer');

	display.appendChild(plotter(crate, layer - 1));
};


function getCurrentCrate() {
	const crates =	JSON.parse(localStorage.getItem('doneList'));
	let crateNum =	document.getElementById('selected-crate').value.split(' ')[1];
	let key
	let works;
	let data;

	for (key in crates) {
		if (crates[key]?.hasOwnProperty('crates')) {
			crates[key].crates.map((crate, i) => {
				if (Array.isArray(crate) && --crateNum === 0) {
					works = crates[key].crates[i + 1];
					data = { type : key, crate : crate, works : works };
				}
			}, 0);
		};
	};
	return (data);
};


// ╭──────────────────────────────────────────────────────────╮
// │          Change the works on the current layer.          │
// ╰──────────────────────────────────────────────────────────╯
export function changeCrateDisplay() {
	const crateNum = document.getElementById('selected-crate').value;
	displayClean();
	return(renderLayer(+crateNum.split(' ')[1]));
};

