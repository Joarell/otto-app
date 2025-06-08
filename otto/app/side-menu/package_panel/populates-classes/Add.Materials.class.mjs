import { newOption } from "../templates.mjs";
import AddPackingMaterials from "./Update.Materials.class.mjs";

export default class AddNewMaterial {

	constructor() {
	};

	/**
	* @method - set the panel information.
	*/
	async #showPanelInfo() {
		const entryPoint =	document.getElementById('content1');
		const settingsBtn =	document.getElementById('settings-content');
		const addBtn =		document.getElementById('confirm-save');
		const cancel =		document.getElementById('cancel-remove');
		const populated =	new AddPackingMaterials(entryPoint);

		document.getElementById('add__new__field').disabled = false;
		settingsBtn.style.backgroundColor = "var(--yellow-select)";
		settingsBtn.style.opacity = "1";
		cancel.disabled = false;
		addBtn.disabled = false;
		return(await populated.populatePanels(1));
	};

	/**
	* @method - adds new field for new material options.
	*/
	async #addNewOpts() {
		const clone =		newOption.content.cloneNode(true);
		return(document.importNode(clone, true));
	};

	/**
	* @field - prepare the panel information.
	*/
	get showPane() {
		return(this.#showPanelInfo());
	};

	/**
	* @field - adds new file to fill with new material option.
	*/
	get addNewMaterialOpts() {
		return(this.#addNewOpts());
	};
};
