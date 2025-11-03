export default class WorksCoordinates {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#limitX;
	#limitY;
	#packedList;

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
	 * @method - update all coordinates with the same axis value.
	 * @param { Array:Array:numbers } coordinates - all available coordinates
	 * @param { boolean } axisXorY - which axis selected.
	 * @param { Array:numbers } local - the work position on the crate.
	 * @param { number } x - work size value
	 * @param { number } y - work size value
	 */
	#updateAllLocations(prevWork, coordinates, local, axisXorY, x, y) {
		const axis = axisXorY ? local[0] : local[1];
		const updatedVal = axisXorY ? axis + x : axis + y;
		const newcoordinates = coordinates.map((data) => {
			if (data[0] === 0 || data[1] === 0) return data;
			const checkUPdate1 = axisXorY && y + local[1] > prevWork[3];
			const checkUPdate2 = !axisXorY && x + local[0] > prevWork[1];
			if (checkUPdate1) data[1] = updatedVal;
			else if (checkUPdate2) data[0] = updatedVal;
			return data;
		});
		console.log("UPDATED coordinates", newcoordinates);
		return newcoordinates;
	}

	/**
	 * @method - define the inner location.
	 * @param { object } data all information needed to define new coordinates.
	 */
	#theEdgeLocations(data) {
		const { prevWork, local, sumX, sumY, onAxis, x, y } = data;
		const X = local[2];
		const Y = local[3];
		let edgeX = 0;
		let edgeY = 0;

		if (onAxis) {
			edgeX =
				sumY >= prevWork.y
					? sumX
					: local[0] === 0 && sumX < X
						? local[0]
						: sumX;
			edgeY =
				sumX >= prevWork.x
					? sumY
					: local[1] === 0 && sumY < Y
						? local[1]
						: sumY;
		} else {
			edgeX =
				sumY >= prevWork.y && local[0] > 0
					? sumX
					: local[1] === 0
						? local[0]
						: sumX;
			edgeY = sumX >= prevWork.x && sumY < Y ? sumY : local[1];
		}
		return { edgeX, edgeY };
	}

	/**
	 * @param { boolean } onAxis
	 * @param { number } x
	 * @param { number } y
	 * @param { Array:Number } local
	 * @param { Array:Array:Number } emptyArea
	 * @param { Object } prevWork
	 */
	#nextLocationGap(onAxis, x, y, local, prevWork) {
		const X = local[2];
		const Y = local[3];
		const sumX = +(local[0] + x).toFixed(3);
		const sumY = +(local[1] + y).toFixed(3);
		const { edgeX, edgeY } = this.#theEdgeLocations({
			prevWork,
			local,
			sumX,
			sumY,
			onAxis,
			x,
			y,
		});

		const newX = onAxis
			? edgeX
			: local[1] === 0 && sumY < Y
				? local[1]
				: local[0] + x;
		const newY = !onAxis
			? edgeY
			: local[0] === 0 && sumX < X
				? local[0]
				: local[1] + y;

		console.log("--->", prevWork, "and", sumX, sumY, "=>", onAxis, local);
		console.log("EDGE", edgeX, edgeY);
		return { newX, newY, sumX, sumY };
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } local
	 * @param { Array: Number } emptyArea
	 * @param { string } code
	 */
	#defineNewCoordinates(axisXorY, local, { x, y }, emptyArea, code) {
		const prevWork = this.#packedList.find((work) => work[0] === local.at(-1));
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const { newX, newY, sumX, sumY } = this.#nextLocationGap(
			axisXorY,
			x,
			y,
			local,
			prevWork,
		);
		let nextX =
			axisXorY && local[1] === 0
				? [newX, 0, X, Y, code]
				: [sumX, newY, X, Y, code];
		let nextY =
			!axisXorY && local[0] === 0
				? [0, sumY, X, Y, code]
				: [newX, sumY, X, Y, code];

		console.log("NEW", nextX, "and", nextY, prevWork, local);
		if (nextX[0] >= X) {
			nextX = false;
			nextY = false;
		} else if (nextY[1] >= Y) {
			nextX = false;
			nextY = false;
		} else if (nextX[0] === nextY[0] && nextX[1] === nextY[[1]]) nextY = false;
		emptyArea = this.#updateAllLocations(
			prevWork,
			emptyArea,
			local,
			axisXorY,
			x,
			y,
		);
		return { nextX, nextY };
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
		let opt;
		let xAndZero = 0;
		let yAndZero = 0;
		let maxX = 0;
		let maxY = 0;

		for (opt of emptyArea) {
			if (xAndZero < opt[0] && opt[1] === 0) xAndZero = opt[0];
			if (yAndZero < opt[1] && opt[0] === 0) yAndZero = opt[1];
			if (maxX < opt[0]) maxX = opt[0];
			if (maxY < opt[1]) maxY = opt[1];
		}
		console.log(
			"TO REMOVE ->:",
			updated,
			emptyArea,
			xAndZero,
			yAndZero,
			"and",
			maxX,
			maxY,
		);
		emptyArea.splice(pos, 1);
		if (!checkGapX && !checkGapY) emptyArea.splice(pos, 1);
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } emptyArea
	 * @@param { Object } opts
	 */
	#addingNewCoordinates({ x, y, pos }, opts, emptyArea) {
		const existX = emptyArea.some(
			(data) => data[0] === opts.nextX[0] && data[1] === opts.nextX[1],
		);
		const existY = emptyArea.some(
			(data) => data[0] === opts.nextY[0] && data[1] === opts.nextY[1],
		);
		const addX = !existX && opts.nextX && opts.nextX[3] > opts.nextX[1];
		const addY = !existY && opts.nextY && opts.nextY[2] > opts.nextY[0];
		const totalX = opts.nextX[0] + opts.nextX[1];
		const totalY = opts.nextY[0] + opts.nextY[1];
		let includedX = 0;
		let includedY = 0;

		console.log("OPTS", opts, emptyArea);
		if (addX && addY) {
			if (totalX > totalY) {
				emptyArea.push(opts.nextX);
				includedX++;
			}
			else if(!includedY && totalY > totalX) {
				emptyArea.push(opts.nextY);
				includedY++;
			}
			if (!includedX) emptyArea.push(opts.nextX);
			if (!includedY) emptyArea.push(opts.nextY);
		}
		else if (addX && !includedX) {
			emptyArea.push(opts.nextX);
		}
		else if (addY && !includedY)
			emptyArea.push(opts.nextY);

		this.#removeAndUpdateCoordinates(emptyArea, x, y, pos);
	}

	/**
	 * @method - update the available coordinates possible to feat the work
	 * @param { Number } pos the array index to be removed from the possibilities.
	 * @param { Array } local the position with the coordinates to place the work.
	 */
	#updateLayerAvailableCoordinates(pos, { x, y }, code, axis) {
		const { emptyArea } = this.#coordinates;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const firstAdd = emptyArea[0][0] === 0 && emptyArea[0][1] === 0;

		if (emptyArea.length > 1) {
			const axisXorY = axis;
			const options = this.#defineNewCoordinates(
				axisXorY,
				emptyArea[pos],
				{ x, y },
				emptyArea,
				code,
			);
			return this.#addingNewCoordinates({ x, y, pos }, options, emptyArea);
		}
		const fullX = x === X;
		const fullY = y === Y;
		const firstX = [emptyArea[0][0] + x, emptyArea[0][1], X, Y, code];
		const firstY = [emptyArea[0][0], emptyArea[0][1] + y, X, Y, code];

		if (fullX && fullY) {
			emptyArea[pos] = [X, Y, X, Y];
			return emptyArea;
		}
		if (x < X) emptyArea.push(firstX);
		if (y < Y) emptyArea.push(firstY);
		if (emptyArea.length > 1 && !emptyArea[0][0] && !emptyArea[0][1])
			emptyArea.splice(0, 1);
		if (!firstAdd) this.#removeAndUpdateCoordinates(emptyArea, x, y, pos);
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 */
	#workMatchLayer(art, coordinate) {
		const X = coordinate[2];
		const Y = coordinate[3];
		const x1 = art[1] + coordinate[0] <= X && coordinate[0] < X;
		const y1 = art[3] + coordinate[1] <= Y && coordinate[1] < Y;
		const x2 = art[3] + coordinate[0] <= X && coordinate[0] < X;
		const y2 = art[1] + coordinate[1] <= Y && coordinate[1] < Y;
		let check01 = x1 && y1;
		let check02 = x2 && y2;

		if (check01 && art[1] > art[3] && art[1] <= Y) {
			if (X - art[3] > Y - art[1]) {
				check01 = false;
				check02 = true;
			}
		}
		return { check01, check02 };
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 */
	#checkExtendSizeToFeatWork(art, coordinate) {
		const EXPAND = 10;
		const limitX = coordinate[2] <= 285 ? 285 : 585;
		const limitY = coordinate[3] <= 145 ? 145 : 225;
		const sumX = +(art[1] + coordinate[0]).toFixed(3);
		const sumY = +(art[3] + coordinate[1]).toFixed(3);
		const diffX =
			coordinate[0] === 0
				? 0
				: sumX <= coordinate[2]
					? Math.abs(+(coordinate[2] - sumX).toFixed(3))
					: Math.abs(+(sumX - coordinate[2]).toFixed(3));
		const diffY =
			coordinate[1] === 0
				? 0
				: sumY <= coordinate[3]
					? Math.abs(+(coordinate[3] - sumY).toFixed(3))
					: Math.abs(+(sumY - coordinate[3]).toFixed(3));
		const pointX1 = sumX <= coordinate[2] || sumX <= coordinate[2] + EXPAND;
		const pointY1 = sumY <= coordinate[3] || sumY <= coordinate[3] + EXPAND;
		const pointX2 = sumX <= coordinate[3] || sumX <= coordinate[3] + EXPAND;
		const pointY2 = sumY <= coordinate[2] || sumY <= coordinate[2] + EXPAND;
		const checkX = coordinate[2] <= sumX && diffX <= EXPAND && diffY <= EXPAND;
		const checkY = coordinate[3] <= sumY && diffY <= EXPAND && diffX <= EXPAND;
		const edge = sumX <= limitX && sumY <= limitY;

		const check01 = pointX1 && pointY1 && edge;
		const check02 = pointX2 && pointY2 && edge;
		const extraX = checkX ? sumX : 0;
		const extraY = checkY ? sumY : 0;

		if (extraX) this.#limitY.push(coordinate.at(-1));
		if (extraY) this.#limitX.push(coordinate.at(-1));
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
		const ICON = `<i class="nf nf-oct-sync"></i>`;
		let found = false;
		let x;
		let y;
		let flip = false;
		const preferAxisY =
			(emptyArea[pos][1] === 0 && !(check02 && check02)) || !check02;
		const fillSpace = (turn, x, y) => {
			found = true;

			if (turn && x !== y) art.push(ICON);
			this.#rawList[ind].defCoordinate = {
				x: emptyArea[pos][0],
				z: art[2],
				y: emptyArea[pos][1],
			};
			if (extraX || extraY) {
				emptyArea.map((info) => {
					if (extraX > 0) info[2] = extraX;
					if (extraY > 0) info[3] = extraY;

					return info;
				});
			}
		};

		console.log("CHECKOUT AXIS:", art, data, emptyArea[pos], preferAxisY);
		if (check01) {
			x = art[1];
			y = art[3];
			fillSpace(flip, x, y);
		} else if (check02) {
			x = art[3];
			y = art[1];
			flip = true;
			fillSpace(flip, x, y);
		}
		if (found)
			this.#updateLayerAvailableCoordinates(pos, { x, y }, art[0], preferAxisY);
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

		console.log("MATCH", art, "and", coordinate, checker);
		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos, ind);
		if (!found) pos--;
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
		const checker = this.#workMatchLayer(art, coordinates);
		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos, ind);

		if (!found) pos--;
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
		const filledX = info.emptyArea.length
			? info.emptyArea[0][0] === info.emptyArea[0][2]
			: true;
		const filledY = info.emptyArea.length
			? info.emptyArea[0][1] === info.emptyArea[0][3]
			: true;
		if (check || !list[len] || (filledX && filledY)) return info;

		const { emptyArea, feat } = info;
		// emptyArea.reverse();
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
		this.#packedList = structuredClone(list);
		const arrange = this.#fillCrateRecursion(info, list, len);
		return arrange;
	}

	/** @param { Object } data  */
	set fillPreparing(data) {
		this.#info = data;
	}
}
