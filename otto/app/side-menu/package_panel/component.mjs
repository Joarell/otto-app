import MaterialSetup from "./materials/Class.materials.mjs";
import AvailableMaterials from "./populates-classes/Available.Materials.class.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class SideDoublePanels extends HTMLElement {
	#type = [];
	#shadowRoot = new WeakMap();
	static observedAttributes = [ "name", "content" ];

	constructor () {
		super();
		const shadow =			this.attachShadow({ mode: "open" });

		this.addNewMaterial =	this.addNewMaterial.bind(this);
		this.close =			this.close.bind(this);
		this.#shadowRoot.set(this, shadow);
	};

	/**
	* @method - populates the first panel with all materials available for packing;
	*/
	async #populateMaterialsUpPanel() {
		const entryPoint =		document.getElementById('content1');
		const materialsInfo =	new AvailableMaterials(entryPoint);

		document.getElementById('add-btn').disabled = false;
		return(await materialsInfo.populate);
	};

	/**
	* @method - populates the second panel to updates the available materials already added.
	*/
	async #populateUpdateMaterials() {
	};

	/**
	* @method - populates the first panel with fields for adding new pack materials.
	*/
	async #populateAddMaterials() {
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
	* @method - calls the correct method to populates panels.
	*/
	async connectedCallBack() {
		this.#type.map(async name => {
			switch(name) {
				case 'select-materials':
					return(await this.#populateMaterialsUpPanel());
				case 'update-materials':
					return(await this.#populateUpdateMaterials());
				case 'add-materials':
					return(await this.#populateAddMaterials());
				case 'packed-works':
					return(await this.#populatePackedWorksInCrates());
				case 'materials-used':
					return(await this.#populateMaterialsUsed());
			};
		});
	};

	/**
	* @param { string } attName - the attribute name;
	* @param { string } oldVal - the old attribute name;
	* @param { string } newVal - new attribute name;
	*/
	async attributeChangedCallback(attName, oldVal, newVal) {
		const shadowRoot = 	this.#shadowRoot.get(this);

		console.log(attName);
		this.#type.push(newVal);
		switch(attName) {
			case 'select-materials':
				return(await this.#populateMaterialsUpPanel());
			case 'update-materials':
				return();
			case 'add-materials':
				return();
			case 'packed-works':
				return();
			case 'materials-used':
				return();
		};
	};

	/**
	*/
	disconnetdCallback() {
		const shadowRoot = 	this.#shadowRoot.get(this);
	};

	/**
	*/
	addNewMaterial() {
	};

	/**
	*/
	close() {
	};
};

globalThis.customElements.define('package-info', SideDoublePanels);
