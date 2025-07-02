import ArtWork from "../../../core2/ArtWork.class.mjs";
import MaterialManagement from "../materials/Material.Management.class.mjs";
import { materialsTable } from "../templates.mjs";

export default class UsedMaterialsTable {
	#pane;
	#materialReport;

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

	/**
	* @method - returns the IDB solved results.
	*/
	async #pickCrateUpList() {
		const { list, crates } = await this.#grabArtWorksOnIDB();
		const artWorkParser =	(info) => {
			const { code, x, z, y, packing } = info;
			return(new ArtWork(code, x, z, y, packing));
		};

		if(!list)
			return ;
		const works =			list.map(artWorkParser);
		this.#materialReport =	new MaterialManagement({ works, crates });
		return(works);
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
			<th>Materials</th>
			<th>Unit</th>
			<th>Used total</th>
			<th>Residual total</th>
			<th>Cost total</th>`;
		imutable.innerHTML = `<h4 class="material-report">Whole used material to the list:</h4>`;
		imutable.appendChild(header);
		this.#materialReport
			.worksReport.finalReport.map(item => {
			const content =	document.createElement('tr');
			const {
				totalCost,
				residual,
				counter,
				type,
				area
			} = item[1];

			content.innerHTML = `
				<td>Artwork</td>
				<td>${item[0]}</td>
				<td>${type}</td>
				<td>${counter}</td>
				<td>${~~(residual * area) / 100} m²</td>
				<td>$ ${Math.ceil(totalCost)}</td>`;
			imutable.appendChild(content);
		});
		imutable.style.display = 'unset';
		return(imutable);
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
		} = artWork[1];
		const checkLength = reuse.findIndex(data => data.length === 3);

		percent.map((info, i) => {
			const content = document.createElement('tr');

			checkLength === i ? content.innerHTML = `
				<td>${info[0]}</td>
				<td>${demand} m²</td>
				<td>${info[1]}%</td>
				<td>${reuse[i][1] ? "Yes": "No"}</td>
				<td class="materialReusable" data-name='Reused from work: ${reuse[i][2]}'>${residual[i][1]}%</td>
				<td>${types[i][0]}</td>
				<td>$ ${cost[i][1]}</td>`:
				content.innerHTML = `
				<td>${info[0]}</td>
				<td>${demand} m²</td>
				<td>${info[1]}%</td>
				<td>${reuse[i][1] ? "Yes": "No"}</td>
				<td>${residual[i][1]}%</td>
				<td>${types[i][0]}</td>
				<td>$ ${cost[i][1]}</td>`;
			table.appendChild(content);
		}, 0);
		table.appendChild(this.#addSubtotalMaterialAppliedResult(cost));
		return(table);
	};

	/**
	* @method - sets the header table
	* @param { HTMLElement } node TABLE
	*/
	async #setsTableElements(node) {
		await this.#pickCrateUpList();
		this.#materialReport.worksReport.materialManagement.map(async work => {
			const code =		work[0];
			const table =		document.createElement('table');
			const content =		document.createElement('tr');
			const headerWork =	document.createElement('th');

			headerWork.innerHTML = `<h5>${code}</h5>`;
			table.append(headerWork);
			content.innerHTML =`
				<th>Type</th>
				<th>Demand</th>
				<th>Prop/Area</th>
				<th>Reusable</th>
				<th>Residual</th>
				<th>Material unit</th>
				<th>Total $</th>`;
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
