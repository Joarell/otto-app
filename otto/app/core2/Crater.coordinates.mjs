export default class WorksCoordinates {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#limitX;
	#limitY;

	constructor(size = false) {
		if (size) {
			this.#sizes = [
				+size[0].toFixed(3),
				+size[1].toFixed(3),
				+size[2].toFixed(3),
			];
			this.#coordinates = this.#crateTemplate();
			this.#limitX = [];
			this.#limitY = [];
		}
	}

	#crateTemplate() {
		const template = {
			emptyArea: [],
			artLocation: new Map(),
			baseSize: this.#sizes,
			usedMaterials: new Map(),
			innerSize: [],
			finalSize: [],
			layers: [],
			get reset() {
				this.emptyArea = [[0, 0, this.baseSize[0], this.baseSize[2]]];
				return this.emptyArea;
			},
			get fillGaps() {
				const data = [];
				const highZ = (works, thick = 0) => {
					works.map((art) => {
						if (!thick) thick = [art.work[0], art.work[2]];
						return thick;
					});
					return thick;
				};
				const calc = (gaps, total = 0, sizes = []) => {
					gaps.map((pos) => {
						if (pos[0] === pos[2] && pos[1] === pos[3]) return pos;
						let gapX = pos[2] - pos[0];
						let gapY = pos[3] - pos[1];

						if (!gapX && gapY) gapX = pos[0];
						if (gapX && !gapY) gapY = pos[1];
						sizes.push([+gapX.toFixed(2), +gapY.toFixed(2)]);
						total += +(gapX * gapY).toFixed(3);
						return pos;
					});
					return { total, sizes };
				};
				this.layers.map((info) => {
					const { vacuum, works } = info;
					const Z = highZ(works);
					const { total, sizes } = calc(vacuum);

					data.push({
						highestZ: Z,
						total,
						sizes,
					});
					return data;
				});
				return data;
			},
			/** @param { Array } info */
			set defineLayer(info) {
				const vacuum = structuredClone(this.emptyArea);
				const works = structuredClone(info[1]);

				this.layers.push({ vacuum, works });
				this.reset;
			},
			get fillMaterials() {
				const materials = JSON.parse(localStorage.getItem("materials"));
				const cratesOnly = JSON.parse(localStorage.getItem("crating"));

				materials.map((info) =>
					cratesOnly.includes(info[0])
						? this.usedMaterials.set(info[0], info)
						: 0,
				);
				return materials;
			},
		};
		template.reset;
		template.fillMaterials;
		return template;
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } local
	 * @param { Array: Number } emptyArea
	 * @param { string } code
	 */
	#defineNewCoordinates(axisXorY, local, { x, y }, emptyArea, code) {
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const checkX = emptyArea[0][0];
		const checkY = emptyArea[0][1];
		const pointX =
			(axisXorY && checkX === X) || (!axisXorY && checkX + x === X)
				? X
				: local[0];
		const pointY =
			(!axisXorY && checkY === Y) || (axisXorY && checkY + y === Y)
				? Y
				: local[1];
		let emptyX =
			axisXorY && pointX < X
				? [+(local[0] + x).toFixed(3), y, X, Y, code]
				: [X, local[1], pointX, Y, code];
		let emptyY =
			!axisXorY && pointY < Y
				? [y, +(local[1] + y).toFixed(3), X, Y, code]
				: [+(local[0] + x).toFixed(3), pointY, X, Y, code];

		if (emptyX[0] >= X) {
			emptyX = false;
			emptyY = false;
		} else if (emptyY[1] >= Y) {
			emptyX = false;
			emptyY = false;
		}
		return { emptyX, emptyY, pointX, pointY };
	}

	/**
	 * @param { Array:Number } emptyArea
	 * @param { Number } x
	 * @param { Number } y
	 * @param { Number } pos Index of the coordinate
	 * @param { Number } prevX last X value
	 */
	#removeAndUpdateCoordinates(emptyArea, x, y, pos) {
		const availableLimit = 10;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const updated = [];
		let newX =
			emptyArea[pos][1] === 0 ? x + emptyArea[pos][0] : emptyArea[pos][0];
		let newY =
			emptyArea[pos][0] === 0 ? y + emptyArea[pos][1] : emptyArea[pos][1];


		if (emptyArea[pos][0] === 0) newX += x;
		if (emptyArea[pos][1] === 0) newY += y;
		const checkGapX = X - newX >= availableLimit;
		const checkGapY = Y - newY >= availableLimit;

		emptyArea.map((data, i) => {
			if (!i) return data;
			else if (data[1] > 0 && data[0] >= newX && newX >= X)
				return updated.push(i);
			else if (data[0] > 0 && data[1] > 0 && data[1] <= newY && newY >= Y)
				return updated.push(i);

			return data;
		}, 0);

		if (updated.length)
			updated.map((ind, j) => emptyArea.splice(ind - j, 1), 0);
		if(!checkGapX && !checkGapY)
			emptyArea.splice(pos, 1);
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } emptyArea
	 * @@param { Object } opts
	 */
	#addingNewCoordinates({ x, y, pos }, opts, emptyArea) {
		const existX = emptyArea.some((data) => data[0] === opts.emptyX[0]);
		const existY = emptyArea.some((data) => data[1] === opts.emptyY[1]);

		if (!existX && opts.emptyX) emptyArea.push(opts.emptyX);
		if (!existY && opts.emptyY) emptyArea.push(opts.emptyY);

		this.#removeAndUpdateCoordinates(emptyArea, x, y, pos);
		console.log("OPTS", opts);
		console.log("###", emptyArea);
	}

	/**
	 * @method - update the available coordinates possible to feat the work
	 * @param { Number } pos the array index to be removed from the possibilities.
	 * @param { Array } local the position with the coordinates to place the work.
	 */
	#updateLayerAvailableCoordinates(pos, local, { x, y, flip }, code) {
		const { emptyArea } = this.#coordinates;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];

		if ((X === x && Y === y) || (X === y && Y === x)) return;
		if (emptyArea.length > 1) {
			const axisXorY = emptyArea[0][0] === local[0];
			const options = this.#defineNewCoordinates(
				axisXorY,
				local,
				{ x, y },
				emptyArea,
				code,
			);

			console.log('POSITION', axisXorY, 'and', emptyArea[pos])
			if (axisXorY) {
				emptyArea[pos][0] = local[0];
				emptyArea[pos][1] = flip ? local[1] + y : local[1] + x;
			} else if (!axisXorY) {
				emptyArea[pos][0] = flip ? local[0] + x : local[0] + y;
				emptyArea[pos][1] = local[1] + y;
			}
			return this.#addingNewCoordinates(
				{ x, y, pos },
				options,
				emptyArea,
				axisXorY,
			);
		}
		const fullX = x === X;
		const fullY = y === Y;
		const firstX = !fullX ? [x, 0, X, Y, code] : false;
		const firstY = !fullY ? [0, y, X, Y, code] : false;

		firstX ? emptyArea.push(firstX) : 0;
		firstY ? emptyArea.push(firstY) : 0;
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 */
	#workFeatnessLayer(art, coordinate) {
		const space =
			coordinate[0] === coordinate[2] && coordinate[1] === coordinate[3];
		const X = coordinate[2];
		const Y = coordinate[3];
		const x1 = art[1] + coordinate[0] <= X && coordinate[0] < X;
		const y1 = art[3] + coordinate[1] <= Y && coordinate[1] < Y;
		const x2 = art[3] + coordinate[0] <= X && coordinate[0] < X;
		const y2 = art[1] + coordinate[1] <= Y && coordinate[1] < Y;
		const check01 = !space ? x1 && y1 : false;
		const check02 = !space ? x2 && y2 : false;

		return { check01, check02 };
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 */
	#checkExtendSizeToFeatWork(art, coordinate) {
		const EXPAND = 10;
		const boundaries = this.#rawList.find(
			(work) => work.code === coordinate.at(-1),
		);
		const limitX = coordinate[2] <= 285 ? 285 : 585;
		const limitY = coordinate[3] <= 145 ? 145 : 225;
		const diffX = art[1] + coordinate[0] - coordinate[2];
		const diffY = art[3] + coordinate[1] - coordinate[3];
		let check01 =
			diffX > 0 && diffX <= limitX && EXPAND >= diffX && EXPAND >= diffY;
		let check02 =
			diffY > 0 && diffY <= limitY && EXPAND >= diffY && EXPAND >= diffX;
		const extraX = diffX > 0 ? art[1] + coordinate[0] : 0;
		const extraY = diffY > 0 ? art[3] + coordinate[1] : 0;

		if (boundaries) {
			const { x, y } = boundaries;
			const xLimit = this.#limitX.includes(boundaries.code);
			const yLimit = this.#limitY.includes(boundaries.code);
			const featX = yLimit && coordinate[0] < art[1] && x >= art[1];
			const featY = xLimit && coordinate[1] < art[3] && y >= art[3];

			check01 = check01 || featX;
			check02 = check02 || featY;
		}
		if (check01 && extraX) this.#limitY.push(coordinate.at(-1));
		if (check02 && extraY) this.#limitX.push(coordinate.at(-1));
		return { check01, check02, extraX, extraY };
	}

	/**
	 * @method - analyses all empty and available positions/coordinates to each work.
	 * @param { Array } emptyArea - available empty coordinates.
	 * @param { boolean } found - changes when a space is matched to the work.
	 * @param { Array } art - the work sizes and code.
	 * @param { Number } ind - the rawList location to the work.
	 * @param { Number } pos the @emptyArea index.
	 */
	#onFoundDefineLocation(data, art, emptyArea, pos, ind) {
		const { check01, check02, extraX, extraY } = data;
		const coordinates = emptyArea[pos];
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const XorY = emptyArea[0][0] === emptyArea[pos][0];
		const ICON = `<i class="nf nf-oct-sync"></i>`;
		const perfect =
			(art[1] === X && art[3] === Y) || (art[3] === X && art[1] === Y);
		let flip = false;
		let found;
		let x;
		let y;

		if (check01) {
			found = true;
			x = art[1];
			y = art[3];

			this.#rawList[ind].defCoordinate = {
				x: emptyArea[pos][0],
				z: art[2],
				y: emptyArea[pos][1],
			};
			if (pos === 0) {
				if (XorY)
					emptyArea[0][0] = (x || y > 0) && !perfect ? x + coordinates[0] : X;
				if (!XorY || emptyArea.length === 1)
					emptyArea[0][1] = (x > 0 || y) && !perfect ? y + coordinates[1] : Y;
			}
			if (extraX || extraY) {
				if (extraX > 0) emptyArea[0][2] = extraX;
				if (extraY > 0) emptyArea[0][3] = extraY;
			}
		} else if (check02) {
			found = true;
			x = art[3];
			y = art[1];

			!extraY ? art.push(ICON) : 0;
			flip = true;
			this.#rawList[ind].defCoordinate = {
				x: emptyArea[pos][0],
				z: art[2],
				y: emptyArea[pos][1],
			};
			if (pos === 0) {
				if (XorY)
					emptyArea[0][1] = (x || y > 0) && !perfect ? x + coordinates[0] : Y;
				if (!XorY || emptyArea.length === 1)
					emptyArea[0][0] = (x > 0 || y) && !perfect ? coordinates[1] + y : X;
			}
			if (extraX || extraY) {
				if (extraX > 0) emptyArea[0][2] = extraX;
				if (extraY > 0) emptyArea[0][3] = extraY;
			}
		}
		found
			? this.#updateLayerAvailableCoordinates(
				pos,
				coordinates,
				{ x, y, flip },
				art[0],
			)
			: 0;
		return found;
	}

	/**
	 * @method - analyses all empty and available positions/coordinates to each work.
	 * @param { Array } emptyArea - available empty coordinates.
	 * @param { boolean } found - changes when a space is matched to the work.
	 * @param { Array } art - the work sizes and code.
	 * @param { Number } ind - the rawList location to the work.
	 * @param { Number } pos the @emptyArea index.
	 */
	#secondCheckExtension(art, pos, emptyArea, ind, found) {
		if (found || pos < 0) return found;
		const coordinate = emptyArea[pos];
		const checker = this.#checkExtendSizeToFeatWork(art, coordinate);

		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos, ind);
		!found ? pos-- : 0;
		return this.#secondCheckExtension(art, pos, emptyArea, ind, found);
	}

	/**
	 * @method - analyses all empty and available positions/coordinates to each work.
	 * @param { Array } param0.emptyArea - available empty coordinates.
	 * @param { boolean } param0.found - changes when a space is matched to the work.
	 * @param { Array } param0.art - the work sizes and code.
	 * @param { Number } param0.ind - the rawList location to the work.
	 * @param { Number } param0.pos the @emptyArea index.
	 */
	#featRecursionLayer({ emptyArea, found, art, ind, pos }) {
		const filled =
			emptyArea[0][0] === emptyArea[0][2] &&
			emptyArea[0][1] === emptyArea[0][3];
		if (found || pos < 0 || filled) return found;
		const coordinates = emptyArea[pos];
		const checker = this.#workFeatnessLayer(art, coordinates);
		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos, ind);

		!found ? pos-- : 0;
		return this.#featRecursionLayer({ emptyArea, found, art, ind, pos });
	}

	/**
	 * @method - the recursion caller to find a match empty space into the crate.
	 * @param { Number } len - the list index.
	 * @param { Object } info - the crate base size and saver to crate layers arrangement.
	 * @param { Array } list - the artworks relation.
	 */
	#fillCrateRecursion(info, list, len) {
		const check =
			info.emptyArea[0] === undefined && info.emptyArea[1] === undefined;
		const filledX = info.emptyArea[0][0] === info.emptyArea[0][2];
		const filledY = info.emptyArea[0][1] === info.emptyArea[0][3];
		if (check || !list[len] || (filledX && filledY)) return info;

		const { emptyArea, feat } = info;
		const art = list[len];
		const pos = emptyArea.length - 1;
		const ind = this.#rawList.findIndex((data) => data.code === art[0]);
		const data = { emptyArea, found: false, art, ind, pos };
		let result = this.#featRecursionLayer(data);
		let tmp;

		if (!result)
			result = this.#secondCheckExtension(art, pos, emptyArea, ind, result);
		if (result) {
			tmp = list.splice(len, 1).flat();
			feat.push({ work: tmp, list: len, raw: ind });
		}
		return this.#fillCrateRecursion(info, list, len - 1);
	}

	/**
	 * @field - returns the crate template to be fulfilled
	 */
	get bluePrintCoordinates() {
		return this.#coordinates;
	}

	/**
	 * @field - Call the fulfillment of the crate.
	 */
	get fillLayer() {
		const { info, list, len, raw } = this.#info;

		this.#rawList = raw;
		return this.#info ? this.#fillCrateRecursion(info, list, len) : false;
	}

	/** @param { Object } data  */
	set fillPreparing(data) {
		this.#info = data;
	}
}
