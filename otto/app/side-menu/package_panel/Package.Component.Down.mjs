import AvailableMaterials from "./populates-classes/Available.Materials.class.mjs";
import AddPackingMaterials from "./populates-classes/Update.Materials.class.mjs";
import UsedMaterialsTable from "./populates-classes/Used.Materials.class.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class PackageInfoDown extends HTMLElement {
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
		const entry =			document.querySelector(".data-update");
		const defaultPanel =	new AddPackingMaterials(entry);

		shadowRoot.append(this.#link);
		shadowRoot.appendChild(await defaultPanel.populatePanels(2));
		return(false);
	};

	/**
	* @method - save and update materials;
	* @param {Array} newInfo New values for the materials.
	* @param {HTMLElement} content New values for the materials.
	*/
	async #updateMaterialsInfo(newInfo, content) {
		const list =	JSON.parse(globalThis.localStorage.getItem('materials'));
		const saver =	new AddPackingMaterials(content);
		const updated = { materials: 'packing', types: [] };
		let pack;

		for(pack of list) {
			newInfo.map(material => {
				if(material[0] === pack[0])
					material.map((info, i) => info && info !== pack[i] ? pack[i] = info: 0, 0);
			});
		};
		updated.types = list;
		saver.saveMaterials = updated;
		return(newInfo.length ? await saver.saveinfo: 0);
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #updateMaterials() {
		const { shadowRoot } =	document.querySelector(".update-materials");
		const content =			shadowRoot.querySelector(".data-update");
		const { children } =	content;
		const updated =			[];
		let i = 				1;
		let aux;
		let checked =			false;

		for(i; children.length > i; ++i) {
			aux = [];
			if(children.item(i).children.item(0)?.children[0].checked) {
				aux.push(children.item(i).children.item(0).children[0].name);
				aux.push(children.item(i).children.item(1).children[0].value);
				aux.push(children.item(i).children.item(1).children[1].value);
				aux.push(children.item(i).children.item(1).children[2].value);
				aux.push(children.item(i).children.item(2).value);
				if(children.item(i).children.item(3).children.item(0).selected)
					aux.push(children.item(i).children.item(3).children.item(0).value);
				if(children.item(i).children.item(3).children.item(1).selected)
					aux.push(children.item(i).children.item(3).children.item(1).value);
				if(children.item(i).children.item(3).children.item(2).selected)
					aux.push(children.item(i).children.item(3).children.item(2).value);
				if(aux.includes("") && !checked) {
					confirm('Blank field found! Would you like to procedd anyway?') ?
						updated.push(aux) : 0;
					checked = true;
				}
				else
					updated.push(aux);
			};
		};
		if (updated.length === 0 && !checked)
			return(alert('Please, select some material to update.'));
		return(await this.#updateMaterialsInfo(updated, content));
	};

	/**
	* @method - remove and update the available materials.
	*/
	async #removeMaterials() {
		const { shadowRoot } =	document.querySelector(".update-materials");
		const content =			shadowRoot.querySelector(".data-update");
		const { children } =	content;
		const list =			[];
		let aux;

		for(aux of children) {
			const { className } = aux;

			if(className === "material-info")
				aux.children.item(0).children.item(0).checked ?
					list.push(aux.children.item(0).children.item(0).name) : 0;
		};
		if(list.length > 0) {
			const upPanel =	document.querySelector('.materials');
			const update =	new AddPackingMaterials(upPanel);

			update.saveMaterials = list;
			await update.removeMaterials;
		};
	};

	/**
	* @method - populates the second panel to updates the available materials already added.
	*/
	async #populateUpdateMaterials() {
		const materials = await this.#checkMaterialsAvailable();

		if (materials) {
			const shadowRoot =		this.#shadowRoot.get(this);
			const entry =			document.querySelector(".update-materials");
			const defaultPanel =	new AddPackingMaterials(entry);
			const fragment =		new DocumentFragment();

			fragment.append(await defaultPanel.populatePanels(2));
			shadowRoot.appendChild(fragment);
			shadowRoot.appendChild(this.#link);
			shadowRoot.appendChild(await defaultPanel.secondPanelPopulate);
		};
	};

	/**
	* @method - Hides useless panel info.
	*/
	#hiddenContent(element) {
		if(!element)
			return ;
		const { shadowRoot } = document.querySelector('.update-materials');
		while(shadowRoot.firstChild)
			shadowRoot.removeChild(shadowRoot.firstChild);
	};

	/**
	* @method - populates the second panel with all materials used and the selected works package info.
	*/
	async #populateMaterialsUsed() {
		const panel = document.querySelector('.update-materials');
		const { shadowRoot } = panel;
		const table = new UsedMaterialsTable(shadowRoot);

		if(!table.setupTable)
			return(this.#populateUpdateMaterials());
		return(shadowRoot.appendChild(this.#link));
	};

	/**
	* @method - calls the correct method to populates panels.
	*/
	async connectedCallBack() {
		return(await this.#populateUpdateMaterials());
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
		const check = oldVal === 'update-materials' && newVal === 'materials-used';

		check || oldVal === 'materials-used' ? this.#hiddenContent(oldVal) : 0;
		switch(newVal !== oldVal ? newVal: false) {
			case 'update-materials':
				return(await this.#populateUpdateMaterials());
			case 'save-updated':
				return(this.#updateMaterials());
			case 'update':
				return(this.#updateMaterials());
			case 'materials-used':
				return(await this.#populateMaterialsUsed());
			case 'remove-material':
				return(await this.#removeMaterials());
		};
	};
};

globalThis.customElements.define('pack-down', PackageInfoDown);
