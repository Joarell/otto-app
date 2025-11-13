export default class CrateMaker {
	#layers;
	#workStack;
	#materials;

	constructor(layers, materials, opt = false) {
		if (!layers) return false;

		this.#materials = materials;
		this.#layers = layers;
		this.#workStack = opt;
	}

	/**
	 * @method - sums all materials to each crate side.
	 * @param { Array } materials - all materials available to the crate.
	 */
	#stablishCrateSizes(materials) {
		const wood = ["Pinewood", "Plywood"];
		const woods = materials.filter((item) => wood.includes(item[5]));
		const separator = materials.filter((wood) => wood[5] === "Foam Sheet");
		const DIVISION = 2.5;
		let x = 0;
		let z = 0;
		let y = 0;
		let div = 0;
		let pad = 0;

		woods.map((item) => {
			x += +item[2];
			z += +item[2];
			return item;
		});
		x *= 2;
		z *= 2;
		y *= 2;
		separator?.length ? separator.map((foam) => {
					if (this.#layers > 1 && foam[2] <= DIVISION) {
						if (this.#workStack) {
							this.#workStack = false;
							y += +foam[2];
						}
						div = foam[2];
						z += +foam[2] * (this.#layers - 1);
						return foam;
					}
					if (this.#layers === 1 && foam[2] <= DIVISION) return foam;
					x += +foam[2] * 2;
					z += +foam[2] * 2;
					y += +foam[2] * 2;
					if(foam[2] > 2.5) pad = 2 * foam[2];
					return foam;
				})
			: 0;
		return { x, z, y, div, pad };
	}

	/**
	 * @method - take all materials to apply to the crate.
	 */
	#crateMaterialsDefined() {
		const { materials, cratesOnly } = this.#materials;
		const crateMaterials = [];

		cratesOnly.map((item) => {
			const material = materials.find((opts) => opts[0] === item);
			material ? crateMaterials.push(material) : 0;
			return item;
		});
		if (!crateMaterials.length) return { x: 0, z: 0, y: 0 };

		return this.#stablishCrateSizes(crateMaterials);
	}

	get outSizes() {
		return this.#crateMaterialsDefined();
	}
}
