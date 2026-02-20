import FillGaps from "./Plotly.crate.gaps.mjs";
import WorksPosition from "./Ploty.works.position.mjs";
import PadDivSizes from "./Plotly.div.sizes.mjs";
import DesignPlotter from "./Plotly.design.works.mjs";

export default class PositionWorksInSideCrate {
	#crate;
	#data;
	#info;
	#threshold;
	#div;
	#pad;
	#inner;

	constructor(crate, data, meta) {
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.at(-1)[0].usedMaterials.get(opt));
		const pine = used.find((list) => list.at(-1) === "Pinewood");
		const ply = used.find((list) => list.at(-1) === "Plywood");
		this.#pad = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5,
		);
		this.#div = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] <= 2.5,
		);
		this.#crate = crate;
		this.#data = meta;
		this.#info = data.at(-1)[0];
		this.#threshold = [];
		this.#inner = crate.innerSize;
		const populate = (size) => {
			this.#threshold.push(size);
			this.#threshold.push(size);
			this.#threshold.push(size);
		};
		const addSides = (size) => {
			this.#threshold[0] += size;
			this.#threshold[1] += size;
			this.#threshold[2] += size;
		};

		[pine, ply, this.#pad].map((info) => {
			if (Array.isArray(info)) {
				switch (info.at(-1)) {
					case "Pinewood": {
						const x = info[2];
						const z = info[2];
						const y = 2 * info[2];
						if (!this.#threshold.length) {
							this.#threshold.push(x);
							this.#threshold.push(z);
							this.#threshold.push(y);
							return info;
						}
						this.#threshold[0] += x;
						this.#threshold[1] += y;
						this.#threshold[2] += z;
						break;
					}
					case "Plywood":
						if (!this.#threshold.length) {
							populate(info[2]);
							return info;
						}
						addSides(info[2]);
						break;
					case "Foam Sheet":
						if (!this.#threshold.length) {
							populate(info[2]);
							return info;
						}
						addSides(info[2]);
						break;
					default:
						return info;
				}
			}
			return info;
		});
		this.#div[1] = +this.#div[1];
		this.#div[2] = +this.#div[2];
		this.#div[3] = +this.#div[3];
	}

	#traceColor() {
		const letters = "0123456789ABCDEF";
		let color = "#";

		for (let i = 0; i < 6; i++)
			color += letters[Math.floor(Math.random() * 16)];
		return color;
	}

	#worksOffset(works, depth, layer) {
		Object.entries(works).map((data) => {
			const { coordinates, code, art } = data[1];
			const offY = coordinates.y - this.#pad[2];
			const x = this.#threshold[0];
			const y = coordinates.y ? this.#threshold[2] + offY : this.#threshold[2];
			const z = this.#threshold[1] + coordinates.z + depth;

			data[1].layer = {
				code,
				name: `layer-${layer}`,
				color: this.#traceColor(),
			};
			art.map((info, i) => {
				switch (i) {
					case 0:
						if(info.x === 0 ) info.x = x + coordinates.x;
						if(info.y === 0) info.y = y;
						if(info.z === 0) info.z = z;
						return info;
					case 1:
						if(info.y === 0) info.y = y;
						if(info.z === 0) info.z = z;
						return info;
					case 2:
						if(info.z === 0) info.z = z;
						return info;
					case 3:
						if(info.x === 0) info.x = x + coordinates.x;
						if(info.z === 0) info.z = z;
						return info;
					case 4:
						if(info.x === 0) info.x = x + coordinates.x;
						if(info.y === 0) info.y = y;
						return info;
					case 5:
						if(info.y === 0) info.y = y;
						return art;
					case 7:
						if(info.x === 0) info.x = x + coordinates.x;
						return info;
				}
				return info;
			}, 0);
			return data;
		});
		return works;
	}

	#populateLayerTubeCrate() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;

		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					depthSum,
					this.#threshold,
					this.#pad
				)
				return position.tubes;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if(!thickness || thickness < info.work[2]) (thickness = info.work[2])
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(depthSum + this.#threshold[1]).toFixed(3),
					pad: this.#pad,
					div: this.#div,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
			depthSum += +thickness.toFixed(3);
			thickness = 0;
			return data;
		}, 0);
		const designWorks = new DesignPlotter(onLayers, this.#data);
		return designWorks.tubesDesign;
	}

	#populateLayerNotCanvas() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;

		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					depthSum,
					this.#threshold,
					this.#pad
				)
				return position.noCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if(!thickness || thickness < info.work[2]) (thickness = info.work[2])
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(depthSum + this.#threshold[1]).toFixed(3),
					pad: this.#pad,
					div: this.#div,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
			depthSum += +thickness.toFixed(3);
			thickness = 0;
			return data;
		}, 0);
		const designWorks = new DesignPlotter(onLayers, this.#data);
		return designWorks.squaredDesign;
	}

	#populateLayerHugeCanvas() {
		const { layers, fillGaps, artLocation, baseSize, finalSize } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;

		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					depthSum,
					this.#threshold,
					this.#pad
				)
				return position.largestCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if(!thickness || thickness < info.work[2]) (thickness = info.work[2])
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(depthSum + this.#threshold[1]).toFixed(3),
					pad: this.#pad,
					div: this.#div,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(
					this.#pad,
					this.#threshold,
					i + 1,
					depthSum,
					structuredClone(this.#inner),
					this.#div,
				);
				onLayers.push(div.hugeDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		const designWorks = new DesignPlotter(onLayers, this.#data, finalSize);
		return designWorks.hugeDesign;
	}

	#populateLayerSameSizes() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;

		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					depthSum,
					this.#threshold,
					this.#pad
				)
				return position.standardCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if(!thickness || thickness < info.work[2]) (thickness = info.work[2])
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(depthSum + this.#threshold[1]).toFixed(3),
					pad: this.#pad,
					div: this.#div,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(
					this.#pad,
					this.#threshold,
					i + 1,
					depthSum,
					structuredClone(this.#inner),
					this.#div,
				);
				onLayers.push(div.sameSizeDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		const designWorks = new DesignPlotter(onLayers, this.#data);
		return designWorks.squaredDesign;
	}

	#populateLayerStandard() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers = [];
		let depthSum = 0;
		let thickness = 0;

		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					depthSum,
					this.#threshold,
					this.#pad
				)
				return position.standardCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if(!thickness || thickness < info.work[2]) (thickness = info.work[2])
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(depthSum + this.#threshold[1]).toFixed(3),
					pad: this.#pad,
					div: this.#div,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
			depthSum += +thickness.toFixed(3);
			if (layers.length > 1 && layers.length - 1 > i) {
				const div = new PadDivSizes(
					this.#pad,
					this.#threshold,
					i + 1,
					depthSum,
					structuredClone(this.#inner),
					this.#div,
				);
				onLayers.push(div.standardDiv);
				depthSum += this.#div[2];
			}
			thickness = 0;
			return data;
		}, 0);
		const designWorks = new DesignPlotter(onLayers, this.#data);
		return designWorks.squaredDesign;
	}

	#defineWorksLocation() {
		switch (this.#crate.type) {
			case "tubeCrate":
				return this.#populateLayerTubeCrate();
			case "sameSizeCrate":
				return this.#populateLayerSameSizes();
			case "largestCrate":
				return this.#populateLayerHugeCanvas();
			case "noCanvasCrate":
				return this.#populateLayerNotCanvas();
			case "standardCrate":
				return this.#populateLayerStandard();
		}
	}

	get arrange() {
		return this.#defineWorksLocation();
	}
}
