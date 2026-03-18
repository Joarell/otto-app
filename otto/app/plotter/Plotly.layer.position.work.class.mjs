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
	#type;
	#pine;

	constructor(data, meta, type = "standardCrate") {
		const { finalSize, innerSize } = data;
		this.#type = type;
		this.#crate = {
			sized: finalSize,
			innerSize,
			type,
		};
		this.#data = meta;
		this.#info = data;
		this.#threshold = [];
		this.#inner = innerSize;
	}

	/**
	 * @method - selected woods for crating
	 * @param { Array: String: Number } materials all wood types
	 */
	#woodUsedMaterials(materials) {
		const pine = materials.find((list) => list.at(-1) === "Pinewood");
		const feet = materials.find((list) => list.at(-1) === "Wooden Post");
		const ply = materials.find((list) => list.at(-1) === "Plywood");

		[pine, feet, ply].map((wood) => {
			if (wood.at(-1) === "Wooden Post") {
				this.#threshold[2] += wood[3];
				return wood;
			} else if (wood.at(-1) === "Pinewood") {
				this.#threshold[0] += wood[2];
				this.#threshold[1] += wood[2];
				this.#pine = wood;
				return wood;
			}
			this.#threshold[0] += wood[2];
			this.#threshold[1] += wood[2];
			this.#threshold[2] +=
				this.#type === "huge" && wood.at(-1) === "Plywood"
					? wood[2] * 3
					: wood[2];
			return wood;
		});
	}

	/**
	 * @method - fill all material used to each crate side
	 * @param { Array:String } used - all selected materials to the crate
	 */
	#fillCrateThresholdData(used) {
		this.#pad = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] > 2.5,
		);
		this.#div = used.find(
			(list) => list.at(-1) === "Foam Sheet" && list[2] <= 2.5,
		);

		this.#threshold[0] = this.#pad[2];
		this.#threshold[1] = this.#pad[2];
		this.#threshold[2] = this.#pad[2];
		this.#div[1] = +this.#div[1];
		this.#div[2] = +this.#div[2];
		this.#div[3] = +this.#div[3];
		this.#woodUsedMaterials(used);
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
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.y === 0) info.y = y;
						if (info.z === 0) info.z = z;
						return info;
					case 1:
						if (info.y === 0) info.y = y;
						if (info.z === 0) info.z = z;
						return info;
					case 2:
						if (info.z === 0) info.z = z;
						return info;
					case 3:
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.z === 0) info.z = z;
						return info;
					case 4:
						if (info.x === 0) info.x = x + coordinates.x;
						if (info.y === 0) info.y = y;
						return info;
					case 5:
						if (info.y === 0) info.y = y;
						return art;
					case 7:
						if (info.x === 0) info.x = x + coordinates.x;
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
		const gap = 10;
		let heightSum = 0;
		let thickness = 0;

		switch (layers.length) {
			case 2:
				this.#threshold[1] += 3 * this.#pad[2];
				this.#threshold[2] += 2 * this.#pine[2] + 2 * this.#pad[2];
				break;
			case 3:
				this.#threshold[1] *= 2;
				this.#threshold[2] = 2 * this.#threshold[2] + this.#pine[2];
				break;
			default:
				this.#threshold[1] += this.#pad[2];
				this.#threshold[2] += 2 * this.#pine[2] + this.#pad[2];
		}
		layers.map((data, i) => {
			const { vacuum, works } = data;
			const allWorks = works.map((info) => {
				const position = new WorksPosition(
					info.work,
					artLocation.get(info.work[0]),
					heightSum,
					this.#threshold,
					this.#pad,
				);
				heightSum += +info.work[3] + gap;
				return position.tubes;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, heightSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
				return info;
			});
			if (checkGap) {
				const info = {
					vacuum,
					maxZ: fillGaps,
					offZ: +(heightSum + this.#threshold[2]).toFixed(3),
					pad: this.#pad,
					div: 0,
					offset: this.#threshold,
				};
				const gaps = new FillGaps(info, i + 1);
				gaps.fill;
			}
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
					this.#pad,
				);
				return position.noCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
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
		const { layers, fillGaps, artLocation, finalSize } = this.#info;
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
					this.#pad,
				);
				return position.largestCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
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
					this.#pad,
				);
				return position.standardCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
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
					this.#pad,
				);
				return position.standardCanvas;
			});
			const checkGap = vacuum.length > 1;

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter((info) => {
				if (!thickness || thickness < info.work[2]) thickness = info.work[2];
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
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => this.#info.usedMaterials.get(opt));
		this.#fillCrateThresholdData(used);

		return this.#defineWorksLocation();
	}
}
