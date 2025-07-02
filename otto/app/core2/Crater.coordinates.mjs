export default class WorksCoordinates {
	#sizes;
	#coordinates;
	#rawList;
	#info;

	constructor(size = false) {
		if (size) {
			this.#sizes = size;
			this.#coordinates = this.#crateTemplate();
		};
	};

	#crateTemplate() {
		const template = {
			emptyArea: [],
			artLocation: new Map(),
			baseSize: this.#sizes,
			plotter3D: new Map(),
			innerSize: [],
			get reset() {
				this.emptyArea = [[0, 0, this.baseSize[0], this.baseSize[2]]];
			},
			/** @param { Array } info */
			set defineLayer(info) {
				const vacuum =	structuredClone(this.emptyArea);
				const works =	structuredClone(info[1]);

				this[`layer${info[0]}`] = { vacuum, works };
				this.reset;
			},
		};
		template.reset;
		return(template);
	};

	/**
	* @method - update the available coordinates possible to feat the work
	* @param { Number } pos the array index to be removed from the possibilities.
	* @param { Array } local the position with the coordinates to place the work.
	*/
	#updateLayerAvailableCoordinates(pos, local, { x, y, flip }) {
		const { emptyArea } =	this.#coordinates;
		const X =				emptyArea[0][2];
		const Y =				emptyArea[0][3];

		if(X === x && Y === y || X === y && Y === x) {
			return ;
		};
		if (emptyArea.length > 1) {
			const axisXorY = emptyArea[0][0] === local[0];
			axisXorY && !flip ? emptyArea[0][0] += x : emptyArea[0][1] += y;

			const checkX =	emptyArea[0][0];
			const checkY =	emptyArea[0][1];
			const pointX =	checkX + x === X ? X : 0;
			const pointY =	checkY + y === Y ? Y : 0;
			const emptyX =	axisXorY ? [ x + checkX, pointY, X, Y ]: [ checkX, pointY, X, Y ];
			const emptyY =	axisXorY ? [ pointX, y + checkY, X, Y ]: [ pointX, checkY, X, Y ];

			emptyArea.splice(pos, 1);
			axisXorY && emptyX[0] < X ? emptyArea.push(emptyX) : 0;
			!axisXorY && emptyY[1] < Y ? emptyArea.push(emptyY) : 0;
			return ;
		};
		const fullX = x === X;
		const fullY = y === Y;
		const firstX = !fullX ? [x, 0, X, Y]: false
		const firstY = !fullY ? [0, y, X, Y]: false;

		firstX ? emptyArea.push(firstX): 0;
		firstY ? emptyArea.push(firstY): 0;
	};

	/**
	* @method - find the feasible position to the work into the crate.
	* @param { Array } art the artwork dimensions and ID.
	* @param { Array } coordinate the empty possibilities to feat the work in.
	*/
	#workFeatnessLayer(art, coordinate) {
		const space = coordinate[0] === coordinate[2]
			&& coordinate[1] === coordinate[3];
		const X = coordinate[2];
		const Y = coordinate[3];
		const x1 = art[1] + coordinate[0] <= X && coordinate[0] < X;
		const y1 = art[3] + coordinate[1] <= Y && coordinate[1] < Y;
		const x2 = art[3] + coordinate[0] <= X && coordinate[0] < X;
		const y2 = art[1] + coordinate[1] <= Y && coordinate[1] < Y;
		const check01 = !space ? x1 && y1: false;
		const check02 = !space ? x2 && y2: false;

		return({ check01, check02 });
	};

	/**
	* @method - analyses all empty and available positions/coordinates to each work.
	* @param { Array } param0.emptyArea - available empty coordinates.
	* @param { boolean } param0.found - changes when a space is matched to the work.
	* @param { Array } param0.art - the work sizes and code.
	* @param { Number param0.ind - the rawList location to the work.
	* @param { Number } param0.pos the @emptyArea index.
	*/
	#featRecursionLayer({ emptyArea, found, art, ind, pos }) {
		emptyArea.length > 1 && pos === 0 ? pos++ : 0;
		const coordinates = emptyArea[pos];
		const filled = emptyArea[0][0] === emptyArea[0][2] &&
			emptyArea[0][1] === emptyArea[0][3];

		if(found || !coordinates || filled)
			return(found);
		const ICON =		`<i class="nf nf-oct-sync"></i>`;
		const { check01, check02 } = this.#workFeatnessLayer(art, coordinates);
		const X =			emptyArea[0][2];
		const Y =			emptyArea[0][3];
		const perfect = 	art[1] === X && art[3] === Y || art[3] === X && art[1] === Y;
		let flip = false;
		let x;
		let y;

		if(check01) {
			found = true;
			x = art[1];
			y = art[3];

			this.#rawList[ind].defCoordinate = {
				x: emptyArea[pos][0],
				z: art[2],
				y: emptyArea[pos][1]
			};
			if(pos === 0) {
				emptyArea[0][0] = (x || y > 0) && !perfect ? x : X;
				emptyArea[0][1] = (x > 0 || y) && !perfect ? y : Y;
			}
		}
		else if(check02) {
			found = true;
			x = art[3];
			y = art[1];

			art.push(ICON);
			flip = true;
			this.#rawList[ind].defCoordinate = {
				x: emptyArea[pos][1],
				z: art[2],
				y: emptyArea[pos][0]
			};
			if(pos === 0) {
				emptyArea[0][1] = (x || y > 0) && !perfect ? emptyArea[0][2] - art[3] : Y;
				emptyArea[0][0] = (x > 0 || y) && !perfect ? emptyArea[0][3] - art[1] : X;
			}
		};
		found ? this.#updateLayerAvailableCoordinates(pos, coordinates, { x, y, flip }): pos++;
		return(this.#featRecursionLayer({emptyArea, found, art, ind, pos}));
	};

	/**
	* @method - the recursion caller to find a match empty space into the crate.
	* @param { Number } len - the list index.
	* @param { Object } info - the crate base size and saver to crate layers arrangement.
	* @param { Array } list - the artworks relation.
	*/
	#fillCrateRecursion(info, list, len) {
		const check =	info.emptyArea[0] === undefined && info.emptyArea[1] === undefined;
		const filledX = info.emptyArea[0][0] === info.emptyArea[0][2];
		const filledY = info.emptyArea[0][1] === info.emptyArea[0][3];
		if(check || !list[len] || filledX && filledY)
			return(info);

		let tmp;
		const { emptyArea, feat } = info;
		const art =		list[len];
		const ind =		this.#rawList.findIndex(data => data.code === art[0]);
		const data =	{ emptyArea, found: false, art, ind, pos: 0 };
		const result =	this.#featRecursionLayer(data);

		if(result) {
			tmp = list.splice(len, 1).flat();
			feat.push({ work: tmp, list: len, raw: ind });
		};
		return(this.#fillCrateRecursion(info, list, len - 1));
	};

	/**
	* @field - returns the crate template to be fulfilled
	*/
	get bluePrintCoordinates() {
		return(this.#coordinates);
	};

	/**
	* @field - Call the fulfillment of the crate.
	*/
	get fillLayer() {
		const { info, list, len, raw } = this.#info;

		this.#rawList = raw;
		return(this.#info ? this.#fillCrateRecursion(info, list, len): false);
	};

	/** @param { Object } data  */
	set fillPreparing(data) {
		this.#info = data;
	};
};
