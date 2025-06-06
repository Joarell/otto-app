// ╭──────────────────────────────────────────────────────────────────────────╮
// │ ╭──────────────────────────────────────────────────────────────────────╮ │
// │ │ INFO:            These are the second layer of the app:              │ │
// │ │                        function displayAirCub();                     │ │
// │ │                            function crate();                         │ │
// │ │                         function cleanInputs();                      │ │
// │ │                         function parseArtWork();                     │ │
// │ ╰──────────────────────────────────────────────────────────────────────╯ │
// ╰──────────────────────────────────────────────────────────────────────────╯

import ArtWork from "../core2/ArtWork.class.mjs";
import UnitAdapter from "../core2/Unit.Adapter.class.mjs";
import { openDisplay } from "../plotter/layer.controller.mjs";
import { addNewWorksToIndexedDB } from "./link.storage.mjs";


// ╭───────────────────────────────────────────────────────────────────╮
// │ Calls to each change on the localStorage to update the list pane. │
// ╰───────────────────────────────────────────────────────────────────╯
globalThis.onstorage = () => {
	displayCub();
	displayAirCub();
	countWorks();
};


// ╭─────────────────────────────────────────────╮
// │ This function adds the new work and counts. │
// ╰─────────────────────────────────────────────╯
export async function countWorks() {
	const result =	await parseArtWork();
	let counter =	document.getElementById("count");

	result && result.length > 0 ?
		document.getElementById('statusList')
			.setAttribute('content', result.length): false;
	counter.innerText =	result ? "Counting: " + result?.length : "Counting 0";
	return (counter);
};


// ╭─────────────────────────────────────────────────────────────────────╮
// │ This function do the calculation of the cub of all works in meters. │
// ╰─────────────────────────────────────────────────────────────────────╯
export async function displayCub() {
	let result;
	const COMA =	1000;
	const element =	document.getElementById("cub-meter");

	result =		await parseArtWork();
	result =		result?.reduce((sum, val) => {
		return (sum + val.cubed);
	}, 0) ?? 0;
	element.innerText = "Cub: " + ((result * COMA) / COMA).toFixed(3) + "m³";
	return (element);
};


// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Returns a calculation of the cub of all works based on the air companies.│
// ╰──────────────────────────────────────────────────────────────────────────╯
export async function displayAirCub() {
	let result;
	let element;
	let std_msg;
	const COMA =	1000;

	std_msg =		"Air-Cub: ";
	element =		document.getElementById("cub-air");
	result =		await parseArtWork();
	result =		result?.reduce((sum, val) => {
		return (sum + val.cAir);
	}, 0) ?? 0;
	element.innerText = std_msg + ((result * COMA) / COMA).toFixed(3);
	return (element);
};


export function setPanels() {
	const fragment1 =	new DocumentFragment();
	const fragment2 =	new DocumentFragment();
	const pane1 =		document.createElement('panel-info');
	const pane2 =		document.createElement('panel-info');
	const firstPane =	document.getElementById('first_pane');
	const secondPane =	document.getElementById('second_pane');

	while(firstPane.firstChild)
		firstPane.removeChild(firstPane.firstChild);
	while(secondPane.firstChild)
		secondPane.removeChild(secondPane.firstChild);

	pane1.id = 'first-pane';
	pane2.id = 'second-pane';
	pane1.setAttribute('name', 'pane1');
	pane2.setAttribute('name', 'pane2');
	fragment1.append(pane1);
	fragment2.append(pane2);
	firstPane.append(fragment1);
	secondPane.append(fragment2);
};

// ╭──────────────────────────────────────────────────────────────────────────╮
// │ This function is the main function of the webapp. It solves the art work │
// │                         list to possible crates.                         │
// ╰──────────────────────────────────────────────────────────────────────────╯
export async function crate(fetched = false) {
	const estimate =	{};
	const weak =		new WeakSet();
	const e_code =		localStorage.getItem('refNumb') ??
		document.getElementById('input_estimate').value;
	let grant =			document.cookie.split('=')[1];
	let list;
	const cratesAsCm =	await checkMetric();
	const root =	document.querySelector(':root');

	if (fetched || confirm("Ready to crate all works?") && cratesAsCm) {
		setPanels();
		estimate.reference =	e_code;
		list =					await parseArtWork();
		estimate.list =			list.map(art => art.data);
		estimate.crates =		cratesAsCm;
		addNewWorksToIndexedDB(estimate, fetched);

		// addPanelInfoData();
		grant === 'FULL' || grant === 'PLOTTER' || !grant ?
			document.getElementById('crate-layers').disabled = false : 0;
		root.style.setProperty("--layer-state", "block");
	};
	weak.add(estimate);
	return ('Crated');
};


async function addPanelInfoData() {
	const padding =		document.createElement('panel-info');
	const fragment =	new DocumentFragment();
	const sideMenu =	document.querySelector('.side-menu');

	padding.setAttribute('name', 'padding');
	padding.id = 'editCrates';
	fragment.appendChild(padding);
	sideMenu.children.length === 2 ?
		sideMenu.removeChild(sideMenu.lastElementChild): false;
	return(sideMenu.children.length === 1 ? sideMenu.appendChild(fragment): false);
};


//╭───────────────────────────────────────────────────────────────────────────╮
//│ This function cleans all fields and puts the cursor in the code input box.│
//╰───────────────────────────────────────────────────────────────────────────╯
export async function cleanInputs(fetched = false) {
	document.getElementById("input_code").value =	"";
	document.getElementById("input_length").value =	"";
	document.getElementById("input_depth").value =	"";
	document.getElementById("input_height").value =	"";
	const RENDER =	document.getElementById("show-layer");
	const dialog =	document.querySelectorAll('padding-dialog').length;
	const root =	document.querySelector(':root');
	let granted =	document.cookie;

	granted = granted.split('=')[1]
	RENDER && RENDER.hasChildNodes() ? openDisplay() : false;
		globalThis.document.getElementById("input_estimate").select();
		globalThis.document.getElementById("input_code").select();
	countWorks();
	displayCub();
	displayAirCub();
	dialog > 0 ? sessionStorage.setItem("CLOSED", "NOW") : false;
	root.style.setProperty("--layer-state", "none");
};


// ╭──────────────────────────────────────────────────────╮
// │ Converts the localStorage data in to ArtWork object. │
// ╰──────────────────────────────────────────────────────╯
async function parseArtWork() {
	const DB =		localStorage;
	const temp =	[];
	let works;
	const avoid =	[
		"doneList",
		"mode",
		"storage",
		"currency",
		"metrica",
		"refNumb",
		"offResults",
		"FETCHED",
		"materials",
		"packing",
	];

	Object.entries(DB).map(data => {
		!avoid.includes(data[0]) ? temp.push(JSON.parse(data[1])) : false;
	});
	if (temp.length > 0)
		works = temp.map(work => {
			return(new ArtWork(work.code, work.x, work.z, work.y));
		});
	return(works ? works : undefined);
};


// ╭──────────────────────────────────────────────────────────────────────────────╮
// │ Checks the works is in inches and converts to centimeters and solve the list.│
// ╰──────────────────────────────────────────────────────────────────────────────╯
async function checkMetric() {
	const storageUnit =	localStorage.getItem('metrica');
	const UNIT =		storageUnit === 'cm - centimeters' ? 'cm' : 'in';
	const list =		await parseArtWork();
	let crates;

	if (list.length === 0)
		return(alert("Oops! Sounds like you do not added any work yet. Please, try again!"));
	crates = await Promise.resolve(new UnitAdapter(list, UNIT));
	return (crates);
};
