export default class ArrangerLargestCanvas {
	#list;

	constructor (list) {
		this.#list = list;
		return(this.#largest());
	};

	#finder () {
		const list =			this.map(work => work.arr)
		const MAXHEIGHT =		213;
		const largestCanvas =	this.filter(work => {
			return(work.x >= MAXHEIGHT || work.y >=MAXHEIGHT ? work : 0);
		});

		return(largestCanvas);
	};

	#largest() {
		const { sorted } =	this.#list;
		const finder =		this.#finder.call(sorted);

		finder.map(canvas => {
			this.#list.sorted.splice(this.#list.sorted.indexOf(canvas), 1);
		});
		this.#list.largest = finder;
		return (this.#list);
	};
};
