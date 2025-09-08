import Converter from '../core2/Converter.class.mjs';
import cratesFrame from './Frame.crate.graphic.mjs';
import DesignWalls from './Plotly.walls.class.mjs';
import SetCrateWalls from './Crate.walls.plotly.mjs';
import CratesFrame from './Frame.crate.graphic.mjs';
import PaddingCrate from './Padding.crate.plotly.mjs';
import DesignWalls from './Plotly.fill.colors.class.mjs';

export default class standardCrateRender {
	#crates;
	#layout;

	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	};

	#startDrawing() {
		let result;

		return({ result, meta: this.#layout });
		this.#layout = setup;
	};

	// async #setWalls (sizes, material, info) {
	// 	const materialInfo = material.find(list => list.at(-1) === 'Plywood');
	// 	const walls = new DesignWalls();
	// };

	#usedMaterials(meta) {
		const available =	JSON.parse(localStorage.getItem('crating'));
		const used =		available.map(opt => meta.usedMaterials.get(opt));

		return(used);
	};

	async #startDrawing() {
		const { crates } =		this.#crates;
		const trace =			await Promise.resolve(crates.map((data, i) => {
			if(i % 2 === 0) {
				const materials =		this.#usedMaterials(data.at(-1)[0]);
				const materialInfo =	materials.find(list => list.at(-1) === 'Pinewood');
				const sized =			data.at(-1)[0].finalSize;
				const frame =			new cratesFrame(sized, materialInfo);
				const graphic =			frame.setFrame;


				// TODO: set class GraphicLayer -> GapsGraphic
				return(graphic);
			};
		}, 0));
		const data =		Promise.all(trace);
		const result =		await data;

		return(result.length ? { result: result[0], meta: this.#layout }: false);
		this.#layout = setup;
	};

	#usedMaterials(meta) {
		const available =	JSON.parse(localStorage.getItem('crating'));
		const used =		available.map(opt => meta.usedMaterials.get(opt));

		return(used);
	};

	async #startDrawing() {
		const { crates } =		this.#crates;
		const trace =			await Promise.resolve(crates.map(async (data, i) => {
			if(i % 2 === 0) {
				const materials =	this.#usedMaterials(data.at(-1)[0]);
				const pine =		materials.find(list => list.at(-1) === 'Pinewood');
				const ply =			materials.find(list => list.at(-1) === 'Plywood');
				const pad =			materials.find(list => list.at(-1) === 'Foam Sheet' && list[2] > 2.5);
				const div =			materials.find(list => list.at(-1) === 'Foam Sheet' && list[2] <= 2.5);
				const sized =		data.at(-1)[0].finalSize;
				const frame =		pine ? new CratesFrame(sized, pine): 0;
				let meta =			await frame.setFrame;
				const walls =		new SetCrateWalls(sized, meta, ply, pine);
				meta =				walls.setWalls;
				const padding =		new PaddingCrate(sized, meta, ply, pine, pad);
				meta =				padding.setPadding;


				// TODO: set class GraphicLayer -> GapsGraphic
				return(meta);
			};
		}, 0));
		const data =		Promise.all(trace);
		const result =		await data;

		return(result.length ? { result: result[0], meta: this.#layout }: false);
	};

	get composeCrate() {
		return(this.#startDrawing())
	}
};
