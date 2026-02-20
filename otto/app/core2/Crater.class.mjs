import Arranger from "./Arranger.class.mjs";
import CraterPythagoras from "./Crater.largest.canvas.mjs";
import CraterLastCheckReArranger from "./Crater.last.check.mjs";
import CraterNotCanvas from "./Crater.no.canvas.mjs";
import CraterSameSize from "./Crater.same.size.mjs";
import CraterStandard from "./Crater.standard.crate.mjs";
import CraterTube from "./Crater.tube.crate.mjs";
import CubCalc from "./CubCalc.class.mjs";

export default class Crater {
	#materials;
	#works;
	#crates;

	constructor(procList, materials) {
		if (procList === Arranger) {
			this.#materials = materials;
			this.#works = procList.list;
			this.#crates = [];
		}
	}

	#startCrateList() {
		if (!this.#works) return false;
		let key = 0;
		const CRATES = [
			"tubeCrate",
			"largestCrate",
			"sameSizeCrate",
			"noCanvasCrate",
			"standardCrate",
		];

		try {
			this.#tubeCrate();
			this.#LargestCanvas();
			this.#sameSizeCrate();
			this.#noCanvasCrate();
			this.#standardCrates();
			this.#lastCheckArrangerSameSizeToStandard();
			for (key in this.#crates)
				if (
					!(this.#crates[key]?.hasOwnProperty("crates") && CRATES.includes(key))
				)
					delete this.#crates[key];

			this.#allCrates();
			this.#cubAir();
			this.#totalCub();
			this.#whichAirPort();
			if (Array.isArray(this.#crates?.sameSizeCrate?.backUp)) {
				this.#totalCubBackUp();
				this.#whichAirPortBackUp();
				this.#allCratesBackUp();
			}
			return { crates: this.#crates };
		} catch (e) {
			console.error("Crater Failed:", e);
		}
	}

	#tubeCrate() {
		if (this.#works?.tubes?.length > 0) {
			const tubeCrate = new CraterTube(this.#works?.tubes, this.#materials);
			this.#crates.tubeCrate = tubeCrate.makeCrate;
		}
	}

	#LargestCanvas() {
		if (this.#works?.largest?.length > 0) {
			const largestcrates = new CraterPythagoras(
				this.#works?.largest,
				this.#materials,
			);
			this.#crates.largestCrate = largestcrates.makeCrate;
		}
	}

	#sameSizeCrate() {
		if (this.#works?.sameSize?.length > 0) {
			const sameMeasure = new CraterSameSize(
				this.#works?.sameSize,
				this.#materials,
			);
			this.#crates.sameSizeCrate = sameMeasure.makeCrate;
		}
	}

	#noCanvasCrate() {
		if (this.#works?.noCanvas?.length > 0) {
			const noCanvas = new CraterNotCanvas(
				this.#works?.noCanvas,
				this.#materials,
			);
			this.#crates.noCanvasCrate = noCanvas.makeCrate;
		}
	}

	#standardCrates() {
		if (this.#works?.sorted?.length > 0) {
			const std = new CraterStandard(
				this.#works?.sorted,
				this.#materials,
				4,
				false,
			);
			this.#crates.standardCrate = std.makeCrate;
		}
	}

	#lastCheckArrangerSameSizeToStandard() {
		const check1 = Object.entries(this.#crates).some(
			(data) => data[0] === "sameSizeCrate",
		);
		const check2 = Object.entries(this.#crates).some(
			(data) => data[0] === "standardCrate",
		);
		if (check1 && check2)
			this.#crates = new CraterLastCheckReArranger(
				this.#crates,
				this.#materials,
			).reduceCrates;
	}

	#allCrates() {
		let key = 0;
		const CRATES = [];
		const filterCrates = (data) => {
			Array.isArray(data) ? CRATES.push(data) : false;
		};

		for (key in this.#crates) this.#crates[key]?.crates?.map(filterCrates);
		this.#crates.allCrates = CRATES;
	}

	#allCratesBackUp() {
		let check1;
		let check2;
		let key = 0;
		const CRATES = [];
		const filterCrates = (data) => {
			Array.isArray(data) ? CRATES.push(data) : false;
		};

		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";

			if (check1 || check2) this.#crates[key]?.backUp?.map(filterCrates);
			this.#crates[key]?.crates?.map(filterCrates);
		}
		this.#crates.allCratesBackUp = CRATES;
	}

	#cubAir() {
		let key = 0;
		const setCub = (sizes) => {
			const COORDINATES = 3;
			if (Array.isArray(sizes) && sizes.length >= COORDINATES) {
				const X = sizes[0];
				const Z = sizes[1];
				const Y = sizes[2];
				const cubCrate = new CubCalc(X, Z, Y).cubCalcAir;
				const data =
					sizes.length === 4
						? sizes.splice(3, 1, cubCrate)
						: sizes.push(cubCrate);
				Array.isArray(data) ? sizes.push(data) : 0;
			}
		};

		for (key in this.#crates) this.#crates[key]?.crates?.map(setCub);
		if (Array.isArray(this.#crates?.sameSizeCrate?.backUp)) {
			this.#crates?.sameSizeCrate?.backUp?.map(setCub);
			this.#crates?.standardCrate?.backUp?.map(setCub);
		}
	}

	#totalCub() {
		let key = 0;
		let total = [];
		const setTotalCub = (crate) => {
			Array.isArray(crate) ? total.push(crate[3]) : 0;
		};

		for (key in this.#crates) this.#crates[key]?.crates?.map(setTotalCub);
		total = total.reduce((sum, val) => sum + val, 0);
		this.#crates.airCubTotal = total.toFixed(3);
	}

	#totalCubBackUp() {
		let check1;
		let check2;
		let total = [];
		let key = 0;
		const setTotalCub = (crate) => {
			if (Array.isArray(crate)) {
				total.push(crate[3]);
			}
		};

		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";

			if (check1 || check2) this.#crates[key]?.backUp?.map(setTotalCub);
			else if (!(check1 || check2)) this.#crates[key]?.crates?.map(setTotalCub);
		}
		total = total.reduce((sum, val) => +(sum + val).toFixed(3), 0);
		this.#crates.airCubTotalBackUp = total;
	}

	#airPortOptions(crate) {
		const MAXX = 300;
		const MAXZ = 200;
		const MAXY = 160;

		if (Array.isArray(crate)) {
			const X = crate[0];
			const Z = crate[1];
			const Y = crate[2];

			return !(X > MAXX || Z > MAXZ || Y > MAXY) ? "PAX" : "CARGO";
		}
	}

	#whichAirPort() {
		let pax = 0;
		let cargo = 0;
		let key = 0;
		let tmp;

		for (key in this.#crates)
			this.#crates[key]?.crates?.map((crate) => {
				tmp = this.#airPortOptions(crate);
				tmp === "PAX" ? pax++ : tmp === "CARGO" ? cargo++ : false;
			});
		this.#crates.whichAirPort = [{ PAX: pax }, { CARGO: cargo }];
	}

	#whichAirPortBackUp() {
		let check1;
		let check2;
		let tmp;
		let key = 0;
		let pax = 0;
		let cargo = 0;

		for (key in this.#crates) {
			check1 = this.#crates[key] === "sameSizeCrate";
			check2 = this.#crates[key] === "standardCrate";

			if (check1 || check2)
				this.#crates[key]?.backUp?.map((crate) => {
					tmp = this.#airPortOptions(crate);
					tmp === "PAX" ? pax++ : tmp === "CARGO" ? cargo++ : false;
				});
			else if (!(check1 || check2))
				this.#crates[key]?.crates?.map((crate) => {
					tmp = this.#airPortOptions(crate);
					tmp === "PAX" ? pax++ : tmp === "CARGO" ? cargo++ : false;
				});
		}
		this.#crates.whichAirPortBackUp = [{ PAX: pax }, { CARGO: cargo }];
	}

	get makeCrate() {
		return this.#startCrateList();
	}
}
