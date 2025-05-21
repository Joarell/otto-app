import MaterialSetup from "./materials/Class.materials.mjs";

/**
* @class - Otto's side menu double panels.
*/
export class SideDoublePanels extends HTMLElement {
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
	*/
	async connectedCallBack() {
		return(await new MaterialSetup();
	};

	/**
	* @param { string } attName - the attribute name;
	* @param { string } oldVal - the old attribute name;
	* @param { string } newVal - ne new attribute name;
	*/
	async attributeChangedCallback(attName, oldVal, newVal) {
	};

	/**
	*/
	disconnetdCallback() {
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
