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
	* @method - updates the crates that residual came from.
	* @param { Array } item the material;
	* @param { Number } index the crate index on the sorted list.
	*/
	#updateCratesMaterialUsage(item, index) {
		const update =		this.#crates[index];
		const material =	update[2].get(item[0]);

		material.residual = 0;
		update[2].set(item[0], material)
		this.#crates[index] = update;
		return(this.#crates);
	};

	/**
	* @method - returns how many materials are needed to the crate.
	* @param { number } count quantity.
	* @param { Array } sizes works dimensions.
	* @param { Array } crate size;
	*/
	#provideMaterial(count, sizes, crate) {
		const provision =	[];
		const extraX =		crate[0] > sizes[0] ? crate[0] - sizes[0]: 0;
		const extraY =		crate[2] > sizes[1] ? crate[2] - sizes[1]: 0;
		const materialArea = sizes[0] * sizes[1];

		if(extraX && extraY) {
			const faces =	((sizes[0] * extraY) + (extraY * extraX)) * 2;
			const sides =	((crate[1] * sizes[1]) + (extraY * crate[1])) * 2;
			const upDown =	((crate[1] * sizes[0]) + (crate[1] * extraX)) * 2;
			const extra =	Math.ceil((faces + sides + upDown) / materialArea);

			count -= extra;
		}
		else if(extraX && !extraY) {
			const faces =	((extraX * crate[2]) + (crate[0] * crate[2])) * 2;
			const upDown =	((extraX * crate[1]) + (crate[0] * crate[1])) * 2;
			const extra =	Math.ceil((faces + upDown) / materialArea);

			count -= extra;
		}
		else if(!extraX && extraY) {
			const faces =	((crate[0] * extraY) + (crate[0] * sizes[1])) * 2;
			const sides =	((crate[1] * extraY) + (crate[1] * sizes[1])) * 2;
			const extra =	Math.ceil((faces + sides) / materialArea);

			count -= extra;
		};
		while(count > provision.length)
			provision.push([sizes[0] + extraX, sizes[1] + extraY]);
		return({ provision, extraX, extraY });
	};

	/**
	* @method - check if the rest of the material can be reused.
	* @param { Array } sizes crates dimensions.
	* @param { Array } data material sizes.
	*/
	#reuseMaterialRecursion(data, sizes, i = 0) {
		const material =	data[0];
		const checker =		data[1];
		if(!data[0][0] || i === 2 || checker.a && checker.b)
			return(data[0]);

		if(material[0] >= sizes[0] && material[1] >= sizes[1]) {
			const x = structuredClone(material[0]);
			const y = structuredClone(material[1]);
			let diff;

			material[0] = material[0] === sizes[0] ? 0: +(material[0] - sizes[0]).toFixed(3);
			!material[0] && material[1] === sizes[1] ? material[1] = +(material[1] - sizes[1]).toFixed(3): 0;
			if(!material[0] && material[1]) {
				if(material[1] > sizes[1]) {
					material[0] = x;
					material[1] = +(material[1] - sizes[1]).toFixed(3);
				}
				else
					material[0] = +(material[0] - sizes[0]).toFixed(3);
			};
			diff = material[0] !== x || material[1] !== y;
			diff && !checker.a ? checker.a = true: checker.b = true;
			if(!checker.b && material[0] >= sizes[0] && material[1] >= sizes[1]){
				material[0] = material[0] === sizes[0] ? 0: +(material[0] - sizes[0]).toFixed(3);
				!material[0] && material[1] === sizes[1] ? material[1] = +(material[1] - sizes[1]).toFixed(3): 0;

				if(!material[0] && material[1]) {
					if(material[1] > sizes[1]) {
						material[0] = x;
						material[1] = +(material[1] - sizes[1]).toFixed(3);
					}
					else
						material[0] = +(material[0] - sizes[0]).toFixed(3);
				};
				material[0] !== x && !checker.a ? checker.a = true: checker.b = true;
			};
		}
		[ material[0], material[1] ] = [ material[1], material[0] ];
		data[0] = material;
		return(this.#reuseMaterialRecursion(data, sizes, i + 1));
	};

	/**
	* @method - try to apply the material to the crate.
	* @param { Array } crate sizes;
	* @param { Array } provided all materials sizes.
	*/
	#cutterManager(provided, bank, crate) {
		const faceAB = 			{ a: false, b: false };
		const sideRL = 			{ a: false, b: false };
		const upDown = 			{ a: false, b: false };
		const takingMaterial =	(sheet => {
			sheet = this.#reuseMaterialRecursion([ sheet, faceAB ], [ crate[0], crate[2] ]);
			sheet = this.#reuseMaterialRecursion([ sheet, sideRL ], [ crate[1], crate[2] ]);
			sheet = this.#reuseMaterialRecursion([ sheet, upDown ], [ crate[0], crate[1] ]);
			sheet[0] <= 10 || sheet[1] <= 10 ? sheet = 0: 0;
			return(sheet);
		});
		let checker =			false;
		let stored =			true;

		if(bank) {
			bank.map(takingMaterial);
			bank = provided.filter(opts => Array.isArray(opts));
			checker = [ faceAB, sideRL, upDown ].some(side => {
				return (side.a === false || side.b === false);
			});
		};
		if(checker || !bank) {
			provided.map(takingMaterial);
			provided = provided.filter(opts => Array.isArray(opts));
			stored = false;
		};
		return({ provided, bank, stored });
	};

	/**
	* @method - defines the crate size materials needed
	* @param { Array } size the crate inner sizes.
	* @param { String } item for usage.
	* @param { Array } type of material.
	* @param { Array } crate data.
	*/
	#allSidesCrate(size, crate, item, type, { extraX, extraY }) {
		let frontBack;
		let sides;
		let upDown;

		if(item === 'Frame') {
			frontBack =	{ x: size[0], y: size[2] - type[3] };
			sides =		{ z: size[1], y: size[2] - type[3] };
			upDown =	{ x: size[0] - type[3], z: size[1] };
			crate[2].set('Frame', {
				frontBack, sides, upDown, name: type[0],
			});
		}
		else {
			frontBack =	{ x: size[0], y: size[2], extraX, extraY };
			sides =		{ z: size[1], y: size[2], extraY };
			upDown =	{ x: size[0], z: size[1], extraX };
			crate[2].set(type[5], {
				frontBack, sides, upDown, name: type[0]
			});
		};
		return(crate);
	};

	/**
	* @method - define the largest crate material for the structure.
	* @param { Array } crate sizes.
	* @param { Array } pine the frame material to apply.
	* @param { Array } bank of used materials.
	*/
	#largeCrateStructure(crate, pine) {
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
		const leanner = {
			counter: div,
			size: +finalSize[1],
			area: highEnforce,
			name: pine[0],
			type: pine[5]
		};
		const enforcer = {
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
	* @method - defines the amount of material needed.
	* @param { Array } size the crate inner sizes.
	* @param { Array } pine the material sizes.
	*/
	#plywoodJoinChecker(size, pine) {
		const ply =		this.#crateMaterials.find(item => item[5] === 'Plywood');
		const join =	size[0] / ply[1];
		const x = 		+(+size[0] * 8).toFixed(3);
		const z = 		+(+size[1] * 10).toFixed(3);
		const y = 		join > 1 ? +(+size[2] * ((join - 1) * 2) + 8):
			+(+size[2] * 8).toFixed(3);
		const yTrimmedLoss =	+(+pine[3] * 4).toFixed(3);

		return(+(x + y + z - yTrimmedLoss).toFixed(3));
	};

	/**
	* @method - cuts the crate frame.
	* @param { Array } pine - material data.
	* @param { Object } crate - crate data.
	*/
	#trimmingFrameCrateMaterial(pine, crate, index) {
		const onBank =			this.#materialBank.get(pine[0]);
		const { innerSize } =	crate[0];
		const totalMaterial =	this.#plywoodJoinChecker(innerSize, pine);
		const update =			crate[2].get(pine[0]);
		let pinewood =			totalMaterial > +pine[1] ?
			Math.ceil(totalMaterial / +pine[1]) * +pine[1] : +pine[1];

		this.#allSidesCrate(innerSize, crate, 'Frame', pine, { extraX: 0, extraY: 0 });
		crate[1] === 'largestCrate' ? this.#largeCrateStructure(crate, pine): 0;
		const structure =		this.#largestData.get('pine');
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
			residual > 20 ? this.#materialBank.set(pine[0], [ index, residual ]): 0;
			return(crate);
		};
		pinewood -=			onBank[1];
		const residual =	+((pinewood + onBank[1]) - totalMaterial).toFixed(3);

		update.counter =	structure ?
			Math.ceil((totalMaterial + structure)  / +pine[1]):
			Math.ceil(totalMaterial / +pine[1]);
		update.residual =	+[+(residual).toFixed(4), onBank[0]]
			.reduce((val, sum) => val + sum, 0).toFixed(4);
		if(structure) {
			update.area +=	structure;
			update.residual += +(1 - structure % 1).toFixed(3);
		};
		crate[2].set(pine[0], update);
		crate[1] !== 'largestData' ?
			this.#updateCratesMaterialUsage(pine, onBank[0]): 0;
		this.#materialBank.set(pine[0], [ index, residual ]);
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
		let foam2 =	this.#materialBank.get('2') || this.#crateMaterials.find(item => {
			if(item[5] === 'Foam Sheet' && item[2] <= 2.5)
				return(item);
		});
		let foam5 =	this.#materialBank.get('5') || this.#crateMaterials.find(item => {
			if(item[5] === 'Foam Sheet' && item[2] > 2.5)
				return(item);
		});
		foam2 = Array.isArray(foam2[0]) ? foam2[0]: foam2;
		foam5 = Array.isArray(foam5[0]) ? foam5[0]: foam5;
		const calcLayer = crate[0].fillGaps;
		const results = calcLayer.map(info => {
			const { highestZ, total } = info;
			return(foam5 && highestZ[1] >= +foam5[2] ? [foam5, total]: [foam2, total]);
		}).flat().filter(data => Array.isArray(data));

		crate[2].set('gaps', { results, calcLayer });
		return(crate);
	};

	/**
	* @method - returns the foam needed to pad the crates sides.
	* @param { Object } crate data.
	* @param { Array } foam sizes.
	*/
	async #trimmingPaddingLayersMaterials(foam, crate, index) {
		if(+foam[2] > 2.5) {
			const highDepth = this.#materialBank.get('thickness5');

			!highDepth ?
				this.#materialBank.set('5', [foam]):
				this.#materialBank.set('5', highDepth.push(foam));
			return(this.#trimmingMainCrateMaterial(foam, crate, index));
		};

		const onBank =		this.#materialBank.get(foam[0]);
		const lowDepth =	this.#materialBank.get('2');
		const { innerSize, layers } = crate[0];
		const len =			layers.length;

		if(!len)
			return(crate)
		const layerArea =	+(innerSize[0] * innerSize[2]).toFixed(3) * (len - 1);
		let areaBank =		0;
		onBank ? onBank.map(val => areaBank += val[0] * val[1]): 0;
		const foamArea =	+(+foam[1] * +foam[3] - areaBank).toFixed(3);
		const count =		Math.ceil(layerArea / foamArea);
		const { provision, extraX, extraY } = this.#provideMaterial(count, [+foam[1], +foam[3]], innerSize);
		let residual;

		if(!onBank) {
			residual =	!provision ? 0 : this.#foamDivisorLayers(innerSize, provision);
		};

		residual =	!residual && count ?
			this.#foamDivisorLayers(innerSize, provision): residual;
		this.#materialBank.set(foam[0], [ residual ]);
		lowDepth && Array.isArray(lowDepth) ?
			this.#materialBank.set('2', lowDepth):
			this.#materialBank.set('2', [foam]);
		return(await this.#fillEmptySpaceOnLayers(crate));
	};

	/**
	* @method - returns the sizes for the sheet materials.
	* @param { Object } crate data.
	* @param { Array } item the material to apply.
	*/
	#trimmingMainCrateMaterial(item, crate, index) {
		const onBank =		this.#materialBank.get(item[0]);
		const { innerSize } = crate[0];
		const area = size => 2 * (size[0] * size[1]) + 2 * (size[0] * size[2]) + 2 * (size[1] * size[2]);
		const material =	crate[2].get(item[0]);
		const totalArea =	+(area(innerSize)).toFixed(3);
		const areaBank =	onBank ?
			Number.parseFloat(onBank[1].reduce((val, sum) => sum += +val[0] * +val[1], 0)): 0;
		const materialArea = areaBank ? ((+item[1] * +item[3]) - +areaBank): +item[1] * +item[3];
		const count =		Math.ceil(totalArea / materialArea);
		const { provision, extraX, extraY } = this.#provideMaterial(count, [+item[1], +item[3]], innerSize);
		const { provided, bank, stored } =	onBank ?
			this.#cutterManager(provision, onBank[1], innerSize):
			this.#cutterManager(provision, false, innerSize);
		const residual =	onBank ? `Reused from crate: ${onBank[0] + 1}`: provided;
		const useful =		Array.isArray(residual) && !stored ?
			residual.filter(val => val[0] > 0)
			.map(rest => +(rest[0] * rest[1]).toFixed(3))
			.reduce((sum, val) => sum + val, 0): 0;

		material.counter = count;
		if(!stored){
			this.#materialBank.delete(item[0]);
			this.#materialBank.set(item[0], [ index, provided ])
		}
		else
			this.#materialBank.set(item[0], [ onBank[1], bank ]);

		onBank && !stored ? this.#updateCratesMaterialUsage(item, onBank[0]): 0;
		// Array.isArray(useful) && useful.length ?
		// 	material.residual = useful: material.residual = residual;
		material.residual = useful;
		crate[2].set(item[0], material);
		this.#allSidesCrate(innerSize, crate, item[5], item, { extraX, extraY });
		return(crate);
	};

	/**
	* @method - calls the trimming methods to apply the materials to the crate.
	* @param { Array } item the materials info.
	* @param { Object } crate data.
	*/
	#enoughMaterial(item, crate, pos) {
		try {
			if(item[5] === 'Pinewood')
				return(this.#trimmingFrameCrateMaterial(item, crate, pos))
			else if(item[5] === 'Foam Sheet')
				return(this.#trimmingPaddingLayersMaterials(item, crate, pos));
			return(this.#trimmingMainCrateMaterial(item, crate, pos));
		}
		catch(e) {
			console.error(e);
		};
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
		this.#crateMaterials.map(item => this.#enoughMaterial(item, crate[i], i));
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

		Object.entries(this.#raw).map((crate, i) => {
			opts.includes(crate[0]) ? types.set(i, crate[1]) :0;
		}, 0);
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
		this.#cutMaterial(this.#crates, mapCrates);
		return(this.#crates);
	};
};
