import largestCrateRender from "./Largest.Canvas.Render.class.mjs";
import notCanvasCrateRender from "./Not.Canvas.Render.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";
import { layout } from "./plotly.layout.mjs";
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
			"tubeCrate",
			"largestCrate",
			"sameSizeCrate",
			"noCanvasCrate",
			"standardCrate",
		];
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
		this.#plotly = Plotly;
	}

	/**
	 * @method - catch the solved results.
	 */
	async #grabArtWorksOnIDB() {
		const ref = localStorage.getItem("refNumb");
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
		return request;
	}

	#baseFrame(info, coordinates) {
		this.#edges.forEach((edge) => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];

			info.push({
				x: [v1.x, v2.x],
				y: [v1.y, v2.y],
				z: [v1.z, v2.z],
				name: "Frame",
				mode: "lines",
				type: "scatter3d",
				showlegend: false,
				opacity: 0,
				line: {
					color: "#00000000",
				},
			});
		});
		return info;
	}

	#populatePlotter(list) {
		let alterLayout = structuredClone(layout);
		const designs = this.#crates.map((crate) => {
			const data = list.get(crate);
			let draw;

			switch (data ? crate : 0) {
				case "tubeCrate": {
					draw = new tubeCrateRender(data, alterLayout);
					const tubeCrates = draw.composeCrate;
					designs.push(tubeCrates.result);
					alterLayout = tubeCrates.meta;
					draw = null;
					break;
				}
				case "largestCrate": {
					draw = new largestCrateRender(data, alterLayout);
					const largestCrates = draw.composeCrate;
					designs.push(largestCrates.result);
					alterLayout = largestCrates.meta;
					draw = null;
					break;
				}
				case "sameSizeCrate": {
					draw = new sameSizeCrateRender(data, alterLayout);
					const sameSizeCrates = draw.composeCrate;
					designs.push(sameSizeCrates.result);
					alterLayout = sameSizeCrates.meta;
					draw = null;
					break;
				}
				case "noCanvasCrate": {
					draw = new notCanvasCrateRender(data, alterLayout);
					const notCanvasCrates = draw.composeCrate;
					designs.push(notCanvasCrates.result);
					alterLayout = notCanvasCrates.meta;
					draw = null;
					break;
				}
				case "standardCrate": {
					draw = new standardCrateRender(data, alterLayout);
					const { result, meta } = draw.composeCrate;
					alterLayout = meta;
					draw = null;
					return result;
				}
			}
		});
		const data = designs;
		const result = data.filter((info) => Array.isArray(info)).flat();
		return { result, alterLayout };
	}

	async #cratesTriage() {
		const { crates } = (await this.#grabArtWorksOnIDB()) || false;
		const allCrates = new Map();
		const designs = sessionStorage.getItem("graphics") || false;

		if (designs) {
			const graphics = JSON.parse(designs);
			const index = sessionStorage.getItem("crate").split("/")[0];
			return graphics[index];
		}
		if (crates) {
			Object.entries(crates).map((data) => {
				if (this.#crates.includes(data[0])) allCrates.set(data[0], data[1]);
			});
			const finished = this.#populatePlotter(allCrates);

			globalThis.sessionStorage.setItem(
				"crate",
				`1/${crates.allCrates.length}`,
			);
			globalThis.sessionStorage.setItem(
				"graphics",
				JSON.stringify(finished.designs),
			);
			document.getElementById("layer-count").innerText =
				`Courrent crate: 1 / ${crates.allCrates.length}`;
			return finished;
		}
		return true;
	}

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
			{ x: 0, y: 30, z: 100 }, // Vertex 7
		];
		const vertices2 = [
			{ x: 10, y: 10, z: 90 }, // Vertex 0
			{ x: 20, y: 10, z: 90 }, // Vertex 1
			{ x: 20, y: 30, z: 90 }, // Vertex 2
			{ x: 10, y: 30, z: 90 }, // Vertex 3
			{ x: 10, y: 10, z: 92.5 }, // Vertex 4
			{ x: 20, y: 10, z: 92.5 }, // Vertex 5
			{ x: 20, y: 30, z: 92.5 }, // Vertex 6
			{ x: 10, y: 30, z: 92.5 }, // Vertex 7
		];
		// const vertices2 = [
		// 	{ x: 10, y: 10, z: 10 }, // Vertex 0
		// 	{ x: 90, y: 10, z: 10 }, // Vertex 1
		// 	{ x: 90, y: 20, z: 10 }, // Vertex 2
		// 	{ x: 10, y: 20, z: 10 }, // Vertex 3
		// 	{ x: 10, y: 10, z: 90 }, // Vertex 4
		// 	{ x: 90, y: 10, z: 90 }, // Vertex 5
		// 	{ x: 90, y: 20, z: 90 }, // Vertex 6
		// 	{ x: 10, y: 20, z: 90 }  // Vertex 7
		// ];
		const data = this.#baseFrame([], vertices1);
		const { result, alterLayout } = await this.#cratesTriage();

		this.#plotly.newPlot("plotter-display", result, alterLayout, {
			displaylogo: false,
		});
	}

	get show() {
		this.#moutingCrates();
	}
}
