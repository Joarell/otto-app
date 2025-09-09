// ╭───────────────────────────────────────────────────────────────────────╮
// │ ╭───────────────────────────────────────────────────────────────────╮ │
// │ │ INFO: Here is some functions to work when the page is loaded, and │ │
// │ │          expose another ones to be available to the DOM:          │ │
// │ │                     browserStoragePrepare();                      │ │
// │ │                             crate();                              │ │
// │ │                            clearAll();                            │ │
// │ ╰───────────────────────────────────────────────────────────────────╯ │
// ╰───────────────────────────────────────────────────────────────────────╯

import * as mod from './functions.front.end.mjs'
import { createIDBMaterials, createIDB, createOffLineIDB } from './link.storage.mjs';
import { openDisplay } from '../plotter/layer.controller.mjs'

globalThis.onload = async () => {
	const color =		localStorage.getItem("mode");
	const statusFrame = document.getElementById("status-frame");
	const list =		document.getElementById('statusList');

	sessionStorage.removeItem('onCrate');
	sessionStorage.removeItem('plotter');
	sessionStorage.removeItem('graphics');
	sessionStorage.removeItem('crate');
	list ? list.setAttribute('content', 'reload'):
		statusFrame.append(addPanelInfo());
	browserStoragePrepare();
	color === null ? localStorage.setItem("mode", "light") : false;
	setCheckRadio();
	setModeColor();
	populateRightPanels();
};


export async function populateRightPanels() {
	const fragment1 =	 new DocumentFragment();
	const fragment2 =	 new DocumentFragment();
	const materials =	document.createElement('pack-up');
	const report =		document.createElement('pack-down');
	const paneUp =		document.getElementById('contents1');
	const packDown =	document.getElementById('contents2');

	materials.setAttribute('name', 'select-materials');
	materials.className = 'materials';
	materials.ariaHidden = 'false';
	report.setAttribute('name', 'update-materials');
	report.setAttribute('content', '0');
	report.className = 'update-materials';
	fragment1.appendChild(materials);
	fragment2.appendChild(report);
	paneUp.appendChild(fragment1);
	packDown.appendChild(fragment2);
};


export function addPanelInfo() {
	const fragment =	new DocumentFragment();
	const status =		document.createElement("panel-info");

	status.setAttribute('name', 'status');
	status.id = 'statusList';
	status.class = 'addedStatus';
	status.setAttribute('content', 0);
	return(fragment.appendChild(status));
};


// ╭────────────────────────────────────────────────────────╮
// │ Defines the measure of the works selected by the user. │
// ╰────────────────────────────────────────────────────────╯
if (!localStorage.getItem("metrica")) {
	const metrica =	document.getElementById("cm").value;
	localStorage.setItem("metrica", metrica);
};


export function setUnit() {
	const measure = localStorage.getItem("metrica");
	const check =	confirm(
		"Attention! You are going to change the measurement of the works."
	);

	if (!measure || measure === undefined) {
		localStorage.setItem("metrica",
			document.getElementById("cm").value
		);
		// INFO: This is the trigger to the "create" and clear button.
	}
	else if (check) {
		measure === 'cm - centimeters' ?
			localStorage.setItem("metrica", "in - inches") :
			localStorage.setItem("metrica", "cm - centimeters");
		sessionStorage.setItem('clean', 'reload');
	}
	setCheckRadio();
};


// ╭──────────────────────────────────────────────────────╮
// │ This is the trigger to the "crate" and clear button. │
// ╰──────────────────────────────────────────────────────╯
export const crate = () => {
	browserStoragePrepare();
	mod.crate();
	const element = document.querySelector(".result");

	if (sessionStorage.getItem('codes')) {
		element && element.ariaHidden === 'true' ? openDisplay() : false;
		setTimeout(
			() => globalThis.scroll({ top: 300, behavior: "smooth" }), 1000
		);
	};
};


function clearBrowserStorage() {
	const { mode, metrica, materials } = localStorage;

	localStorage.clear();
	sessionStorage.clear();
	localStorage.setItem("mode", mode);
	localStorage.setItem("metrica", unit);
	localStorage.setItem("metrica", metrica);
	localStorage.setItem("materials", materials);
	mod.countWorks();
	mod.displayCub();
	mod.displayAirCub();
};


export const clearAll = () => {
	const element =		document.querySelector(".result");
	const plotter =		document.getElementById('layers');
	const menu =		document.querySelector(".plotter__menu");
	const status =		document.getElementById("statusList");
	const statusFrame = document.getElementById("status-frame");
	const pane1 = 		document.getElementById("first_pane");
	const pane2 = 		document.getElementById("second_pane");
	const closeDialog =	document.querySelector(".side-menu");

	if (confirm("Do you really want to delete the whole list?")) {
		clearBrowserStorage();
		mod.cleanInputs(true);
		globalThis.document.getElementById("input_estimate").value = "";
		globalThis.document.getElementById("input_estimate").select();
		openCloseDisplay([element, plotter, menu]);
		status.setAttribute('content', undefined);
		statusFrame.removeChild(document.getElementById('statusList'));
		pane1.firstChild ? pane1.removeChild(document.getElementById('first-pane')): 0;
		pane2.firstChild ? pane2.removeChild(document.getElementById('second-pane')): 0;
		statusFrame.append(addPanelInfo());
		closeDialog.getElementsByTagName('panel-info').length > 0 ?
			document.querySelector(".side-menu")
			.lastElementChild.setAttribute('name', 'close') : false;
		document.querySelector(".materials").setAttribute('name', 'select-materials');
		sessionStorage.removeItem('plotter');
		sessionStorage.removeItem('graphics');
		sessionStorage.removeItem('crate');
	};
};


function browserStoragePrepare() {
	const ref =		localStorage.getItem("refNumb");
	let grants =	document.cookie;

	grants = grants.split('=')[1];
	if (ref)
		document.getElementById("input_estimate").value = ref;
	createIDB();
	createIDBMaterials();
	if (grants === "OFF" || grants === "FULL") {
		createOffLineIDB();
		// globalThis.navigator.serviceWorker.register('../sw.mjs');
	};
	return (mod.displayCub() && mod.displayAirCub() && mod.countWorks());
};


function setCheckRadio() {
	const measure = localStorage.getItem("metrica");

	switch (measure) {
		case 'cm - centimeters':
			document.getElementById('cm').checked = true;
			break;
		case 'in - inches':
			document.getElementById('in').checked = true;
			break;
	}
};


function setModeColor() {
	const color =	localStorage.getItem("mode");
	const body =	document.body;

	switch (color) {
		case ('light' || null):
			document.getElementById('light-mode').checked = true;
			body.classList.remove("dark-mode");
			body.classList.toggle("light-mode");
			break;
		case 'dark':
			document.getElementById('dark-mode').checked = true;
			body.classList.remove("light-mode");
			body.classList.toggle("dark-mode");
			break;
	}
}
