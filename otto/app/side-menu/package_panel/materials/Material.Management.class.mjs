import SheetTrimmer from "./Material.Card.trimmer.class.mjs";
import CrateTrimmer from "./Material.Crate.trimmer.class.mjs";

export default class MaterialManagement {
	#data;
	#works;
	#crates;
	#worksSum;
	#materials;
	#layers = [];
	#appliedMaterials = [];

	constructor({ works , crates }) {
		if(!works && !crates)
			return(false);

		this.#works =			works;
		this.#crates =			crates;
		this.#materials =		JSON.parse(localStorage.getItem('materials'));
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
	};

	/**
	* @method - calls the all methods in order to fill all material data.
	*/
	async #startReport() {
		const CRATES = [
			'tubeCrate',
			'largestCrate',
			'sameSizeCrate',
			'noCanvasCrate',
			'standardCrate'
		];
		const crateSizes = [];

		this.#works.map(work => this.#worksMaterialSum(work));
		this.#worksSum.usedTypes.map((item,i) => {
			this.#summarazedMaterialReport(item, i);
		});
		this.#works.length > 1 ? this.#residualAndReuseCalcMaterials():
			this.#data.worksReport.materialManagement = [
				this.#works[0], this.#works[0].packInfo
			];
		Object.entries(this.#crates).map(data => {
			if(CRATES.includes(data[0])) {
				const { crates } = data[1];
				crates.map((info, i) => {
					i % 2 === 0 ? crateSizes.push([info[4][0], data[0], new Map()]):
						this.#layers.push(info.length);
				}, 0);
			};
		});
		const preCrate =		await this.#cratesMaterialSummarazed(crateSizes);
		const trimmerCrate =	new CrateTrimmer(preCrate, this.#crates);
		this.#data.cratesReport.materialManagement = await trimmerCrate.crateCutter;
		return(this.#data);
	};

	/**
	* @method - returns the basic data to each material passed.
	* @param { Array } crate sizes.
	* @param { Array } material the material info to apply.
	*/
	#commumMaterialcalc(crate, material) {
		const x = crate[0];
		const z = crate[1];
		const y = crate[2];
		const crateArea = 2 * (x * z) + 2 * (x * y) + 2 * (z * y); // NOTE: Prism area formula.

		const type =		material[0];
		const area =		+material[1] * +material[3];
		const quantity =	+(crateArea / area).toFixed(3);
		const counter =		Math.ceil(quantity);
		const residual =	+(quantity - Math.floor(quantity)).toFixed(3);
		const totalCost =	material[4] * counter;
		return({ area, quantity, counter, residual, type, totalCost });
	};

	/**
	* @method - grabs the wood materials needed to apply.
	* @param { Array } crates all crates sizes to defines the material needed.
	* @param { Array } materials - all materials available to apply.
	*/
	async #woodMaterialsData(crates, materials) {
		const Pinewood =	{ area: 0, quantity: 0, counter: 0, residual: 0, totalCost: 0 };
		const Plywood =		{ area: 0, quantity: 0, counter: 0, residual: 0, totalCost: 0 };

		crates.map(crate => {
			const { innerSize } = crate[0];
			materials.map(item => {
				let area =		0;
				let quantity =	0;
				let counter =	0;
				let residual =	0;
				let totalCost =	0;

				if(item[5] === 'Pinewood') {
					const length =	innerSize[0] * (4 * 2); 					// NOTE: Each face has 2 pieces to compose the crate frame.
					const depth =	(innerSize[1] * (4 * 2)) + (innerSize[1] * 4);	// NOTE: Each face has 2 pieces to compose the crate frame plus 2 the handler and 2 for the feed.
					const height =	innerSize[2] * (4 * 2);						// NOTE: Each face has 2 pieces to compose the crate frame.
					const joins =	+item[3] * (4 * 6);						// NOTE: Each face has 4 joins than 6 times to each face.

					area =			length + depth + height - joins;
					quantity =		area / +item[1];
					counter =		Math.ceil(quantity);
					residual =		+(quantity - Math.floor(quantity)).toFixed(3);
					totalCost =	item[4] * counter;

					Pinewood.area += area;
					Pinewood.quantity += quantity;
					Pinewood.counter += counter;
					Pinewood.residual += residual;
					Pinewood.totalCost += totalCost;
					Pinewood.type = item[0];
					crate.at(-1).set(item[0], { type: item[0], counter, residual, area, totalCost, });
					return(item);
				};
				const plywood = this.#commumMaterialcalc(innerSize, item);
				crate.at(-1).set(item[0], plywood);
				Plywood.area += plywood.area;
				Plywood.quantity += plywood.quantity;
				Plywood.counter += plywood.counter;
				Plywood.residual += plywood.residual;
				Plywood.totalCost += plywood.totalCost;
				Plywood.type = item[0];
			});
			return(crate);
		});
		this.#data.cratesReport.finalReport['Pinewood'] = Pinewood;
		this.#data.cratesReport.finalReport['Plywood'] = Plywood;
		return(crates);
	};

	/**
	* @method - grabs the foam materials needed to apply.
	* @param { Array } crates all crates sizes to defines the material needed.
	* @param { Array } materials - all materials available to apply.
	*/
	async #foamMaterialsData(crates, materials) {
		const Foam = { area: 0, quantity: 0, counter: 0, residual: 0, totalCost: 0 };
		const Padding = { area: 0, quantity: 0, counter: 0, residual: 0, totalCost: 0 };
		crates.map(crate => {
			const { innerSize } = crate[0];
			materials.map(item => {
				let area =		0;
				let quantity =	0;
				let counter =	0;
				let residual =	0;
				let totalCost =	0;

				if(item[2] <= 2.5) {
					const crateFaceArea = +innerSize[0] * +innerSize[2];

					area =			+item[1] * +item[3];
					quantity =		crateFaceArea >= area ?
						(crateFaceArea / area) * (this.#layers > 1 ? this.#layers - 1: 1):
						(area / crateFaceArea) * (this.#layers > 1 ? this.#layers - 1: 1);
					counter =		Math.ceil(quantity);
					residual =		+(quantity - Math.floor(quantity)).toFixed(3);
					totalCost =		item[4] * counter;

					crate.at(-1).set(item[0], { type: item[0], counter, residual, area, totalCost, });
					Foam.area += area;
					Foam.quantity += quantity;
					Foam.counter += counter;
					Foam.residual += residual;
					Foam.totalCost += totalCost;
					Foam.type = item[0];
					return(item);
				};
				const padding = this.#commumMaterialcalc(innerSize, item);
				crate[2].set(item[0], padding);
				Padding.area += padding.area;
				Padding.quantity += padding.quantity;
				Padding.counter += padding.counter;
				Padding.residual += padding.residual;
				Padding.totalCost += padding.totalCost;
				Padding.type = item[0];
			});
			return(crate);
		});
		this.#data.cratesReport.finalReport['Foam'] = Foam;
		this.#data.cratesReport.finalReport['Padding'] = Padding;
		return(crates);
	};

	/**
	* @method - differs wood from foam to apply to the crates.
	* @param { Array } sizes - all crate sizes.
	*/
	async #cratesMaterialSummarazed(sizes) {
		const foam =		this.#materials.filter(info => info[5] === 'Foam Sheet');
		const materials =	this.#materials.filter(info => ['Pinewood', 'Plywood'].includes(info[5]));

		await this.#woodMaterialsData(sizes, materials);
		await this.#foamMaterialsData(sizes, foam);
		return(sizes);
	};


	#quickSort(list) {
		if(list.length <= 1)
			return(list);

		const left =	[];
		const pivot =	list.splice(0, 1);
		const right =	[];

		list.map(work => work[1].demand <= pivot[0][1].demand ? left.push(work) : right.push(work));
		return(this.#quickSort(left).concat(pivot, this.#quickSort(right)));
	};

	/**
	*@method - defines the planification of the works sizes as prism/parallelepiped.
	*/
	#worksPlanification(){
		const list2D = this.#works.map(work => {
			const length =		(work.x * 2) + (work.z * 2);
			const height =		(work.z * 2) + work.y;
			const { demand } =	work.packInfo;
			const planedPrism =	{ code: work.code, length, height, demand };

			return(planedPrism);
		});
		return(list2D);
	};

	/**
	* @method - calls the trimmer class to manage and reuse materials when it possible.
	*/
	async #residualAndReuseCalcMaterials() {
		const packedList =		this.#works.map(art => [art.code, art.packInfo]);
		const prism =			this.#worksPlanification();
		const sorted =			this.#quickSort(structuredClone(packedList));
		const trimmerCard =		new SheetTrimmer(sorted, prism, this.#works);
		const sheets =			this.#materials.filter(item => item[5] === 'Sheet');
		const materialData =	sheets.map(material => {
			material.unshift(material[1] * material[3] / 100);
			return(material);
		});

		trimmerCard.setWorksPacking = materialData;
		this.#data.worksReport.materialManagement = trimmerCard.cardBoardcutter;
	};

	/**
	* @method - sum all materials applied to each work.
	* @param { Array: ArtWork } art the list of works to provide packing materials.
	*/
	#worksMaterialSum(art) {
		const { residual, types, cost, quantity } = art.packInfo;
		const residualTotal =		[];
		const totalUsed =			[];
		const usedTypes =			[];
		const counterMaterials =	[];

		types.map(item => this.#appliedMaterials.push(item));
		residual.map(resid => residualTotal.push(resid));
		cost.map(value => totalUsed.push(value));
		quantity.map(type => {
			!usedTypes.includes(type[0]) ? usedTypes.push(type[0]): 0;
			counterMaterials.push(type);
		});
		this.#worksSum = {
			usedTypes, residualTotal, totalUsed, quantity, counterMaterials
		};
	};

	#summarazedMaterialReport(item, pos) {
		const {
			totalUsed, residualTotal, counterMaterials
		} = this.#worksSum;
		const type =	this.#appliedMaterials[pos][0];
		const area =	this.#appliedMaterials[pos][1];
		let totalCost =		0;
		let residual =	0;
		let counter =	0;

		totalUsed.map(info => info[0] === item ? totalCost += info[1]: 0);
		residualTotal.map(info => info[0] === item ? residual += info[1]: 0);
		counterMaterials.map(info => info[0] === item ? counter += info[1]: 0);
		this.#data.worksReport.finalReport.push([item, {
			totalCost, residual, counter, type, area
		}]);
	};

	get start() {
		return(this.#startReport());
	};
};
