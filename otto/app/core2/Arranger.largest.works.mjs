export default class ArrangerLargestCanvas {
	#list;

	constructor(list) {
		this.#list = list;
		return this.#largest();
	}

	#finder() {
		const MAXHEIGHT = 213;
		const largestCanvas = this.filter((work) => {
			const check = work.x >= MAXHEIGHT && work.y >= MAXHEIGHT;
			return check ? work : 0;
		});

		return largestCanvas.length ? largestCanvas : false;
	}

	#largest() {
		const { sorted } = this.#list;
		const finder = this.#finder.call(sorted);

		finder
			? finder.map((canvas) => {
					canvas
						? this.#list.sorted.splice(this.#list.sorted.indexOf(canvas), 1)
						: 0;
				})
			: 0;
		finder ? (this.#list.largest = finder) : 0;
		return this.#list;
	}
}
