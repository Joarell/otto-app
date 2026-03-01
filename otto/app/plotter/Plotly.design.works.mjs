import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";
import WorksLabel from "./Plotly.works.label.mjs";

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
		const label = new WorksLabel();
		let tmp;

		this.#list.map((info) => {
			info.map((data, i) => {
				const {
					div,
					layer,
					offsetX,
					offsetY,
					offsetZ,
					width,
					depth,
					height,
					code,
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
					next: i,
				};
				meta = fill.designTubes;
				if(code) {
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 6,
						z: offsetZ + height / 6,
						code,
					}
					meta = label.setLabel;
				}
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			}, 0);
			return info;
		});
		return meta;
	}

	#buildTraceAndFillHuge() {
		let meta = structuredClone(this.#data);
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const sizes = { dep: this.#baseSize[1], high: this.#baseSize[2] };
		const label = new WorksLabel();
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
					code,
				} = data;

				trace.data = {
					info: meta,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
					sizes,
				};
				meta = trace.defineHugeTrace;
				if(code) {
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 2,
						z: offsetZ + height / 2,
						dep: depth,
						high: height,
						code,
					}
					meta = label.setHugeLabel;
				}
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
		const label = new WorksLabel();
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
					code,
				} = data;

				trace.data = {
					info: meta,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
				};
				meta = trace.defineTrace;
				if(code) {
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 2,
						z: offsetZ + height / 2,
						show: div || tmp === layer.name ? false : true,
						code,
					}
					meta = label.setLabel;
				}
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
