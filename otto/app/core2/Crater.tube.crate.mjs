import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterTube {
	#tubes;
	#DIAMETER;
	#coordinates;
	#rawList;
	#materials;

	constructor(list, materials) {
		if (list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#tubes = list.map((art) => art.arr);
			this.#DIAMETER = 35;
		}
	}

	#crateMaker() {
		if (!this.#rawList || this.#rawList.length === 0) return { tube: false };
		const checker = this.#tubes.filter((item) => {
			return item[2] < this.#DIAMETER ? item : false;
		});
		if (checker.find((data) => !Array.isArray(data))) return { tube: false };

		return this.#possibleCrates();
	}

	#setWokdCoordinates(innerSize, list) {
		const coordinates = new WorksCoordinates(innerSize, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		const len = Array.isArray(list[0]) ? list.length - 1 : 0;

		coordinates.fillPreparing = { info, list, len, raw: this.#rawList };
		const { feat } = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, feat];
		this.#coordinates.innerSize = [innerSize[0], innerSize[1], innerSize[2]];
		this.#rawList.map((work) =>
			this.#coordinates.artLocation.set(work.code, work),
		);
	}

	#sizeComposer(list) {
		let x = list[0][1];
		let z = list[0][2];
		let y = 0;

		list.map((tube) => {
			x = tube[1] > x ? tube[1] : x;
			z = tube[2] > z ? tube[2] : z;
			y += tube[3];
			return tube;
		});
		return [x, z, y];
	}

	#setPaddings(base, list) {
		const crate = new CrateMaker(1, this.#materials);
		const x = +(base[0] + crate.outSizes.x).toFixed(3);
		const z = +(base[1] + crate.outSizes.z).toFixed(3);
		const y = +(base[2] + crate.outSizes.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(0);
		const Z = z % 1 > 0 ? z : z.toFixed(0);
		const Y = y % 1 > 0 ? y : y.toFixed(0);
		const { pad } = crate.outSizes;

		this.#setWokdCoordinates(
			[base[0] + pad, base[1] + pad, base[2] + pad],
			structuredClone(list),
		);
		this.#coordinates.finalSize = [+X, +Z, +Y];
		return [...this.#coordinates.finalSize];
	}

	#tubeCrate(works) {
		const baseSize = this.#sizeComposer(works);
		return this.#setPaddings(baseSize, works);
	}

	#interfaceCrates(list) {
		switch (list.length) {
			case 1:
				return this.#tubeCrate(list);
			case 2:
				return this.#tubeCrate(list);
			case 3:
				return this.#tubeCrate(list);
			case 4:
				return this.#tubeCrate(list);
		}
	}

	#hugeTubes(tubes) {
		const result = [];
		const MAXCONTENT = 3;
		let getter;

		while (tubes.length >= MAXCONTENT) {
			getter = tubes.splice(0, MAXCONTENT);
			result.push(this.#interfaceCrates(getter.length, getter));
			result.push({ works: getter });
		}
		return result;
	}

	#checkHugeTubes() {
		const getter = [];

		this.#tubes.filter((tube) => {
			if (tube[2] > this.#DIAMETER) getter.push(tube);
			return tube;
		});
		getter.map((roll) => {
			this.#tubes.splice(this.#tubes.indexOf(roll), 1);
			return roll;
		});
		return getter;
	}

	#possibleCrates() {
		let reduce = [];
		const crates = [];
		const MAXCONTENT = 3;
		const biggest = this.#checkHugeTubes();

		if (biggest.length > 0 || biggest.length > MAXCONTENT)
			crates.push(this.#hugeTubes(biggest));

		while (this.#tubes.length) {
			reduce = this.#tubes.splice(0, MAXCONTENT);
			crates.push(this.#interfaceCrates(reduce));
			crates.push({ works: reduce });
		}
		if (this.#tubes.length >= 1) {
			crates.push(this.#interfaceCrates(this.#tubes.length, this.#tubes));
			crates.push({ works: this.#tubes });
		}
		return { crates };
	}

	get makeCrate() {
		return this.#crateMaker();
	}
}
