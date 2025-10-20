//╭───────────────────────────────────────────────────────────────────────────╮
//│ ╭───────────────────────────────────────────────────────────────────────╮ │
//│ │ INFO:          These are the functions to the first layer:            │ │
//│ │                           Function checkWork();                       │ │
//│ │                           Function regValid();                        │ │
//│ │                          Function catchWork();                        │ │
//│ │                         Function catchRemove();                       │ │
//│ │                         Function checkReference();                    │ │
//│ │                         Function intParser();                         │ │
//│ ╰───────────────────────────────────────────────────────────────────────╯ │
//╰───────────────────────────────────────────────────────────────────────────╯

import ArtWork from "../core2/ArtWork.class.mjs";
import * as mod from "./functions.front.end.mjs";

function definedPackingMaterials() {
	const packs = JSON.parse(localStorage.getItem("packing"));
	const materials = JSON.parse(localStorage.getItem("materials"));
	const filtered = [];

	if (!packs || packs.length === 0) return false;
	packs.filter((type) => {
		filtered.push(materials.find((opts) => opts[0] === type).flat());
	});
	return filtered;
}

// ╭────────────────────────────────────────────────────────────────────────╮
// │ This function validates all inputs of the fields provided by the user. │
// ╰────────────────────────────────────────────────────────────────────────╯
export function checkWork(work) {
	const checked = regValid(intParser([work[1], work[2], work[3]]));
	const regex = /[^-a-z-A-Z-0-9]/g;
	const estimate = document.getElementById("input_estimate").value;
	const materials = definedPackingMaterials();
	let i = 0;

	if (!materials) {
		alert("Please, select some packing material to apply to the artwork.");
		return "material";
	}
	if (regex.test(work[0]) || regex.test(estimate)) {
		alert(`Found special character NOT allowed on "Work code",\
		or "Estimate" input. Please, try again!`);
		return false;
	}
	for (i in localStorage.key(i)) {
		if (work[0] === localStorage.key(i)) {
			alert(`${work[0]} already added to the list. Please, try again`);
			return false;
		}
	}
	checkReference();
	return Array.isArray(checked)
		? new ArtWork(work[0], checked[0], checked[1], checked[2], materials)
		: false;
}

// ╭──────────────────────────────────────────────────────╮
// │ This function converts all string inputs in integer. │
// ╰──────────────────────────────────────────────────────╯
export function intParser(dimensions) {
	const result = dimensions.map((size) => {
		return parseInt(size);
	});
	return result;
}

// ╭────────────────────────────────────────────────────────────────────╮
// │ Regular expression function to validate if all inputs are numbers. │
// ╰────────────────────────────────────────────────────────────────────╯
export function regValid(sizes_parsed) {
	let i = 2;
	const regex = /^[0-9.0-9]{1,7}$/;

	while (--i >= 0) {
		if (!regex.test(sizes_parsed[i])) {
			switch (i) {
				case 2:
					alert(`The provide HEIGHT is not a valid number.\
					Please, try again!`);
					return false;
				case 1:
					alert(`The provide DEPTH is not a valid number.\
					Please, try again!`);
					return false;
				case 0:
					alert(`The provide LENGTH is not a valid number.\
					Please, try again!`);
					return false;
			}
		}
	}
	return sizes_parsed;
}

function selectEmptyinput() {
	const IDS = [
		"input_estimate",
		"input_code",
		"input_length",
		"input_depth",
		"input_height",
	];
	let aux = false;

	IDS.find((field) => {
		const input = document.getElementById(field);
		console.log(input.value);
		if (!input.value && !aux) {
			aux = true;
			return input.select();
		}
	});
}

//╭───────────────────────────────────────────────────────────────────────────╮
//│   This function start the verification of the inputs in the first step.   │
//│Secondly, calls the other functions from the modules when all verifications│
//│                           were done and right.                            │
//╰───────────────────────────────────────────────────────────────────────────╯
export async function catchWork() {
	const estimate = document.getElementById("input_estimate").value;
	const cod = document.getElementById("input_code").value;
	const length = document.getElementById("input_length").value;
	const depth = document.getElementById("input_depth").value;
	const height = document.getElementById("input_height").value;
	let tmp;

	if (!estimate)
		return alert('Attention! Please, add the "Doc:" reference field!');
	switch (cod && length && depth && height) {
		case "":
			alert(`Oops! Do not forget to fill each field. Please, try again!`);
			return selectEmptyinput();
		// return (mod.cleanInputs());
	}
	tmp = checkWork([cod, length, depth, height]);
	if (tmp && tmp !== "material") {
		await orderWorks(tmp.data);
		localStorage.setItem(tmp.data.code, JSON.stringify(tmp.data));
		localStorage.setItem("storage", "art-work");
		mod.countWorks();
		mod.displayAirCub();
		mod.displayCub();
		mod.cleanInputs();
	}
	return !tmp || tmp === "material" ? 0 : mod.cleanInputs();
}

// ╭─────────────────────────────────────────────────────────────────╮
// │ This is the function to find the work in the list to remove it. │
// ╰─────────────────────────────────────────────────────────────────╯
export function catchRemove() {
	const work = prompt("Please enter the work code to be removed:", "code?");

	if (localStorage.getItem(work)) {
		orderRemove(work);
		localStorage.removeItem(work);
		mod.countWorks();
		mod.displayAirCub();
		mod.displayCub();
	} else if (work === null) return mod.cleanInputs();
	else alert(`"${work}" was not found in the list. Please, try again!`);
	localStorage.setItem("storage", "art-work");
	return mod.cleanInputs();
}

// ╭─────────────────────────────────────────────────────────────────╮
// │ This functions checks if the reference has changed by the user. │
// ╰─────────────────────────────────────────────────────────────────╯
export function checkReference() {
	const ref = localStorage.getItem("refNumb");
	const actual = document.getElementById("input_estimate").value;

	if (ref) {
		if (ref !== actual) {
			if (confirm("ATTENTION! The refNumb has changed")) {
				localStorage.removeItem("refNumb");
				localStorage.setItem("refNumb", actual);
				document.getElementById("input_estimate").value = actual;
			} else document.getElementById("input_estimate").value = ref;
		}
	}
	localStorage.setItem("refNumb", actual);
}

async function orderWorks({ code }) {
	const storage = sessionStorage;
	const array = JSON.parse(storage.getItem("codes"));
	let num;

	if (!array) return storage.setItem("codes", JSON.stringify([[0, code]]));
	num = Number.parseInt(array[array.length - 1]);
	num = num + 1;
	array.push([num, code]);
	return storage.setItem("codes", JSON.stringify(array));
}

function orderRemove(code) {
	const session = sessionStorage;
	const codes = JSON.parse(session.getItem("codes"));
	let i = 0;

	while (codes[i][1] !== code && i <= codes.length) i++;
	codes.splice(i, 1);
	session.setItem("codes", JSON.stringify(codes));
}
