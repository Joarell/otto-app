import SetLargeCrateWalls from "./Crate.walls.plotly.class.mjs";
import LargeCratesFrame from "./Plotly.large.crate.frame.mjs";
import PaddingCrate from "./Padding.crate.plotly.mjs";
import PositionWorksInSideCrate from "./Plotly.layer.position.work.class.mjs";
import BottomCrate from "./Plotly.bottomCrate.render.mjs";

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
				const { finalSize, innerSize, baseSize, extraDepth } = data.at(-1)[0];
				const bottom = new BottomCrate(finalSize, data.at(-1)[0], baseSize);
				let meta = bottom.largeBottom;
				const frame = new LargeCratesFrame(meta, baseSize, data.at(-1)[0], finalSize, extraDepth);
				meta = frame.setFrame;
				// const walls = new SetLargeCrateWalls(baseSize, data.at(-1)[0], meta, finalSize);
				// meta = walls.setHugeWalls;
				// const padding = new PaddingCrate(baseSize, data.at(-1)[0], meta, finalSize);
				// meta = padding.setPaddingHuge;
				// const position = new PositionWorksInSideCrate(
				// 	{ sized: finalSize, innerSize, type: "largestCrate", baseSize },
				// 	data,
				// 	meta,
				// 	"huge"
				// );
				// meta = position.arrange;
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
