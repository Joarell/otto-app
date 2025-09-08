import Converter from "./Converter.class.mjs";
import CubCalc from "./CubCalc.class.mjs";
import Hexaedro from "./Hexaedro.class.mjs";


export default class ArtWork extends Hexaedro {
	coordinates;
	packMaterials;
	code;
	#x;
	#z;
	#y;

	/**
	* @param { String } code
	* @param { Number } x
	* @param { Number } z
	* @param { Number } y
	* @typedef { [Array: Number | String] } Materials
	* @param { Materials } pack
	*/
	constructor (code, x, z, y, pack) {
		super(x, z, y);
		try {
			if (!code || code.trim() <= 0) {
				const error = `Please, provide a valid code. Current: ${code}`;
				throw new TypeError(error);
			}
		}
		catch (err) {
			return (err);
		}
		this.code =			""+code;
		this.#x =				+x;
		this.#z =				+z;
		this.#y =				+y;
		this.packMaterials =	pack;
	};


	/**
	* @method - returns the artworks plus the packing materials
	*/
	#packedWorkSizes() {
		const dimensions = {
			x: structuredClone(this.#x),
			z: structuredClone(this.#z),
			y: structuredClone(this.#y),
		}

		if(this.packMaterials && this.packMaterials.length)
			this.packMaterials.map(item => {
				dimensions.x += item[2] * 2;
				dimensions.z += item[2] * 2;
				dimensions.y += item[2] * 2;
			});
		return([ this.code, dimensions.x, dimensions.z, dimensions.y ]);
	};

	/**
	* @method - returns the packing material percent needed to wrap the artwork.
	* @param { Array } area the material total area in meters.
	* @param { number } demand the artworks total area in meters.
	*/
	#packingTypeMaterial(area, demand) {
		const percent =	area.map((info, i) => {
			const result = [this.packMaterials[i][0]]

			result.push((+((demand * 100) / info).toFixed(0)));
			return(result);
		}, 0);
		return(percent);
	};

	/**
	* @method - returns the packing material units needed to wrap the artwork.
	* @param { Array } percent the material total area in percentile.
	*/
	#materialQuantityApplied(percent) {
		const result = percent.map((val, i) => {
			if(this.packMaterials[i][5] === 'Roll')
				return([val[0], +(val[1] / 100).toFixed(2)]);
			return([val[0], Math.ceil(val[1] / 100)]);
		}, 0);
		return(result);
	};

	/**
	* @method - returns the rest of the percent used material.
	* @param { Array } percent the material total area in percentile.
	*/
	#residualPacking(percent) {
		const residual = percent.map(percent => {
			const magnitude =	+(percent[1] / 100).toFixed(3);
			return(1 - magnitude % 1);
		});
		return(residual);
	};

	/**
	* @method - returns the quantity needed of all materials applied to the artwork.
	*/
	#packingData() {
		const demand =		this.packingDemanded;
		const packArea =	this.packMaterials.map(item => item[1] * item[3] / 100);
		const percent =		this.#packingTypeMaterial(packArea, demand);
		const reuse =		packArea.map((data, i) => [ percent[i][0], data > demand ], 0);
		const residual =	this.#residualPacking(percent);
		const prices =		this.packMaterials.map(values => values[4]);
		const types =		this.packMaterials.map((kind, i) => [ kind[5], packArea[i], kind[0] ],0);
		const cost =		prices.map((val, i) => {
			const value = +((percent[i][1] / 100) * val).toFixed(2);
			return([percent[i][0], value, +val]);
		}, 0);
		const quantity =	this.#materialQuantityApplied(percent, residual);

		return({ demand, percent, reuse, residual, types, cost, quantity });
	};

	/**
	* @field - returns the artworks info as an Array.
	*/
	get arr() {
		return ([this.code, this.#x, this.#z, this.#y]);
	};

	/**
	* @field - returns the cube area as the air companies does the calculation.
	*/
	get cAir() {
		return (new CubCalc(this.#x,this.#z, this.#y).cubCalcAir);
	};

	/**
	* @field - returns the cube area as normal math calculation
	*/
	get cubed() {
		return (new CubCalc(this.#x, this.#z, this.#y).cubArea);
	};

	/**
	* @field - convert the art work sizes to inches from centimeters.
	*/
	get autoConvert() {
		let { x, z, y } =	this;
		const CMVALUES = new Converter(x, z, y).cmConvert;

		x =	CMVALUES[0];
		z =	CMVALUES[1];
		y =	CMVALUES[2];
		return([this.code, x, z, y]);
	};

	/**
	* @field - returns all materials and artworks data.
	*/
	get data() {
		return ({
			code : this.code,
			x : this.#x,
			z : this.#z,
			y : this.#y,
			packing: this.packMaterials
		});
	};

	/**
	* @field - returns the total area needed to cover packing.
	*/
	get packingDemanded() {
		const { x, z, y } =	this;
		const area =		2 * ((x * y) + (x * z) + (y * z));

		return(+(area / 100).toFixed(5));
	};

	/**
	* @field - store the crate position of the artwork.
	*/
	get cratePosition() {
		return(this.coordinates);
	};

	/**
	* @field - returns the artwork sizes after all packing applied.
	*/
	get packedSized() {
		return(this.#packedWorkSizes());
	};

	/**
	* @field - returns all packing materials data applied to the artwork.
	*/
	get packInfo() {
		return(this.#packingData());
	};

	/**
	*  @param { Object } values
	*/
	set defCoordinate(values) {
		this.coordinates = values;
	};
};
