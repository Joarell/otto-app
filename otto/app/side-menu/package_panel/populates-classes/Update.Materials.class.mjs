import { availableMaterials, newMaterials } from "../templates.mjs";
import AvailableMaterials from "./Available.Materials.class.mjs";

export default class AddPackingMaterials {
	/** @type { Worker } COMMANDWORKER */
	#COMMANDWORKER = new Worker(
		new URL("./commands/worker.save.materials.mjs", import.meta.url),
		{ type: "module" },
	);
	#entry;
	#materials;

	/**
	* @param { HTMLElement } entry1
	* @param { HTMLElement } entry2
	*/
	constructor(entry) {
		if(!entry)
			return(undefined);
		this.#entry = entry;
	};

	/**
	* @method - updates all panels based on the new materials added.
	*/
	async populatePanels(panel) {
		const clone1 =		newMaterials.content.cloneNode(true);
		const clone2 =		availableMaterials.content.cloneNode(true);
		const node1 =		document.importNode(clone1, true);
		const node2 =		document.importNode(clone2, true);
		const fragment1 =	new DocumentFragment();
		const fragment2 =	new DocumentFragment();

		fragment1.append(node1);
		fragment2.append(node2);
		return(panel === 1 ? fragment1: fragment2);
	};

	/**
	* @method - restore all materials already added.
	*/
	async #grabNewMaterials() {
		const packing =	new AvailableMaterials(this.#entry);
		const packIDB =	await packing.allMaterials;

		return(packIDB);
	};

	/**
	* @method = setup the second panel to update each material addition.
	*/
	async #updateDownPanel() {
		const { shadowRoot } =	document.querySelector(".update-materials");
		const content =			shadowRoot.querySelector(".packing-materials");
		const fragment =		new DocumentFragment();
		const clone =			availableMaterials.content.cloneNode(true);
		const node =			document.importNode(clone, true);

		fragment.append(node);
		!this.#materials ? this.#materials = await this.#grabNewMaterials() : 0;
		this.#materials.types.map((pack, i) => {
			const material =	document.createElement('div');
			let select =		document.createElement('select');

			material.className = "material-info";
			switch(pack[5]) {
				case 'Sheet':
					select.innerHTML = `
						<option selected>Sheet</option>
						<option>Roll</option>
						<option>Wood</option>`;
					break;
				case 'Roll':
					select.innerHTML = `
						<option>Sheet</option>
						<option selected>Roll</option>
						<option>Wood</option>`;
					break;
				case 'Wood':
					select.innerHTML = `
						<option>Sheet</option>
						<option>Roll</option>
						<option selected>Wood</option>`;
					break;
			};
			material.innerHTML = `
				<div class="check-material">
					<input type="checkbox" id="material-${i}" name="${pack[0]}"></input>
					<label for="material-${i}" name="material-${i}">${pack[0]}:</label>
				</div>
				<div class="material-sizes">
					<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(\.[0-9]+)?$" placeholder="${pack[1]}" name="length" maxlength="7" required>
					<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(\.[0-9]+)?$" name="depth" placeholder="${pack[2]}" maxlength="7" required>
					<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(\.[0-9]+)?$" placeholder="${pack[3]}" name="height" maxlength="7" required>
				</div>
				<input class="material-price" type="number" placeholder="$ ${pack[4]}" pattern="\d+(\.\d{1,2})?" required></input>
			`;
			material.appendChild(select);
			fragment.appendChild(material);
		}, 0);
		while(content && content.firstChild)
			content.removeChild(content.firstChild);
		return(content.appendChild(fragment));
	};

	/**
	* @method - save all materials in IDB.
	*/
	async #storeNewMaterials() {
		localStorage.setItem('materials', JSON.stringify(this.#materials.types));
		this.#COMMANDWORKER.postMessage(this.#materials);
		const message = await new Promise((resolve) => {
			this.#COMMANDWORKER.onmessage = (res) => {
				resolve(res.data);
			};
		});
		return (message === "Saved" ? this.#updateDownPanel(): 0);
	};

	/**
	* @method - adds a new packing field.
	*/
	#addsNewFieldForNewMaterial() {
		const newOption =	document.createElement('div');

		newOption.className =	'material-sizes';
		newOption.innerHTML = `
			<input class="material-name" type="text" pattern="^[A-Za-z0-9\s]+$" inputmode="text" placeholder="Type" required></input>
			<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(?:\\.[0-9]+)?$" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="H" name="height" maxlength="7" required>
			<input class="material-price" type="number" inputmode="numeric" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
			<select>
				<option selected>Sheet</option>
				<option>Roll</option>
				<option>Wood</option>
			</select>
		`;
		return (newOption);
	};

	get secondPanelPopulate() {
		return(this.#updateDownPanel());
	};

	get plusOne() {
		return(this.#addsNewFieldForNewMaterial());
	};

	get saveinfo() {
		return(this.#storeNewMaterials());
	};

	/**
	* @field - save the materials in IDB and server.
	* @typedef { Object } Material;
	* @property { [ Array: number | string ] } materials - the material list data.
	* @param { Material } materials
	*/
	set saveMaterials(materials) {
		return(this.#materials = materials);
	};
};
