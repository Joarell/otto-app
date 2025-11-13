export default class WorksCoordinates {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#limitX;
	#limitY;
	#packedList;
	#centerWork;
	#attachedTo;
	#center;

	constructor(size = false) {
		if (size) {
			this.#sizes = [
				+size[0].toFixed(3),
				+size[1].toFixed(3),
				+size[2].toFixed(3),
			];
			this.#center = [];
			this.#attachedTo = new Map();
			this.#centerWork = new Map();
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
	 * @method - update all coordinates based on the gap size.
	 * @param { Array:Array:number } gaps
	 */
	#updateAllLocations(gaps) {
		let astro = 0;
		let i = 0;

		for (astro of this.#center) {
			const data = this.#centerWork.get(astro);
			const work = this.#packedList.find((work) => work[0] === astro);
			const rand = ~~Math.random(astro[1] * astro[2]);
			const { x, y } = data;

			if (x[0] >= work[1] && y[0] >= work[3]) {
				let majorX = 0;
				let majorY = 0;
				let pos = 0;
				let properX = 0;
				let properY = 0;

				for (pos of gaps) {
					if (pos[4] === 0 && majorX < pos[0]) majorX = pos[0];
					if (pos[4] === 1 && majorY < pos[1]) majorY = pos[1];
				}
				for (pos of gaps) {
					if (pos[4] === 0) pos[0] = majorX;
					if (pos[4] === 1) pos[1] = majorY;
				}
				for (pos of gaps) {
					const valX = pos[0] > 0 && pos[1] > 0;
					const valY = pos[1] > 0 && pos[0] > 0;

					if (!pos[4] && valX && properY < pos[1]) properY = pos[1];
					if (!pos[4] && valX && properY > pos[1]) pos.splice(5, 0, `${ rand }-y`);

					if (pos[4] && valY && properX < pos[0]) properX = pos[0];
					if (pos[4] && valY && properX > pos[0]) pos.splice(5, 0, `{ rand }-x`);
				}
				this.#center.splice(i, 1);
			}
			i++;
		}
		return gaps;
	}

	/**
	 * @method - define the inner location.
	 * @param { object } data all information needed to define new coordinates.
	 */
	#theEdgeLocations(data) {
		const { prevWork, local, onAxis, x, y } = data;
		const onCenter = this.#attachedTo.get(prevWork[0]);
		const orbit = onCenter
			? this.#centerWork.get(onCenter)
			: this.#centerWork.get(prevWork[0]);
		const centerWork = onCenter
			? this.#packedList.find((work) => work[0] === onCenter)
			: prevWork;
		const X = local[2];
		const Y = local[3];
		const sumX =
			+(local[0] + x).toFixed(3) <= X
				? +(local[0] + x).toFixed(3)
				: prevWork[1];
		const sumY =
			+(local[1] + y).toFixed(3) <= Y
				? +(local[1] + y).toFixed(3)
				: prevWork[3];
		const properX = sumY >= centerWork[3] && onAxis ? sumX : orbit.x[0];
		const properY = sumX >= centerWork[1] && !onAxis ? sumY : orbit.y[0];
		const random =
			orbit.x[0] > local[0] || orbit.y[0] > local[1]
				? ~~(Math.random() * x)
				: false;
		const extra = random
			? orbit.x[0] > local[0]
				? { x: local[0], y: sumY, random: `${random}-y` }
				: { x: sumX, y: local[1], random: `${random}-x` }
			: false;
		let postX;
		let postY;
		let edgeX = 0;
		let edgeY = 0;

		if (onAxis) {
			postX = sumY >= centerWork[3] ? sumX : properX;
			postY = sumX >= centerWork[1] ? properY : sumY;

			edgeX = sumX < X ? postX : prevWork[1];
			edgeY = sumY < Y ? postY : prevWork[3];
		} else {
			postX = local[0] === 0 && sumY < Y ? 0 : sumX;
			postY = local[1] === 0 && sumX < X ? 0 : sumY;

			edgeX = (sumX < X && x >= prevWork[1]) || !postX ? postX : prevWork[1];
			edgeY = (sumY < Y && y >= prevWork[3]) || !postY ? postY : prevWork[3];
		}
		return { edgeX, edgeY, extra };
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
		const sumX =
			+(local[0] + x).toFixed(3) <= X
				? +(local[0] + x).toFixed(3)
				: prevWork[1];
		const sumY =
			+(local[1] + y).toFixed(3) <= Y
				? +(local[1] + y).toFixed(3)
				: prevWork[3];
		const { edgeX, edgeY, extra } = this.#theEdgeLocations({
			prevWork,
			local,
			onAxis,
			x,
			y,
		});
		const newX = edgeX;
		const newY = edgeY;
		return { newX, newY, sumX, sumY, extra };
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
		const axis = axisXorY ? 0 : 1;
		const { newX, newY, sumX, sumY, extra } = this.#nextLocationGap(
			axisXorY,
			x,
			y,
			local,
			prevWork,
		);
		let plus;
		let nextX =
			axisXorY && local[1] === 0
				? [sumX, 0, X, Y, axis, false, local.at(-1), code]
				: [sumX, newY, X, Y, axis, false, local.at(-1), code];
		let nextY =
			!axisXorY && local[0] === 0
				? [0, sumY, X, Y, axis, false, local.at(-1), code]
				: [newX, sumY, X, Y, axis, false, local.at(-1), code];

		if (extra) {
			const extraAxis = extra.random.split("-")[1];
			plus = [extra.x, extra.y, X, Y, axis, extra.random, local.at(-1), code];
			extraAxis === "x"
				? nextX.splice(5, 1, extra.random)
				: nextY.splice(5, 1, extra.random);
		}
		if (nextX[0] >= X) {
			nextX = false;
			nextY = false;
		} else if (nextY[1] >= Y) {
			nextX = false;
			nextY = false;
		} else if (nextX[0] === nextY[0] && nextX[1] === nextY[[1]]) nextY = false;
		return { nextX, nextY, plus };
	}

	/**
	 * @param { Array:Number } emptyArea
	 * @param { Number } x
	 * @param { Number } y
	 * @param { Number } pos Index of the coordinate
	 * @param { Number } prevX last X value
	 */
	#removeAndUpdateCoordinates(emptyArea, pos) {
		let opt;
		let xAndZero = 0;
		let yAndZero = 0;
		let maxX = 0;
		let maxY = 0;
		let i = 0;
		const removeIndex = [];
		const toRemove = emptyArea[pos][5] ? emptyArea[pos][5] : false;

		for (opt of emptyArea) {
			if (xAndZero < opt[0] && opt[1] === 0) xAndZero = opt[0];
			if (yAndZero < opt[1] && opt[0] === 0) yAndZero = opt[1];
			if (maxX < opt[0]) maxX = opt[0];
			if (maxY < opt[1]) maxY = opt[1];
			if (toRemove && opt[5] === toRemove) removeIndex.push(i);
			i++;
		}
		removeIndex.length
			? removeIndex.map((ind, i) => emptyArea.splice(ind - i, 1), 0)
			: emptyArea.splice(pos, 1);
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } emptyArea
	 * @@param { Object } opts
	 */
	#addingNewCoordinates(pos, opts, emptyArea) {
		this.#removeAndUpdateCoordinates(emptyArea, pos);
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

		if (addX && addY) {
			if (totalX > totalY) {
				emptyArea.push(opts.nextX);
				includedX++;
			} else if (!includedY && totalY > totalX) {
				emptyArea.push(opts.nextY);
				includedY++;
			}
			if (!includedX) emptyArea.push(opts.nextX);
			if (!includedY) emptyArea.push(opts.nextY);
		} else if (addX && !includedX) {
			emptyArea.push(opts.nextX);
		} else if (addY && !includedY) emptyArea.push(opts.nextY);
		if (opts.plus) emptyArea.push(opts.plus);
		return this.#updateAllLocations(emptyArea);
	}

	/**
	 * @method - set the works around the main work on orbits.
	 */
	#addToTheCenter(center, newWork, onAxis, x, y) {
		let orbit = this.#centerWork.get(center);
		let code;
		if (!orbit && center)
			for (code of this.#center) {
				orbit = this.#centerWork.get(code);
				if (orbit) break;
			}
		const found = orbit
			? orbit.x.includes(center) || orbit.y.includes(center)
			: false;

		code
			? this.#attachedTo.set(newWork, code)
			: center
				? this.#attachedTo.set(newWork, center)
				: false;
		if (!orbit && !found) {
			this.#center.push(newWork);
			const newCenter = center
				? !onAxis
					? { x: [x, newWork], y: [0] }
					: { x: [0], y: [y, newWork] }
				: { x: [0], y: [0] };
			center
				? this.#centerWork.set(center, newCenter)
				: this.#centerWork.set(newWork, newCenter);
			return;
		}
		!onAxis ? orbit.x.push(newWork) : orbit.y.push(newWork);
		!onAxis ? (orbit.x[0] += x) : (orbit.y[0] += y);
		if (found) {
			this.#centerWork.delete(code);
			this.#centerWork.set(code, orbit);
			return;
		}
		this.#centerWork.delete(center);
		this.#centerWork.set(center, orbit);
	}

	/**
	 * @method - update the available coordinates possible to feat the work
	 * @param { Number } pos the array index to be removed from the possibilities.
	 * @param { Array } local the position with the coordinates to place the work.
	 */
	#updateLayerAvailableCoordinates(pos, { x, y }, code) {
		const { emptyArea } = this.#coordinates;
		const onAxis = emptyArea[pos][4] === 0;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const firstAdd = emptyArea[0][0] === 0 && emptyArea[0][1] === 0;
		const prev =
			emptyArea[pos].length > 6
				? emptyArea[pos].length > 7
					? emptyArea[pos].at(-2)
					: emptyArea[pos].at(-1)
				: false;

		if (emptyArea.length > 1) {
			const options = this.#defineNewCoordinates(
				onAxis,
				emptyArea[pos],
				{ x, y },
				emptyArea,
				code,
			);
			this.#addToTheCenter(prev, code, onAxis, x, y);
			return this.#addingNewCoordinates(pos, options, emptyArea);
		}
		const fullX = x === X;
		const fullY = y === Y;
		const firstX = prev
			? [emptyArea[0][0] + x, emptyArea[0][1], X, Y, 0, prev, false, code]
			: [emptyArea[0][0] + x, emptyArea[0][1], X, Y, 0, false, code];
		const firstY = prev
			? [emptyArea[0][0], emptyArea[0][1] + y, X, Y, 1, prev, false, code]
			: [emptyArea[0][0], emptyArea[0][1] + y, X, Y, 1, false, code];

		if (fullX && fullY) {
			emptyArea[pos] = [X, Y, X, Y];
			return emptyArea;
		}
		if (x < X) emptyArea.push(firstX);
		if (y < Y) emptyArea.push(firstY);
		if (emptyArea.length > 1 && !emptyArea[0][0] && !emptyArea[0][1])
			emptyArea.splice(0, 1);
		if (!firstAdd) this.#removeAndUpdateCoordinates(emptyArea, pos);
		this.#addToTheCenter(prev, code, onAxis, x, y);
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 * @param { Object: boolean } values for match position of the work in side the crate.
	 */
	#checkLimitSet(art, coordinate, values) {
		const limit = coordinate[5] ? coordinate[5]?.split("-")[1] : false;

		if (limit === "x" || limit === "y") {
			const center = this.#packedList.find(
				(work) => work[0] === this.#center[0],
			);
			const featness =
				limit === "x" ? center[1] - coordinate[0] : center[3] - coordinate[1];
			const avoidPos = coordinate[0] === center[1] || coordinate[1] === center[3];

			values.check01 = values.check01 && avoidPos
				? limit === "x"
					? featness >= art[1]
					: featness >= art[3]
				: values.check01;
			values.check02 = values.check02 && avoidPos
				? limit === "x"
					? featness >= art[1]
					: featness >= art[3]
				: values.check02;
		}
		return values;
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
		const check01 = x1 && y1;
		const check02 = x2 && y2;

		return this.#checkLimitSet(art, coordinate, { check01, check02 });
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
		return this.#checkLimitSet(art, coordinate, {
			check01,
			check02,
			extraX,
			extraY,
		});
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
		if (found) this.#updateLayerAvailableCoordinates(pos, { x, y }, art[0]);
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

		if (checker.check01 || checker.check02)
			found = this.#onFoundDefineLocation(checker, art, emptyArea, pos, ind);

		if (!found) pos--;
		return this.#featRecursionLayer({ emptyArea, found, art, ind, pos });
	}

	/**
	 * @method - select the best candidate for match to the art work.
	 * @param { Array:Array: Number | String } emptyArea
	 */
	#selectPositionCandidate(emptyArea) {
		const last = emptyArea.length - 1;
		const center = this.#centerWork.get(this.#center[0]);
		const theWork = this.#packedList.find(
			(work) => work[0] === this.#center[0],
		);
		const { x } = center;
		const candidateAxis = x[0] === 0 || x[0] < theWork[1];
		let position;

		position = candidateAxis
			? emptyArea.findIndex((pos) => pos[0] === 0)
			: emptyArea.findIndex((pos) => pos[1] === 0);
		if (!Array.isArray(position)) position = last;
		return position;
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
		if (check || !list[len] || (filledX && filledY)) {
			this.#centerWork = null;
			this.#centerWork = new Map();
			return info;
		}
		const { emptyArea, feat } = info;
		const art = list[len];
		const pos = this.#center.length
			? this.#selectPositionCandidate(emptyArea)
			: emptyArea.length - 1;
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
