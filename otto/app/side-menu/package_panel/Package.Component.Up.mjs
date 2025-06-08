import AddNewMaterial from "./populates-classes/Add.Materials.class.mjs";
import AvailableMaterials from "./populates-classes/Available.Materials.class.mjs";
import PackedWorks from "./populates-classes/Crates.Packed.class.mjs";
import AddPackingMaterials from "./populates-classes/Update.Materials.class.mjs";
import { templateMaterials } from "./templates.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class PackageInfoUp extends HTMLElement {
	#type = [];
	#shadowRoot = new WeakMap();
	static observedAttributes = [ "name", "content" ];
	#reg = new RegExp("^[A-Za-z\ 0-9\s]+$");
	#link;
	#lastElement;

	constructor() {
		super();
		const shadow =			this.attachShadow({ mode: "open" });

		this.#link =			document.createElement('link');
		this.#link.rel =		'stylesheet';
		this.#link.type =		'text/css';
		this.#link.href =		'./stylesheet.css';
		this.#shadowRoot.set(this, shadow);
	};

	/**
	* @method - save the materials in IDB and server.
	* @typedef { Object } Material;
	* @property { [ Array: number | string ] } types - the material list data.
	*/
	async #saveMaterials() {
		const shadowRoot =	this.#shadowRoot.get(this);
		const entry =		shadowRoot.getElementById('new-material');
		const saver =		new AddPackingMaterials(entry);
		/** @type { Material } */
		const addedMaterials = { materials: 'packing', types: [] };
		let i = 2;
		let j = 0;
		let next = true;

		for(i; entry.children.length > i && next; ++i) {
			const aux = [];
			while(j < entry.children.item(i).children.length) {
				const value = entry.children.item(i).children[j].value;
				if (value === '') {
					alert('Please, check if all fields is properly filled!');
					next = false;
					break;
				};
				if(!this.#reg.test(value) && j === 0) {
					alert('Invalid character found!');
					next = false;
					break;
				};
				aux.push(value);
				entry.children.item(i).children[j++].value = "";
			};
			addedMaterials.types.push(aux);
			j = 0;
		};
		if (next) {
			saver.saveMaterials = addedMaterials;
			await saver.saveinfo;
		};
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #updateMaterials() {
		const content =	document.querySelector(".update-materials");
		const value =	+content.getAttribute('content');

		content.setAttribute("content", "update");
	};

	/**
	* @method - adds the input listener to select artwork packing materials.
	*/
	#inputListener() {
		globalThis.document.querySelector(".package-crates")
			.addEventListener("input", (async element => {
				const { className } =	element.target;
				const value =		element.target.getAttribute('content');

				if (value !== 0 && className === "packing-materials")
					return ;
				element
					.target
					.shadowRoot
					.querySelector(".select-materials")
					.addEventListener("input", this.#localStoreSelectedMaterials, true);
			}), true);
	};

	/**
	* @method - check the options to active the confirm button.
	*/
	#checkSPressButton() {
		const shadowRoot = this.#shadowRoot.get(this);

		globalThis.document.querySelector(".package-crates")
		.addEventListener("click", (async element => {
			const { className } =	shadowRoot.lastElementChild;
			const { id } =			element.target;

			this.#lastElement = `.${className}`;
			switch(id) {
				case 'settings-content':
					return(className !== 'new-material' ? this.#cleanPanel(id, className): 0);
				case 'packages':
					this.#inputListener();
					return(className !== 'select-materials' ? this.#cleanPanel(id, className) : 0);
				case 'select-materials':
					this.#inputListener();
					return(className !== 'select-materials' ? this.#cleanPanel(id, className) : 0);
				case 'materials':
					this.#inputListener();
					return(className !== 'select-materials' ? this.#cleanPanel(id, className) : 0);
				case 'pack-opts':
					return(className !== 'upPane' ? await this.#populatePackedWorksInCrates(): 0);
				case 'works-packed':
					return(className !== 'upPane' ? await this.#populatePackedWorksInCrates(): 0);
				case 'reset-szs':
					return(className !== 'upPane' ? await this.#populatePackedWorksInCrates(): 0);
				case 'adding-material':
					return(this.#addNewField());
				case 'add__new__field':
					return(this.#addNewField());
				case 'cancel-remove':
					return(this.#removeField());
				case 'confirm-ok':
					this.#inputListener();
					return(this.#saveMaterials());
				case 'confirm-save':
					this.#inputListener();
					return(this.#saveMaterials());
				case 'contents2':
					return(this.#updateMaterials());
			};
		}), true);
	};

	/**
	* @method - Store the selected materials to the localStorage.
	*/
	#localStoreSelectedMaterials() {
		const { shadowRoot } =	document.querySelector(".materials");
		const list =			shadowRoot.querySelector('.select-materials');
		const materials =		[];
		let i;

		for(i in list.children)
			if (list.children.item(i).id === 'populate-materials')
				list.children.item(i).children.item(0).checked ?
					materials.push(list.children.item(i).children.item(0).name): 0;
		return(globalThis.localStorage.setItem('packing', JSON.stringify(materials)));
	};

	/**
	* @method - clean the panel content.
	* @param {string} id - the last element to render on the panel.
	* @param {string} caller - the next element to render on the panel.
	*/
	async #cleanPanel(id, caller) {
		const shadowRoot =	this.#shadowRoot.get(this);
		const element =		shadowRoot.querySelector(caller);
		const tag =			globalThis.document.querySelector('.materials');

		while(element && element.firstChild)
			element.removeChild(element.firstChild);
		return(tag.setAttribute('name', id));
	};

	/**
	* @method - populates the first panel with fields for adding new pack materials.
	*/
	async #populateAddMaterials() {
		this.#hiddenContent();
		const adder =		new AddNewMaterial();
		const shadowRoot = 	this.#shadowRoot.get(this);

		shadowRoot.appendChild(this.#link);
		return(shadowRoot.append(await adder.showPane));
	};

	/**
	* @method - check if there is some materials available to select.
	*/
	async #checkMaterialsAvailable() {
		this.#inputListener();
		if(await new AvailableMaterials().allMaterials)
			return(true);
		await this.#populateAddMaterials();
		return(false);
	};

	/**
	* @method - populates the first panel with all materials available for packing;
	*/
	async #populateMaterialsUpPanel() {
		if(!await this.#checkMaterialsAvailable())
			return(true);
		this.#hiddenContent();
		const shadowRoot =		this.#shadowRoot.get(this);
		const clone =			templateMaterials.content.cloneNode(true);
		const node =			document.importNode(clone, true);
		const materialsInfo =	new AvailableMaterials(node.lastElementChild);
		const types =			await materialsInfo.allMaterials;
		const fragment =		new DocumentFragment();
		const settingsBtn =		document.getElementById('settings-content');

		settingsBtn.style.backgroundColor = "transparent";
		document.getElementById('add__new__field').disabled = true;
		document.getElementById('confirm-btn').disabled = true;
		document.getElementById('cancel-btn').disabled = true;
		if(types) {
			shadowRoot.appendChild(this.#link);
			fragment.append(await materialsInfo.populate)
			return(shadowRoot.appendChild(fragment));
		};
	};

	/**
	* @method - remove the last field added for new material.
	*/
	#removeField() {
		const shadowRoot =		this.#shadowRoot.get(this);
		const newMaterials =	shadowRoot.getElementById('new-material');

		return(
			newMaterials.lastElementChild.className === 'material-sizes' ?
				newMaterials.removeChild(newMaterials.lastElementChild): 0
		);
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #addNewField() {
		const shadowRoot =	this.#shadowRoot.get(this);
		const adder =		new AddNewMaterial();
		const entry =		shadowRoot.getElementById('new-material');
		const fragment =	new DocumentFragment();

		fragment.append(await adder.addNewMaterialOpts);
		entry.appendChild(fragment);
		return(shadowRoot.querySelector(".material-name").select());
	};

	/**
	* @method - populates the second panel to updates the available materials already added.
	*/
	async #populateUpdateMaterials() {
	};

	/**
	* @method - Hides useless panel info.
	*/
	#hiddenContent() {
		const shadowRoot = 		this.#shadowRoot.get(this);
		const materials =		document.getElementById('select-materials');
		const pack =			document.getElementById('packing-materials');
		const cratesPackage =	document.getElementById('first-pane');
		const child =			shadowRoot.querySelector(this.#lastElement);

		child ? child.remove() : 0;
		materials ? materials.ariaHidden = "true": false;
		pack ? pack.ariaHidden = "true": false;
		cratesPackage ? cratesPackage.ariaHidden = "true": false
	};

	/**
	* @method - populates the first panel with all crates with works packed.
	*/
	async #populatePackedWorksInCrates() {
		this.#hiddenContent();
		const shadowRoot =	this.#shadowRoot.get(this);
		const works =		new PackedWorks();
		const fragment =	new DocumentFragment();

		fragment.append(await works.showWorksPacked);
		return(shadowRoot.append(fragment));
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
		!oldVal ? this.#checkSPressButton() : 0;
		// const shadowRoot = 	this.#shadowRoot.get(this);

		this.#type.push(newVal);
		switch(newVal) {
			case 'select-materials':
				return(await this.#populateMaterialsUpPanel());
			case 'materials':
				return(await this.#populateMaterialsUpPanel());
			case 'packages':
				return(await this.#populateMaterialsUpPanel());
			case 'update-materials':
				return(await this.#populateUpdateMaterials());
			case 'settings-content':
				return(await this.#populateAddMaterials());
			case 'packed-works':
				return(await this.#populatePackedWorksInCrates());
			// case 'materials-used':
			// 	return();
		};
	};
};

globalThis.customElements.define('pack-up', PackageInfoUp);
