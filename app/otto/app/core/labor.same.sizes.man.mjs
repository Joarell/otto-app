// ╭─────────────────────────────────────────────────────────────────────╮
// │ ╭─────────────────────────────────────────────────────────────────╮ │
// │ │ These are the functions to support the manager function on this │ │
// │ │                             module.                             │ │
// │ │                      function swapSizes();                      │ │
// │ │                     function largeCrate();                      │ │
// │ │                     function doubleCheck();                     │ │
// │ │                function splitSectionCrateFour();                │ │
// │ │                   function splitSectionTwo();                   │ │
// │ │                function splitSectionCrateOne();                 │ │
// │ │                       function manager();                       │ │
// │ ╰─────────────────────────────────────────────────────────────────╯ │
// ╰─────────────────────────────────────────────────────────────────────╯


// ╭──────────────────────────────────────────────────────────────────────╮
// │ Verify which is the better value to "x", toward to reduce the height │
// │                          measure or depth.                           │
// ╰──────────────────────────────────────────────────────────────────────╯
export function swapSizes (sizes) {
	let x;
	let z;
	let y;
	let swap;

	x = sizes[0];
	z = sizes[1];
	y = sizes[2];
	if (z > x) {
		swap = x;
		x = z;
		z = swap;
	}
	if (y > x) {
		swap = x;
		x = y;
		y = swap;
	}
	sizes = [x, z, y];
	return (sizes);
}


// ╭─────────────────────────────────────────────────────────────────╮
// │ Returns the new crate with more works in side if it's possible. │
// ╰─────────────────────────────────────────────────────────────────╯
export function largeCrate(list, sizes, dimensions) {
	let new_crate;
	let len;
	let x;
	let z;
	let y;

	len = list.length;
	x = dimensions[0];
	z = dimensions[1];
	y = list[len - 2][3];
	while (x >= 0 || len > 0) {
		if (list[len - 2][3] <= y && x >= list[len - 2][1]) {
			x -= list[len - 2][1];
			list.splice(len - 2, 2);
			sizes.splice(sizes.length - 1, 1);
		}
		len -= 2;
		if (list.length <= 0 || sizes.length <= 0 || (x - list[len - 2][1] < 0))
			break;
	}
	if (x < dimensions[0]) {
		x = dimensions[0];
		y += dimensions[2];
		new_crate = [x, z, y];
		dimensions = new_crate;
	}
	return (swapSizes(dimensions));
}


// ╭──────────────────────────────────────────────────────────────────────────╮
// │ Call the largerCrate funtion to define a new crate to arrange more works │
// │                                 in side.                                 │
// ╰──────────────────────────────────────────────────────────────────────────╯
export function doubleCheck(list, sizes, dimensions) {
	let x;
	let z;
	let y;
	let pack;
	let height;
	let i;

	i = 0;
	x = false;
	z = false;
	y = false;
	pack = 5;
	height = 145;
	if (list[i][1] >= dimensions[0]) {
		x = true;
	}
	if (list[i][2] >= dimensions[1] * pack) {
		z = true;
	}
	if (list[i][3] + dimensions[2] <= height) {
		y = true;
	}
	if (!x && !z && y)
		return (largeCrate(list, sizes, dimensions));
	else
		return (dimensions);
}


// ╭─────────────────────────────────────────────────────────────────────────╮
// │ Returns the sizes of the crate dealing with all works with the sizes if │
// │                 the dimensions length if equal to four.                 │
// ╰─────────────────────────────────────────────────────────────────────────╯
export function splitSectionCrateFour(list, dimensions) {
	let x;
	let y;
	let z;
	let definition;
	let i;
	let pack;

	i = 0;
	pack = 5;
	x = dimensions[0] * pack;
	z = list[i][1];
	y = list[i][3];
	while (i < list.length - 2) {
		if (list[i][1] < list[i + 2][1]) {
			z = list[i + 2][1];
			y = list[i + 2][3];
		}
		i += 2;
	}
	if (i > dimensions.length){
		dimensions.splice(dimensions.length - 1, 1);
		list.splice(i, 2);
	}
	else
		dimensions.splice(i, 1);
	definition = [x, z, y];
	definition = swapSizes(definition);
	return (doubleCheck(list, dimensions, definition));
}


// ╭─────────────────────────────────────────────────────────────────────────╮
// │ Returns the sizes of the crate dealing with all works with the sizes if │
// │                 the dimensions length if equal to two.                  │
// ╰─────────────────────────────────────────────────────────────────────────╯
export function splitSectionTwo(list, dimensions) {
	let x;
	let y;
	let z;
	let definition;
	let pack;
	let max_hight;

	pack = 5;
	max_hight = 145;
	x = dimensions[0] * pack;
	list[0][1] > list[2][1] ? z = list[0][1] : z = list[2][1];
	if (list[0][3] + list[2][3] < max_hight)
		y = list[0][3] + list[2][3];
	else {
		z = list[0][1] + list[2][1];
		list[0][3] > list[2][3] ? y = list[0][3] : y = list[2][3];
	}
	list.splice(0, 4);
	dimensions.splice(0, 2);
	definition = [x, z, y];
	return (swapSizes(definition));
}


// ╭─────────────────────────────────────────────────────────────────────────╮
// │ Returns the sizes of the crate dealing with all works with the sizes if │
// │                 the dimensions length if equal to one.                  │
// ╰─────────────────────────────────────────────────────────────────────────╯
export function splitSectionCrateOne(list, dimensions) {
	let x;
	let y;
	let z;
	let definition;
	let pack;

	pack = 5;
	x = list[1] * pack;
	z = list[0][1];
	y = list[0][3];
	list.splice(0, 2);
	dimensions.splice(0, 2);
	definition = [x, z, y];
	return (swapSizes(definition));
}


// ╭─────────────────────────────────────────────────────────────────────────╮
// │ It does the redirection to the correct function splitSectin base on the │
// │                      list and dimensions provided.                      │
// ╰─────────────────────────────────────────────────────────────────────────╯
export function manager(list, dimensions) {
	let copy;
	let result;

	if (dimensions.length === 1)
		return (splitSectionCrateOne(list, dimensions));
	else if (dimensions.length <= 3) {
		if (dimensions.length === 3) {
			copy = Array.from(dimensions);
			result = splitSectionCrateFour(list, copy);
		}
		else if (copy === dimensions)
			return (splitSectionTwo(list, dimensions));
		return (splitSectionTwo(list, dimensions));
	}
	else (dimensions.length >= 4)
		return (splitSectionCrateFour(list, dimensions));
}
