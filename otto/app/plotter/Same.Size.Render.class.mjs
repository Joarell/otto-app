import SetCrateWalls from "./Crate.walls.plotly.class.mjs";
import CratesFrame from "./Frame.crate.graphic.mjs";
import PaddingCrate from "./Padding.crate.plotly.mjs";
import PositionWorksInSideCrate from "./Plotly.layer.position.work.class.mjs";
import BottomCrate from "./Plotly.bottomCrate.render.mjs";

export default class sameSizeCrateRender {
	#crates;
	#layout;

	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	}

	#startDrawing() {
		const { crates } = this.#crates;
		const result = crates.map((data, i) => {
			if (i % 2 === 0) {
				const { finalSize, innerSize } = data.at(-1)[0];
				const bottom = new BottomCrate(finalSize, data.at(-1)[0]);
				let meta = bottom.commumSameBottom;
				const frame = new CratesFrame(meta, finalSize, data.at(-1)[0]);
				meta = frame.setFrame;
				const walls = new SetCrateWalls(finalSize, data.at(-1)[0], meta);
				meta = walls.setWalls;
				const padding = new PaddingCrate(finalSize, data.at(-1)[0], meta);
				meta = padding.setPadding;
				const position = new PositionWorksInSideCrate(
					{ sized: finalSize, innerSize, type: "sameSizeCrate" },
					data,
					meta,
				);

				meta = position.arrange;
				return meta;
			}
			return data;
		}, 0);

		return result.length ? { result: result[0], meta: this.#layout } : false;
	}

	get composeCrate() {
		return this.#startDrawing();
	}
}
