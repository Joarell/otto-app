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
			<th>STATUS</th>
		<th>TYPE</th>
			<th>LENGTH</th>
		<th>DEPTH</th>
			<th>HEIGHT</th>
		<th>CUB</th>
			<th>UNIT</th>
		</tr></tbody>
	`;
	return table.append(head);
}

async function getIDBINFO(ref) {
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
	return request;
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

function addHTMLTableLine(data, unit, table) {
	const { crates } = data;

	crates.map((create, i) => {
		if (i % 2 === 0) {
			const port = airPortStatus(create, unit);
			table.innerHTML += create
				.map((info, i) => {
					switch (i) {
						case 0:
							return `<tbody><tr><td>${port}</td><td>CREATE</td><td>${info}</td>`;
						case 1:
							return `<td>${info}</td>`;
						case 2:
							return `<td>${info}</td>`;
						case 3:
							return `<td>${info}</td><td>${unit}</td></tr></tbody>`;
					}
				}, 0)
				.join("");
		}
	}, 0);
}

// ╭───────────────────────────────────────────────────────────╮
// │ Returns all crates from the indexedDB or gets from cloud. │
// ╰───────────────────────────────────────────────────────────╯
export async function showCrates1(estimate, pane) {
	const { crates } =	await getIDBINFO(estimate);
	const element =		document.createElement("table");
	let key =			0;
	let metric;

	if (!crates)
		return;
	localStorage.getItem("metrica") === "in - inches"
		? (metric = "in")
		: (metric = "cm");
	createHeader(element);
	for (key in crates) {
		if (crates[key].hasOwnProperty("crates")) {
			crates[key].crates.length > 0 ?
				addHTMLTableLine(crates[key], metric, element)
				: false;
		}
	}
	// sessionStorage.removeItem("pane1");
	return(pane.appendChild(finishedRender(element, crates)));
};

function finishedRender(table, info) {
	table.innerHTML += `<tr>
		<td>-</td>
		<td>-</td>
		<td>-</td>
		<td>-</td>
		<td>-</td>
		<td>-</td>
		<td>-</td>
		</tr>`;
	table.innerHTML += `<tr>
		<td>AIRPORT</td>
		<td>PAX</td>
		<td>${info.whichAirPort[0].PAX}</td>
		</tr>`;
	table.innerHTML += `<tr>
		<td>AIRPORT</td>
		<td>CARGO</td>
		<td>${info.whichAirPort[1].CARGO}</td>
		</tr>`;
	table.innerHTML += `<tr>
		<td>Total Cub:</td>
		<td>${info.airCubTotal}</td>
		</tr>`;
	return(table);
};
