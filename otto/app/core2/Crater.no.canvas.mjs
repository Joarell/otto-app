import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterNotCanvas {
	#pieces;
	#rawList;
	#coordinates;
	#materials;
	#list;

	constructor(list, materials) {
		if(list && list.length > 0) {
			this.#materials = materials;
			this.#rawList = list;
			this.#pieces = list.map((art) => art.arr);
			this.#list = list.map((art) => art.arr);
		}
	}

	#quickSort(arts, pos) {
		if (arts.length <= 1) return arts;

		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];

		arts.map((work) => {
			work[pos] <= pivot[0][pos] ? left.push(work) : right.push(work);
			return work;
		});
		return this.#quickSort(left, pos).concat(
			pivot,
			this.#quickSort(right, pos),
		);
	}

	#setWorksCoordinates(base) {
		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		const len = this.#list.length - 1;
		const separator = this.#materials.materials.filter((foam) =>
			foam[5] === "Foam Sheet" && foam[2] < 5
		).flat();
		let lastX = 0;

		coordinates.fillPreparing = {
			info,
			list: this.#list,
			len,
			raw: this.#rawList,
		};
		const { feat } = coordinates.fillLayer;
		this.#coordinates.defineLayer = [1, feat];
		this.#rawList.map((work, i) => {
			const location = {
				x: i > 0 ? i * separator[2] + lastX: 0,
				y: 0,
				z: work.z,
			}
			work.coordinates = location;
			this.#coordinates.artLocation.set(work.code, work);
			lastX += work.x;
			return work;
		}, 0);
	}

	#setPadding(innerCrate) {
		const crate = new CrateMaker(this.#rawList.length, this.#materials).outSizes;
		const div = crate.div ? crate.div * (this.#rawList.length - 1): 0;
		const x = +(innerCrate[0] + crate.x + div).toFixed(3);
		const z = +(innerCrate[1] + crate.z - crate.div).toFixed(3);
		const y = +(innerCrate[2] + crate.y).toFixed(3);
		const X = x % 1 > 0 ? x : x.toFixed(3);
		const Z = z % 1 > 0 ? z : z.toFixed(3);
		const Y = y % 1 > 0 ? y : y.toFixed(3);

		this.#setWorksCoordinates(structuredClone([+X, +Z, +Y]));
		this.#coordinates.innerSize = [ x, innerCrate[1], innerCrate[2] ];
		this.#coordinates.finalSize = [+X, +Z, +Y];
		return [...this.#coordinates.finalSize, this.#coordinates];
	}

	#splitCrate(works) {
		let x = 0;
		let z = 0;
		let newX = 0;
		let newZ = 0;
		let aux;

		aux = works.length / 2;
		works.map((item) => {
			if (aux-- > 0) {
				x += item[1];
				if(z < item[2]) z = item[2];
			}
			newX = item[1];
			if(newZ < item[2]) newZ = item[2];
			return item
		});
		if(newX < x ) newX = x;
		newZ += z;
		return { newX, newZ };
	}

	#defCrate(pieces) {
		const LENLIMIT = 277;
		const SPLIT = pieces.length > 4 && pieces.length % 2 === 0;
		let x = 0;
		let z = 0;
		let y = 0;
		let split;

		pieces.map((item) => {
			x += item[1];
			z = item[2] > z ? item[2] : z;
			y = item[3] > y ? item[3] : y;
			return item;
		});
		if (x > LENLIMIT || SPLIT) {
			split = this.#splitCrate(pieces);
			x = split.newX;
			z = split.newZ;
		}
		return this.#setPadding([x, z, y]);
	}

	#validationComp(val1, val2) {
		const MAXLEN = 277;
		const MAXDEPTH = 177;
		const MAXHEIGHT = 132;
		const compareX = val1[1] === val2[1] && val1[1] < MAXLEN;
		const compareZ = val1[2] === val2[2] && val1[2] < MAXDEPTH;
		const compareY = val1[3] <= MAXHEIGHT;

		return compareX && compareZ && compareY;
	}

	#validationSizes(x, z, equals, items) {
		const PAD = 10;
		const MAXLEN = 554;
		const MAXDEPTH = 177;

		if (items.length % 2 === 0)
			if (x > MAXLEN && z * 2 + PAD < MAXDEPTH) return items.length;
		return equals === 0 || items[0][1] > MAXLEN ? 1 : equals;
	}

	#defineMaxPeces(items) {
		const PAD = 10;
		let x = PAD * items.length;
		let z = 0;
		let equals = 0;
		const workRef = items[0];

		items.map((art) => {
			const compare = this.#validationComp(art, workRef);
			const bool1 = art[2] - workRef[2];
			const bool2 = workRef[2] - art[2];
			const check = (bool1 > 0 && bool1 <= PAD) || (bool2 > 0 && bool2 <= PAD);

			if (compare === true || check) {
				equals++;
				x += art[1];
				z += art[3];
			}
			return art;
		});
		return this.#validationSizes(x, z, equals, items);
	}

	#addXandZtimes(canvas) {
		if (!Array.isArray(canvas)) return canvas;
		let procList = canvas.map((art) => {
			art.push(art[1] * art[2]);
			return art;
		});

		procList = this.#quickSort(procList, 5);
		procList = procList.map((art) => {
			art.pop();
			return art;
		});
		this.#pieces = procList;
	}

	#noCanvasTrail() {
		if (!this.#rawList || this.#rawList.length === 0) return { noCanvas: false };

		const crate = [];
		let peces;

		this.#addXandZtimes(this.#pieces);
		while (this.#pieces.length > 0) {
			peces = this.#defineMaxPeces(this.#pieces);
			peces = this.#pieces.splice(0, peces);
			if (peces.length > 0) {
				crate.push(this.#defCrate(peces));
				crate.push({ works: peces });
			} else {
				crate.push(this.#defCrate(this.#pieces.splice(0, 1)));
				crate.push({ works: peces });
			}
		}
		return { crates: crate };
	}

	get makeCrate() {
		return this.#noCanvasTrail();
	}
}
