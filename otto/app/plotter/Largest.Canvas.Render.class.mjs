import SetLargeCrateWalls from "./Crate.walls.plotly.class.mjs";
import LargeCratesFrame from "./Plotly.large.crate.frame.mjs";
import PaddingLargeCrate from "./Plotly.large.padding.mjs";
import PositionWorksInSideCrate from "./Plotly.layer.position.work.class.mjs";
import LargeBottomCrate from "./Plotly.large.bottom.mjs";

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
				const bottom = new LargeBottomCrate(data.at(-1)[0]);
				let meta = bottom.largeBottom;
				const frame = new LargeCratesFrame(meta, data.at(-1)[0]);
				meta = frame.setFrame;
				const walls = new SetLargeCrateWalls(meta, data.at(-1)[0]);
				meta = walls.setHugeWalls;
				const padding = new PaddingLargeCrate(meta, data.at(-1)[0]);
				meta = padding.setPaddingHuge;
				const position = new PositionWorksInSideCrate(data.at(-1)[0], meta, "largestCrate");
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
