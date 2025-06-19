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
		const materials =	document.querySelector('.materials');
		const { shadowRoot } = materials;
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
			return(materials.setAttribute('name', 'select-materials'));
		};
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #updateMaterials() {
		const content = document.querySelector(".update-materials");
		content.setAttribute("content", "update");
	};

	/**
	* @method - adds the input listener to select artwork packing materials.
	*/
	#inputListener() {
		globalThis.document.querySelector(".package-crates")
			.addEventListener("input", (async element => {
				const { className } =	element.target;
				const value =			element.target.getAttribute('content');
				const customElement =	element .target .shadowRoot
										.querySelector(".select-materials");

				if (value !== 0 && className === "packing-materials")
					return ;
				if(customElement)
					customElement
					.addEventListener("input", this.#localStoreSelectedMaterials, true);
			}), true);
	};

	async #toggleReportDownPanel(work) {
		const { shadowRoot } =	document.querySelector('.update-materials');
		const list =			shadowRoot.querySelectorAll('table');

		Object.entries(list).map(node => {
			const { id } =	node[1];
			if(!node[1].id && node[1].tagName !== 'TABLE')
				return ;
			const compare =	id === work;

			if(!compare)
				node[1].ariaHidden = 'true';
			else if(compare && (node[1].ariaHidden === 'true'))
				node[1].ariaHidden = 'false';
			else if(compare && (node[1].ariaHidden === 'false'))
				node[1].ariaHidden = 'true';
		});
	};

	#packedReportToggle() {
		const { shadowRoot } =	document.querySelector('.materials');
		const packed =			shadowRoot.getElementById('first-pane')

		if(!packed)
			return ;
		packed.addEventListener('click', (async event => {
			const { tagName } =	event.target;
			const { id } =		event.target;

			event.stopImmediatePropagation();
			tagName === "A" ? await this.#toggleReportDownPanel(id): 0;
		}), true);
	};

	/**
	* @method - toggles the down pane.
	*/
	#toggleMaterialsReportAndUpdate() {
		const downPane =	document.querySelector(".update-materials");
		const name =		downPane.getAttribute('name');

		name === "materials-used" ?
			downPane.setAttribute('name', 'update-materials'):
			downPane.setAttribute('name', 'materials-used')
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
				case 'reset-sizes':
					return(this.#toggleMaterialsReportAndUpdate());
				case 'reset-szs':
					return(this.#toggleMaterialsReportAndUpdate());
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
				default :
					return(this.#packedReportToggle());
			};
		}), true);
	};

	/**
	* @method - sets the materials after the page is loaded.
	*/
	#loadPageSelection() {
		const { shadowRoot } =	document.querySelector(".materials");
		const list =			shadowRoot.querySelector('.select-materials');
		const materials =		JSON.parse(localStorage.getItem('packing'));
		let temp;
		let i;

		if(!materials)
			return ;
		for(i in list.children)
			if (list.children.item(i).id === 'populate-materials') {
				temp = list.children.item(i).children.item(0).name;
				materials.includes(temp) ?
				list.children.item(i).children.item(0).checked = true : 0;
			};
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
		return(localStorage.setItem('packing', JSON.stringify(materials)));
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
		document.getElementById('add__new__field').disabled = true;
		document.getElementById('confirm-save').disabled = true;
		const shadowRoot =		this.#shadowRoot.get(this);
		const clone =			templateMaterials.content.cloneNode(true);
		const node =			document.importNode(clone, true);
		const materialsInfo =	new AvailableMaterials(node.lastElementChild);
		const types =			await materialsInfo.allMaterials;
		const fragment =		new DocumentFragment();
		const settingsBtn =		document.getElementById('settings-content');

		settingsBtn.style.backgroundColor = "transparent";
		if(types) {
			shadowRoot.appendChild(this.#link);
			fragment.append(await materialsInfo.populate)
			shadowRoot.appendChild(fragment);
			return(this.#loadPageSelection());
		};
	};

	/**
	* @method - remove the last field added for new material.
	*/
	#removeField() {
		const shadow =			this.#shadowRoot.get(this);
		const newMaterials =	shadow.getElementById('new-material') ?? null;
		const { className } =	newMaterials ? newMaterials.lastElementChild: 0;
		const removeMaterial =	document.querySelector('.update-materials');

		return(
			className && className === 'material-sizes' ? newMaterials
				.removeChild(newMaterials.lastElementChild): removeMaterial
					.setAttribute('name', 'remove-material')
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
	* @method - Hides useless panel info.
	*/
	#hiddenContent() {
		const { shadowRoot } = document.querySelector(".materials");
		while(shadowRoot.firstChild)
			shadowRoot.removeChild(shadowRoot.firstChild);
		return(shadowRoot.append(this.#link));
	};

	/**
	* @method - populates the first panel with all crates with works packed.
	*/
	async #populatePackedWorksInCrates() {
		this.#hiddenContent();
		const shadowRoot =	this.#shadowRoot.get(this);
		const works =		new PackedWorks(shadowRoot);

		shadowRoot.append(this.#link)
		return(await works.showWorksPacked);
	};

	/**
	* @method - calls the correct method to populates panels.
	*/
	async connectedCallBack() {
		this.#type.map(async name => {
			switch(name) {
				case 'select-materials':
					return(await this.#populateMaterialsUpPanel());
				case 'add-materials':
					return(await this.#populateAddMaterials());
				case 'packed-works':
					return(await this.#populatePackedWorksInCrates());
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

		this.#type.push(newVal);
		switch(newVal) {
			case 'update':
				return(await this.#populateMaterialsUpPanel());
			case 'select-materials':
				return(await this.#populateMaterialsUpPanel());
			case 'materials':
				return(await this.#populateMaterialsUpPanel());
			case 'packages':
				return(await this.#populateMaterialsUpPanel());
			case 'settings-content':
				return(await this.#populateAddMaterials());
			case 'packed-works':
				return(await this.#populatePackedWorksInCrates());
		};
	};
};

globalThis.customElements.define('pack-up', PackageInfoUp);
