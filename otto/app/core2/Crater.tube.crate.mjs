import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterTube {
	#tubes;
	#DIAMETER
	#coordinates;
	#rawList;

	constructor(list) {
		if(!list || list.length === 0)
			return({ tube : false });


		this.#rawList =		list;
		this.#tubes =		list.map(art => art.arr);
		this.#DIAMETER =	35;
		const checker =		this.#tubes.filter(item => {
			return(item[2] < this.#DIAMETER ? item : false);
		})
		const works =		checker.find(data => data !== false);

		if (!works)
			return ({ tube: false });
		return(this.#crateMaker());
	};

	#crateMaker() {
		this.#possibleCrates();
		return(this.#tubes);
	};

	#setWokdCoordinates(innerSize, list) {
		const coordinates =		new WorksCoordinates(innerSize);
		this.#coordinates =		coordinates.bluePrintCoordinates;
		const { emptyArea } =	this.#coordinates;
		let info =				{ emptyArea, feat: [] };
		let len =				Array.isArray(list[0]) ? list.length - 1 : 0;
		let result;

		coordinates.fillPreparing = { info, list, len, raw: this.#rawList };
		result = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, result.feat];
		this.#coordinates.innerSize = [innerSize[0], innerSize[1], innerSize[2]];
		this.#rawList.map(work => this.#coordinates.artLocation.set(work.code, work));
	};

	#sizeComposer(list){
		let x = list[0][1];
		let z = list[0][2];
		let y = 0;

		list.map(tube => {
			x = tube[1] > x ? tube[1]: x;
			z = tube[2] > z ? tube[2]: z;
			y += tube[3];
		});
		return([x, z, y]);
	}

	#setPaddings() {
		const crate = new CrateMaker(1);
		const x = +(this[0] + crate.x).toFixed(3);
		const z = +(this[1] + crate.z).toFixed(3);
		const y = +(this[2] + crate.y).toFixed(3);
		const X = x % 1 > 0 ? x: (x).toFixed(0);
		const Z = z % 1 > 0 ? z: (z).toFixed(0);
		const Y = y % 1 > 0 ? y: (y).toFixed(0);

		this.#setWokdCoordinates([
			this[0] + crate.pad, this[1] + crate.pad, this[2] + crate.pad
		], structuredClone(list));
		this.#coordinates.finalSize = [+X,+Z, +Y];
		return([...this.#coordinates.finalSize]);
	};

	#tubeCrate(works) {
		const baseSize =	this.#sizeComposer(works);
		return (this.#setPaddings(baseSize, works));
	};

	#interfaceCrates(list) {
		switch(list.length) {
			case 1:
				return(this.#tubeCrate(list));
			case 2:
				return(this.#tubeCrate(list));
			case 3:
				return(this.#tubeCrate(list));
			case 4:
				return(this.#tubeCrate(list));
		};
	};

	#hugeTubes(tubes) {
		const result =		[];
		const MAXCONTENT =	3;
		let getter;

		while(tubes.length >= MAXCONTENT) {
			getter = tubes.splice(0, MAXCONTENT);
			result.push(this.#interfaceCrates(getter.length, getter));
			result.push({ works: getter });
		};
		return(result);
	};

	#checkHugeTubes() {
		const getter =		this.#tubes.filter(tube => {
			if (tube[2] > this.#DIAMETER)
				return (tube);
			return ;
		});
		getter.map(roll => {
			this.#tubes.splice(this.#tubes.indexOf(roll), 1);
		});
		return(getter);
	};

	#possibleCrates() {
		let reduce =		[];
		let crates =		[];
		const MAXCONTENT =	3;
		const biggest =		this.#checkHugeTubes();

		if (biggest.length > 0 || biggest.length > MAXCONTENT)
			crates.push(this.#hugeTubes(biggest));

		while(this.#tubes.length) {
			reduce = this.#tubes.splice(0, MAXCONTENT);
			crates.push(this.#interfaceCrates(reduce));
			crates.push({ works: reduce });
		};
		if (this.#tubes.length >= 1) {
			crates.push(this.#interfaceCrates(this.#tubes.length, this.#tubes));
			crates.push({ works: this.#tubes });
		};
		return(this.#tubes = { crates });
	};
};
