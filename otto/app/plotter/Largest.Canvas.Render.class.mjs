import SetCrateWalls from "./Crate.walls.plotly.class.mjs";
import LargeCratesFrame from "./Plotly.large.crate.frame.mjs";
import CratesFrame from "./Frame.crate.graphic.mjs"
import PaddingCrate from "./Padding.crate.plotly.mjs";
import PositionWorksInSideCrate from "./Plotly.layer.position.work.class.mjs";

export default class largestCrateRender {
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
				let meta;
				const { finalSize, innerSize, baseSize } = data.at(-1)[0];
				const frame = new LargeCratesFrame(baseSize, data.at(-1)[0], finalSize);
				meta = frame.setFrame;
				const walls = new SetCrateWalls(baseSize, data.at(-1)[0], meta, finalSize);
				meta = walls.setHugeWalls;
				const padding = new PaddingCrate(baseSize, data.at(-1)[0], meta, finalSize);
				meta = padding.setPaddingHuge;
				const position = new PositionWorksInSideCrate(
					{ sized: finalSize, innerSize, type: "largestCrate", baseSize },
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
