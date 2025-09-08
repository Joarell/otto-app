export default class ArrangerStarter {
	#list;

	constructor (works) {
		this.#list = works;
		return(this.#starter());
	};

	#addCubValueToEachWork() {
		const cubedList = this.#list.map(work => {
			const arrWork = work.arr;
			arrWork.push(work.cubed);

			return(arrWork);
		});
		return(cubedList);
	};

	#quickS(list, pos) {
		if (list.length <= 1)
			return(list);

		const left =	[];
		const pivot =	list.splice(0, 1);
		const right =	[];

		list.map(work => {
			work[pos] <= pivot[0][pos] ? left.push(work): right.push(work);
		});
		return(this.#quickS(left, pos) .concat(pivot, this.#quickS(right, pos)));
	};

	#starter() {
		const arrCubedList =	this.#addCubValueToEachWork();
		const CUBEDPOS =		4
		const inOrder =			this.#quickS(arrCubedList, CUBEDPOS);
		const sorted =			[];

		inOrder.map(work => {
			this.#list.find(art => work[0] === art.code ? sorted.push(art): 0)
		} );

		return({ sorted });
	};
};
