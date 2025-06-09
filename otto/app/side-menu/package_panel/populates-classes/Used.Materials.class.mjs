import { materialsTable } from "../templates.mjs";

export default class UsedMaterialsTable {
	#pane;

	/**
	* @param { HTMLElement } element
	*/
	constructor(element) {
		this.#pane = element;
	};

	async #populateTableMaterialsUesed() {
		const content =		materialsTable.content.cloneNode(true)
		const node =		document.importNode(content, true)
		const fragment =	new DocumentFragment();

		fragment.append(node);
		this.#pane.appendChild(fragment)
		document.getElementById('reset-sizes').disabled = false;
	};

	get setupTable() {
		return(this.#populateTableMaterialsUesed());
	};
};
