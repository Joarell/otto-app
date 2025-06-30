export default class CrateMaker {
	#layers;

	constructor(layers) {
		if(!layers)
			return(false)
		this.#layers = layers;
		return(this.#crateMaterialsDefined())
	};

	/**
	* @method - sums all materials to each crate side.
	* @param { Array } materials - all materials available to the crate.
	*/
	#stablishCrateSizes(materials) {
		const woods =		materials.filter(wood => wood[5] !== "Foam Sheet");
		const separator =	materials.filter(wood => wood[5] === "Foam Sheet");
		const DIVISION =	2.5;
		let x =				0;
		let z =				0;
		let y =				0;

		woods.map(item => {
			x += +item[2];
			z += +item[2];
			y += +item[2];
		});
		separator && separator.length ? separator.map(foam => {
			if(this.#layers > 1 && foam[2] <= DIVISION)
				return(z += +foam[2]);
			x += +foam[2];
			z += +foam[2];
			y += +foam[2];
		}): 0;
		x *= 2;
		z *= 2;
		y *= 2;
		return({ x, z, y });
	};

	/**
	* @method - take all materials to apply to the crate.
	*/
	#crateMaterialsDefined() {
		let { materials, crating } =	localStorage;
		const crateMaterials =			[]

		materials =	JSON.parse(materials);
		crating =	JSON.parse(crating);

		crating.map(item => {
			crateMaterials.push(materials.find(opts => opts[0] === item).flat());
		});
		if(!crateMaterials.length)
			return({ x: 0, z: 0, y: 0 });

		return(this.#stablishCrateSizes(crateMaterials));
	};
};
