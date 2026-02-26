import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterSameSize {
	#pieces;
	#packageSize;
	#rawList;
	#coordinates;
	#materials;

	constructor(list, materials) {
		if(list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#pieces = list.map((art) => art.packedSized);
			this.#packageSize = list[0].packedSized;
		}
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

	#setWorksCoordinates(base, stack) {
		const { materials, cratesOnly } = this.#materials;
		const check = (a, b) => a === b[0] && b[2] < 5 && b[5] === "Foam Sheet";
		let padLayer;

		cratesOnly.map((item) => {
			const padding = materials.filter((opt) => check(item, opt));
			if (padding.length) padLayer = padding.flat();
			return item;
		});
		if (stack) base[2] = +padLayer[2];

		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		// TODO: add loop for getting each work coordinates.
		coordinates.fillPreparing = {
			info,
			list: this.#pieces,
			len: this.#pieces.length - 1,
			raw: this.#rawList
		};
		const { feat } = coordinates.fillLayer;
		const list = structuredClone(this.#pieces);

		this.#coordinates.defineLayer = [ 1, feat ];
		this.#rawList.map((work) =>
			this.#coordinates.artLocation.set(work.code, work),
		);
		this.#worksInPlace(list, coordinates);
		this.#rawList.map((work) =>
			this.#coordinates.artLocation.set(work.code, work),
		);
		this.#coordinates.innerSize = base;
		delete this.#coordinates.defineLayer;
		delete this.#coordinates.reset;
		return base;
	}

	#setPad(innerCrate, layersUp) {
		const crater = new CrateMaker(
			this.#pieces.length,
			this.#materials,
			layersUp,
		).outSizes;
		const x = +(innerCrate[0] + crater.x).toFixed(3);
		const z = +(innerCrate[1] + crater.z).toFixed(3);
		const y = +(innerCrate[2] + crater.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(0);
		const Z = z % 1 > 0 ? z : z.toFixed(0);
		const Y = y % 1 > 0 ? y : y.toFixed(0);
		const div = innerCrate[1] + crater.div * this.#pieces.length;

		this.#setWorksCoordinates(innerCrate, layersUp);
		this.#coordinates.innerSize = [innerCrate[0], div, innerCrate[2]];
		this.#coordinates.finalSize = [+X, +Z, +Y];
		return [...this.#coordinates.finalSize, this.#coordinates];
	}

	#checkComp(getter, test, baseLayer) {
		const checker = getter.map((value) => {
			const checkX = value[0] + test[0] <= baseLayer[0];
			const checkZ = value[1] + test[1] <= baseLayer[1];
			const checkY = value[2] + test[2] <= baseLayer[2];

			if (checkX && checkZ && checkY) return value;
			return value;
		});

		if (checker[0] !== undefined)
			checker.map((size) => getter.splice(getter.indexOf(size), 1));
		return checker[0] !== undefined;
	}

	#composeLayer(baseSize, list) {
		const getter = [];
		const compLayer = list.map((size) => {
			const X = size[0] === baseSize[0][0];
			const Y = size[2] === baseSize[0][2];
			const secondX = size[0] === baseSize[0][0] - this.#packageSize[1];
			const secondY = size[2] === baseSize[0][2] - this.#packageSize[3];

			if ((X && Y) || (secondX && secondY)) return size;
			if (getter.length > 0) {
				if (this.#checkComp(getter, size, baseSize)) return size;
			} else getter.push(size);
			return size;
		});
		return compLayer[0] !== undefined;
	}

	#orderSizes(base, art) {
		const STACK = base.shift();
		const LEN = art.length;
		// const LEN = Array.isArray(art[0]) ? art[0].length : art.length;
		let DEPTH;
		let x;
		let z;
		let y;

		if (STACK) {
			DEPTH = (LEN % 2) + LEN / 2;
			x = base[0];
			z = DEPTH * this.#packageSize[2];
			y = base[2];
		} else {
			// DEPTH = (LEN % 2) + LEN;
			x = base[0];
			z = LEN * this.#packageSize[2];
			y = base[2];
		}
		return this.#setPad([x, z, y], STACK);
	}

	#sizeStacking(base, newBase) {
		const extraSizes =
			newBase.length > 3
				? [newBase[0][1], newBase[0][2], newBase[0][3]]
				: newBase;
		const LIMIT = 132;
		let x = base[0];
		const z = base[1];
		let y = base[2] + extraSizes[2];
		let stack = false;

		if (y > LIMIT && x < LIMIT) {
			[y, x] = [x, y];
			stack = true;
		} else if (y > base[2]) stack = true;
		return [stack, [x, z, y]];
	}

	#solveList(list) {
		const LIMITWORKS = 10;
		let comp;
		let baseCrate = list.splice(0, 1).flat();
		let works = list.splice(0, 1).flat();

		if (list.length > 0) comp = this.#composeLayer(baseCrate, list);
		if (comp) {
			baseCrate = this.#sizeStacking(baseCrate, list.splice(0, 1));
			list[0].map((val) => works[0][0].push(val));
			list.splice(0, list[0].length);
		} else {
			if (works[0].length > LIMITWORKS && works[0].length % 2 === 0)
				baseCrate = this.#sizeStacking(baseCrate, works[0]);
			else baseCrate.unshift(false);
		}
		if (Array.isArray(works[0][0])) works = works.flat();
		const crate = this.#orderSizes(baseCrate.flat(), works);
		return { crate, works };
	}

	#compCrate(list) {
		const crate = [];
		let solver;

		while (list.length) {
			solver = this.#solveList(list);
			crate.push(solver.crate);
			crate.push({ works: solver.works });
		}
		return crate;
	}

	#countWorks() {
		const MAXDEPTH = 14;
		let x = this.#pieces[0][1];
		let z = this.#pieces[0][2];
		let y = this.#pieces[0][3];
		const sizes = [[x, z, y]];
		let works = [];

		this.#pieces.map((work) => {
			if (work[2] <= MAXDEPTH) {
				if (work[1] !== x && work[3] !== y) {
					sizes.push([works]);
					x = work[1];
					z = work[2];
					y = work[3];
					sizes.push([x, z, y]);
					works = [];
				}
				works.push(work);
			}
			return work;
		});
		sizes.push(works);
		return sizes[1][0].length >= 4 ? sizes : null;
	}

	#startCrateTrail() {
		if (!this.#rawList || this.#rawList.length === 0) return { sameSize: false };

		let countDiffSizes = this.#countWorks();
		if (countDiffSizes === null) return null;
		const crateDone = this.#compCrate(countDiffSizes);
		countDiffSizes = null;
		return { crates: crateDone };
	}

	get makeCrate () {
		return this.#startCrateTrail();
	}
}
