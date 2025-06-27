

export default class ArrangerTube {
	#list;

	constructor (list) {
		this.#list = list;
		return(this.#findTubesOnTheList());
	};

	#findTubesOnTheList() {
		const { noCanvas } =	this.#list;
		const tubes =			noCanvas.filter(pece => {
			const MAXDIM =	35;
			const LIMIT =	pece.z < MAXDIM && pece.y < MAXDIM;
			const CHECK =	pece.z === pece.y;

			if (LIMIT && CHECK)
				if(pece.x !== pece.y && CHECK)
					return(pece);
			return ;
		});

		tubes.map(art => {
			this.#list.noCanvas.splice(this.#list.noCanvas.indexOf(art), 1);
		});
		this.#list.tubes = tubes;
		return (this.#list);
	};
};
