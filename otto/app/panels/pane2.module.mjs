// ╭────────────────────────────────────────────────────╮
// │ This is the trigger activated by the create button. │
// ╰────────────────────────────────────────────────────╯
function changeMode(color) {
	const body = document.body.classList;

	body.remove("light-mode");
	body.remove("dark-mode");
	return color === "dark" ? body.add("dark-mode") : body.add("light-mode");
}

// ╭───────────────────────────────────────────────────────────────────────╮
// │ This is the header creator when the page or localStorage are updated. │
// ╰───────────────────────────────────────────────────────────────────────╯
export function createHeader(table) {
	const head = document.createElement("tr");

	while (table.firstChild) table.removeChild(table.firstChild);
	head.innerHTML = `
		<tbody><tr>
			<th>INFO</th>
			<th>DATA</th>
			<th>LENGTH</th>
			<th>DEPTH</th>
			<th>HEIGHT</th>
			<th>UNIT</th>
			<th>STATE</th>
		</tr></tbody>
	`;
	return table.appendChild(head);
}

async function getIDBDataBrowser(ref) {
	const WORKER = new Worker(
		new URL("./worker.IDB.crates.mjs", import.meta.url),
		{ type: "module" },
	);
	let request;

	WORKER.postMessage(ref);
	request = await new Promise((resolve, reject) => {
		WORKER.onmessage = (res) => {
			const { data } = res;
			data?.reference === ref ? resolve(data) : reject(res);
		};
	});
	return(request);
}

function layerInterface(layer, num, unit) {
	if (!Array.isArray(layer))
		return;
	const content = layer.map((info, i) => {
		switch (i) {
			case 0:
				return `<tbody><tr><td>LAYER-${num}</td><td>${info}</td>`;
			case 1:
				return `<td>${info}</td>`;
			case 2:
				return `<td>${info}</td>`;
			case 3:
				return `<td>${info}</td>`;
			case 4:
				return layer[i + 1] !== undefined ? `<td>${unit}</td>`
					: `<td>${unit}</td><td>N/A</td></tr></tbody>`;
			case 5:
				return `<td>${info}</td></tr></tbody>`;
		}
	}, 0).join("");
	return(content);
}

function addSameSizeLayerWorksLine({ works }, table, unit, create) {
	const AUX =		Array.isArray(works[0][0]) ? works[0] : works;
	const PAD =		28;
	const STACKED =	~~(+AUX[0][3] + +AUX[1][3] + PAD) === create[2];
	let tmp =		[];
	let count =		1;

	if (STACKED) {
		AUX.map((art, counter) => {
			tmp.push(art);
			if (counter % 2 === 1) {
				table.innerHTML += tmp.map((work) => {
						return layerInterface(work, count, unit);
					}).join("");
				tmp = [];
				count++;
			}
		}, 0);
	} else {
		AUX.map((art, count) => {
			table.innerHTML += layerInterface(art, count + 1, unit);
		});
	}
	return table;
}

function addHTMLLayerWorksLine({ works }, table, unit, kind, create) {
	let layer;
	let i = 0;

	while (i < works.length) {
		if (!Array.isArray(works[i])) {
			for (layer in works[i]) {
				table.innerHTML += works[i][layer].map(info => {
					if (!Array.isArray(info[0]))
						return layerInterface(info, i + 1, unit);
					return(info.map((peace, j) => {
						if (j % 2 === 0)
							return(layerInterface(peace, i + 1, unit));
					}, 0).join(""));
				}).join("");
			};
		} else if (kind === "sameSizeCrate") {
			return addSameSizeLayerWorksLine({ works }, table, unit, create);
		} else if (Array.isArray(works[i])) {
			works.map((art, count) => {
				table.innerHTML += layerInterface(art, count + 1, unit);
			});
			return table;
		}
		i++;
	}
	return table;
}

function airPortStatus(create, sizeUnit) {
	const MAXX = sizeUnit === "cm" ? 300 : 118.11; // INFO: cm and in max size
	const MAXZ = sizeUnit === "cm" ? 200 : 78.74; // INFO: cm and in max size
	const MAXY = sizeUnit === "cm" ? 165 : 64.96; // INFO: cm and in max size
	const X = create[0];
	const Z = create[1];
	const Y = create[2];

	return X <= MAXX && Z <= MAXZ && Y <= MAXY ? "PAX" : "CARGO";
}

function setStatusCrateType(kind, unit) {
	switch (kind) {
		case "tubeCrate":
			return `<td>${unit}</td><td><i class="nf nf-md-cylinder"></i></td></tr></tbody>`;
		case "largestCrate":
			return `<td>${unit}</td><td><i class="nf nf-fae-triangle_ruler"></i></td></tr></tbody>`;
		case "sameSizeCrate":
			return `<td>${unit}</td><td><i class="nf nf-fae-equal"></i></td></tr></tbody>`;
		case "noCanvasCrate":
			return `<td>${unit}</td><td><i class="nf nf-md-sync_off"></i></td></tr></tbody>`;
		case "standardCrate":
			return `<td>${unit}</td><td><i class="nf nf-fa-picture_o"></i></td></tr></tbody>`;
	}
}

function addHTMLTableLine({ crates }, table, kind) {
	const UNIT = localStorage.getItem("metrica") === "cm - centimeters" ? "cm" : "in";

	crates.map((done, i) => {
		if (i % 2 === 0) {
			const port = airPortStatus(done, UNIT);
			table.innerHTML += done
				.map((info, i) => {
					switch (i) {
						case 0:
							return `<tbody><tr><td>${port}</td><td>CREATE</td><td>${info}</td>`;
						case 1:
							return `<td>${info}</td>`;
						case 2:
							return `<td>${info}</td>`;
						case 3:
							return setStatusCrateType(kind, UNIT);
					}
				}, 0)
				.join("");
		} else
			addHTMLLayerWorksLine(crates[i], table, UNIT, kind, crates[i - 1]);
	}, 0);
}

// ╭───────────────────────────────────────────────────────────╮
// │ Returns all crates from the indexedDB or gets from cloud. │
// ╰───────────────────────────────────────────────────────────╯
export async function showCrates2(estimate, pane) {
	const { crates } =	await getIDBDataBrowser(estimate);
	const element =		document.createElement("table");
	let key;

	if (!crates)
		return;
	createHeader(element);
	for (key in crates) {
		if (crates[key].hasOwnProperty("crates")) {
			crates[key].crates.length > 0
				? addHTMLTableLine(crates[key], element, key)
				: false;
		}
	}
	while(pane.firstChild)
		pane.removeChild(pane.firstChild)
	return(pane.appendChild(element));
}
