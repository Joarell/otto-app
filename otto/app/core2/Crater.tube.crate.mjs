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

	#worksInPlace(list, arranger, i = 1) {
		if (!list.length) return this.#coordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		const len = list.length - 1;

		arranger.fillPreparing = { info, list, len, raw: this.#rawList };
		const result = arranger.fillLayer;
		this.#coordinates.defineLayer = [i, result.feat];
		return this.#worksInPlace(list, arranger, i + 1);
	}

	#setWokdCoordinates(innerSize, list) {
		const coordinates = new WorksCoordinates(innerSize, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		const len = Array.isArray(list[0]) ? list.length - 1 : 0;
		const spanPad = 10;
		let sumY = 0;

		coordinates.fillPreparing = { info, list, len, raw: this.#rawList };
		const { feat } = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, feat];
		this.#worksInPlace(list, coordinates);
		this.#rawList.map((work, i) => {
			if(i > 0) sumY += spanPad;
			this.#coordinates.artLocation.set(work.code, work)

			return work;
		}, 0);
		this.#coordinates.innerSize = [innerSize[0], innerSize[1], innerSize[2] + sumY];
	}

	#sizeComposer(list) {
		let x = list[0][1];
		let z = list[0][2];
		let y = 0;

		list.map((tube, i) => {
			x = tube[1] > x ? tube[1] : x;
			z = tube[2] > z ? tube[2] : z;
			y += i > 0 ? tube[3] + 10: tube[3];
			return tube;
		}, 0);
		return [x, z, y];
	}

	#setPaddings(base, list) {
		const crate = new CrateMaker(1, this.#materials);
		const outSizes = crate.outSizes;
		const x = +(base[0] + outSizes.x).toFixed(3);
		const z = +(base[1] + outSizes.z).toFixed(3);
		const y = +(base[2] + outSizes.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(0);
		const Z = z % 1 > 0 ? z : z.toFixed(0);
		const Y = y % 1 > 0 ? y : y.toFixed(0);

		this.#setWokdCoordinates(base, structuredClone(list));
		this.#coordinates.finalSize = [+X, +Z, +Y];
		return [...this.#coordinates.finalSize];
	}

	#tubeCrate(works) {
		const baseSize = this.#sizeComposer(works);
		return this.#setPaddings(baseSize, works);
	}

	#hugeTubes(tubes) {
		const result = [];
		const MAXCONTENT = 3;
		let getter;

		while (tubes.length >= MAXCONTENT) {
			getter = tubes.splice(0, MAXCONTENT);
			result.push(this.#tubeCrate(getter.length));
			result.push({ works: getter });
		}
		console.log("🗣️", result)
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
		let reduce;
		let tubes;
		const crates = [];
		const MAXCONTENT = 3;
		const biggest = this.#checkHugeTubes();

		if (biggest.length > 0 || biggest.length > MAXCONTENT)
			crates.push(this.#hugeTubes(biggest));

		while (this.#tubes.length) {
			tubes = this.#tubes.splice(0, MAXCONTENT);

			reduce = structuredClone(tubes);
			crates.push(this.#tubeCrate(reduce));
			crates[0].push(this.#coordinates);
			crates.push({ works: tubes });
		}
		if (this.#tubes.length >= 1) {
			tubes = this.#tubes.splice(0, MAXCONTENT);

			reduce = structuredClone(tubes);
			crates.push(this.#tubeCrate(reduce));
			crates[0].push(this.#coordinates);
			crates.push({ works: tubes });
		}
		return { crates };
	}

	get makeCrate() {
		return this.#crateMaker();
	}
}
