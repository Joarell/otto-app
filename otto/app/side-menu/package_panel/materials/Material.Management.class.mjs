import PackingTrimmer from "./Material.Card.trimmer.class.mjs";
import CrateTrimmer from "./Material.Crate.trimmer.class.mjs";

export default class MaterialManagement {
	#data;
	#works;
	#crates;
	#worksSum;
	#materials;
	#layers = [];
	#appliedMaterials = new Map();
	#padding;

	constructor({ works, crates }) {
		this.#worksSum = [];
		this.#works = works;
		this.#crates = crates;
		this.#materials = JSON.parse(localStorage.getItem("materials"));
		this.#data = {
			worksReport: {
				finalReport: [],
				materialManagement: [],
			},
			cratesReport: {
				finalReport: [],
				materialManagement: [],
			},
		};
	}

	#quickSort(list) {
		if (list.length <= 1) return list;

		const left = [];
		const pivot = list.splice(0, 1);
		const right = [];

		list.map((work) =>
			work[1].demand <= pivot[0][1].demand ? left.push(work) : right.push(work),
		);
		return this.#quickSort(left).concat(pivot, this.#quickSort(right));
	}

	/**
	 * @method - calls the all methods in order to fill all material data.
	 */
	async #startReport() {
		const CRATES = [
			"tubeCrate",
			"largestCrate",
			"sameSizeCrate",
			"noCanvasCrate",
			"standardCrate",
		];
		const crateSizes = [];

		this.#works.map((work) => this.#worksMaterialSum(work));
		await this.#summarazedMaterialReport();
		if(this.#works.length > 1) this.#residualAndReuseCalcMaterials();
		else this.#data.worksReport.materialManagement = [
			[this.#works[0].code, this.#works[0].packInfo],
		];
		Object.entries(this.#crates).map((data) => {
			if (CRATES.includes(data[0])) {
				const { crates } = data[1];
				crates.map((info, i) => {
					i % 2 === 0
						? crateSizes.push([info[4][0], data[0], new Map()])
						: this.#layers.push(info.length);
					return info;
				}, 0);
			}
			return data;
		});
		const preCrate = await this.#cratesMaterialSummarazed(crateSizes);
		const trimmerCrate = new CrateTrimmer(preCrate, this.#crates);
		this.#data.cratesReport.materialManagement = await trimmerCrate.crateCutter;
		return this.#data;
	}

	/**
	 * @method - returns the basic data to each material passed.
	 * @param { Array } crate sizes.
	 * @param { Array } material the material info to apply.
	 */
	#commumMaterialcalc(crate, material) {
		const x = crate[0];
		const z = crate[1];
		const y = crate[2];
		const crateArea = 2 * (x * z + x * y + z * y); // NOTE: Prism area formula.

		const type = material[0];
		const area = +material[1] * +material[3];
		const quantity = +(crateArea / area).toFixed(3);
		const counter = Math.ceil(quantity);
		const residual = +(quantity - Math.floor(quantity)).toFixed(3);
		const totalCost = material[4] * counter;
		return { area, quantity, counter, residual, type, totalCost };
	}

	/**
	 * @method - define the amount pinewood needed
	 * @param { Object } crate  information
	 * @param { Object } data material template info
	 * @param { Array } item data.
	 */
	#pineWoodMaterial(crate, data, item) {
		let area = 0;
		let quantity = 0;
		let counter = 0;
		let residual = 0;
		let totalCost = 0;
		const { innerSize } = crate[0];
		const length = innerSize[0] * (4 * 2); // NOTE: Each face has 2 pieces to compose the crate frame.
		const height = innerSize[1] * (4 * 2); // NOTE: Each face has 2 pieces to compose the crate frame.
		const depth = innerSize[2] * (4 * 2); // NOTE: Each face has 2 pieces to compose the crate frame.
		const joins = +item[3] * (4 * 6); // NOTE: Each face has 4 joins than 6 times to each face.

		area = length + depth + height - joins;
		quantity = area / +item[1];
		counter = Math.ceil(quantity);
		residual = +(quantity - Math.floor(quantity)).toFixed(3);
		totalCost = item[4] * counter;

		data.area += area;
		data.quantity += quantity;
		data.counter += counter;
		data.residual += residual;
		data.totalCost += totalCost;
		data.type = item[0];
		crate.at(-1).set(item[0], {
			type: item[0],
			counter,
			residual,
			area,
			totalCost,
		});
		return data;
	}

	/**
	 * @method - define the amount plywood needed
	 * @param { Object } crate  information
	 * @param { Object } data material template info
	 * @param { Array } item data.
	 */
	#plyWoodMaterial(crate, data, item) {
		const { innerSize } = crate[0];
		const size = [
			innerSize[0] + this.#padding[2],
			innerSize[1] + this.#padding[2],
			innerSize[2] + this.#padding[2],
		]
		const plyWood = this.#commumMaterialcalc(size, item);
		const { type, counter, quantity, residual, area, totalCost } = plyWood;

		data.area += area;
		data.quantity += quantity;
		data.counter += counter;
		data.residual += residual;
		data.totalCost += totalCost;
		data.type = item[0];
		crate.at(-1).set(type, { type, counter, residual, area, totalCost });
		return data;
	}

	/**
	 * @method - define the amount wooden post needed
	 * @param { Object } crate  information
	 * @param { Object } data material template info
	 * @param { Array } item data.
	 */
	#woodenPostMaterial(crate, data, item) {
		const { finalSize } = crate[0];
		const plywood = this.#materials.find(
			(material) => material[5] === "Plywood",
		);
		const total = finalSize[0] / +plywood[1];
		const counter = total > 2 ? Math.round(total) : 2; // NOTE: 2 is the minimum crates feet needed.
		const size = counter * +finalSize[1];
		const area = size * +item[2] * +item[3];
		const quantity = size > item[1] ? ~~(item[1] / size) : 1;
		const residual = +item[1] - size;
		const totalCost = total > 2 ? counter * +item[4] : +item[4];
		const type = item[0];

		data.area += area;
		data.quantity += quantity;
		data.counter += counter;
		data.residual += residual;
		data.totalCost += totalCost;
		data.type = type;
		crate.at(-1).set(item[0], { type, counter, residual, area, totalCost });
		return data;
	}

	/**
	 * @method - grabs the wood materials needed to apply.
	 * @param { Array } crates all crates sizes to defines the material needed.
	 * @param { Array } materials - all materials available to apply.
	 */
	async #woodMaterial(crates, materials) {
		const template = {
			area: 0,
			quantity: 0,
			counter: 0,
			residual: 0,
			totalCost: 0,
		};
		let Pinewood = structuredClone(template);
		let Plywood = structuredClone(template);
		let WoodenPost = structuredClone(template);

		crates.map((crate) => {
			materials.map((item) => {
				switch (item[5]) {
					case "Pinewood":
						Pinewood = this.#pineWoodMaterial(crate, Pinewood, item);
						return item;
					case "Plywood":
						Plywood = this.#plyWoodMaterial(crate, Plywood, item);
						return item;
					case "Wooden Post":
						WoodenPost = this.#woodenPostMaterial(crate, WoodenPost, item);
						return item;
				}
				return item;
			});
			return crate;
		});
		this.#data.cratesReport.finalReport.Pinewood = Pinewood;
		this.#data.cratesReport.finalReport.Plywood = Plywood;
		this.#data.cratesReport.finalReport.WoodenPost = WoodenPost;
		return crates;
	}

	/**
	 * @method - grabs the foam materials needed to apply.
	 * @param { Array } crates all crates sizes to defines the material needed.
	 * @param { Array } materials - all materials available to apply.
	 */
	async #foamMaterialsData(crates, materials) {
		const Foam = {
			area: 0,
			quantity: 0,
			counter: 0,
			residual: 0,
			totalCost: 0,
		};
		const Padding = {
			area: 0,
			quantity: 0,
			counter: 0,
			residual: 0,
			totalCost: 0,
		};

		crates.map((crate) => {
			const { innerSize, layers } = crate[0];
			materials.map((item) => {
				let area = 0;
				let quantity = 0;
				let counter = 0;
				let residual = 0;
				let totalCost = 0;

				if (item[2] <= 2.5) {
					if (layers.length === 1) {
						crate[2].set(item[0], {
							type: item[0],
							counter,
							residual,
							area,
							totalCost,
						});
						return crate;
					}
					const crateFaceArea = +innerSize[0] * +innerSize[2];

					area = +item[1] * +item[3];
					quantity =
						crateFaceArea >= area
							? (crateFaceArea / area) *
								(this.#layers > 1 ? this.#layers - 1 : 1)
							: (area / crateFaceArea) *
								(this.#layers > 1 ? this.#layers - 1 : 1);
					counter = Math.ceil(quantity);
					residual = +(quantity - Math.floor(quantity)).toFixed(3);
					totalCost = item[4] * counter;

					crate[2].set(item[0], {
						type: item[0],
						counter,
						residual,
						area,
						totalCost,
					});
					Foam.area += area;
					Foam.quantity += quantity;
					Foam.counter += counter;
					Foam.residual += residual;
					Foam.totalCost += totalCost;
					Foam.type = item[0];
					return item;
				}
				const padding = this.#commumMaterialcalc(innerSize, item);
				this.#padding = item;
				crate[2].set(item[0], padding);
				Padding.area += padding.area;
				Padding.quantity += padding.quantity;
				Padding.counter += padding.counter;
				Padding.residual += padding.residual;
				Padding.totalCost += padding.totalCost;
				Padding.type = item[0];
				return item;
			});
			return crate;
		});
		this.#data.cratesReport.finalReport.Foam = Foam;
		this.#data.cratesReport.finalReport.Padding = Padding;
		return crates;
	}

	/**
	 * @method - differs wood from foam to apply to the crates.
	 * @param { Array } sizes - all crate sizes.
	 */
	async #cratesMaterialSummarazed(sizes) {
		const foam = this.#materials.filter((info) => info[5] === "Foam Sheet");
		const materials = this.#materials.filter((info) =>
			["Pinewood", "Plywood", "Wooden Post"].includes(info[5]),
		);

		sizes = await this.#foamMaterialsData(sizes, foam);
		sizes = await this.#woodMaterial(sizes, materials);
		return sizes;
	}

	/**
	 *@method - defines the planification of the works sizes as prism/parallelepiped.
	 */
	#worksPlanification() {
		const list2D = this.#works.map((work) => {
			const length = work.x * 2 + work.z * 2;
			const height = work.z * 2 + work.y;
			const { demand } = work.packInfo;

			return { code: work.code, length, height, demand };
		});
		return list2D;
	}

	/**
	 * @method - calls the trimmer class to manage and reuse materials when it possible.
	 */
	async #residualAndReuseCalcMaterials() {
		const packedList = this.#works.map((art) => [art.code, art.packInfo]);
		const prism = this.#worksPlanification();
		const sorted = this.#quickSort(structuredClone(packedList));
		const trimmerCard = new PackingTrimmer(sorted, prism);
		const available = ["Sheet", "Roll"];
		const packing = this.#materials.filter((item) =>
			available.includes(item[5]),
		);
		const materialData = packing.map((material) => {
			material.unshift((material[1] * material[3]) / 100);
			return material;
		});

		trimmerCard.setWorksPacking = materialData;
		this.#data.worksReport.materialManagement = trimmerCard.cardBoardCutter;
	}

	/**
	 * @method - sum all materials applied to each work.
	 * @param { Array: ArtWork } art the list of works to provide packing materials.
	 */
	#worksMaterialSum(art) {
		const { residual, types, cost, quantity } = art.packInfo;
		const residualTotal = [];
		const totalUsed = [];
		const usedTypes = [];
		const counterMaterials = [];

		types.map((item) => this.#appliedMaterials.set(item[2], item));
		residual.map((resid, i) => residualTotal.push([types[i][2], resid]), 0);
		cost.map((value) => totalUsed.push(value));
		quantity.map((type) => {
			!usedTypes.includes(type[0]) ? usedTypes.push(type[0]) : 0;
			counterMaterials.push(type);
			return type;
		});
		this.#worksSum.push({
			usedTypes,
			residualTotal,
			totalUsed,
			quantity,
			counterMaterials,
		});
	}

	/**
	 * @method - resume the materials applied data.
	 * @param { Array } item the material info.
	 * @param { number } pos index of the material on the list.
	 */
	async #summarazedMaterialReport(materials = new Map(), data = [], pos = 0) {
		if (!this.#worksSum[pos])
			return data.map((info) => {
				this.#data.worksReport.finalReport.push([info, materials.get(info)]);
				return info;
			});
		const item = this.#worksSum[pos];
		const { totalUsed, residualTotal, counterMaterials } = item;

		item.usedTypes.map((pack) => {
			const stored = this.#appliedMaterials.get(pack);
			const type = stored[0];
			const area = stored[1];
			let totalCost = 0;
			let residual = 0;
			let counter = 0;

			if (data.includes(pack)) {
				let { totalCost, residual, counter } = materials.get(pack);

				totalUsed.map((info) => {
					if (info[0] === pack) totalCost += info[1];
					return info;
				});
				residualTotal.map((info) => {
					if (info[0] === pack) residual += info[1];
					return info;
				});
				counterMaterials.map((info) => {
					if (info[0] === pack) counter += info[1];
					return info;
				});
				return materials.set(pack, {
					totalCost,
					residual,
					counter,
					type,
					area,
				});
			}
			totalUsed.map((info) => {
				if (info[0] === pack) totalCost += info[1];
				return info;
			});
			residualTotal.map((info) => {
				if (info[0] === pack) residual += info[1];
				return info;
			});
			counterMaterials.map((info) => {
				if (info[0] === pack) counter += info[1];
				return info;
			});
			data.push(pack);
			counter = +counter.toFixed(2);
			materials.set(pack, { totalCost, residual, counter, type, area });
			return pack;
		});
		return this.#summarazedMaterialReport(materials, data, pos + 1);
	}

	/**
	 * @field - init the cutting material report.
	 */
	get start() {
		if (!this.#works && !this.#crates) return false;
		return this.#startReport();
	}
}
