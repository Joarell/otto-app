export default class ArrangerSameSize {
	#list;

	constructor({ sorted }) {
		this.#list = sorted;
		return this.#sameSizeTrail();
	}

	#trailOne() {
		const MAXDEPTH = 10;
		const getter = [];
		const checker = (a, b) => a.cubed <= b.cubed && a.code !== b.code;

		this.map((work) => {
			let i = 0;
			let checked;

			if (work.z <= MAXDEPTH)
				for (i in this) {
					checked = checker(this[i], work);
					if (!getter.includes(this[i]) && checked) getter.push(this[i]);
				}
		});
		return getter;
	}

	#checker(art, work) {
		const x = work.x;
		const y = work.y;
		const cub = work.cubed;

		return art.x === x && art.y === y && art.cubed <= cub;
	}

	#trailTwo(list) {
		const sameSize = [];
		list.map((work) => {
			let getter = [];
			let i = 0;

			for (i in list) {
				if (this.#checker(list[i], work) && !sameSize.includes(list[i]))
					getter.push(list[i]);
			}
			if (getter.length >= 4)
				getter.map((element) => {
					sameSize.push(element);
				});
			getter = null;
		});
		return sameSize;
	}

	#sameSizeTrail() {
		const pathOne = this.#trailOne.call(this.#list);
		const pathTwo = this.#trailTwo(pathOne);

		pathTwo.map((art) => {
			this.#list.splice(this.#list.indexOf(art), 1);
		});
		return { sorted: this.#list, sameSize: pathTwo };
	}
}
