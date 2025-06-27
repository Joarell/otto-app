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

	async #woodOptions(woods) {
		const woodMenu = document.createElement('div');

		woodMenu.innerHTML = `<h4>Select the woods for crating.</h4>`;
		this.#entry.appendChild(woodMenu);
		woods.map((opts, i) => {
			const material = document.createElement('div');

			material.id = 'populate-materials';
			material.innerHTML = `
				<input type="checkbox" name="${opts[0]}" id="material-${i}"></input>
				<label for="material-${i}" name="material-${i}">${opts[0]}</label>
			`;
			this.#entry.appendChild(material);
		}, 0);
		return(this.#entry);
	};

	/**
	* @method - populates the HTMLElement passed through the class.
	*/
	async #addsTheInfo() {
		const materials =	await this.#grabMaterialsIDB();
		const woods =		['Pinewood', 'Plywood', 'Foam Sheet'];
		const woodOpts =	[];

		if(!materials)
			return(false);
		materials.types.map((pack, i) => {
			const material = document.createElement('div');

			if(woods.includes(pack[5]))
				return(woodOpts.push(pack))
			material.id = 'populate-materials';
			material.innerHTML = `
				<input type="checkbox" name="${pack[0]}" id="material-${i}"></input>
				<label for="material-${i}" name="material-${i}">${pack[0]}</label>
			`;
			this.#entry.appendChild(material);
		}, 0);
		if(woodOpts.length > 0)
			return(await this.#woodOptions(woodOpts));
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
