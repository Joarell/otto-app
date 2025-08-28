import largestCrateRender from "./Largest.Canvas.Render.class.mjs";
import notCanvasCrateRender from "./Not.Canvas.Render.class.mjs";
import { layout } from "./plotly.layout.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.walls.class.mjs";
import sameSizeCrateRender from "./Same.Size.Render.class.mjs";
import standardCrateRender from "./Standard.Render.class.mjs";
import tubeCrateRender from "./Tube.Render.class.mjs";

export default class GraphicCrates {
	#plotly;
	#edges;
	#crates;

	constructor() {
		const { Plotly } = globalThis;
		this.#crates = [
			'tubeCrate',
			'largestCrate',
			'sameSizeCrate',
			'noCanvasCrate',
			'standardCrate'
		];
		this.#edges = [
			[0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
			[4, 5], [5, 6], [6, 7], [7, 4], // Top face
			[0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
		];
		this.#plotly = Plotly;
	};

	/**
	* @method - catch the solved results.
	*/
	async #grabArtWorksOnIDB() {
		const ref = localStorage.getItem('refNumb');
		const WORKER = new Worker(
			new URL("../panels/worker.IDB.crates.mjs", import.meta.url),
			{ type: "module" },
		);

		WORKER.postMessage(ref);
		const request = await new Promise((resolve, reject) => {
			WORKER.onmessage = (res) => {
				const { data } = res;
				data?.reference === ref ? resolve(data) : reject(res);
			};
		});
		return(request);
	};

	#baseFrame(info, coordinates) {
		this.#edges.forEach(edge => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];

			info.push({
				x: [ v1.x, v2.x ],
				y: [ v1.y, v2.y ],
				z: [ v1.z, v2.z ],
				name: 'Frame',
				mode: 'lines',
				type: 'scatter3d',
				showlegend: false,
				opacity: 0,
				line: {
					color: '#00000000'
				}
			});
		});
		return(info);
	};

	#populatePlotter(list) {
		const designs = [];
		let alterLayout = structuredClone(layout);

		this.#crates.map(crate => {
			const data = list.get(crate);
			let draw;

			switch(data ? crate: 0) {
				case 'tubeCrate':
					draw = new tubeCrateRender(data, alterLayout);
					const tubeCrates = draw.composeCrate;
					designs.push(tubeCrates.result);
					alterLayout = tubeCrates.meta;
					draw = null;
					break;
				case 'largestCrate':
					draw = new largestCrateRender(data, alterLayout);
					const largestCrates = draw.composeCrate;
					designs.push(largestCrates.result);
					alterLayout = largestCrates.meta;
					draw = null;
					break;
				case 'sameSizeCrate':
					draw = new sameSizeCrateRender(data, alterLayout);
					const sameSizeCrates = draw.composeCrate;
					designs.push(sameSizeCrates.result);
					alterLayout = sameSizeCrates.meta;
					draw = null;
					break;
				case 'noCanvasCrate':
					draw = new notCanvasCrateRender(data, alterLayout);
					const notCanvasCrates = draw.composeCrate;
					designs.push(notCanvasCrates.result);
					alterLayout = notCanvasCrates.meta;
					draw = null;
					break;
				case 'standardCrate':
					draw = new standardCrateRender(data, alterLayout);
					const standardCrates = draw.composeCrate;
					designs.push(standardCrates.result);
					alterLayout = standardCrates.meta;
					draw = null;
					break;
			};
		});
		designs.unshift(alterLayout);
		return(designs);
	};

	async #cratesTriage() {
		const { crates } = await this.#grabArtWorksOnIDB() || false;
		const allCrates = new Map();

		if(crates) {
			Object.entries(crates).map(data => {
				if(this.#crates.includes(data[0]))
					allCrates.set(data[0], data[1]);
			});
			const finished = this.#populatePlotter(allCrates);
			globalThis.sessionStorage.setItem('crate', `1/${crates.allCrates.length}`);
			globalThis.sessionStorage.setItem('graphics', JSON.stringify(finished));
			document.getElementById('layer-count').innerText = `Courrent crate: 1 / ${ crates.allCrates.length }`;
		};
	};

	/**
	* @method starts the drawing all graphic crates.
	*/
	async #moutingCrates() {
		const walls = new DesignWalls();
		const trace = new TraceMaker();
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
		let data = this.#baseFrame([], vertices1);

		await this.#cratesTriage();
		trace.data = { info: data, coordinates: vertices1, name: 'walls' };
		data = trace.defineTrace;
		walls.objectData = {
			width: 100, depth: 30, height: 100, info: data, name: 'walls',
			offsetX: 0, offsetZ: 0, offsetY: 0
		}
		data = walls.designSides;

		trace.data = { info: data, coordinates: vertices2, name: 'works' };
		data = trace.defineTrace;
		walls.objectData = {
			width: 80, depth: 10, height: 80, info: data, name: 'works',
			offsetX: 10, offsetZ: 10, offsetY: 10
		};
		data = walls.designSides;
		data = walls.designSides
		layout.legendgrouptitle['Walls'] = { text: 'Crate sides.' };
		layout.legendgrouptitle['Works'] = { text: 'Works sides.' };
		this.#plotly.newPlot('plotter-display', data, layout, { displaylogo: false });
	};

	get show() {
		this.#moutingCrates();
	};
};
