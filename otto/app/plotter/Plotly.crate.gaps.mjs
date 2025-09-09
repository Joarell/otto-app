export default class FillGaps {
	#gaps;
	#thickness

	constructor(vacuum, highZ) {
		this.#gaps = vacuum;
		this.#thickness = highZ;
	};
};
