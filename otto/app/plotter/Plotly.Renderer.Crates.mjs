import largestCrateRender from "./Largest.Canvas.Render.class.mjs";
import notCanvasCrateRender from "./Not.Canvas.Render.class.mjs";
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

	#populatePlotter(list) {
		let alterLayout = structuredClone(layout);
		const designs = this.#crates.map((crate) => {
			const data = list.get(crate);
			const crateTypes = new Map([
				["tubeCrate", new tubeCrateRender(data, alterLayout)],
				["largestCrate", new largestCrateRender(data, alterLayout)],
				["sameSizeCrate", new sameSizeCrateRender(data, alterLayout)],
				["noCanvasCrate", new notCanvasCrateRender(data, alterLayout)],
				["standardCrate", new standardCrateRender(data, alterLayout)],
			]);
			const draw = crateTypes.get(crate);

			if(data) {
				const { result, meta } = draw.composeCrate;
				alterLayout = meta;
				return result;
			}
			return crate;
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
				return data;
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
		const { result, alterLayout } = await this.#cratesTriage();

		this.#plotly.newPlot("plotter-display", result, alterLayout, {
			displaylogo: false,
		});
	}

	get show() {
		return this.#moutingCrates();
	}
}
