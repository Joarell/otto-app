export default class CrateMaker {
	#layers;
	#workStack;
	#materials;

	constructor(layers, materials, opt = false) {
		if (layers) {
			this.#materials = materials;
			this.#layers = layers;
			this.#workStack = opt;
		}
	}

	/**
	 * @method - sums all materials to each crate side.
	 * @param { Array } materials - all materials available to the crate.
	 */
	#stablishCrateSizes(materials) {
		const wood = ["Pinewood", "Plywood", "Wooden Post"];
		const woods = materials.filter((item) => wood.includes(item[5]));
		const separator = materials.filter((foam) => foam[5] === "Foam Sheet");
		const DIVISION = separator.find((sep) => sep[2] < 5).flat();
		let x = 0;
		let z = 0;
		let y = 0;
		let div = 0;
		let pad = 0;

		woods.map((item) => {
			if(item.at(-1) !== "Wooden Post") {
				x += +item[2] * 2;
				z += +item[2] * 2;
			}
			y += item.at(-1) === "Pinewood" || item.at(-1) === "Wooden Post"
				? +item[2]
				: +item[2] * 2;
			return item;
		});
		if(separator?.length)
			separator.map((foam) => {
				if (this.#layers > 1 && +foam[2] <= +DIVISION[2]) {
					if (this.#workStack) {
						this.#workStack = false;
						y += +foam[2];
					}
					div = +foam[2]
					z += +foam[2] * (this.#layers - 1);
					return foam;
				}
				if (this.#layers === 1 && +foam[2] <= +DIVISION[2]) return foam;
				x += +foam[2] * 2;
				z += +foam[2] * 2;
				y += +foam[2] * 2;
				if(+foam[2] > +DIVISION[2]) pad = 2 * foam[2];
				return foam;
			})
		return { x, z, y, div, pad };
	}

	/**
	 * @method - take all materials to apply to the crate.
	 */
	#crateMaterialsDefined() {
		const { materials, cratesOnly } = this.#materials;
		const crateMaterials = [];

		if(cratesOnly) {
			cratesOnly.map((item) => {
				const material = materials.find((opts) => opts[0] === item);
				material ? crateMaterials.push(material) : 0;
				return item;
			});
			if (!crateMaterials.length) return { x: 0, z: 0, y: 0 };

			return this.#stablishCrateSizes(crateMaterials);
		}
		return false;
	}

	get outSizes() {
		if (!this.#layers) return false;
		return this.#crateMaterialsDefined();
	}
}
