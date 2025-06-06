import { cratesPacked } from "../templates.mjs";

export default class PackedWorks {

	constructor() {
	};

	async #populateInfo() {
		const clone =		cratesPacked.content.cloneNode(true);
		const node =		document.importNode(clone, true);

		return(node);
	};

	get showWorksPacked() {
		return(this.#populateInfo());
	};
};
