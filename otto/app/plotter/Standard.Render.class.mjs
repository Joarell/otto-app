import Converter from '../core2/Converter.class.mjs';
import SetCrateWalls from './Crate.walls.plotly.class.mjs';
import CratesFrame from './Frame.crate.graphic.mjs';
import PaddingCrate from './Padding.crate.plotly.mjs';

export default class standardCrateRender {
	#crates;
	#layout;

	constructor(data, setup) {
		this.#crates = data;
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
		return(this.#startDrawing());
	};
};
