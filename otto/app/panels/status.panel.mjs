// ╭───────────────────────────────────────────────────────────────────╮
// │ Calls to each change on the localStorage to update the list pane. │
// ╰───────────────────────────────────────────────────────────────────╯
function changeMode(color) {
	const body = document.body.classList;

	body.remove("light-mode");
	body.remove("dark-mode");
	return color === "dark" ? body.add("dark-mode") : body.add("light-mode");
};

function restorePanel() {
	const list =	localStorage;
	const element =	document.createElement("table");
	const plot =	document.getElementById("status");
	const avoid =	[
		"refNumb",
		"metrica",
		"mode",
		"layers",
		"numLyaer",
		"pane1",
		"pane2",
	];
	const codes =	getOrder();
	let metric;
	let works =	Object.entries(list).filter((data) => {
		if (!avoid.includes(data[0])) return data[1];
	});

	if (works.length === 0) return;
	list.getItem("metrica") === "in - inches"
		? (metric = "in")
		: (metric = "cm");
	works = works.map((art) => JSON.parse(art[1]));
	createHeader(element);
	if (codes)
		codes.reverse().map((code) => {
			let work;

			work = JSON.parse(list.getItem(code));
			work = Object.values(work);
			element.innerHTML += work
				.map((item, index) => {
					if (!item) return;
					return index === 0 ? `<tbody><tr><td>${item}</td>`
						: index === 3 ? `<td>${item}</td><td>${metric}</td></tr></tbody>`
						: `<td>${item}</td>`;
				}, 0)
				.join("");
		});
	else
		works.map((art) => {
			if (art?.hasOwnProperty("code")) {
				const { code, x, z, y } = art;
				const line = `<tbody><tr><td>${code}</td>
					<td>${x}</td>
					<td>${z}</td>
					<td>${y}</td>
					<td>${metric}</td></tr></tbody>
				`;
				element.innerHTML += line;
			}
		});
	plot.appendChild(element);
};

export function statusTablePopulate(data) {
	let metric;
	let codes;
	const doc =		JSON.parse(data);
	const mode =	localStorage.getItem("mode");
	const { reference, list } = doc;

	localStorage.getItem("metrica") === "in - inches"
		? (metric = "in - inches")
		: (metric = "cm - centimeters");
	localStorage.clear();
	codes = list.map((art, index) => {
		const { code } = art;
		localStorage.setItem(code, JSON.stringify(art));
		return [index, code];
	}, 0);
	sessionStorage.setItem("codes", JSON.stringify(codes));
	localStorage.setItem("refNumb", reference);
	localStorage.setItem("metrica", metric);
	localStorage.setItem("mode", mode);
};

// ╭────────────────────────────────────────────────────╮
// │ Returns the HTML table with all works in the list. │
// ╰────────────────────────────────────────────────────╯
export async function statusTable(plot, table = false) {
	const list =		localStorage;
	const codes =		getOrder();
	const crateBTN =	document.getElementById('crate-btn');

	let metric;
	let element =	document.createElement("table");

	list.getItem("metrica") === "in - inches"
		? (metric = "in")
		: (metric = "cm");
	createHeader(element);
	element.id = "works-list";
	if (table && codes) {
		crateBTN.disabled ? crateBTN.disabled = false: false;
		element = 		plot;
		element.id =	"works-list";
		const last =	codes.at(-1);
		codes.map((code) => {
			let work;

			work = JSON.parse(list.getItem(code));
			work = Object.values(work);
			element.innerHTML += work
				.map((item, index) => {
					if (!item || last !== code)
						return;
					return index === 0
						? `<tbody><tr><td>${item}</td>`
						: index === 3
						? `<td>${item}</td><td>${metric}</td></tr></tbody>`
						: `<td>${item}</td>`;
				}, 0)
				.join("");
		});
	};
	return(table ? element : plot.appendChild(element));
};

function getOrder() {
	const session = JSON.parse(sessionStorage.getItem("codes"));
	const allCodes = session ? session.map((code) => code[1]) : false;
	return allCodes ? allCodes : false;
};

// ╭───────────────────────────────────────────────────────────────────────╮
// │ This is the header creator when the page or localStorage are updated. │
// ╰───────────────────────────────────────────────────────────────────────╯
export function createHeader(table) {
	const head = document.createElement("tr");

	while (table.firstChild)
		table.removeChild(table.firstChild);
	head.innerHTML = `
		<tr>
			<th>CODE</th>
			<th>LENGTH</th>
			<th>DEPTH</th>
			<th>HEIGHT</th>
			<th>UNIT</th>
		</tr>
	`;
	return table.appendChild(head);
};
