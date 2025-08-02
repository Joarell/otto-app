export default class CrateTrimmer {
	#crateMaterials;
	#materialBank;
	#largestData;
	#crates;
	#raw;

	constructor(crates, rawList) {
		if(crates) {
			const apply =	JSON.parse(localStorage.getItem('crating'));
			const data =	JSON.parse(localStorage.getItem('materials'));

			this.#raw = rawList;
			this.#crateMaterials =	data.filter(item => apply.includes(item[0]));
			this.#crates =			crates;
			this.#materialBank =	new Map();
			this.#largestData =		new Map();
		};
	};

	/**
	* @method - sort;
	* @param { Array } list of crates
	*/
	#quickSort(list) {
		if(list.length <= 1)
			return(list);

		const left =	[];
		const pivot =	list.splice(0, 1);
		const right =	[];

		list.map(crate => crate.at(-1) <= pivot.at(-1) ? left.push(crate): right.push(crate));
		return(this.#quickSort(left).concat(pivot, this.#quickSort(right)));
	};

	/**
	* @method - returns how many materials are needed to the crate.
	* @param { number } count quantity.
	* @param { Array } sizes works dimensions.
	*/
	#provideMaterial(count, sizes) {
		const provision = [];
		while(count > provision.length)
			provision.push([sizes[0], sizes[1]])
		return(provision);
	};

	/**
	* @method - check if the rest of the material can be reused.
	* @param { Array } sizes crates dimensions.
	* @param { Array } data material sizes.
	*/
	#reuseMaterialRecursion(data, sizes, i = 0) {
		const material =	data[i];
		const checker =		data[1];
		if(!data[0][i] || checker.a && checker.b)
			return(data);

		if(material[0] >= sizes[0] && material[1] >= sizes[1]) {
			let x = material[0] - sizes[0];
			let y = material[1] - sizes[1];

			material[0] = +(material[0] - sizes[0]).toFixed(3);
			!y ? material[1] -= sizes[1]: 0
			x && material[0] === 0 && sizes[1] > material[1] ? x = sizes[0]: sizes[0];
			y && material[0] === 0 && sizes[1] > material[1] ? y = sizes[1]: sizes[0];

			if (material[0] >= sizes[0]) {
				material[0] = +(material[0] - sizes[0]).toFixed(3);
				!y ? material[1] -= sizes[1]: 0
				x && material[0] === 0 && sizes[1] > material[1] ? x += sizes[0]: sizes[0];
				y && material[0] === 0 && sizes[1] > material[1] ? y += sizes[1]: sizes[0];
				checker.a = true;
				checker.b = true;
			}
			else {
				checker.a && !checker.b ? checker.b = true: 0;
				!checker.a ? checker.a = true: 0;
			}
			x && y ? data.push([x, y]): 0;
		}
		else if(material[1] >= sizes[0] && material[0] >= sizes[1]) {
			let x = material[0] - sizes[1];
			let y = material[1] - sizes[0];

			material[1] = +(material[1] - sizes[0]).toFixed(3);
			!y ? material[0] -= sizes[0]: 0
			x && material[0] === 0 && sizes[0] > material[0] ? x = sizes[1]: sizes[1];
			y && material[0] === 0 && sizes[0] > material[0] ? y = sizes[0]: sizes[1];

			if(material[1] >= sizes[0]) {
				material[1] = +(material[1] - sizes[0]).toFixed(3);
				!y ? material[0] -= sizes[0]: 0
				x && material[0] === 0 && sizes[0] > material[0] ? x = sizes[1]: sizes[1];
				y && material[0] === 0 && sizes[0] > material[0] ? y = sizes[0]: sizes[1];
			}
			else {
				checker.a && !checker.b ? checker.b = true: 0;
				!checker.a ? checker.a = true: 0;
			};
			x && y ? data.push([x, y]): 0;
		};
		return(this.#reuseMaterialRecursion([material, checker], sizes, i + 1));
	};

	/**
	* @method - try to apply the material to the work.
	* @param { Array } crate sizes;
	* @param { Array } available all materials sizes.
	*/
	#cutterManager(available, crate) {
		const faceAB = { a: false, b: false };
		const sideRL = { a: false, b: false };
		const upDown = { a: false, b: false };

		available.map(sheet => {
			this.#reuseMaterialRecursion([sheet, faceAB ], [crate[0], crate[2]]);
			this.#reuseMaterialRecursion([sheet, sideRL], [crate[1], crate[2]]);
			this.#reuseMaterialRecursion([sheet, upDown], [crate[0], crate[1]]);
			return(sheet);
		});
		return(available);
	};

	/**
	* @method - define the largest crate material for the structure.
	* @param { Array } crate sizes.
	* @param { Array } pine the frame material to apply.
	* @param { Array } bank of used materials.
	*/
	#largeCrateStructure(crate, pine, bank) {
		const { finalSize } =	crate[0];
		const ply =				this.#crateMaterials.find(item => item[5] === 'Plywood');
		const plyArea =			ply[1] * ply[3];
		const area =			finalSize[0] * finalSize[1];
		const base =			(area / plyArea) * 2;
		const div =				Math.ceil(finalSize[0] / 100);
		const baseEnforce =		finalSize[1] * div;
		const highEnforce =		finalSize[2] * div;
		let allPine =			+((baseEnforce + highEnforce) / pine[1]).toFixed(3);
		const bottom =			{
			counter: Math.ceil((base) * 2),
			size: [finalSize[0], finalSize[1]],
			area: finalSize[0] * finalSize[1],
			name: ply[0],
			type: ply[5]
		};
		const leanner =			{
			counter: div,
			size: +finalSize[1],
			area: highEnforce,
			name: pine[0],
			type: pine[5]
		};
		const enforcer =		{
			counter: div,
			size: +finalSize[2],
			area: baseEnforce,
			name: pine[0],
			type: pine[5]
		};

		this.#largestData.set('pine', allPine);
		this.#largestData.set('ply', base);
		crate[2].set('structure', { bottom, leanner, enforcer  });
		return(crate);
	};

	/**
	* @method - cuts the crate frame.
	* @param { Array } pine - material data.
	* @param { Object } crate - crate data.
	*/
	#trimmingFrameCrateMaterial(pine, crate) {
		const onBank =			this.#materialBank.get(pine[0]);
		const { innerSize } =	crate[0];
		const ply =				this.#crateMaterials.find(item => item[5] === 'Plywood');
		const join =			innerSize[0] / ply[1];
		const update =			crate[2].get(pine[0]);
		const x = 				+(+innerSize[0] * 8).toFixed(3);
		const z = 				+(+innerSize[1] * 10).toFixed(3);
		const y = 				join > 1 ? +(+innerSize[2] * ((join - 1) * 2) + 8):
			+(+innerSize[2] * 8).toFixed(3);
		const yTrimmedLoss =	+(+pine[3] * 4).toFixed(3);
		const totalMaterial =	+(x + y + z - yTrimmedLoss).toFixed(3);
		const frontBack =		{ x: innerSize[0], y: innerSize[2] - pine[3] };
		const sides =			{ z: innerSize[1], y: innerSize[2] - pine[3] };
		const upDown =			{ x: innerSize[0] - pine[3], z: innerSize[1] };
		let pinewood =			totalMaterial > +pine[1] ?
			Math.ceil(totalMaterial / +pine[1]) * +pine[1] : +pine[1];

		crate[2].set('Frame', { frontBack, sides, upDown, name: pine[0] });
		crate[1] === 'largestCrate' ? this.#largeCrateStructure(crate, pine): 0;
		const structure =	this.#largestData.get('pine');
		if(!onBank) {
			const residual =	+((pinewood - totalMaterial)).toFixed(3);

			update.area = 		totalMaterial;
			update.counter =	structure ?
				Math.ceil((totalMaterial + structure)  / +pine[1]):
				Math.ceil(totalMaterial / +pine[1]);
			update.residual =	residual;
			if(structure) {
				update.area +=		structure;
				update.residual +=	+(1 - structure % 1);
			};
			crate[2].set(pine[0], update);
			residual > 20 ? this.#materialBank.set(pine[0], [crate, residual]): 0;
			return(crate);
		};
		pinewood += onBank[1];
		const data = onBank[0][4]?.get(pine[0]);
		data ? data.residual = 0: 0;
		const residual =	+(pinewood - totalMaterial).toFixed(3);

		update.area = 		totalMaterial;
		update.counter =	structure ?
			Math.ceil((totalMaterial + structure)  / +pine[1]):
			Math.ceil(totalMaterial / +pine[1]);
		update.residual =	+[+(residual).toFixed(4), +onBank[1]]
			.reduce((val, sum) => val + sum, 0).toFixed(4);
		if(structure) {
			update.area +=	structure;
			update.residual += +(1 - structure % 1).toFixed(3);
		};
		crate[2].set(pine[0], update);
		this.#materialBank.set(pine[0], [crate, residual]);
		return(crate);
	};

	/**
	* @method - returns the foam needed to feat between each layer.
	* @param { Array } size inner crate dimensions.
	* @param { Array } foam the material data.
	*/
	#foamDivisorLayers(size, foam) {
		const trimmed = [];
		foam.map(pad => {
			let x = 0;
			let y = 0;

			pad[0] >= size[0] ? x = +(pad[0] - size[0]).toFixed(3): 0;
			pad[0] === size[0] ? y = +(pad[1] - size[2]).toFixed(3): y = pad[1];

			!x && pad[1] >= size[0] ? x = +(pad[1] - size[0]).toFixed(3): 0;
			!y && pad[1] === size[0] ? y = +(pad[0] - size[1]).toFixed(3): y = pad[0];
			trimmed.push([x, y]);
		});
		return(trimmed);
	};

	/**
	* @method - returns the needed material to fill the gaps in side the crate.
	* @param { Object } crate data.
	*/
	async #fillEmptySpaceOnLayers(crate) {
		let foam2 =	await Promise.resolve(this.#materialBank.get('2'));
		let foam5 =	await Promise.resolve(this.#materialBank.get('5'));


		!foam2 ? foam2 = this.#crateMaterials.find(item => {
			if(item[5] === 'Foam Sheet' && item[2] <= 2.5)
				return(item);
		}): 0;
		!foam5 ? foam5 = this.#crateMaterials.find(item => {
			if(item[5] === 'Foam Sheet' && item[2] > 2.5)
				return(item);
		}): 0;
		const calcLayer = crate[0].fillGaps;
		const results = calcLayer.map(info => {
			const { highestZ, total } = info;
			return(highestZ > 2.5 ? [foam5, total]: [foam2, total]);
		})

		crate[2].set('gaps', results);
		return(crate);
	};

	/**
	* @method - returns the foam needed to pad the crates sides.
	* @param { Object } crate data.
	* @param { Array } foam sizes.
	*/
	async #trimmingPaddingLayersMaterials(foam, crate) {
		if(+foam[2] > 2.5) {
			const highDepth = this.#materialBank.get('thickness5');

			!highDepth ?
				this.#materialBank.set('5', [foam]):
				this.#materialBank.set('5', highDepth.push(foam));
			return(this.#trimmingMainCrateMaterial(foam, crate));
		};

		const onBank =		this.#materialBank.get(foam[0]);
		const lowDepth =	this.#materialBank.get('2');
		const { innerSize, layers } = crate[0];
		const len =			layers.length;

		if(!len)
			return(crate)
		const layerArea =	+(innerSize[0] * innerSize[2]).toFixed(3) * (len - 1);
		let areaBank =		0;
		onBank ? onBank.map(val => areaBank += val[0][0] * val[0][1]): 0;
		const foamArea =	+(+foam[1] * +foam[3] - areaBank).toFixed(3);
		const count =		Math.ceil(layerArea / foamArea);
		let needed;
		let residual;

		if(!onBank) {
			needed =	!count ? 0 : this.#provideMaterial(count, [+foam[1], +foam[3]]);
			residual =	!needed ? 0 : this.#foamDivisorLayers(innerSize, needed);
		};

		needed =	!needed ? this.#provideMaterial(count, [+foam[1], +foam[3]]): needed;
		residual =	!residual ? this.#foamDivisorLayers(innerSize, needed): residual;
		this.#materialBank.set(foam[0], [residual]);
		lowDepth ?
			this.#materialBank.set('2', lowDepth.push(foam)):
			this.#materialBank.set('2', [foam]);
		return(await this.#fillEmptySpaceOnLayers(crate, layers));
	};

	/**
	* @method - returns the sizes for the sheet materials.
	* @param { Object } crate data.
	* @param { Array } item the material to apply.
	*/
	#trimmingMainCrateMaterial(item, crate) {
		const onBank =		this.#materialBank.get(item[0]);
		const { innerSize } = crate[0];
		const frontBack =	{ x: innerSize[0], y: innerSize[2] };
		const sides =		{ z: innerSize[1], y: innerSize[2] };
		const upDown =		{ x: innerSize[0], z: innerSize[1] };
		const area = size => 2 * (size[0] * size[1]) + 2 * (size[0] * size[2]) + 2 * (size[1] * size[2]);
		const material =	crate[2].get(item[0]);
		let materialArea;
		let count;
		let needed;

		crate[2].set(item[5], { frontBack, sides, upDown, name: item[0] });
		const totalArea =	+(area(innerSize)).toFixed(3);
		if(!onBank) {
			materialArea =	+item[1] * +item[3];
			count =			Math.ceil(totalArea / materialArea);
			needed =		this.#provideMaterial(count, [+item[1], +item[3]]);
		};
		const areaBank =	onBank ? onBank[1].reduce((val, sum) => sum += val[0] * val[1], 0): 0;
		materialArea =		!materialArea ? (+item[1] * +item[3]) - areaBank: materialArea;
		count =				!count ? Math.ceil(totalArea / materialArea): count;
		needed =			!needed ? this.#provideMaterial(count, [+item[1], +item[3]]): needed;
		onBank ? needed.push(onBank[1]): 0;
		const residual =	this.#cutterManager(needed, innerSize);
		const useful =		residual.filter(rest => rest[0] >= 50 && rest[1] >= 50);

		material.counter = count;
		useful.length ? this.#materialBank.set(crate, useful): 0;
		useful.length ? material.residual = useful: material.residual = 0;
		item[5] === 'Plywood' ?
			crate[2].set(item[0], material): crate[2].set(item[0], material);
		return(crate);
	};

	/**
	* @method - calls the trimming methods to apply the materials to the crate.
	* @param { Array } item the materials info.
	* @param { Object } crate data.
	*/
	#enoughMaterial(item, crate) {
		if(item[5] === 'Pinewood')
			return(this.#trimmingFrameCrateMaterial(item, crate))
		else if(item[5] === 'Foam Sheet')
			return(this.#trimmingPaddingLayersMaterials(item, crate));
		return(this.#trimmingMainCrateMaterial(item, crate));
	};

	/**
	 * @method iterates on each work in order to revise the needed material.
	 * @param { Object } crate data.
	 * @param { Map } mapCrates all crates on the list.
	 * @param {number} [i=0].
	*/
	async #cutMaterial(crate, mapCrates, i = 0) {
		if(!crate[i])
			return(crate);

		crate[i].pop();
		this.#crateMaterials.map(item => this.#enoughMaterial(item, crate[i]));
		return(this.#cutMaterial(crate, mapCrates, i + 1));
	};

	/**
	* @method - returns the Map for all crates on the list.
	*/
	#mapCrateTypes() {
		const opts = [
			'tubeCrate',
			'largestCrate',
			'sameSizeCrate',
			'noCanvasCrate',
			'standardCrate'
		];
		const types = new Map();

		Object.entries(this.#raw).map(crate => {
			opts.includes(crate[0]) ? types.set(crate[0], crate[1]) :0;
		});
		return(types);
	};

	/**
	* @field - Call the fulfillment of the crate.
	*/
	get crateCutter() {
		this.#crates.map(crate => {
			const x = crate[0];
			const z = crate[1];
			const y = crate[2];
			const area = +(2 * (x * z) + 2 * (x * z) + 2 * (z * y)).toFixed(3);

			crate.push(area);
			return(crate);
		});
		this.#crates =		this.#quickSort([...this.#crates]);
		const mapCrates =	this.#mapCrateTypes();
		this.#cutMaterial(this.#crates.reverse(), mapCrates);
		return(this.#crates);
	};
};
