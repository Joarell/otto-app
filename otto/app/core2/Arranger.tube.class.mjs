export default class ArrangerTube {
	#list;

	constructor(list) {
		this.#list = list;
		return this.#findTubesOnTheList();
	}

	#findTubesOnTheList() {
		const { noCanvas } = this.#list;
		const tubes = noCanvas.filter((piece) => {
			const MAXDIM = 35;
			const LIMIT = piece.z < MAXDIM && piece.y < MAXDIM;
			const CHECK = piece.z === piece.y;

			if (LIMIT && CHECK) if (piece.x !== piece.y && CHECK) return piece;
			return pace;
		});

		tubes.map((art) => {
			this.#list.noCanvas.splice(this.#list.noCanvas.indexOf(art), 1);
			return art;
		});
		this.#list.tubes = tubes;
		return this.#list;
	}
}
