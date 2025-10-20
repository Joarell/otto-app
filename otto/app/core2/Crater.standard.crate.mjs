import CrateMaker from "./Crate.maker.mjs";
import WorksCoordinates from "./Crater.coordinates.mjs";

/**
 * @class Class to comping the Crater class as a method towards solve canvas with different sizes.
 */
export default class CraterStandard {
	#rawList;
	#list;
	#maxLayers;
	#backUp;
	#coordinates;
	#thresholdX;
	#layers = 0;

	/**
	 * @param {Array} canvas - The list to be solved.
	 * @param {Array} backUp - The backUp from the first solved tried.
	 * @param {Number} maxLayer - The max number of layers to the crate.
	 * @param {Boolean} recheck - The option reset crates sizes.
	 */
	constructor(canvas, backUp, maxLayer, recheck) {
		if (!canvas || canvas.length === 0) return { standard: false };

		this.#rawList = canvas;
		this.#list = canvas.map((work) => work.packedSized);
		this.#maxLayers = maxLayer ?? 4;
		this.#backUp = backUp;
		return this.#startCrate([], recheck);
	}

	#startCrate(ARTS1, recheck) {
		switch (recheck) {
			case false:
				ARTS1 = this.#selectTheBestSolution();
				return !this.#backUp
					? { crates: ARTS1 }
					: { crates: ARTS1, backUp: JSON.parse(JSON.stringify(ARTS1)) };
			case true:
				ARTS1 = this.#provideCrate([], 1, structuredClone(this.#list));
				return !this.#backUp
					? { crates: ARTS1 }
					: { crates: ARTS1, backUp: JSON.parse(JSON.stringify(ARTS1)) };
		}
	}

	#checkEqualLengths(list1, list2) {
		let check1;
		let check2;
		let check3;
		let check4;
		let opt1 = 0;
		let opt2 = 0;
		let pos;

		for (pos in list1) {
			check1 = list1[pos][0] > list2[pos][0];
			check2 = list1[pos][0] !== list2[pos][0];
			check3 = list1[pos][2] > list2[pos][2];
			check4 = list1[pos][2] !== list2[pos][2];

			check1 && check2 ? (opt1 += 1) : check2 ? (opt2 += 1) : 0;
			check3 && check4 ? (opt1 += 1) : check4 ? (opt2 += 1) : 0;
		}
		return { opt1, opt2 };
	}

	#checkBestAirportOptions(list1, list2) {
		const MAXx = 300;
		const MAXy = 160;
		let pax1 = 0;
		let pax2 = 0;
		let cargo1 = 0;
		let cargo2 = 0;
		let bestArrange = 2;

		list1.map((crate) =>
			crate[0] <= MAXx && crate[2] <= MAXy ? pax1++ : cargo1++,
		);
		list2.map((crate) =>
			crate[0] <= MAXx && crate[2] <= MAXy ? pax2++ : cargo2++,
		);
		if (cargo1 === cargo2) bestArrange = pax1 <= pax2 ? 1 : 2;
		else if (cargo1 < cargo2) bestArrange = pax1 >= pax2 ? 1 : 2;
		return { bestArrange };
	}

	#selectTheBestSolution() {
		const results = {
			opt1: this.#provideCrate([], 0, structuredClone(this.#list)),
			opt2: this.#provideCrate([], 1, structuredClone(this.#list)),
		};
		const crates1 = [];
		const crates2 = [];
		const GC = new WeakSet();
		Object.entries(results).map((solution) => {
			solution[0] === "opt1"
				? solution[1].map(
						(crate, i) => (i % 2 === 0 ? crates1.push(crate) : 0),
						0,
					)
				: solution[1].map(
						(crate, i) => (i % 2 === 0 ? crates2.push(crate) : 0),
						0,
					);
		});
		const equalCrates = crates1.length === crates2.length;
		let count;
		let bestOne;

		equalCrates
			? (count = this.#checkEqualLengths(crates1, crates2))
			: (count = this.#checkBestAirportOptions(crates1, crates2));

		if (Object.hasOwn(count, "bestArrange")) bestOne = count.bestArrange;
		else bestOne = count.opt1 <= count.opt2 ? 1 : 2;

		GC.add(count);
		return bestOne === 1 ? results.opt1 : results.opt2;
	}

	#quickSort(arts, pos) {
		if (arts.length <= 1) return arts;

		const left = [];
		const pivot = arts.splice(0, 1);
		const right = [];

		arts.map((work) => {
			work[pos] <= pivot[0][pos] ? left.push(work) : right.push(work);
		});
		return this.#quickSort(left, pos).concat(
			pivot,
			this.#quickSort(right, pos),
		);
	}

	#defineFinalSize(innerSize, works) {
		const FORKFEET = 8;
		let z = 0;
		let i = 0;
		let tmp = 0;
		const crate = new CrateMaker(this.#layers).outSizes;

		if (this.#layers > 1)
			for (i in works) {
				Object.entries(works[i]).map((canvas) => {
					if (canvas.includes("status")) return;
					canvas[1].map((art) => {
						art[2] > tmp ? (tmp = art[2]) : art;
					});
					z += tmp;
					tmp = 0;
				});
			}
		tmp = crate.div * (this.#layers - 1) + z;
		this.#coordinates.innerSize = [
			+(innerSize[0] + crate.pad).toFixed(3),
			+(tmp + crate.pad).toFixed(3),
			+(innerSize[2] + crate.pad).toFixed(3),
		];
		crate.x += innerSize[0];
		crate.z += !tmp ? innerSize[1] : tmp;
		crate.y += innerSize[2];
		crate.y += FORKFEET;
		const X = crate.x % 1 > 0 ? crate.x.toFixed(3) : crate.x.toFixed(0);
		const Z = crate.z % 1 > 0 ? crate.z.toFixed(3) : crate.z.toFixed(0);
		const Y = crate.y % 1 > 0 ? crate.y.toFixed(3) : crate.y.toFixed(0);
		this.#rawList.map((work) =>
			this.#coordinates.artLocation.set(work.code, work),
		);
		this.#coordinates.finalSize = [+X, +Z, +Y];
		return [+X, +Z, +Y, structuredClone(this.#coordinates)];
	}

	//		   ╭──────────────────────────╮
	//		   │                          │
	//		   │                          │
	//		   │                          │
	//		 y │                          │
	//		   │                          │
	//		   │                          │
	//		   │                          │
	//		   ╰──────────────────────────╯
	//			0			x

	#setLayer(crate, works) {
		switch (this) {
			case 1:
				Array.isArray(works[0])
					? crate.push({ layer1: works })
					: crate.push({ layer1: [works] });
				break;
			case 2:
				Array.isArray(works[0])
					? crate.push({ layer2: works })
					: crate.push({ layer2: [works] });
				break;
			case 3:
				Array.isArray(works[0])
					? crate.push({ layer3: works })
					: crate.push({ layer3: [works] });
				break;
			case 4:
				Array.isArray(works[0])
					? crate.push({ layer4: works })
					: crate.push({ layer4: [works] });
				break;
			case 5:
				Array.isArray(works[0])
					? crate.push({ layer5: works })
					: crate.push({ layer5: [works] });
				break;
			default:
				return;
		}
		return crate;
	}

	#fillCrate(measure, list) {
		const coordinates = new WorksCoordinates(measure);
		this.#coordinates = coordinates.bluePrintCoordinates;
		const crate = [];
		let greb = [];
		let info;
		let i = 0;
		let getter;
		let copy;
		const updateSize = (filled) => {
			const { emptyArea } = filled;
			emptyArea.map((data) => {
				if(data[2] > measure[0]) measure[0] = data[2];
				if(data[3] > measure[2]) measure[2] = data[3];
				return data;
			});
		};

		while (i++ < this.#maxLayers && list.length) {
			const { emptyArea } = this.#coordinates;
			info = { emptyArea, feat: [] };
			coordinates.fillPreparing = {
				info,
				list,
				len: list.length - 1,
				raw: this.#rawList,
			};
			getter = coordinates.fillLayer;
			console.debug('FILL', getter);
			updateSize(getter);
			copy = structuredClone(getter);
			greb = copy.feat.map((info) => {
				const piece = this.#rawList.find(
					(item) => item.code === info.work[0],
				);
				const art = piece.arr;
				const work = structuredClone(info.work);

				work[1] = art[1];
				work[2] = art[2];
				work[3] = art[3];
				return work;
			});
			this.#setLayer.call(i, crate, greb);
			this.#coordinates.defineLayer = [i, getter.feat];
			greb = null;
			getter = null;
			info = null;
			greb = [];
		}
		this.#layers = i - 1;
		delete this.#coordinates.defineLayer;
		delete this.#coordinates.reset;
		return { crate, measure, list };
	}

	// NOTE: have to improve the best sizes.
	#composeCrateSizes(crate, list, len) {
		if (len < 0) {
			crate.x < crate.y ? ([crate.x, crate.y] = [crate.y, crate.x]) : 0;
			return crate;
		}
		const THRESHOLDY = 140;
		const sum = crate.x * crate.y > list[len][0] * list[len][3];
		const pos1 = sum && crate.x >= list[len][1];
		const pos2 = sum && crate.y >= list[len][3];

		crate.x = crate.x < list[len][1] ? list[len][1] : crate.x;
		crate.x =
			pos1 && crate.x + list[len][1] <= this.#thresholdX
				? crate.x + list[len][1]
				: crate.x;

		crate.z = list[len][2] > crate.z ? list[len][2] : crate.z;

		crate.y = list[len][3] > crate.y ? list[len][3] : crate.y;
		crate.y =
			pos2 && crate.y + list[len][3] <= THRESHOLDY
				? crate.y + list[len][3]
				: crate.y;
		return this.#composeCrateSizes(crate, list, len - 1);
	}

	#defineSizeBaseCrate(list) {
		const SIZES = { x: 0, z: 0, y: 0 };
		const { x, z, y } = this.#composeCrateSizes(SIZES, list, list.length - 1);

		return [x, z, y];
	}

	#addXandYtimes(list) {
		let procList = list.map((art) => {
			art.push(art[1] * art[3]);
			return art;
		});

		procList = this.#quickSort(procList, 5);
		procList = procList.map((art) => {
			art.pop();
			return art;
		});
		list = procList;
		return list;
	}

	/**
	 * @method - start solver procedures.
	 */
	#provideCrate(crates, setup, works) {
		if (!works.length) return crates;
		!setup ? (this.#thresholdX = 180) : (this.#thresholdX = 250);
		works = this.#addXandYtimes(works);
		const size = this.#defineSizeBaseCrate(works);
		const { crate, measure, list } = this.#fillCrate(size, works);

		crates.push(this.#defineFinalSize(measure, crate));
		crates.push({ works: crate });
		return this.#provideCrate(crates, setup, list);
	}
}
