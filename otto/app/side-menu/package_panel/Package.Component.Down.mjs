import AvailableMaterials from "./populates-classes/Available.Materials.class.mjs";
import AddPackingMaterials from "./populates-classes/Update.Materials.class.mjs";
import { availableMaterials } from "./templates.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class PackageInfoDown extends HTMLElement {
	#type = [];
	#shadowRoot = new WeakMap();
	static observedAttributes = [ "name", "content" ];
	#link;

	constructor() {
		super();
		const shadow =		this.attachShadow({ mode: "open" });

 		this.#link =		document.createElement('link');
		this.#link.rel =	'stylesheet';
		this.#link.type =	'text/css';
		this.#link.href =	'./stylesheet.css';
		this.#shadowRoot.set(this, shadow);
	};

	/**
	* @method - check if there is some materials available to select.
	*/
	async #checkMaterialsAvailable() {
		if(await new AvailableMaterials().allMaterials)
			return(true);
		const shadowRoot =		this.#shadowRoot.get(this);
		const entry =			document.querySelector(".packing-materials");
		const defaultPanel =	new AddPackingMaterials(entry);
		const fragment =		new DocumentFragment();

		fragment.append(await defaultPanel.populatePanels(2));
		shadowRoot.append(this.#link);
		shadowRoot.appendChild(fragment);
		return(false);
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #updateMaterials() {
		const { shadowRoot } =	document.querySelector(".update-materials");
		const content =			shadowRoot.querySelector(".packing-materials");
		const saver =			new AddPackingMaterials(content);
		const { children } =	document.querySelector(".packing-materials");
		let i = 1;

		console.log(saver);
		for (i; children.length > i; ++i)
			console.log(children.item(i).children.item(0).children[0].checked);
		console.log(globalThis.localStorage.getItem('materials'));
	};

	/**
	* @method - populates the second panel to updates the available materials already added.
	*/
	async #populateUpdateMaterials() {
		const materials = await this.#checkMaterialsAvailable();

		if (materials) {
			const shadowRoot =		this.#shadowRoot.get(this);
			const entry =			document.querySelector(".packing-materials");
			const defaultPanel =	new AddPackingMaterials(entry);
			const fragment =		new DocumentFragment();

			fragment.append(await defaultPanel.populatePanels(2));
			shadowRoot.append(this.#link);
			shadowRoot.appendChild(fragment);
			shadowRoot.appendChild(await defaultPanel.secondPanelPopulate);
		};
	};

	/**
	* @method - Hides useless panel info.
	*/
	#hiddenContent() {
		const materials =		document.getElementById('select-materials');
		const pack =			document.getElementById('packing-materials');
		const cratesPackage =	document.getElementById('first-pane');

		materials ? materials.ariaHidden = "true": false;
		pack ? pack.ariaHidden = "true": false;
		cratesPackage ? cratesPackage.ariaHidden = "true": false
	};

	/**
	* @method - populates the first panel with all crates with works packed.
	*/
	async #populatePackedWorksInCrates() {
	};

	/**
	* @method - populates the second panel with all materials used and the selected works package info.
	*/
	async #populateMaterialsUsed() {
	};

	/**
	* @method - check the options to check the selected materials for updating
	*/
	#checkMaterialsForUpdating() {
		globalThis.document.querySelector(".packing-materials")
			.addEventListener("input", (element => {
				this.#updateMaterials();
				// switch(event.target.className)
		}), true);
	};

	/**
	* @method - calls the correct method to populates panels.
	*/
	async connectedCallBack() {
		this.#type.map(async name => {
			switch(name) {
				case 'update-materials':
					return(await this.#populateUpdateMaterials());
				// case 'materials-used':
				// 	return(await this.#populateMaterialsUsed());
				// case 'save-updated':
				// 	return();
			};
		});
	};

	/**
	*/
	disconnetdCallback() {
		const shadowRoot = 	this.#shadowRoot.get(this);
	};

	/**
	* @param { string } attName - the attribute name;
	* @param { string } oldVal - the old attribute name;
	* @param { string } newVal - new attribute name;
	*/
	async attributeChangedCallback(attName, oldVal, newVal) {
		// const shadowRoot = 	this.#shadowRoot.get(this);

		switch(newVal) {
			case 'update-materials':
				return(await this.#populateUpdateMaterials());
			case 'save-updated':
				return(this.#updateMaterials());
			// case 1:
			// 	return(this.#inputListener());
			// case 'materials-used':
			// 	return();
		};
	};
};

globalThis.customElements.define('pack-down', PackageInfoDown);
