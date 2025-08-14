import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

export default class CraterPythagoras {
	#list;
	#largest;
	#rawList;
	#coordinates;

	constructor (canvas) {
		if(!canvas || canvas.length === 0)
			return({ largest: false });

		this.#rawList = canvas;
		this.#largest = canvas.map(art => art.arr);
		this.#list =	structuredClone(this.#largest);
		return(this.#pitagorasCrater());
	};

	#worksInPlace(list, arranger, layers, i = 1) {
		if(!list.length && !layers)
			return(this.#coordinates);
		const { emptyArea } = this.#coordinates;
		const info = 			{ emptyArea, feat: [] };
		const len =				list.length - 1;
		let result;

		arranger.fillPreparing = { info, list, len, raw: this.#rawList };
		result = arranger.fillLayer;
		this.#coordinates.defineLayer = [ i, result.feat ];
		return(this.#worksInPlace(list, arranger, layers - 1, i + 1));
	}

	#setWorksCoordinates(base, layers, div) {
		const coordinates =		new WorksCoordinates(base);
		this.#coordinates =		coordinates.bluePrintCoordinates;

		this.#worksInPlace(this.#list, coordinates, layers);
		this.#rawList.map(work => this.#coordinates.artLocation.set(work.code, work));
		this.#coordinates.innerSize = [base[0], div, base[2]];
	};

	#setPadding(innerCrate, layers) {
		const crate =	new CrateMaker(layers).outSizes;
		const x = 		+(innerCrate[0] + crate.x).toFixed(3);
		const z = 		+(innerCrate[1] + crate.z).toFixed(3);
		const y = 		+(innerCrate[2] + crate.y).toFixed(3);
		const X = 		x % 1 > 0 ? x: (x).toFixed(0);
		const Z = 		z % 1 > 0 ? z: (z).toFixed(0);
		const Y = 		y % 1 > 0 ? y: (y).toFixed(0);
		const div =		crate.dev && layers.length > 1 ?
			innerCrate[1] + (crate.div * (layers - 1)): innerCrate[1];

		this.#setWorksCoordinates([ X, Z, Y ], layers, div);
		return ([ X, Z, Y ]);
	};

	#pitagorasTheorem(crate) {
		const MAXHEIGHT =	240;
		const a =			crate[2] ** 2;
		const b =			MAXHEIGHT ** 2;
		const c =			a > b ? a - b : b - a;
		const z =			(~~(Math.sqrt(c) * 100)) / 100;

		this.#coordinates.finalSize = [crate[0], z, MAXHEIGHT];
		return ([...this.#coordinates.finalSize]);
	};

	#defineCrate(canvas) {
		let crate;
		let x = 0;
		let z = 0;
		let y = 0;

		canvas.map(work => {
			x < work[1] ? x = work[1] : false;
			z < work[2] ? z = work[2] : false;
			y < work[3] ? y = work[3] : false;
		});
		crate = x >= y ?
			this.#setPadding([x, z, y], canvas.length):
			this.#setPadding([y, z, x], canvas.length);
		return(crate);
	};

	#crateInterface(works) {
		let crate;
		const FLIP =	`<i class="nf nf-oct-sync"></i>`;

		crate =			this.#defineCrate(works);
		works.map(art => {
			art[1] <= crate[2] && art[3] > crate[2] ? art.push(FLIP) : 0;
		});
		return(this.#pitagorasTheorem(crate));
	};

	#largestCrateTrail () {
		const MAXCANVAS =	3;
		let crates =		[];
		let canvas;

		while(this.#largest.length) {
			canvas = this.#largest.splice(0, MAXCANVAS);
			crates.push(this.#crateInterface(canvas))
			crates.push({ works: canvas });
		};
		crates[0].push(this.#coordinates);
		return(crates);
	};

	#pitagorasCrater() {
		const crates = this.#largestCrateTrail();
		return(this.largest = { crates: crates });
	};
};
