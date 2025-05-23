import Converter from "./Converter.class.mjs";
import CubCalc from "./CubCalc.class.mjs";
import Hexaedro from "./Hexaedro.class.mjs";


export default class ArtWork extends Hexaedro {
	#coordinates;
	#packMaterials;
	#code;
	#x;
	#z;
	#y;

	/**
	* @param { String } code
	* @param { Number } x
	* @param { Number } z
	* @param { Number } y
	* @typedef { [Array:Number] } Materials
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
		this.#packMaterials =	pack;
		this.#code =	""+code;
		this.#x =		+x;
		this.#z =		+z;
		this.#y =		+y;
	};

	get arr () {
		return ([this.#code, this.#x, this.#z, this.#y]);
	};

	get cAir () {
		return (new CubCalc(this.#x, this.#z, this.#y).cubCalcAir);
	};

	get cubed () {
		return (new CubCalc(this.#x, this.#z, this.#y).cubArea);
	};

	get autoConvert () {
		const CMVALUES = new Converter(this.#x, this.#z, this.#y).cmConvert;

		this.#x =	CMVALUES[0];
		this.#z =	CMVALUES[1];
		this.#y =	CMVALUES[2];

		return([this.#code, this.#x, this.#z, this.#y]);
	};

	get data () {
		return ({ code : this.#code, x : this.#x, z : this.#z, y : this.#y});
	};

	/**
	* @field - returns the array with the artwork packed.
	*/
	get packingTheWork() {
		let packed = [this.#x, this.#z, this.#y];
		this.#packMaterials.map(type => {
			packed[0] = packed[0] + type[1];
			packed[1] = packed[1] + type[1];
			packed[2] = packed[2] + type[1];
		});
		return(packed);
	};

	/**
	* @field - returns the total area needed to cover packing.
	*/
	get packingDemanded() {
		const { x, z, y } =	this;
		const area =		2 * ((x * y) + (x * z) + (y * z));

		return(area);
	};

	get cratePosition() {
		return(this.#coordinates);
	};

	/**
	*  @typedef { Array:number } Coordinate
	*  @param { Coordinate } values
	*/
	set coordinates(values) {
		this.#coordinates = values;
	};
};
