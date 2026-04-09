import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterPythagoras {
	#list;
	#largest;
	#rawList;
	#coordinates;
	#materials;

	constructor(canvas, materials) {
		if (canvas && canvas.length > 0) {
			this.#materials = materials;
			this.#rawList = canvas;
			this.#largest = canvas.map((art) => art.packedSized);
			this.#list = structuredClone(this.#largest);
		}
	}

	#worksInPlace(list, arranger, layers, i = 1) {
		if (!list.length && !layers) return this.#coordinates;
		const { emptyArea } = this.#coordinates;
		const info = { emptyArea, feat: [] };
		const len = list.length - 1;

		arranger.fillPreparing = { info, list, len, raw: this.#rawList };
		const { feat } = arranger.fillLayer;
		this.#coordinates.defineLayer = [i, feat];
		return this.#worksInPlace(list, arranger, layers - 1, i + 1);
	}

	#setWorksCoordinates(base, layers, div, pad) {
		const coordinates = new WorksCoordinates(base, this.#materials);
		this.#coordinates = coordinates.bluePrintCoordinates;

		this.#worksInPlace(this.#list, coordinates, layers);
		this.#rawList.map((work) =>
			this.#coordinates.artLocation.set(work.code, work),
		);
		this.#coordinates.innerSize = [base[0] + pad, div + pad, base[2] + pad];
	}

	#setPadding(innerCrate, layers) {
		const pine = this.#materials?.materials.find((opts) => opts[5] === "Pinewood");
		const crate = new CrateMaker(layers, this.#materials).outSizes;
		const x = +(innerCrate[0] + crate.x).toFixed(3);
		const z = +(innerCrate[1] + crate.z).toFixed(3);
		const y = +(innerCrate[2] + crate.y + +pine[2]).toFixed(3);
		const X = x % 1 > 0 ? x : +(x).toFixed(3);
		const Z = z % 1 > 0 ? z : +(z).toFixed(3);
		const Y = y % 1 > 0 ? y : +(y).toFixed(3);
		const div =
			crate.div && layers.length > 1
				? innerCrate[1] + crate.div * (layers - 1)
				: crate.div;

		this.#setWorksCoordinates(innerCrate, layers, div, crate.pad);
		return [+X, +Z, +Y];
	}

	#extraStructureData(depth, crate, hypo, extraHeight) {
		const MAXHEIGHT = 240;
		const RAD = Math.PI / 180;
		const angleFirstTriangle = +(Math.acos(depth / hypo)).toFixed(5);
		const angleUp = +(Math.atan2(hypo, crate[1])).toFixed(10);
		const diffAngle = +(RAD * 90 - angleUp).toFixed(5);
		const angleSecondTriangle = angleFirstTriangle - diffAngle;
		const angle = +(RAD * 90 - angleSecondTriangle).toFixed(5);

		const angleHeight = Math.ceil(crate[1] * Math.sin(angle));
		const extraLength = Math.ceil(crate[1] * Math.cos(angle));
		const extension = +(crate[2] * Math.sin(angle)).toFixed(1) + extraLength;
		const leanSupport = Math.ceil(crate[2] * Math.cos(angle) - (angleHeight - extraHeight));

		this.#coordinates.finalSize = [ crate[0], extension, MAXHEIGHT ];
		this.#coordinates.extra = {
			extraHeight,
			leanSupport,
			extraLength,
			baseSize: crate,
			angle,
		};
	}

	#pitagorasTheorem(crate) {
		const ply = this.#materials?.materials.find((opts) => opts[5] === "Plywood");
		const feet = this.#materials?.materials.find((opts) => opts[5] === "Wooden Post");
		const BASE = 2 * +ply[2] + +feet[3];
		const MAXHEIGHT = 240 - BASE;
		const hypotenusa = +(Math.sqrt(crate[1] ** 2 + crate[2] ** 2)).toFixed(0)
		const z = Math.floor(Math.cos(Math.asin(MAXHEIGHT / hypotenusa)) * hypotenusa);

		this.#extraStructureData(z, crate, hypotenusa, BASE);
		return [...this.#coordinates.finalSize];
	}

	#defineCrate(canvas) {
		let x = 0;
		let z = 0;
		let y = 0;

		canvas.map((work) => {
			if (x < work[1]) x = work[1];
			if (z < work[2]) z = work[2];
			if (y < work[3]) y = work[3];
			return work;
		});
		const crate = x >= y
				? this.#setPadding([x, z, y], canvas.length)
				: this.#setPadding([y, z, x], canvas.length);
		return crate;
	}

	#crateInterface(works) {
		let crate;
		const FLIP = `<i class="nf nf-oct-sync"></i>`;

		crate = this.#defineCrate(works);
		works.map((art) => {
			art[1] <= crate[2] && art[3] > crate[2] ? art.push(FLIP) : 0;
			return art;
		});
		return this.#pitagorasTheorem(crate);
	}

	#largestCrateTrail() {
		const MAXCANVAS = 3;
		const crates = [];
		let canvas;

		while (this.#largest.length) {
			canvas = this.#largest.splice(0, MAXCANVAS);
			crates.push(this.#crateInterface(canvas));
			crates.push({ works: canvas });
		}
		crates[0].push(this.#coordinates);
		return crates;
	}

	#pitagorasCrater() {
		if (!this.#rawList || this.#rawList.length === 0) return { largest: false };

		const crates = this.#largestCrateTrail();
		delete this.#coordinates.defineLayer;
		return { crates: crates };
	}

	get makeCrate() {
		return this.#pitagorasCrater();
	}
}
