import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";
import WorksLabel from "./Plotly.works.label.mjs";

export default class DesignPlotter {
	#data;
	#list;
	#angle;
	#depth;
	#height;
	#baseSize;

	constructor(list, data, baseSize, info = false) {
		if(info) {
			const { angle, baseSize, extraHeight, extraLength } = info;
			this.#angle = angle;
			this.#depth = extraLength;
			this.#height = extraHeight;
			this.#baseSize = baseSize;
		}
		else {
			this.#baseSize = baseSize;
			this.#data = data;
		}
		this.#data = data;
		this.#list = list;
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
					info: this.#data,
					coordinates: art ? art : div,
					name: layer ?? div,
					show: div || tmp === layer.name ? false : true,
					angle: this.#angle,
					base: this.#height,
					align: this.#depth,
				};
				this.#data = trace.defineHugeTrace;
				if(code) {
					label.data = {
						angle: this.#angle,
						align: this.#depth,
						base: this.#height,
						info: this.#data,
						x: offsetX + width / 2,
						y: - this.#depth,
						z: offsetZ + height / 2,
						code,
					}
					this.#data = label.setHugeLabel;
				}
				fill.objectData = {
					width,
					depth,
					height,
					info: this.#data,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
					angle: this.#angle,
					align: this.#depth,
					base: this.#height,
				};
				this.#data = fill.largestCanvas;
				tmp = div || layer.name === tmp ? tmp : layer.name;
				return data;
			});
			return info;
		});
		return this.#data;
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
					const label = new WorksLabel();
					label.data = {
						info: meta,
						x: offsetX + width / 2,
						y: offsetY + depth / 2,
						z: offsetZ + height / 2,
						name: layer.name,
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
