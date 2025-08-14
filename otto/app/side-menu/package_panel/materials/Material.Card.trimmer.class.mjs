export default class PackingTrimmer {
	#worksMaterials;
	#plannedWorks;
	#materialBank;
	#sorted;

	constructor(list, prisms) {
		if(list && prisms) {
			this.#sorted =			list;
			this.#plannedWorks =	prisms;
			this.#materialBank =	new Map();
		};
	};

	/**
	* @method - executes the cut material based on art sizes.
	* @param { Object } art sizes
	* @param { Array } material sizes.
	*/
	#trimMaterial(material, art) { let x =		material[0] - art.length;
		const y =	material[1] - art.height;

		y ? x = x - y: 0;
		material[0] = x;
		return(material);
	};

	/**
	* @method - returns the available trimmed materials.
	* @param { Object } work data.
	* @param { number } counter needed units of the materials to apply.
	* @param { Array } feat the position of the work over the material.
	* @param { Array } material sizes.
	*/
	#defineAvailableCoordinates(work, material, counter) {
		let trimming;

		const pack = this.#worksMaterials.find(item => item[1] === material[0]);
		if(pack) {
			const coordinates = +pack[2] >= +pack[4] ?
				[[+pack[2] * counter, +pack[4]]] : [[+pack[4] * counter, +pack[2]]];
			trimming =	this.#trimMaterial(coordinates[0], work);
			return(trimming);
		};
	};

	/**
	* @method - adds the rest of the materials to the possible reuse bank.
	* @param { number } count
	* @param { boolean } found
	* @param { Array } retang the planned work sizes.
	* @param { Array } optimized the position valid for reuse the material.
	*/
	#feedMaterialOnBanck(retang, found, optimized, feat, count) {
		if(!found && !optimized[1] || !feat) {
			const positions =	this.#defineAvailableCoordinates(retang, optimized, count);

			return(this.#materialBank.set(optimized[0], [[retang.code, positions]]));
		};
	};

	/**
	* @method - updates the used materials available on the bank.
	* @param { Array } retang the works sizes planned.
	* @param { Array } feat the position of the work over the material.
	* @param { Array } material sizes.
	* @param { Object } infoWork data.
	*/
	#updateMaterialBank(retang, infoWork, feat, material) {
		const { types, quantity, reuse } = infoWork[1];
		const optimol =	reuse.filter(kind => kind[0] === material[2]).flat();

		if(!material) {
			types.map(item => {
				const onBank =	this.#materialBank.has(item[0]);
				const optimol =	reuse.filter(kind => kind[0] === item[2]).flat();
				const unit =	quantity.find(type => type[0] === optimol[0]).flat();

				this.#feedMaterialOnBanck(retang, onBank, optimol, feat, unit[1]);
			});
			return;
		};
		const onBank =		this.#materialBank.get(material[2]);

		onBank[1] = this.#trimMaterial(onBank[0][1], retang);
		this.#materialBank.set(onBank[0], onBank[0]);
		return(this.#feedMaterialOnBanck(retang, false, optimol, feat));
	};

	/**
	* @method - provide all material needed to apply on the work.
	* @param { Array } item the materials data.
	* @param { Array } work data.
	*/
	#enoughMaterial(item, work) {
		const available =	this.#materialBank.get(item[2]);
		let area =			available && Array.isArray(available[0][1]) ?
			available.find(opt => opt[1][0] && opt[1][1]): false;

		if(area) {
			const i = work[1].reuse.findIndex(data => data[0] === item[2]);

			work[1].residual[i] =		0;
			work[1].quantity[i][1] =	0;
			work[1].reuse[i][1] =		false;
			work[1].reuse[i].push(structuredClone(area[0]));
			area = area[1][0] * area[1][1] / 100;
		};
		return(area);
	};

	/**
	 * @method iterates on each work in order to revise the needed material.
	 * @param { Array } list all works planned to pack.
	 * @param { Array } packedInfo the works data.
	 * @param {number} [i=1]
	*/
	async #cutMaterial(packedInfo, list, i = 1) {
		try {
			if(!list[i])
				return(this.#plannedWorks);
			const art =	list[i];
			const packing =	['Sheet', 'Roll', 'Tape'];
			const { reuse, types } = packedInfo[1];
			const sheets =		types.filter(item => packing.includes(item[0]));
			const materials =	sheets.filter((kind, j) => {
				if(kind[2] === reuse[j][0] && reuse[j][1])
					return(kind);
			}, 0);

			if(materials.length) {
				materials.map(item => {
					const area = this.#enoughMaterial(item, packedInfo);
					if(area) {
						const compact =	area >= art.demand;
						this.#updateMaterialBank(art, packedInfo, compact, item);
					};
				});
			};
			return(this.#cutMaterial(packedInfo, list, i + 1));
		}
		catch(e) {
			console.error(e);
		};
	};

	/**
	* @field - Call the fulfillment of the crate.
	*/
	get cardBoardCutter() {
		this.#sorted.reverse().map(async (check, i) => {
			if(i)
				return(await this.#cutMaterial(check, this.#plannedWorks));
			const firstCheck = this.#plannedWorks.find(work => work.code === check[0]);
			this.#updateMaterialBank(firstCheck, check, false, false);
		}, 0);
		return(this.#sorted);
	};

	/** @param { Object } data  */
	set setWorksPacking(data) {
		this.#worksMaterials = data;
	};
};
