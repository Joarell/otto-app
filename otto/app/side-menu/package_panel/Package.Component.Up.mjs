import AddNewMaterial from "./populates-classes/Add.Materials.class.mjs";
import AvailableMaterials from "./populates-classes/Available.Materials.class.mjs";
import PackedWorks from "./populates-classes/Crates.Packed.class.mjs";
import AddPackingMaterials from "./populates-classes/Update.Materials.class.mjs";
import { templateMaterials } from "./templates.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class PackageInfoUp extends HTMLElement {
	static observedAttributes = [ "name", "content" ];
	#type = [];
	#shadowRoot = new WeakMap();
	#reg = new RegExp("^[A-Za-z0-9 ][0-9]+(?:\.\d+)?$");
	#link;
	#listeners;

	constructor() {
		super();
		const shadow =			this.attachShadow({ mode: "open" });

		this.#link =			document.createElement('link');
		this.#link.rel =		'stylesheet';
		this.#link.type =		'text/css';
		this.#link.href =		'./stylesheet.css';
		this.#shadowRoot.set(this, shadow);
		this.#listeners =		new Map;
	};

	/**
	* @method - finds the first blank file to be filled.
	* @param { HTMLElement } shadow the shadow div with all inputs.
	*/
	#findBlankField(shadow) {
		let found = false;
		let node =	2;
		let i;
		let aux;

		if(!shadow)
			return;
		for(node; node < shadow.children.length && !found; node++) {
			aux = shadow.children.item(node);
			i = 0;
			for(i in aux.children) {
				if (!aux.children.item(i).value) {
					aux.children.item(i).select();
					found = true;
					break;
				};
			};
		};
		return(found);
	};

	/**
	* @method - checks the material data before add it.
	* @param { string } value data
	*/
	#validationNewMaterial(value) {
		let next = true;
		let check = false;
		const materials = JSON.parse(localStorage.getItem('materials'));

		if (value === '') {
			alert('Please, check if all fields is properly filled!');
			this.#findBlankField(entry);
			next = false;
		};
		if(!this.#reg.test(value) && Number.isNaN(value)) {
			alert('Invalid character found!');
			next = false;
		};
		if(materials) {
			check = materials.some(item => item[0] === value);
			check ? alert('Material already added! Please, recheck the name.'): 0;
			check ? next = false : 0;
		};

		return(next ? value : next);
	};

	/**
	* @method - save the materials in IDB and server.
	* @property { [ Array: number | string ] } types - the material list data.
	*/
	async #saveMaterials() {
		const materials =	document.querySelector('.materials');
		const { shadowRoot } = materials;
		const entry =		shadowRoot.getElementById('new-material');
		const saver =		new AddPackingMaterials(entry);
		const addedMaterials = { materials: 'packing', types: [] };
		const cleaner =			[];
		let i = 2;
		let j = 0;
		let next = true;
		let saveResult;

		for(i; entry.children.length > i && next; ++i) {
			const aux = [];
			while(j < entry.children.item(i).children.length && next) {
				const value = entry.children.item(i).children[j].value;
				if (!this.#validationNewMaterial(value)) {
					next = false;
					break;
				}
				else {
					aux.push(value);
					cleaner.push(entry.children.item(i).children[j++]);
				};
			};
			addedMaterials.types.push(aux);
			j = 0;
		};
		if(next) {
			saver.saveMaterials = addedMaterials;
			saveResult = await saver.saveinfo;
			switch(saveResult){
				case 'wrap' :
					alert('Please, add some wood material for wrapping the artworks.');
					return(this.#addNewField());
				case 'wood' :
					alert('Please, add some wood material for crating.');
					return(this.#addNewField());
				default :
					cleaner.map(field => field.value = "");
					this.#hiddenContent();
					return(this.#populateMaterialsUpPanel());
			};
		};
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #updateMaterials(shadow) {
		shadow.querySelector('.packing-materials')
			.addEventListener('input', (e) => {
				const { id } = e.target;
				e.stopImmediatePropagation();
				id ? result = true: 0;
		});
		shadow.querySelector('.packing-materials')
			.removeEventListener('input');
	};

	/**
	* @method - adds the input listener to select artwork packing materials.
	*/
	#inputListener() {
		globalThis.document.querySelector(".package-crates")
			.addEventListener("input", (async element => {
				const { className } =	element.target;
				const value =			element.target.getAttribute('content');
				const customElement =	element.target.shadowRoot
										.querySelector(".select-materials");

				if (value !== 0 && className === "packing-materials")
					return ;
				if(customElement)
					customElement
					.addEventListener("input", this.#localStoreSelectedMaterials, true);
			}), true);
	};

	/**
	* @method - calls the second panel to show the package info for each work.
	* @param { String } work the work ID to display the info.
	*/
	async #toggleReportDownPanel(work) {
		const { shadowRoot } =	document.querySelector('.update-materials');
		const list =			shadowRoot.querySelectorAll('table');
		const onCrate =			new Map(
			Object.entries(
				JSON.parse(globalThis.sessionStorage.getItem('onCrate'))
			)
		);

		Object.entries(list).map((node, i) => {
			const { id } =	node[1];
			if(i > list.length - 1 || id === '')
				return;
			const layer =	onCrate.get(work);
			const crate =	sessionStorage.getItem('crate');
			const art =		id === work;

			node[1].ariaHidden = 'true';
			if(art) {
				node[1].ariaHidden = 'false'
				sessionStorage.setItem('crate', layer);
			};
			id === crate ? node[1].ariaHidden = 'false': 0;
		}, 0);
	};

	/**
	* @method - gets the work ID to sow all package information.
	*/
	#packedReportToggle() {
		const { shadowRoot } =	document.querySelector('.materials');
		const packed =			shadowRoot.getElementById('first-pane')

		if(!packed)
			return ;
		packed.addEventListener('click', (async event => {
			const { id, tagName } =	event.target;

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
	* @method - check if the user wants to save the materials.
	* @param { ShadowRoot } shadow - listener element.
	*/
	#checkingSaveNewMaterials(shadow) {
		let result = false;

		const checker = (event) => {
			const { id } = event.target;
			const check = this.#findBlankField(shadow);

			event.stopImmediatePropagation();
			if(id === 'new-material') {
				!check ? this.#inputListener(): 0;
				!check ? this.#saveMaterials(): 0;
				result = true;
				return(result)
			};
		};
		shadow.lastElementChild.addEventListener('click', checker, true);
		return(this.#listeners.set('add', shadow));
	};

	/**
	* @method - sets the materials after the page is loaded.
	*/
	#loadPageSelection() {
		const { shadowRoot } =	document.querySelector(".materials");
		const list =			shadowRoot.querySelector('.select-materials');
		const pack =			JSON.parse(localStorage.getItem('packing'));
		const crate =			JSON.parse(localStorage.getItem('crating'));
		let crates;
		let temp;
		let node;

		if(!pack || !crate)
			return ;
		for(node of list.children) {
			!crates && node.className ? crates = true: 0;
			if (node.id === 'populate-materials') {
				temp = node.children.item(0).name;
				pack.includes(temp) && !crates ?
					node.children.item(0).checked = true : 0;
				crate.includes(temp) && crates ?
					node.children.item(0).checked = true : 0;
			};
		};
	};

	/**
	* @method - Store the selected materials to the localStorage.
	*/
	#localStoreSelectedMaterials() {
		const { shadowRoot } =	document.querySelector(".materials");
		const list =			shadowRoot.querySelector('.select-materials');
		const wrap =			['Sheet', 'Roll', 'Tape' ];
		const packing =			[];
		const crating =			[];
		let { materials } =		localStorage;
		let crates =			false;
		let pack =				false;
		let crate =				false;
		let node;
		let aux;
		let opts;

		materials = JSON.parse(materials);
		for(node of list.children) {
			!crates && node.className ? crates = true: 0;
			if (node.id === 'populate-materials') {
				if(node.children.item(0).checked) {
					aux = node.children.item(0).name;
					opts = materials.filter(item => item[0] === aux).flat();
					pack = !crates && opts[5] === 'Foam Sheet';
					crate = crates && opts[5] === 'Foam Sheet';
					crates && !wrap.includes(opts[5]) || crate ? crating.push(aux): 0;
					!crates && wrap.includes(opts[5]) || pack ? packing.push(aux): 0;
				};
				pack = false;
				crate = false;
			};
		};
		localStorage.setItem('packing', JSON.stringify(packing));
		localStorage.setItem('crating', JSON.stringify(crating));
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
		this.#toggleMaterialsReportAndUpdate();
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

		className && className === 'material-sizes' ? newMaterials
			.removeChild(newMaterials.lastElementChild): removeMaterial
			.setAttribute('name', 'remove-material')
		return(this.#findBlankField(newMaterials));
	};

	/**
	* @adds new fields to fill with new pack materials;
	*/
	async #addNewField() {
		const { shadowRoot } =	document.querySelector('.materials');
		const adder =			new AddNewMaterial();
		const entry =			shadowRoot.getElementById('new-material');
		const fragment =		new DocumentFragment();

		fragment.append(await adder.addNewMaterialOpts);
		entry.appendChild(fragment);
		return(this.#findBlankField(entry));
	};

	/**
	* @method - Hides useless panel info.
	*/
	#hiddenContent() {
		const { shadowRoot } = document.querySelector(".materials");
		while(shadowRoot.firstChild)
			shadowRoot.removeChild(shadowRoot.firstChild);
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
		!oldVal && attName === 'content' ? this.#packedReportToggle() : 0;
		const shadow =		this.#shadowRoot.get(this);
		const shadowClass =	shadow.lastElementChild?.className;

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
			case 'settings-content':
				return(className !== 'update-materials' && shadowClass !== 'new-material' ? this.#cleanPanel(id, shadowClass): 0);
			case 'packages':
				this.#inputListener();
				return(className !== 'update-materials' && shadowClass !== 'select-materials' ? this.#cleanPanel(id, shadowClass) : 0);
			case 'select-materials':
				this.#inputListener();
				return(className !== 'update-materials'&& shadowClass !== 'select-materials' ? this.#cleanPanel(id, shadowClass) : 0);
			case 'materials':
				this.#inputListener();
				return(className !== 'update-materials' && shadowClass !== 'select-materials' ? this.#cleanPanel(id, shadowClass) : 0);
			case 'pack-opts':
				return(shadowClass !== 'upPane' ? await this.#populatePackedWorksInCrates(): 0);
			case 'works-packed':
				return(shadowClass !== 'upPane' ? await this.#populatePackedWorksInCrates(): 0);
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
			case 'new-material':
				return(this.#checkingSaveNewMaterials(shadow));
			case 'confirm-save':
				return(this.#checkingSaveNewMaterials(shadow));
			default:
				return(this.#toggleReportDownPanel(newVal));
		};
	};
};

globalThis.customElements.define('pack-up', PackageInfoUp);
