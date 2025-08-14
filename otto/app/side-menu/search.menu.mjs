import { addPanelInfo } from '../front-modules/checkout.mjs';
import * as mod from '../front-modules/functions.front.end.mjs';
import { addNewWorksToIndexedDB } from '../front-modules/link.storage.mjs';


function addPanelFetched() {
	const status =		document.getElementById("statusList");
	const statusFrame =	document.getElementById("status-frame");
	const closeDialog =	document.querySelector(".side-menu");

	statusFrame.removeChild(document.getElementById('statusList'));
	statusFrame.append(addPanelInfo());
	status.setAttribute('content', 'FETCHED')
	closeDialog.getElementsByTagName('panel-info').length > 0 ?
		document.querySelector(".side-menu")
		.lastElementChild.setAttribute('name', 'close') : false;
	mod.displayCub();
	mod.displayAirCub();
	mod.countWorks();
};


// NOTE: the path is different with or without the bundle file.
/**
 * @param {String} doc The reference/document with artwork list.
 */
export async function checkBrowserDB(doc) {
	const workerDB =	new Worker(
		// new URL("../panels/worker.IDB.crates.mjs", import.meta.url),
		new URL("./panels/worker.IDB.crates.mjs", import.meta.url),
		{ type: "module" },
	);
	const checkIDB =	await new Promise((resolve, reject) => {
		workerDB.postMessage(doc);
		workerDB.onmessage = (result) => {
			result !== undefined ? resolve(result.data) : reject(undefined);
		};
	});

	if (checkIDB) {
		document.getElementById("input_estimate").value = doc;
		sessionStorage.setItem("FETCHED", JSON.stringify(checkIDB));
		addPanelFetched();
		setDBFetched([checkIDB]);
		return("IDB data Found.");
	};
	return(false);
};


/**
 * @param {Crater} result The Crater object with the solved list from DB.
 */
async function setDBFetched(result) {
	try {
		if (result?.hasOwnProperty('crates')) {
			document.getElementById("input_estimate").value = result.reference;
			const { materials } = globalThis.sessionStorage;
			globalThis.sessionStorage.clear();
			globalThis.sessionStorage.setItem("FETCHED", JSON.stringify(result, null))
			globalThis.sessionStorage.setItem('materials', materials);
			return(addPanelFetched());
		}
		throw new TypeError("Data not found!");
	} catch (err) {
		return(err);
	};
};


/**
 * @param {String} doc The reference/document with artwork list.
 */
async function fetchDB(doc) {
	const url =		`/api/v1/estimates/${doc}`;
	const headers =	{
		"Content-Type": "application/json; charset=UTF-8",
	};

	if (globalThis.navigator.onLine) {
		const data = await fetch(url, {
			method: "GET",
			headers
		}).then(async estimate => await estimate.json())
		.then(setDBFetched)
		.catch(e => alert(`Search ERROR! \n ${e}`));
		return(data);
	};
};


/**
 * @param {String} doc The reference/document with artwork list.
 */
function regexChecker(data) {
	const regex = /[^-a-z-A-Z-0-9]/g;

	switch (regex.test(data)) {
		case true:
			alert(`Found special character NOT allowed. Please, try again!`);
			return true;
		case false:
			return false;
	}
};


/**
 * @function Gets the reference/document number from the page in order to search.
 */
export async function searchEstimate() {
	const docEstimate =	document.getElementById("estimate_getter").value;
	const update =		memoization(document.getElementById("input_estimate").value);

	if (!regexChecker(docEstimate)) {
		const data = [checkBrowserDB(docEstimate), fetchDB(docEstimate)];

		await Promise.all(data).then(async val => {
			!val[0] && val[1]?.length === 0 ?
				alert(`Document not found! Please, try again.`):
				await Promise.resolve(update(docEstimate))
				.then(async () => {
					if (val[1]?.length > 0) {
						const result = {
							reference: val[1][0].reference_id,
							crates: val[1][0].crates.crates,
							list: val[1][0].works.list
						};
						addNewWorksToIndexedDB(result, true);
					}
					else
						mod.crate(true)
				});
		});
	};
};


/**
 * @function check if the fetch to doc/reference was successful and updates the app status.
 */
function memoization(before) {
	return async (after) => {
		before && before !== after ? mod.cleanInputs(true) : false;
	};
}
