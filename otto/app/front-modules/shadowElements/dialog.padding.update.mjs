import { template, status, pane1, pane2 } from "./template.panel.mjs";
import { alterCrateSizes, populateCrates } from "./populate.dialog.mjs";
import { statusTable, statusTablePopulate } from "../../panels/status.panel.mjs"
import { showCrates1 } from "../../panels/pane1.module.mjs";
import { showCrates2 } from "../../panels/pane2.module.mjs";


/**
 * @class Build the <dialog> element to popup when the user needs to customize the crate padding;
*/
export class DialogPadding extends HTMLElement {
	#type = [];
	#shadowRoot = new WeakMap();
	static observedAttributes = [ "name", "content", "mode" ];

	constructor () {
		super();
		const shadow =	this.attachShadow({ mode: "open" });

		this.close =	this.close.bind(this);
		this.apply =	this.apply.bind(this);
		this.#shadowRoot.set(this, shadow);
	};

	/**
	 * @method Populates the dialog popup when clicked.;
	*/
	connectedCallback() {
		this.#type.map(async name => {
			switch(name) {
				case 'padding':
					return(await this.#populatePaddingCrate());
				case 'pane1':
					return(await this.#populatePane1());
				case 'pane2':
					return(await this.#populatePane2());
				case 'close':
					return(this.close());
				default:
					return;
			};
		});
	};

	/**
	* @method populates the padding dialog info.
	*/
	async #populatePaddingCrate() {
		const shadowRoot =	this.#shadowRoot.get(this);
		const link =		document.createElement('link');
		const clone =		template.content.cloneNode(true);
		const node =		document.importNode(clone, true);

		link.rel =	'stylesheet';
		link.type =	'text/css';
		link.href = './stylesheet.css';
		shadowRoot.append(node);
		shadowRoot.appendChild(link);
		shadowRoot.getElementById('padding-close')
			.addEventListener('click', this.close);
		shadowRoot.getElementById('padding-apply')
			.addEventListener('click', () => {
			const applyBtn = shadowRoot.getElementById('padding-apply');

			if (this.apply()) {
				applyBtn.disabled = true;
				setTimeout(() => applyBtn.disabled = false, 1000);
			};
		});
		const frameUl = shadowRoot.getElementById('crate-list');
		await populateCrates(frameUl);
	};

	/**
	* @method populates the status panel.
	*/
	async #populateStatus() {
		const shadowRoot =	this.#shadowRoot.get(this);
		const table =		shadowRoot.getElementById('works-list');
		const result =		sessionStorage.getItem('FETCHED');

		if(!table) {
			const link =	document.createElement('link');
			const clone =	status.content.cloneNode(true);
			const node =	document.importNode(clone, true);

			document.getElementById('crate-btn').disabled = true;
			link.rel =	'stylesheet';
			link.type =	'text/css';
			link.href = './stylesheet.css';
			shadowRoot.append(node);
			shadowRoot.appendChild(link);
		};

		return(table ? await statusTable(table, true, result):
			await statusTable(shadowRoot.querySelector("#content-list"))
		);
	};

	/**
	* @method populates the first pane with all crates.
	* @param {boolean} [update=false] - set the update status panel.
	*/
	async #populatePane1(update = false) {
		const shadowRoot =	this.#shadowRoot.get(this);
		const link =		document.createElement('link');
		const clone =		pane1.content.cloneNode(true);
		const node =		document.importNode(clone, true);
		const reference =	localStorage.getItem('refNumb');

		link.rel =	'stylesheet';
		link.type =	'text/css';
		link.href = './stylesheet.css';
		shadowRoot.append(node);
		shadowRoot.appendChild(link);
		const cratePane =	shadowRoot.getElementById('crates-only');
		if(update)
			while(cratePane.firstChild)
				cratePane.removeChild(cratePane.firstChild);
		return(reference ? await showCrates1(reference, cratePane): false);
	};

	/**
	* @method populates the second panel with all crates opened.
	*/
	async #populatePane2(update = false) {
		const shadowRoot =	this.#shadowRoot.get(this);
		const link =		document.createElement('link');
		const clone =		pane2.content.cloneNode(true);
		const node =		document.importNode(clone, true);
		const reference =	localStorage.getItem('refNumb');

		link.rel =	'stylesheet';
		link.type =	'text/css';
		link.href = './stylesheet.css';
		shadowRoot.append(node);
		shadowRoot.appendChild(link);

		shadowRoot.append(node);
		shadowRoot.appendChild(link);
		const openPane =	shadowRoot.getElementById('opened-crates');
		if(update)
			while(openPane.firstChild)
				openPane.removeChild(openPane.firstChild);
		return(reference ? await showCrates2(reference, openPane): false);
	};

	/**
	* @method set the panes when the result is fetched.
	*/
	async #fetchedResult() {
		const result = sessionStorage.getItem('FETCHED');

		statusTablePopulate(result);
		return(await this.#populateStatus());
	};

	/** @method Update when the dialog popup.
	 */
	async attributeChangedCallback(attrName, oldVal, newVal) {
		const shadowRoot = 	this.#shadowRoot.get(this);
		const status =		oldVal !== newVal && attrName === 'content' && newVal !== 'FETCHED';

		// console.log(`Shadow: ${attrName}, ${oldVal}, ${newVal}`);
		this.#type.push(newVal);
		if(attrName === 'content' && newVal === 'FETCHED')
			return(await this.#fetchedResult());
		switch(attrName) {
			case 'padding':
				return(
					oldVal ? await populateCrates(shadowRoot.querySelector('#crate-list')): 0
				);
			case 'content':
				return(oldVal === null || status ? await this.#populateStatus(): 0);
			case 'name':
				return(newVal === 'close' ? this.close(): 0);
			case 'pane1':
				return(await this.#populatePane1());
			case 'pane2':
				return(await this.#populatePane2());
			default:
				return(false);
		};
	};

	/**
	 * @method Removes the dialog popup when clicked.;
	 */
	disconnectedCallback() {
		const shadowRoot = 	this.#shadowRoot.get(this);

		if(shadowRoot.getElementById('padding-apply')) {
			shadowRoot.getElementById('padding-apply')
				.removeEventListener('click', this.close, true);
			shadowRoot.getElementById('padding-close')
				.removeEventListener('click', this.close, true);
		}
	};

	/**
	 * @function call worker to updates the solved list applying the new sizes
	 */
	async apply() {
		const X =			this.shadowRoot.getElementById('pad_length');
		const Z =			this.shadowRoot.getElementById('pad_depth');
		const Y =			this.shadowRoot.getElementById('pad_height');
		const storage =		sessionStorage;
		const shadowRoot =	this.#shadowRoot.get(this);
		const padding = 	shadowRoot.querySelector('#crate-list');

		if ([X.value, Z.value, Y.value].includes("")) {
			alert('ATTENTION: Character not allow found!');
			return (false);
		};
		storage.setItem('SetCrates', JSON.stringify(
			structuredClone([X.value, Z.value, Y.value]
		)));
		[ X, Z, Y].map(size => size.value = '');
		await alterCrateSizes(padding);
		setTimeout(async () => await populateCrates(padding) , 100);
	};

	/**
	 * @function close the dialog when the button is pressed
	 */
	close() {
		const closeDialog =	document.querySelector('.side-menu');

		this.disconnectedCallback();
		closeDialog.getElementsByTagName('panel-info').length > 0 ?
			document.querySelector(".side-menu").lastElementChild.remove() : false;
	};
};

globalThis.customElements.define('panel-info', DialogPadding);
