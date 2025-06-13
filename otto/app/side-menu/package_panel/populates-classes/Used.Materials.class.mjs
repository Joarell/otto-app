import ArtWork from "../../../core2/ArtWork.class.mjs";
import { materialsTable } from "../templates.mjs";

export default class UsedMaterialsTable {
	#pane;
	#appliedMaterials =	[];
	#totalUsed =		[];
	#residualTotal =	[];
	#counterMaterials =	[];
	#kindTotal =		[];

	/**
	* @param { HTMLElement } element
	*/
	constructor(element) {
		this.#pane = element;
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
		const request = await new Promise((resolve, reject) => {
			WORKER.onmessage = (res) => {
				const { data } = res;
				data?.reference === ref ? resolve(data) : reject(res);
			};
		});
		return(request);
	};

	async #pickCrateUpList() {
		const { list } =		await this.#grabArtWorksOnIDB();
		if(!list)
			return ;
		const artWorkParsed =	list.map(work => {
			const { code, x, z, y, packing } = work;
			return(new ArtWork(code, x, z, y, packing));
		});

		return(artWorkParsed);
	};

	/**
	* @method - gets the sum of all used packing materials.
	* @param { Number } pos  - the array position for getting the data.
	* @param { String } item  - the material name.
	*/
	async #resumeMaterialReport(item, pos) {
		let used =		0;
		let residual =	0;
		let counter =	0;
		const type =	this.#appliedMaterials[pos][0];
		const area =	this.#appliedMaterials[pos][1];

		this.#totalUsed.map(info => info[0] === item ? used += info [1]: 0);
		this.#residualTotal.map(info => info[0] === item ? residual += info[1]: 0);
		this.#counterMaterials.map(info => info[0] === item ? counter += info[1]: 0)
		return({ used, residual, counter, type, area })
	};

	/**
	* @method - sets the bottom table material data applied to the whole list.
	* @param {HTMLElement} table - the table tag to be filled.
	*/
	#imutableTableSetup() {
		const header =		document.createElement('tr');
		const imutable =	document.createElement('table');

		header.innerHTML = `
			<th>Type</th>
			<th>Unit</th>
			<th>Used total</th>
			<th>Residual total</th>
			<th>Cost total</th>`;
		imutable.innerHTML = `<h4 class="material-report">Whole used material to the list:</h4>`;
		imutable.appendChild(header);
		this.#kindTotal.map(async (item, i) => {
			const content =	document.createElement('tr');
			const {
				used,
				residual,
				counter,
				type,
				area
			} = await this.#resumeMaterialReport(item, i);

			content.innerHTML = `
				<td>${item}</td>
				<td>${type}</td>
				<td>${counter}</td>
				<td>${~~(residual * area) / 100} m²</td>
				<td>$ ${Math.ceil(used)}</td>`;
			imutable.appendChild(content);
		});
		imutable.style.display = 'unset';
		return(imutable);
	};

	/**
	* @method - populates the global variables to each packing material.
	* @param { ArtWork } work - the artWork for getting the data.
	*/
	#materialTotalSum(work) {
		const { residual, types, cost, quantity } = work.packInfo;

		types.map(material => this.#appliedMaterials.push(material));
		residual.map(resid => this.#residualTotal.push(resid));
		cost.map(value => this.#totalUsed.push(value));
		quantity.map(type => {
			!this.#kindTotal.includes(type[0]) ?
				this.#kindTotal.push(type[0]): 0;
			this.#counterMaterials.push(type);
		});
	};

	/**
	* @method - adds the last table row.
	* @param { Array:Number } prices the array with all packing material prices.
	*/
	#addSubtotalMaterialAppliedResult(prices) {
		const subTotal =	document.createElement('tr');
		const values =		prices.map(item => item[1]);
		const cost =		+values.reduce((val, sum) => val + sum, 0).toFixed(2);

		subTotal.innerHTML = `
			<td>Subtotal:</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td>$ ${cost}</td>`;
		return(subTotal);
	};

	/**
	* @method - sets all the packing materials used on the artWork.
	* @param { ArtWork } artWork - the artWork with all data.
	* @param { HTMLElement } table
	*/
	async #materialsOnTable(artWork, table) {
		const {
			demand,
			percent,
			reuse,
			residual,
			types,
			cost,
		} = artWork.packInfo;

		percent.map((info, i) => {
			const content = document.createElement('tr');

			content.innerHTML = `
				<td>${info[0]}</td>
				<td>${demand} m²</td>
				<td>${info[1]}%</td>
				<td>${reuse[i][1]}</td>
				<td>${residual[i][1]}%</td>
				<td>${types[i][0]}</td>
				<td>$ ${cost[i][1]}</td>`;
			table.appendChild(content);
		}, 0);
		this.#materialTotalSum(artWork);
		table.appendChild(this.#addSubtotalMaterialAppliedResult(cost));
		return(table);
	};

	/**
	* @method - sets the header table
	* @param { HTMLElement } node TABLE
	*/
	async #setsTableElements(node) {
		const artWorks = await this.#pickCrateUpList();

		artWorks.map(async work => {
			const { code } =	work.data;
			const table =		document.createElement('table');
			const content =		document.createElement('tr');
			const headerWork =	document.createElement('th');

			headerWork.innerHTML = `<h5>${code}</h5>`;
			table.append(headerWork);
			content.innerHTML =`
				<th>Type</th>
				<th>Demand</th>
				<th>Prop/Area</th>
				<th>Reuse</th>
				<th>Residual</th>
				<th>Material unit</th>
				<th>Total cost $</th>`;
			table.appendChild(content);
			table.id = code;
			table.ariaHidden = 'true';
			table.role = 'none';
			await this.#materialsOnTable(work, table);
			node.appendChild(table);
		});
		return(node);
	};

	/**
	* @method - starts the table population.
	*/
	async #populateTableMaterialsUesed() {
		const content =		materialsTable.content.cloneNode(true)
		const node =		document.importNode(content, true)
		const table =		node.getElementById('second-pane');
		const fragment =	new DocumentFragment();

		await this.#setsTableElements(table);
		await table.appendChild(this.#imutableTableSetup());
		fragment.append(node);
		this.#pane.appendChild(fragment)
		document.getElementById('reset-sizes').disabled = false;
	};

	/**
	* @method - returns the table populated with all package data used.
	*/
	get setupTable() {
		return(this.#populateTableMaterialsUesed());
	};
};
