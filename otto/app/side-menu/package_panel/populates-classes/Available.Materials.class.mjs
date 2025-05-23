export default class AvailableMaterials {
	#entry

	/**
	* @param { HTMLElement } entry
	*/
	constructor(entry) {
		this.#entry = entry
	};

	/**
	* @method - returns all materials available.
	*/
	async #grabIDBMaterials() {
	};

	/**
	* @method - returns the warning to add some materials.
	*/
	async #emptyMaterials() {
	};

	/**
	* @method - returns all stored materials available.
	*/
	async #demandedMaterials() {
		const WORKER = new Worker(
			new URL("./worker.grab.materials.mjs", import.meta.url),
			{ type: "module" },
		);
		let request;

		WORKER.postMessage();
		request = await new Promise((resolve, reject) => {
			WORKER.onmessage = (res) => {
				const { data } = res;
				data?.reference === ref ? resolve(data) : reject(res);
			};
		});
		return(request);
	};


	/**
	* @method - populates the HTMLElement passed through the class.
	*/
	async #addsTheInfo() {
		const materials = await this.#demandedMaterials();
		alert(materials);
	};

	/**
	* @method call to populate the element.
	*/
	get populate() {
		return(this.#addsTheInfo());
	};
};
