import { template } from "./template.panel.mjs";
import { populateCrates, alterCrateSizes } from "./populate.dialog.mjs";


/**
 * @class Build the <dialog> element to popup when the user needs to customize the crate padding;
*/
export class DialogPadding extends HTMLElement {
	#shadowRoot = new WeakMap();
	static observedAttributes = ["content"];

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
	async connectedCallback() {
		const shadowRoot =	this.#shadowRoot.get(this);
		const link =		document.createElement('link');
		const clone =		template.content.cloneNode(true);
		const node =		document.importNode(clone, true);


		link.rel =	'stylesheet';
		link.type =	'text/css';
		link.href = './stylesheet.css';
		shadowRoot.append(node);
		shadowRoot.appendChild(link);

		globalThis.sessionStorage.setItem('PopulateCrates', "call");
		shadowRoot.getElementById('modal').setAttribute('open', '');
		shadowRoot.getElementById('padding-close')
			.addEventListener('click', this.close);
		shadowRoot.getElementById('padding-apply')
			.addEventListener('click', () => {
			const applyBtn = shadowRoot.getElementById('padding-apply');

			if (this.apply()) {
				applyBtn.disabled = true;
				setTimeout(() => applyBtn.disabled = false, 10000);
			}
		});
		const frameUl = shadowRoot.getElementById('crate-list');
		await populateCrates(frameUl);
	};

	/**
	 * @method Removes the dialog popup when clicked.;
	 */
	disconnectedCallback() {
		this.shadowRoot.getElementById('padding-apply')
			.removeEventListener('click', this.close, true);
		this.shadowRoot.getElementById('padding-close')
			.removeEventListener('click', this.close, true);
	};

	/**
	 * @method Called when the dialog popup moves to the another document.
	 */
	adoptedCallback() {
	};

	/**
	 * @method Update when the dialog popup.
	 */
	async attributeChangedCallback(attrName, oldVal, newVal) {
		console.log(`Setup values ${attrName}, ${oldVal}, and ${newVal}`);
		const shadowRoot = this.#shadowRoot.get(this);
		return(
			oldVal !== null ?
			await populateCrates(shadowRoot.getElementById('crate-list')): 0
		);
	};

	/**
	 * @function call worker to updates the solved list applying the new sizes
	 */
	apply() {
		const X =			this.shadowRoot.getElementById('pad_length');
		const Z =			this.shadowRoot.getElementById('pad_depth');
		const Y =			this.shadowRoot.getElementById('pad_height');
		const storage =		sessionStorage;

		if ([X.value, Z.value, Y.value].includes("")) {
			alert('ATTENTION: Character not allow found!');
			return (false);
		};
		storage.setItem('SetCrates', JSON.stringify(
			structuredClone([X.value, Z.value, Y.value]
		)));
		[ X, Z, Y].map(size => size.value = '');
		return (true);
	};

	/**
	 * @function close the dialog when the button is pressed
	 */
	close() {
		const closeDialog =	document.querySelector('.side-menu');

		closeDialog.getElementsByTagName('panel-info').length > 0 ?
			document.querySelector(".side-menu").lastElementChild.remove() : false;
	};
};

globalThis.customElements.define('panel-info', DialogPadding);
