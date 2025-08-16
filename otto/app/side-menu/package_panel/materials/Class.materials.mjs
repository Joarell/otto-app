/**
* @class - defines the materials set up prices, sizes and types.
*/
export default class MaterialSetup {

	constructor() {
		return(this.#starter());
	};

	/**
	* @method - restore the artwork materials already saved.
	*/
	async #recoveredMaterials() {
	};

	/**
	* @method - set materials for packing artworks.
	*/
	async #setMaterials() {
	};

	/**
	* @field - Sets the interface to get all materials information;
	*/
	async #starter() {
		const materials = globalThis.localStorage.getItem('materials');
		return(
			materials !== null ?
			await this.#recoveredMaterials(): await this.#setMaterials()
		);
	};
};
