import Converter from '../core2/Converter.class.mjs';

export default class largestCrateRender {
	#crates;
	#layout;

	constructor(data, layout) {
		this.#crates = data;
		this.#layout = layout;
	};

	#startDrawing() {
		let result;

		return({ result, meta: this.#layout });
	};

	get composeCrate() {
		return(this.#startDrawing())
	}
};
