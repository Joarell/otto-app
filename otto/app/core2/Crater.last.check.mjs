import CraterStandard from "./Crater.standard.crate.mjs";
import ArtWork from "./ArtWork.class.mjs";

export default class CraterLastCheckReArranger {
	#cratesDone;
	#materials;

	constructor(crates, materials) {
		if (crates[0] !== "crates ahead") return false;

		this.#materials = materials;
		this.#cratesDone = crates;
		return this.#consolidationStarted();
	}

	#quickSort(arts, pos) {
		if (arts.length <= 1) return arts;

		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];
		let j = 0;

		for (j in arts)
			arts[j][pos] <= pivot[0][pos] ? left.push(arts[j]) : right.push(arts[j]);
		return this.#quickSort(left, pos).concat(
			pivot,
			this.#quickSort(right, pos),
		);
	}

	#removeCrate(crate, pos, list) {
		const crateWorks = crate[pos];
		const { works } = crateWorks;

		works.map((layer) => {
			Object.entries(layer).map((arts) => {
				arts[1].map((data) => {
					!Array.isArray(data[0])
						? list.push(data)
						: data.map((work) =>
							Array.isArray(work[0]) ? list.push(work[0]) : 0,
						);
					return data;
				});
				return arts;
			});
			return layer;
		});
		const parsedList = list.map((canvas) => {
			const { code, x, y, z, packing } = JSON.parse(localStorage.getItem(canvas[0]));
			const parsed = new ArtWork(code, x, z, y, packing);
			return parsed;
		});
		return parsedList;
	}

	// ╭───────────────────────────────────────────────────────────────────────────╮
	// │ Simulates if the crate with 5 layer can consolidate all same size canvas. │
	// ╰───────────────────────────────────────────────────────────────────────────╯
	#processingCratesList(listCrates, attCrate) {
		const GC = new WeakSet();
		const LEN = attCrate.works.length;
		const CUBPOS = 4;
		const MAXLAYER = 5;
		let i = 0;
		let bool = true;
		let result;

		while (i++ < listCrates.length && bool) {
			if (i % 2 === 1) {
				result =
					LEN === 1
						? structuredClone(attCrate.works[0])
						: structuredClone(attCrate.works);
				result = this.#removeCrate(listCrates, i, result);
				result = this.#quickSort(result, CUBPOS);
				result = new CraterStandard(result, this.#materials, MAXLAYER, true);
				if (result.crates.length === listCrates.length) {
					listCrates.splice(i, 1, result.crates[1]);
					listCrates.splice(i - 1, 1, result.crates[0]);
					bool = false;
				}
				GC.add(result);
			}
		}
		return !bool;
	}

	#consolidationTrail(standard, sameSizes, pos) {
		if (pos < 0) return sameSizes;
		if (pos % 2 === 1)
			if (this.#processingCratesList(standard, sameSizes[pos])) {
				sameSizes.splice(pos - 1, 2);
				pos = sameSizes.length;
			}
		return this.#consolidationTrail(standard, sameSizes, pos - 1);
	}

	#extractTheFifthLayer(data) {
		let works;
		let info;
		let i = 0;

		for (info in data) {
			if (i++ % 2 === 1)
				if (data[info].works.length === 5) works = data[info].works[4].layer5;
			if (works) break;
		}
		return works ? { info, works } : false;
	}

	#newCrateSet(works, layers) {
		const CUBPOS = 4;
		const newList = [];

		Object.entries(layers).map((arr) => {
			arr[1].map((data) => {
				let info;

				for (info in data) {
					if (data[info].length > 0 && Array.isArray(data[info]))
						data[info].map((art) => newList.push(art));
				}
				return data;
			});
			return arr;
		});
		works.map((art) => newList.push(art));
		const listSorted = this.#quickSort(newList, CUBPOS);
		return listSorted;
	}

	#updatesCrates(crates, pos, newCrate, target) {
		const PAD = this.#materials.find(
			(opt) => opt.at(-1) === "Foam Sheet" && opt[2] > 2.5,
		);

		crates[target].works.pop();
		crates[target - 1][1] -= PAD[2];
		crates.splice(pos - 1, 1, newCrate.crates[0]);
		crates.splice(pos, 1, newCrate.crates[1]);
		return crates;
	}

	#removeTheFifthLayer() {
		const { crates } = this.#cratesDone.standardCrate;
		const list = this.#extractTheFifthLayer(crates);
		const LIMITLAYER = 5;
		let count = 0;
		let newList;
		let newCrate;
		let check;
		let layers;

		if (!list) return;
		for (layers in crates) {
			if (!Array.isArray(crates[layers]) && count !== +list.info) {
				newList = this.#newCrateSet(list.works, crates[layers]);
				newCrate = new CraterStandard(newList, false, LIMITLAYER, true);
				check = newCrate.crates.length === 2;
				if (check) {
					this.#updatesCrates(crates, count, newCrate, list.info);
					break;
				}
			}
			count++;
		}
	}

	#consolidationStarted() {
		const sameSize = this.#cratesDone.sameSizeCrate.crates;
		const standard = this.#cratesDone.standardCrate.crates;

		if (!sameSize || !standard) return;
		const sameLen = sameSize.length;
		this.#consolidationTrail(standard, sameSize, sameLen);
		this.#removeTheFifthLayer();
	}
}
