export default class AvailableMaterials {
	#WORKER = new Worker(
		new URL("./commands/worker.grab.materials.mjs",
		import.meta.url),
		{ type: "module" },
	);
	#entry

	/**
	* @param { HTMLElement } entry
	*/
	constructor(entry) {
		this.#entry = entry
	};

	/**
	* @method - returns all stored materials available.
	*/
	async #grabMaterialsIDB() {
		let request;

		this.#WORKER.postMessage("Materials");
		request = await new Promise(resolve => {
			this.#WORKER.onmessage = (res) => {
				const { data } = res;
				resolve(data);
			};
		});
		return(request);
	};

	/**
	* @method - populates the HTMLElement passed through the class.
	*/
	async #addsTheInfo() {
		const materials =	await this.#grabMaterialsIDB();

		if(!materials)
			return(false);
		materials.types.map((pack, i) => {
			const material = document.createElement('div');

			material.id = 'populate-materials';
			material.innerHTML = `
				<input type="checkbox" name="${pack[0]}" id="material-${i}"></input>
				<label for="material-${i}" name="material-${i}">${pack[0]}</label>
			`;
			this.#entry.appendChild(material);
		}, 0);
		return(this.#entry);
	};

	/**
	* @field call to populate the element.
	*/
	get populate() {
		return(this.#addsTheInfo());
	};

	/**
	* @field retrieve all materials available.
	*/
	get allMaterials() {
		return(this.#grabMaterialsIDB());
	};
};
