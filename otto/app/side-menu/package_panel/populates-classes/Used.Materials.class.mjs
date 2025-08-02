import ArtWork from "../../../core2/ArtWork.class.mjs";
import MaterialManagement from "../materials/Material.Management.class.mjs";
import { materialsTable } from "../templates.mjs";

export default class UsedMaterialsTable {
	#pane;
	#zSum;
	#materials;
	#materialReport;

	/**
	* @param { HTMLElement } element
	*/
	constructor(element) {
		this.#zSum = 		0;
		this.#pane =		element;
		this.#materials =	JSON.parse(localStorage.getItem('materials'));
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
		const works =	list.map(artWorkParser);
		const report =	new MaterialManagement({ works, crates });
		const data =	await report.start;

		this.#materialReport =	data;
		return(data);
	};

	/**
	* @method - sets the bottom table material data applied to the whole list.
	* @param {HTMLElement} table - the table tag to be filled.
	*/
	#imutableTableSetup() {
		const header =		document.createElement('tr');
		const imutable =	document.createElement('table');
		const { worksReport, cratesReport } = this.#materialReport;
		const prices = 		[];

		header.innerHTML = `
			<th>Applied</th>
			<th>Materials</th>
			<th>Unit</th>
			<th>Used total</th>
			<th>Residual total</th>
			<th>Total</th>`;
		imutable.innerHTML = `<h4 class="material-report">Whole used material to the list:</h4>`;
		imutable.appendChild(header);
		worksReport.finalReport.map(item => {
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
			prices.push(+totalCost);
		});
		Object.entries(cratesReport.finalReport).map(item => {
			const content =	document.createElement('tr');
			const {
				totalCost,
				residual,
				counter,
				type,
			} = item[1];

			content.innerHTML = `
				<td>Crate</td>
				<td>${type}</td>
				<td>${item[0]}</td>
				<td>${counter}</td>
				<td>${(residual).toFixed(3)} m²</td>
				<td>$ ${totalCost}</td>`;
			imutable.appendChild(content);
			prices.push(+totalCost);
		});
		imutable.appendChild(this.#addSubtotalMaterialAppliedResult(prices, 'crates'));
		imutable.style.display = 'unset';
		return(imutable);
	};

	/**
	* @method - adds the last table row.
	* @param { Array:Number } prices the array with all packing material prices.
	*/
	#addSubtotalMaterialAppliedResult(prices, type = 'works') {
		const subTotal =	document.createElement('tr');
		const values =		prices.map(item => item[1]);
		const cost =		type === 'works' ?
			values.reduce((val, sum) => val + sum, 0):
			prices.reduce((val, sum) => val + sum, 0);
		const finalCost =	Math.ceil(cost).toFixed(2);

		if (type === 'works')
			subTotal.innerHTML = `
				<td>Subtotal:</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td>$ ${finalCost}</td>`;
		else
			subTotal.innerHTML = `
				<td>Subtotal:</td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td>$ ${finalCost}</td>`;
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
		const span =		document.createElement('h6');

		percent.map((info, i) => {
			const content = document.createElement('tr');

			console.log(reuse)
			checkLength === i ? content.innerHTML = `
				<td>${ info[0] }</td>
				<td>${ demand} m²</td>
				<td>${ info[1]}%</td>
				<td>${ reuse[i][1] ? "Yes": "No" }</td>
				<td class="materialReusable" data-name='Reused from work: ${reuse[i][2]}'>${residual[i][1]}%</td>
				<td>${ types[i][0] }</td>
				<td>$ ${cost[i][1] }</td>`:
				content.innerHTML = `
				<td>${ info[0] }</td>
				<td>${ demand} m²</td>
				<td>${ info[1] }%</td>
				<td>${ reuse[i][1] ? "Yes": "No"}</td>
				<td>${ (residual[0]).toFixed(3) }%</td>
				<td>${ types[i][0] }</td>
				<td>$ ${cost[i][1] }</td>`;
			table.appendChild(content);
		}, 0);
		table.appendChild(this.#addSubtotalMaterialAppliedResult(cost));
		table.appendChild(span);
		return(table);
	};

	/**
	* @method - prepare the crate faces size data.
	* @param { Object } info all crate faces sizes.
	* @param { number } layers number for each crate.
	*/
	#correctCutMaterials(info, layers) {
		const { frontBack, sides, upDown, name} = info;
		const material =	this.#materials.find(item => item[0] === name);
		const div =			this.#materials.find(item => item[2] <= 2.5 && item[5] === 'Foam Sheet');
		const feet = 		8;

		material[5] === 'Pinewood' ? this.#zSum += material[2] * 2: 0;
		frontBack.x +=	this.#zSum;
		frontBack.y +=	name === 'Pinewood' ? this.#zSum + feet: this.#zSum;
		sides.z +=		this.#zSum + layers * +div[2];
		sides.y +=		this.#zSum;
		upDown.x +=		this.#zSum;
		upDown.z +=		name === 'Pinewood' ?
			this.#zSum + feet + layers * +div[2]: this.#zSum + +div[2] * layers;
		this.#zSum +=	material[2] * 2;
		return({ frontBack, sides, upDown, name });
	};

	/**
	* @method - fill all data for the structure largest crates.
	* @param { Array } crate all crates data content.
	* @param { HTMLElement } table.
	*/
	#largestCrateTable(crate, table) {
		const metric =		localStorage.getItem('metrica').split('-')[0];
		const columns =		document.createElement('tr');
		const header =		document.createElement('h4');
		const structure =	crate[2].get('structure');
		const { bottom, leanner, enforcer } = structure;
		const frag =		new DocumentFragment();

		header.innerHTML = `The crate structure for lean on support: <i class="nf nf-fa-ruler_combined"></i>`;
		columns.innerHTML =`
			<th>Material</th>
			<th>Area</th>
			<th>Size</th>
			<th>Units needed</th>`;

		table.appendChild(header);
		table.appendChild(columns);
		[ bottom, leanner, enforcer ].map(data => {
			const row =	document.createElement('tr');
			const { counter, size, area, name, type } = data;
			const info = type === 'Pinewood' ?
				(size).toFixed(3) + ' - ' + metric:
				`${ size[0] }  x  ${ size[1] } - ${ metric }`;

			row.innerHTML = `
				<td>${ name }</td>
				<td>${ (area / 100).toFixed(3) } m² </td>
				<td> ${ info } </td>
				<td>${ counter }</td>`
			frag.appendChild(row);
		});
		table.appendChild(frag);
		return(table);
	};

	/**
	* @method - fill all data from largest crates structure.
	* @param { Array } crate all crates data content.
	* @param { HTMLElement } table
	*/
	#crateMaterialCut(crate, table) {
		const metric =		localStorage.getItem('metrica').split('-')[0];
		const content =		document.createElement('tr');
		const cuts =		document.createElement('h4');
		const disclaimer =	document.createElement('p');
		const frame =		crate[2].get('Frame');
		const faces =		crate[2].get('Plywood');
		const padding =		crate[2].get('Foam Sheet');
		const frag =		new DocumentFragment();
		const layers =		crate[0].layers.length - 1;

		cuts.innerText = `Crate Cut materials: - Front/Back - Sides - Up/Down`;
		disclaimer.innerText = `Obs: Each measure must be cut twice in order to build all crates sides.`
		table.appendChild(cuts);
		table.appendChild(disclaimer);
		content.innerHTML =`
			<th>Material</th>
			<th>Each face</th>
			<th>Each Side</th>
			<th>Each top/bottom</th>`;

		table.appendChild(content);
		[ padding, faces, frame ].map(data => {
			const row =	document.createElement('tr');
			const { frontBack, sides, upDown, name} = this.#correctCutMaterials(data, layers);

			row.innerHTML = `
				<td>${ name }</td>
				<td>${ frontBack.x } x ${ frontBack.y } - ${ metric } </td>
				<td>${ sides.z } x ${ sides.y } - ${ metric }</td>
				<td>${ upDown.x } x ${ upDown.z } - ${ metric }</td>`;
			frag.appendChild(row);
		});
		table.appendChild(frag);
		return(crate[1] === 'largestCrate' ? this.#largestCrateTable(crate, table): table);
		// return(table);
	};

	/**
	* @method - fill all data to the table.
	* @param { Array } crate all crates data content.
	* @param { HTMLElement } table
	*/
	#cratesOnTable(crate, table) {
		const material =	JSON.parse(localStorage.getItem('crating'));
		const cost =		[];
		const sumResidual = (data => {
			const values = data.map(val => val[0] * val[1]);
			const total = 	values.reduce((val, sum) => val + sum, 0);

			return(+(total / 100).toFixed(3));
		});

		material.map(info => {
			const content =		document.createElement('tr');
			const data =		crate[2].get(info);
			const { type, counter, residual, area, totalCost } = data;

			cost.push(totalCost);
			content.innerHTML = `
				<td>${ type }</td>
				<td>${ area } m²</td>
				<td>${ residual > 100 ? 'Yes': 'No' }</td>
				<td>${ Array.isArray(residual) ?
					sumResidual(residual): (residual / 100).toFixed(3) } m²</td>
				<td>${ counter }</td>
				<td>$ ${ totalCost }</td>`;
			table.appendChild(content);
		});
		table.appendChild(this.#addSubtotalMaterialAppliedResult(cost, 'crate'));
		return(this.#crateMaterialCut(crate, table));
	};

	/**
	* @method - defines the table header.
	* @param { HTMLElement } node table.
	* @param { Array } crates all works data to show up.
	*/
	#worksTable(node, works) {
		const { materialManagement } = works;

		materialManagement.map(async work => {
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
	* @method - define icons based on each crate type.
	* @param { string } kind - crates type.
	*/
	#setStatusCrateType(kind) {
		switch (kind) {
			case "tubeCrate":
				return `<td><i class="nf nf-md-cylinder"></i></td></tr></tbody>`;
			case "largestCrate":
				return `<td><i class="nf nf-fae-triangle_ruler"></i></td></tr></tbody>`;
			case "sameSizeCrate":
				return `<td><i class="nf nf-fae-equal"></i></td></tr></tbody>`;
			case "noCanvasCrate":
				return `<td><i class="nf nf-md-sync_off"></i></td></tr></tbody>`;
			case "standardCrate":
				return `<td><i class="nf nf-fa-picture_o"></i></td></tr></tbody>`;
		};
	};

	/**
	* @method - defines the table header.
	* @param { HTMLElement } node table.
	* @param { Array } crates all crates data to show up.
	*/
	#cratesTable(node, crates) {
		const { materialManagement } = crates;

		materialManagement.reverse().map(async (crate, i) => {
			const table =			document.createElement('table');
			const content =			document.createElement('tr');
			const headerCrate =		document.createElement('th');
			const type =			this.#setStatusCrateType(crate[1]);

			headerCrate.innerHTML = `<h5>Crate - ${i + 1}</h5>`;
			headerCrate.innerHTML = `
				<th>Crate ${ i + 1 } - ${ type }</th>`
			table.append(headerCrate);
			content.innerHTML =`
				<th>Material</th>
				<th>Prop/Area</th>
				<th>Reusable</th>
				<th>Residual</th>
				<th>Material unit</th>
				<th>Total $</th>`;
			table.appendChild(content);
			table.id = i;
			table.className = 'crate';
			table.ariaHidden = 'true';
			table.role = 'none';
			await this.#cratesOnTable(crate, table);
			node.appendChild(table);
		}, 0);
		return(node);
	};

	/**
	* @method - sets the header table
	* @param { HTMLElement } node TABLE
	*/
	async #setsTableElements(node) {
		const tableFilled = await Promise.resolve(this.#pickCrateUpList())
		.then(data => {
			const { worksReport } = data;
			const result = this.#worksTable(node, worksReport);

			return({ data, result });
		}).then(info => {
			const { data, result } = info;
			const { cratesReport } = data;
			const table = this.#cratesTable(result, cratesReport);

			return({ data, table });
		}).then(result => {
			const { data, table } =			result;
			const { materialManagement } =	data.cratesReport;
			const onCrate =					new Map();
			let strObject;

			materialManagement.map((info, i) => {
				const { layers } =	info[0];
				const collector =	[];

				layers.map(content => {
					const { works } = content;
					collector.push(works[0].work[0]);
				});
				onCrate.set(i, collector);
			}, 0);
			strObject = Object.fromEntries(onCrate);
			globalThis.sessionStorage.setItem('onCrate', JSON.stringify(strObject));
			return(table);
		}).catch(e => console.error(e));
		return(tableFilled);
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
