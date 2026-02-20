import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";

export default class DesignPlotter {
	#data;
	#list;
	#baseSize;

	constructor(list, data, baseSize) {
		this.#data = data;
		this.#list = list;
		this.#baseSize = baseSize;
	}

	#buildTraceAndFillTubes() {
		let meta = structuredClone(this.#data);
		const fill = new DesignWalls();
		let tmp;

		this.#list.map((info) => {
			info.map((data) => {
				const {
					div,
					layer,
					offsetX,
					offsetY,
					offsetZ,
					width,
					depth,
					height,
				} = data;

				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
				};
				meta = fill.designTubes;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return meta;
	}

	#buildTraceAndFillHuge() {
		let meta = structuredClone(this.#data);
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const sizes = { dep: this.#baseSize[1], high: this.#baseSize[2] };
		let tmp;

		this.#list.map((info) => {
			info.map((data) => {
				const {
					div,
					layer,
					art,
					offsetX,
					offsetY,
					offsetZ,
					width,
					depth,
					height,
				} = data;

				trace.data = {
					info: meta,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
					sizes,
				};
				meta = trace.defineHugeTrace;
				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
					sizes,
				};
				meta = fill.largestCanvas;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return meta;
	}

	#buildTraceAndFill() {
		let meta = structuredClone(this.#data);
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		let tmp;

		this.#list.map((info) => {
			info.map((data) => {
				const {
					div,
					layer,
					art,
					offsetX,
					offsetY,
					offsetZ,
					width,
					depth,
					height,
				} = data;

				trace.data = {
					info: meta,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
				};
				meta = trace.defineTrace;
				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
				};
				meta = fill.designSides;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return meta;
	}

	get tubesDesign() {
		return this.#buildTraceAndFillTubes();
	}

	get squaredDesign() {
		return this.#buildTraceAndFill();
	}

	get hugeDesign() {
		return this.#buildTraceAndFillHuge();
	}
}
