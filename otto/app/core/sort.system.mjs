// ╭─────────────────────────────────────────────────────────────────────────╮
// │ ╭─────────────────────────────────────────────────────────────────────╮ │
// │ │ Here you find the first module and functions to prepare all data to │ │
// │ │                    prepare towards to anothers.                     │ │
// │ │                        function splitInt();                         │ │
// │ │                      function getDimensions();                      │ │
// │ │                         function cubeAll();                         │ │
// │ │                        function quickSort();                        │ │
// │ │                         function zipper();                          │ │
// │ │                     function newArraySorted();                      │ │
// │ ╰─────────────────────────────────────────────────────────────────────╯ │
// ╰─────────────────────────────────────────────────────────────────────────╯

import * as extra_math from "./extras.math.mjs";


//╭─────────────────────────────────────────────────────────────╮
//│ This function get the codes and sizes of the works from the │
//│                       list proveided.                       │
//╰─────────────────────────────────────────────────────────────╯
export function getDimensions(w_list) {
	const dimensions = w_list.map((work) => {
		return(work.arr());
	});
	return (dimensions);
}


//╭───────────────────────────────────────────────────────────────────────╮
//│ This function provides the airfreight cube to each sizes of the works │
//│                          in the Object list.                          │
//╰───────────────────────────────────────────────────────────────────────╯
export function cubeAll(w_list) {
	let result = [];
	let i = 0;
	let dimensions = getDimensions(w_list);

	while (i < dimensions.length) {
		result.push(extra_math.cubing(dimensions[i]));
		i++;
	}
	return result;
}


//╭────────────────────────────────────────────────────────────────────────────╮
//│This function acts sorting the smallest work to the biggest one. The "index"│
//│ argument provides the correct array index where the value is to be sorted. │
//╰────────────────────────────────────────────────────────────────────────────╯
export function quickSort(works, index) {
	if (works.length <= 1)
		return works;

	const left = [];
	const right = [];
	const pivot = [works[0]];
	let i = 0;

	while (i++ < works.length - 1)
		works[i][index] <= pivot[0][index] ?
		left.push(works[i]) :
		right.push(works[i]);
	return (quickSort(left, index).concat(pivot, quickSort(right, index)));
}


//╭───────────────────────────────────────────────────────────────────────────╮
//│This function returns the code and cubed values in new arrays to each code │
//│                         baased on the its sizes.                          │
//╰───────────────────────────────────────────────────────────────────────────╯
export function zipper(codes, cubes, index) {
	let new_arranje = [];

	new_arranje.push(codes[index]);
	new_arranje.push(cubes[index]);
	return new_arranje;
}


//╭──────────────────────────────────────────────────────────────────────────╮
//│ This function applies the zipper function to each code and dimensions to │
//│         provide a new array sorted with the quickSort function.          │
//╰──────────────────────────────────────────────────────────────────────────╯
export function newArraySorted(works) {
	let new_a = [];
	let i = 0;

	while (i < Object.values(works).length) {
		new_a.push(zipper(Object.keys(works), cubeAll(works), i));
		i++;
	}
	return quickSort(new_a, 1);
}
