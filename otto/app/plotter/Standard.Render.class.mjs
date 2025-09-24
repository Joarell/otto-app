import SetCrateWalls from './Crate.walls.plotly.class.mjs';
import CratesFrame from './Frame.crate.graphic.mjs';
import PaddingCrate from './Padding.crate.plotly.mjs';
import PositionWorksInSideCrate from './Plotly.layer.position.work.class.mjs';

export default class standardCrateRender {
	#crates;
	#layout;

	constructor(data, setup) {
		this.#crates = data;
		this.#layout = setup;
	};

	#startDrawing() {
		const { crates } =		this.#crates;
		const result =			crates.map((data, i) => {
			if(i % 2 === 0) {
				const { finalSize, innerSize } = data.at(-1)[0];
				const frame =		new CratesFrame(finalSize, data.at(-1)[0]);
				let meta =			frame.setFrame;
				const walls =		new SetCrateWalls(finalSize, data.at(-1)[0], meta);
				meta =				walls.setWalls;
				const padding =		new PaddingCrate(finalSize, data.at(-1)[0], meta);
				meta =				padding.setPadding;
				const position =	new PositionWorksInSideCrate({ sized: finalSize, innerSize, type: "standardCrate" }, data, meta);
				meta =				position.arrange;

				position.arrange;
				return(meta);
			};
		}, 0);

		return(result.length ? { result: result[0], meta: this.#layout }: false);
	};

	get composeCrate() {
		return(this.#startDrawing());
	};
};
