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
		const estimate =				await this.#grabArtWorksOnIDB();

		if(!estimate)
			return(false) ;
		const { list, crates } =	estimate;
		const artWorkParser =		(info) => {
			const { code, x, z, y, packing } = info;
			return(new ArtWork(code, x, z, y, packing));
		};

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
				<td>${(counter).toFixed(2)}</td>
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

			if(!type)
				return;
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
		const finalCost =	(cost).toFixed(2);

		if (type === 'works')
			subTotal.innerHTML = `
				<td>Subtotal:</td>
				<td>-</td>
				<td>-</td>
				<td>-</td>
				<td>-</td>
				<td>-</td>
				<td>$ ${finalCost}</td>`;
		else
			subTotal.innerHTML = `
				<td>Subtotal:</td>
				<td>-</td>
				<td>-</td>
				<td>-</td>
				<td>-</td>
				<td>$ ${finalCost}</td>`;
		return(subTotal);
	};

	/**
	* @method - sets all the packing materials used on the artWork.
	* @param { ArtWork } artWork - the artWork with all data.
	* @param { HTMLElement } table
	*/
	async #materialsOnTable(artWork, table) {
		if(!Array.isArray(artWork))
			return(table);
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
			const usage = checkLength === i ?
				`<td class="materialReusable" data-name='Reused from work: ${reuse[i][2]}'>${residual[i]}%</td>`:
				`<td>${ residual[0] < 1 ? (residual[0] * 100).toFixed(0): 0 }%</td>`;

			content.innerHTML
				= `
				<td>${ info[0] }</td>
				<td>${ demand} m²</td>
				<td>${ info[1]}%</td>
				<td>${ reuse[i][1] ? "Yes": "No" }</td>
				${ usage }
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
		if(!info)
			return;
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
				<td>${ (+area / 100).toFixed(3) } m² </td>
				<td> ${ info } </td>
				<td>${ counter }</td>`
			frag.appendChild(row);
		});
		table.appendChild(frag);
		return(table);
	};

	/**
	* @method - adds the extra crate material for cutting info.
	* @param { HTMLElement } table crate data.
	* @param {Object} param1
	* @param { Array } param1.padding
	* @param { Array } param1.faces
	* @param { Array } param1.frame
	* @param { number } layers current layer
	*/
	#crateExtraMaterialCut(table, { padding, faces, frame }, layers) {
		const metric =	localStorage.getItem('metrica').split('-')[0];
		const content =	document.createElement('tr');
		const frag =	new DocumentFragment();
		const span =	document.createElement('h6');
		let extra =		false;

		content.innerHTML =`
			<th>Material</th>
			<th>Extra face</th>
			<th>Extra Side</th>
			<th>Extra top/bottom</th>`;
		table.appendChild(span);
		table.appendChild(content);
		[ padding, faces, frame ].map(data => {
			const row =	document.createElement('tr');
			const info = this.#correctCutMaterials(data, layers);
			let first;
			let second;
			let third;

			if(!info)
				return;
			const { frontBack, sides, upDown, name} = info;
			const faces =		[];
			const rightLeft =	[];
			const topBottom =	[]

			if(frontBack.extraX && frontBack.extraY) {
				faces.push(frontBack.extraX)
				faces.push(frontBack.extraY)
			}
			else if(frontBack.extraX && !frontBack.extraY) {
				faces.push(frontBack.extraX)
				faces.push(frontBack.y)
			}
			else if(!frontBack.extraX && frontBack.extraY) {
				faces.push(frontBack.x)
				faces.push(frontBack.extraY)
			}
			if(sides.extraY) {
				rightLeft.push(sides.z);
				rightLeft.push(sides.extraY);
			};
			if(upDown.extraX) {
				topBottom.push(upDown.extraX);
				topBottom.push(upDown.z);
			}
			first = faces.length ?
				`<td>${ (frontBack.x).toFixed(2) } x ${ (frontBack.y).toFixed(2) } - ${ metric } </td>`: 0;
			second = rightLeft.length ?
				`<td>${ (sides.z).toFixed(2)} x ${ (sides.y).toFixed(2) } - ${ metric }</td>`: 0;
			third = topBottom.length ? `<td>${ (upDown.x).toFixed(2)} x ${ (upDown.z).toFixed(2) } - ${ metric }</td>`: 0;
			if(!first || !second || !third)
				return;
			!extra ? extra = true: 0;
			row.innerHTML = `
				<td>${ name }</td>
				${ first }
				${ second }
				${ third }`;
			frag.appendChild(row);
		});
		if(extra) {
			table.appendChild(frag);
			table.appendChild(document.createElement('h6'));
		};
		return(extra ? table: table.removeChild(table.lastElementChild));
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

		cuts.innerText = `Crate Cut materials:`;
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
			const info = this.#correctCutMaterials(data, layers);

			if(!info)
				return;
			const { frontBack, sides, upDown, name} = info;

			row.innerHTML = `
				<td>${ name }</td>
				<td>${ (frontBack.x).toFixed(2) } x ${ (frontBack.y).toFixed(2) } - ${ metric } </td>
				<td>${ (sides.z).toFixed(2)} x ${ (sides.y).toFixed(2) } - ${ metric }</td>
				<td>${ (upDown.x).toFixed(2)} x ${ (upDown.z).toFixed(2) } - ${ metric }</td>`;
			frag.appendChild(row);
		});
		table.appendChild(frag);
		this.#crateExtraMaterialCut(table, { padding, faces, frame }, layers);
		return(crate[1] === 'largestCrate' ? this.#largestCrateTable(crate, table): table);
	};

	/**
	* @method - fill all data to the table.
	* @param { Array } crate all crates data content.
	* @param { HTMLElement } table
	*/
	#cratesOnTable(crate, table) {
		const material =	JSON.parse(localStorage.getItem('crating'));
		const cost =		[];

		material.map(info => {
			const content =		document.createElement('tr');
			const data =		crate[2].get(info);

			if(!data)
				return;
			const { type, counter, residual, area, totalCost } = data;

			cost.push(residual === 'number' ? Math.ceil(totalCost) : totalCost);
			const usage = typeof residual === 'number' ?
				`<td>${ (+residual / 100).toFixed(3) } m²</td>`:
				`<td class="materialReusable" data-name='${residual}'> 0 m²</td>`;

			content.innerHTML = `
				<td>${ type }</td>
				<td>${ (area).toFixed(3) } m²</td>
				<td>${ residual > 100 ? 'Yes': 'No' }</td>
				${ usage }
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
	async #worksTable(node, works) {
		const { materialManagement } = works;
		const metric = localStorage.getItem('metrica').split('-')[0];

		materialManagement.map(async work => {
			if(!work)
				return;
			const table =		document.createElement('table');
			const content =		document.createElement('tr');
			const art =			JSON.parse(localStorage.getItem(work[0]));
			const headerWork =	`
				<th class="report-table" colspan="1" rowspan="1">${art.code}</th>
				<th class="report-table" colspan="6" rowspan="1">${art.x} x ${art.z} x ${art.y} - ${metric}</th>`;

			content.innerHTML =`
				<th>Type</th>
				<th>Demand</th>
				<th>Prop/Area</th>
				<th>Reusable</th>
				<th>Residual</th>
				<th>Material unit</th>
				<th>Total $</th>`;
			table.innerHTML = headerWork;
			table.appendChild(content);
			table.id = art.code;
			table.ariaHidden = 'true';
			table.role = 'table';
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
				return `<i class="nf nf-md-cylinder"></i>`;
			case "largestCrate":
				return `<i class="nf nf-fae-triangle_ruler"></i>`;
			case "sameSizeCrate":
				return `<i class="nf nf-fae-equal"></i>`;
			case "noCanvasCrate":
				return `<i class="nf nf-md-sync_off"></i>`;
			case "standardCrate":
				return `<i class="nf nf-fa-picture_o"></i>`;
		};
	};

	/**
	* @method - defines the table header.
	* @param { HTMLElement } node table.
	* @param { Array } crates all crates data to show up.
	*/
	async #cratesTable(node, crates) {
		const { materialManagement } = crates;
		const metric = localStorage.getItem('metrica').split('-')[0];

		materialManagement.map(async (crate, i) => {
			const table =			document.createElement('table');
			const content =			document.createElement('tr');
			const type =			this.#setStatusCrateType(crate[1]);
			const { finalSize } =	crate[0];
			const headerCrate =	`
				<th class="report-table" colspan="1" rowspan="1">Crate  ${i + 1} - ${type}</th>
				<th class="report-table" colspan="5">${finalSize[0]} x ${finalSize[1]} x ${finalSize[2]} - ${metric}</th>`;

			content.innerHTML =`
				<th>Material</th>
				<th>Prop/Area</th>
				<th>Reusable</th>
				<th>Residual</th>
				<th>Material unit</th>
				<th>Total $</th>`;
			table.innerHTML = headerCrate;
			table.appendChild(content);
			table.id = i;
			table.className = 'crate';
			table.ariaHidden = 'true';
			table.role = 'table';
			await this.#cratesOnTable(crate, table);
			node.appendChild(table);
		}, 0);
		return(node);
	};

	/**
	* @method - adds the layer data.
	* @param { Array } gap - foam sizes.
	* @param { Object } data - all the gaps data.
	* @param { Array } material - information.
	* @param { HTMLElement } table.
	*/
	#fillLayerTable(table, data, gap, material) {
		if(!gap)
			return(table);
		const metric =		localStorage.getItem('metrica').split('-')[0];
		const content =		document.createElement('tr');
		const sizes =		data.total ?
			`<td> ${ gap[0] } x ${ gap[1] } - ${ metric }</td>`: `<td>N/A</td>`;
		const area =		data.total ?
			`<td> ${ (gap[0] * gap[1] / 100).toFixed(2) } m²</td>`: `<td>0 m²</td>`;

		content.innerHTML = `
			<td> ${ material[0] }</td>
			<td> ${ data.highestZ[0] }</td>
			${ area }
			${ sizes }
			<td> ${ material.at(-1) }</td>`;
		table.appendChild(content);
		return(table);
	};

	/**
	* @method - defines the layer table for all empty gaps to fill.
	* @param { HTMLElement } node table.
	* @param { Array } data all gaps mapped to each crate's layer.
	*/
	#layerTable(node, data, crateNumb) {
		const { results, calcLayer } =	data[2].get('gaps');
		const avoid =	[ 'tubeCrate', 'noCanvasCrate' ];
		const header =	document.createElement('h4');
		let head =		false;

		if(avoid.includes(data[1]))
			return(node);
		header.innerHTML = `All the layer empty gaps: <i class="nf nf-md-layers_outline"></i>`;
		header.id = 'layers';
		node.removeChild(node.firstChild);
		calcLayer.map((info, i) => {
			if(!info.total)
				return;
			const table =			document.createElement('table');
			const content =			document.createElement('tr');
			const headerLayer =		document.createElement('th');
			const type =			this.#setStatusCrateType(data[1]);

			if(!head){
				table.append(header);
				head = true;
			};
			headerLayer.innerHTML = `<h5>Layer${ i + 1 } - ${ type }</h5>`;
			table.append(headerLayer);
			content.innerHTML =`
				<th>Material</th>
				<th>High thickness</th>
				<th>Prop/Area</th>
				<th>Sizes</th>
				<th>Material Unit</th>`;
			table.append(content);
			table.id = crateNumb;
			table.className = `layer${i + 1}`;
			table.ariaHidden = 'true';
			table.role = 'none';
			Array.isArray(info.sizes[0]) ?
				info.sizes.map(gap => this.#fillLayerTable(table, info,  gap, results[i])):
				this.#fillLayerTable(table, info,  info.sizes, results[i]);
			table.appendChild(document.createElement('h6'));
			node.appendChild(table);
		}, 0);
		return(node);
	};

	/**
	* @method - sets the works on each crate -> layer.
	*/
	#worksCrateLocation(data) {
		const onCrate =	new Map();
		let strObject;

		data.map((info, i) => {
			const { layers } =	info[0];

			layers.map(content => {
				const { works } = content;
				works.map(art => onCrate.set(art.work[0], i));
			});
		}, 0);
		strObject = Object.fromEntries(onCrate);
		globalThis.sessionStorage.setItem('onCrate', JSON.stringify(strObject));
	};

	/**
	* @method - sets the header table
	* @param { HTMLElement } node TABLE
	*/
	async #setsTableElements(node) {
		if(!this.#materialReport)
			return(false)
		const { worksReport } = this.#materialReport;
		const { cratesReport } = this.#materialReport;
		const { materialManagement } =	cratesReport;

		await this.#worksTable(node, worksReport);
		await this.#cratesTable(node, cratesReport);
		materialManagement.map((data, i) => this.#layerTable(node, data, i + 1), 0);
		this.#worksCrateLocation(materialManagement);
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
		const info =		await this.#pickCrateUpList().catch(e => e);

		if(!info || !await this.#setsTableElements(table))
			return(false)
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
