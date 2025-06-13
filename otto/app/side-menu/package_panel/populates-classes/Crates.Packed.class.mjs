import { cratesPacked } from "../templates.mjs";

export default class PackedWorks {
	#pane;
	#result;
	#countCrates;
	#metric;

	/**
	* @param { HTMLElement } element
	*/
	constructor(element) {
		this.#pane = element
	};

	/**
	* @method - catch the solved results.
	*/
	async #grabArtWorksOnIDB() {
		const ref = localStorage.getItem('refNumb');
		const WORKER = new Worker(
			new URL("../../../panels/worker.IDB.crates.mjs", import.meta.url),
			{ type: "module" },
		);

		WORKER.postMessage(ref);
		this.#result = await new Promise((resolve, reject) => {
			WORKER.onmessage = (res) => {
				const { data } = res;
				data?.reference === ref ? resolve(data) : reject(res);
			};
		});
	};

	/**
	* @method - populate the list and anchor html element.
	* @param { Array:HTMLElement } list - the layer array with all works inside.
	*/
	#setWorksUpList(list) {
		const worksListed = document.createElement('ol');

		list.map(work => {

			if(!Array.isArray(work))
				return ;
			const info = document.createElement('li');
			const anchor = document.createElement('a');

			anchor.setAttribute('href', `#${work[0]}`);
			anchor.id = work[0];
			anchor.innerText = `${work[0]} - ${work[1]} x ${work[2]} x ${work[3]} - ${this.#metric}`;
			info.append(anchor);
			worksListed.appendChild(info);
		});
		return(worksListed);
	};

	/**
	* @method - sets the detail html element to be populated
	* @param {Object} works - the crate object content layers.
	*/
	#layersStructureElements({ works }) {
		const levels =	document.createElement('details');

		Object.entries(works).map(info => {
			if(Array.isArray(info[1])) {
				const summaryLayer = document.createElement('summary');

				summaryLayer.innerHTML = `<i class="nf nf-fae-layers"></i>`
				levels.appendChild(summaryLayer);
				return(levels.appendChild(this.#setWorksUpList(info)));
			};
			Object.entries(info[1]).map(info => {
				const summaryLayer = document.createElement('summary');

				summaryLayer.innerText = `${info[0]}`
				levels.appendChild(summaryLayer);
				levels.appendChild(this.#setWorksUpList(info[1]));
			});
		});
		return(levels);
	};

	/**
	* @method - starts the html element population calls.
	* @param {Object} crates - the result object to feed them.
	*/
	#resultReportElements({ crates }) {
		const report =		document.createElement('details');
		const crateSum =	document.createElement('summary');
		const metric =		localStorage.getItem('metrica').split('-')[0];
		const fragment =	new DocumentFragment();

		this.#metric = metric;
		if(!this.#countCrates)
			this.#countCrates = 1;
		crateSum.innerText = `crate ${this.#countCrates} - ${crates[0][0]} x ${crates[0][1]} x ${crates[0][2]} - ${metric}`;
		this.#countCrates++;
		report.appendChild(crateSum);
		report.appendChild(this.#layersStructureElements(crates[1]));
		fragment.append(report);
		return(fragment);
	};

	/**
	* @method - filter the crates content over the result data.
	*/
	async #pickCrateUpList() {
		if(!this.#result)
			await this.#grabArtWorksOnIDB();
		const { crates } =	this.#result;
		const crateTypes =	[
			'tubeCrate',
			'sameSizeCrate',
			'noCanvasCrate',
			'largestCrate',
			'standardCrate'
		];
		const fragment =	new DocumentFragment();

		Object.entries(crates).map(crate => {
			if(Array.isArray(crate[1].crates) && crate[1].crates.length === 0)
				return ;
			if(crateTypes.includes(crate[0]))
				fragment.appendChild(this.#resultReportElements(crate[1]));
		});
		return(fragment);
	};

	/**
	* @method - defines the template node to be filled
	*/
	async #populateInfo() {
		const clone =		cratesPacked.content.cloneNode(true);
		const node =		document.importNode(clone, true);
		const data =		node.getElementById('first-pane');
		const fragment =	new DocumentFragment();

		fragment.append(node);
		data.appendChild(await this.#pickCrateUpList());
		this.#pane.appendChild(fragment);
		return(this.#pane);
	};

	/**
	* @property - starts the panel population info.
	*/
	get showWorksPacked() {
		return(this.#populateInfo());
	};
};
