export default class WorksCoordinates {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#packedList;
	#centerWork;
	#packing;
	#lastIndexY = false;

	constructor(size = false, materials) {
		if (size && materials) {
			this.#sizes = [
				+size[0].toFixed(3),
				+size[1].toFixed(3),
				+size[2].toFixed(3),
			];
			this.#packing = materials;
			this.#centerWork = {
				center: [],
				works: [],
				linked: [],
				x: new Map(),
				y: new Map(),
			};
			this.#coordinates = this.#crateTemplate();
		}
	}

	#crateTemplate() {
		const { materials, cratesOnly } = this.#packing;
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

		for (astro of this.#centerWork.center) {
			const x = this.#centerWork.x.get(astro);
			const y = this.#centerWork.y.get(astro);
			if (!this.#centerWork.center.length) return gaps;

			const work = this.#packedList.find((work) => work[0] === astro);
			const rand = work
				? Math.floor(Math.random() * work[1])
				: Math.floor(Math.random() * 1_0000);

			if (x.sum >= work[1] && y.sum >= work[3]) {
				let majorX = 0;
				let majorY = 0;
				let pos = 0;
				let properX = 0;
				let properY = 0;
				const copy = [];

				for (pos of gaps) {
					if (pos[4] === 0 && majorX < pos[0]) majorX = pos[0];
					if (pos[4] === 1 && majorY < pos[1]) majorY = pos[1];
				}
				copy.map((oldLocation) => gaps.push(oldLocation));
				for (pos of gaps) {
					const valX = pos[0] > 0 && pos[1] > 0;
					const valY = pos[1] > 0 && pos[0] > 0;

					if (!pos[4] && valX && properY < pos[1]) properY = pos[1];
					if (!pos[4] && valX && properY > pos[1])
						pos.splice(5, 1, `${rand}-y`);

					if (pos[4] && valY && properX < pos[0]) properX = pos[0];
					if (pos[4] && valY && properX > pos[0])
						pos.splice(5, 1, `{ rand }-x`);
				}
				this.#centerWork.center.splice(i, 1);
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
		const xThread = this.#centerWork.x.get(prevWork[0]);
		const yThread = this.#centerWork.y.get(prevWork[0]);
		const onCenter = this.#centerWork.center.length
			? this.#centerWork.center.at(-1)
			: prevWork[0];

		const centerWork = onCenter
			? this.#packedList.find(
				(work) => work[0] === onCenter || work[0] === onCenter,
			)
			: prevWork;
		const X = local[2];
		const Y = local[3];
		const sumX =
			+(local[0] + x).toFixed(3) <= X
				? +(local[0] + x).toFixed(3)
				: prevWork.length === 4
					? prevWork[1] + local[0]
					: prevWork[3] + local[0];
		const sumY =
			+(local[1] + y).toFixed(3) <= Y
				? +(local[1] + y).toFixed(3)
				: prevWork.length === 4
					? prevWork[3] + local[1]
					: prevWork[1] + local[1];

		const properX = sumY >= centerWork[3] && onAxis ? sumX : xThread.sum;
		const properY = sumX >= centerWork[1] && !onAxis ? sumY : yThread.sum;
		const random =
			xThread.sum < local[2] || yThread.sum < local[3]
				? ~~(Math.random() * x)
				: false;
		let extra = random
			? yThread.sum < local[3]
				? { x: local[0], y: sumY, random: `${random}-y` }
				: { x: sumX, y: local[1], random: `${random}-x` }
			: false;
		let postX;
		let postY;
		let newX = 0;
		let newY = 0;

		if (onAxis) {
			postX = sumY >= centerWork[3] ? sumX : properX;
			postY = sumX >= centerWork[1] ? properY : sumY;

			newX = sumX < X ? postX : prevWork[1];
			newY = sumY < Y ? (local[1] > 0 ? sumY : postY) : prevWork[3];
			// console.log("⭕", newX, newY, extra);
		} else {
			postX = local[0] === 0 && sumY < Y ? 0 : sumX;
			postY = local[1] === 0 && sumX < X ? 0 : sumY;

			newX =
				(sumX < X && x >= prevWork[1]) || !postX
					? local[0] > 0
						? sumX
						: postX
					: local[0];
			newY = (sumY < Y && y >= prevWork[3]) || !postY ? postY : prevWork[3];
			// console.log("🪝", newX, newY, extra);
		}
		if (extra.x === newX && extra.y === newY) extra = undefined;
		return { newX, newY, extra };
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
		const { newX, newY, extra } = this.#theEdgeLocations({
			prevWork,
			local,
			onAxis,
			x,
			y,
		});
		return { newX, newY, sumX, sumY, extra };
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } local
	 * @param { Array: Number } emptyArea
	 * @param { string } code
	 */
	#defineNewCoordinates(axisXorY, local, { x, y }, emptyArea, code) {
		const astro = local.length === 8 ? local.at(-2) : local.at(-1);
		const prevWork = this.#packedList.find((work) => work[0] === astro);
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const axis = axisXorY && y < Y ? 0 : 1;
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
			if (nextX[0] === plus[0] || nextX[1] === plus[1]) nextX = plus;
			if (nextY[0] === plus[0] || nextY[1] === plus[1]) nextY = plus;
		}
		if (nextX[0] >= X) nextX = false;
		else if (nextY[1] >= Y) nextY = false;
		else if (nextX[0] === nextY[0] && nextX[1] === nextY[[1]]) nextY = false;
		return { nextX, nextY, plus };
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } emptyArea
	 * @@param { Object } opts
	 */
	#addingNewCoordinates(pos, opts, emptyArea) {
		emptyArea.splice(pos, 1);
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
		const existGap = (setup) =>
			emptyArea.some((gap) => gap[0] === setup[0] && gap[1] === setup[1]);

		if (addX && addY) {
			if (totalX < totalY) {
				emptyArea.push(opts.nextX);
				includedX++;
			} else if (!includedY && totalY > totalX) {
				emptyArea.push(opts.nextY);
				includedY++;
			}
			if (!includedX) emptyArea.push(opts.nextX);
			if (!includedY) emptyArea.push(opts.nextY);
		} else if (addX && !includedX && !existGap(opts.nextX)) {
			emptyArea.push(opts.nextX);
		} else if (addY && !includedY && !existGap(opts.nextY))
			emptyArea.push(opts.nextY);
		if (opts.plus && !existGap(opts.plus)) emptyArea.push(opts.plus);
		return this.#centerWork.center.length
			? this.#updateAllLocations(emptyArea)
			: emptyArea;
	}

	/**
	 * @method - updates the axis of the work attached to.
	 * @param { boolean } onAxis
	 * @param { string } newWork
	 * @param { string } lastWork
	 */
	#setLastWorkAxis(attached, newWork, onAxis) {
		const x = this.#centerWork.x.get(attached);
		const y = this.#centerWork.y.get(attached);
		const newX = newWork.length > 4 ? newWork[3] : newWork[1];
		const newY = newWork.length > 4 ? newWork[1] : newWork[3];

		if (onAxis) {
			if (attached) {
				x.sum += newX;
				x.codes.push(newWork[0]);
			}
		} else {
			if (attached) {
				y.sum += newY;
				y.codes.push(newWork[0]);
			}
		}
		return { x, y };
	}

	/**
	 * @method - adds a new work to the thread sequence.
	 * @param { string } work
	 */
	#newAttachedWork(work) {
		this.#centerWork.center.push(work);
		this.#centerWork.x.set(work, { sum: 0, codes: [] });
		this.#centerWork.y.set(work, { sum: 0, codes: [] });
	}

	/**
	 * @method - updates the x and y axis thread with works attached to its own axis.
	 * @param { string } code
	 * @param { Object } work
	 * @param { boolean } onAxis
	 * @param { string } center
	 * @param { string } newWork
	 * @param { String } closeTo
	 */
	#attachingWorksOrder(onAxis, closeTo, newWork) {
		if (!this.#centerWork.center.length) this.#newAttachedWork(closeTo);
		const newArt = this.#packedList.find((art) => art[0] === newWork);
		const { x, y } = this.#setLastWorkAxis(closeTo, newArt, onAxis);

		this.#centerWork.x.set(closeTo, x);
		this.#centerWork.y.set(closeTo, y);
		this.#centerWork.x.set(newWork, { sum: 0, codes: [] });
		this.#centerWork.y.set(newWork, { sum: 0, codes: [] });
		if (!this.#centerWork.works.includes(closeTo))
			this.#centerWork.works.push(closeTo);
	}

	/**
	 * @method - updates the adjacent previous work.
	 * @param { boolean } onAxis
	 * @param { string } newWork
	 * @param { string } lastWork
	 */
	#upDateLastWork(onAxis, lastWork, newWork) {
		const newArt = this.#packedList.find((art) => art[0] === newWork);
		const checkWork = this.#centerWork.x.get(lastWork);

		if (!checkWork) this.#newAttachedWork(lastWork);
		const { x, y } = this.#setLastWorkAxis(lastWork, newArt, onAxis);

		this.#centerWork.x.set(lastWork, x);
		this.#centerWork.y.set(lastWork, y);
		this.#centerWork.linked.push(newWork);
	}

	/**
	 * @method - update the available coordinates possible to feat the work
	 * @param { Number } pos the array index to be removed from the possibilities.
	 * @param { Array } local the position with the coordinates to place the work.
	 */
	#updateLayerAvailableCoordinates(pos, { x, y }, code) {
		const { emptyArea } = this.#coordinates;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const firstAdd = emptyArea[0][0] === 0 && emptyArea[0][1] === 0;
		const lastArt = emptyArea[pos].length > 4 ? emptyArea[pos].at(-1) : code;
		const prev =
			emptyArea[pos].length === 4
				? lastArt
				: emptyArea[pos].length > 7
					? emptyArea[pos].at(-2)
					: emptyArea[pos].at(-1);
		const closeTo = prev ? prev : code;
		const onAxis = emptyArea[pos][4];

		// BUG: the axis sum is not quite right.
		this.#attachingWorksOrder(onAxis, closeTo, code);
		if (closeTo !== lastArt) this.#upDateLastWork(!onAxis, lastArt, code);
		if (emptyArea.length > 1) {
			const options = this.#defineNewCoordinates(
				onAxis,
				emptyArea[pos],
				{ x, y },
				emptyArea,
				code,
			);
			return this.#addingNewCoordinates(pos, options, emptyArea);
		}
		const fullX = x === X;
		const fullY = y === Y;
		const firstX = prev
			? [emptyArea[0][0] + x, emptyArea[0][1], X, Y, 0, false, prev, code]
			: [emptyArea[0][0] + x, emptyArea[0][1], X, Y, 0, false, code];
		const firstY = prev
			? [emptyArea[0][0], emptyArea[0][1] + y, X, Y, 1, false, prev, code]
			: [emptyArea[0][0], emptyArea[0][1] + y, X, Y, 1, false, code];

		if (fullX && fullY) {
			emptyArea[pos] = [X, Y, X, Y];
			return emptyArea;
		}
		if (y >= Y) firstX[4] = 1;
		if (x >= X) firstY[4] = 0;
		if (x < X) emptyArea.push(firstX);
		if (y < Y) emptyArea.push(firstY);
		if (emptyArea.length > 1 && !emptyArea[0][0] && !emptyArea[0][1])
			emptyArea.splice(0, 1);
		if (!firstAdd) emptyArea.splice(pos, 1);
	}

	/**
	 * @method - find the feasible position to the work into the crate.
	 * @param { Array } art the artwork dimensions and ID.
	 * @param { Array } coordinate the empty possibilities to feat the work in.
	 * @param { Object: boolean } values for match position of the work in side the crate.
	 */
	#checkLimitSet(art, coordinate, values) {
		if (!values.check01 && !values.check02) return values;
		const limit = coordinate[5] ? coordinate[5]?.split("-")[1] : false;

		if (limit === "x" || limit === "y") {
			if (!this.#centerWork.center.length)
				this.#attachingWorksOrder(0, art[0], art[0]);
			const center = this.#packedList.find(
				(work) => work[0] === this.#centerWork.center.at(-1),
			);
			const featness =
				limit === "x" ? center[1] - coordinate[0] : center[3] - coordinate[1];
			const avoidPos =
				coordinate[0] === center[1] || coordinate[1] === center[3];

			values.check01 =
				values.check01 && avoidPos && featness > 0
					? limit === "x"
						? featness >= art[1]
						: featness >= art[3]
					: values.check01;
			values.check02 =
				values.check02 && avoidPos && featness > 0
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
				? true
				: sumX <= coordinate[2]
					? true
					: Math.abs(+(sumX - coordinate[2]).toFixed(3)) <= EXPAND;
		const diffY =
			coordinate[1] === 0
				? true
				: sumY <= coordinate[3]
					? true
					: Math.abs(+(sumY - coordinate[3]).toFixed(3)) <= EXPAND;
		const pointX1 = sumX <= coordinate[2] || sumX <= coordinate[2] + EXPAND;
		const pointY1 = sumY <= coordinate[3] || sumY <= coordinate[3] + EXPAND;
		const pointX2 = sumX <= coordinate[3] || sumX <= coordinate[3] + EXPAND;
		const pointY2 = sumY <= coordinate[2] || sumY <= coordinate[2] + EXPAND;
		const checkX = coordinate[2] <= sumX && diffX && diffY;
		const checkY = coordinate[3] <= sumY && diffY && diffX;
		const edge = sumX <= limitX && sumY <= limitY;

		const check01 = pointX1 && pointY1 && edge;
		const check02 = pointX2 && pointY2 && edge;
		const extraX = checkX ? sumX : 0;
		const extraY = checkY ? sumY : 0;

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
	#onFoundDefineLocation(data, art, emptyArea, pos) {
		const { check01, check02, extraX, extraY } = data;
		const ind = this.#rawList.findIndex((data) => data.code === art[0]);
		const ICON = `<i class="nf nf-oct-sync"></i>`;
		let found = false;
		let x;
		let y;
		const fillSpace = (turn, x, y) => {
			found = true;

			if (turn && x !== y) {
				art.push(ICON);
				this.#packedList.find((work) =>
					work[0] === art[0] ? work.push(ICON) : 0,
				);
			}
			this.#rawList[ind].defCoordinate = {
				x: structuredClone(emptyArea[pos][0]),
				z: art[2],
				y: structuredClone(emptyArea[pos][1]),
			};
			if (extraX || extraY) {
				emptyArea.map((info) => {
					if (extraX > 0) info[2] = extraX;
					if (extraY > 0) info[3] = extraY;

					return info;
				});
			}
			this.#lastIndexY = false;
		};

		if (check01) {
			x = art[1];
			y = art[3];
			fillSpace(false, x, y);
		} else if (check02) {
			x = art[3];
			y = art[1];
			fillSpace(true, x, y);
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
	#secondCheckExtension(art, pos, emptyArea, found) {
		if (found || pos < 0) return found;
		const coordinate = emptyArea[pos];
		const checker = this.#checkExtendSizeToFeatWork(art, coordinate);

		found = this.#onFoundDefineLocation(checker, art, emptyArea, pos);
		if (!found) pos--;
		return this.#secondCheckExtension(art, pos, emptyArea, found);
	}

	/**
	 * @method - analyses all empty and available positions/coordinates to each work.
	 * @param { Array } param0.emptyArea - available empty coordinates.
	 * @param { boolean } param0.found - changes when a space is matched to the work.
	 * @param { Array } param0.art - the work sizes and code.
	 * @param { Number } param0.ind - the rawList location to the work.
	 * @param { Number } param0.pos the @emptyArea index.
	 */
	#featRecursionLayer({ emptyArea, found, art, pos }) {
		const filled =
			emptyArea[0][0] === emptyArea[0][2] &&
			emptyArea[0][1] === emptyArea[0][3];
		if (found || pos < 0 || filled) return found;
		const coordinates = emptyArea[pos];
		const checker = this.#workMatchLayer(art, coordinates);

		if (checker.check01 || checker.check02)
			found = this.#onFoundDefineLocation(checker, art, emptyArea, pos);

		if (!found) pos--;
		return this.#featRecursionLayer({ emptyArea, found, art, pos });
	}

	#traceValidPosition(code, local, axis) {
		const work = this.#packedList.find((art) => art[0] === code);
		const onAxis = axis === 0 ?
			this.#centerWork.x.get(code)
	 		: this.#centerWork.x.get(code);
		const gap = axis === 0 ? work[1] - onAxis.sum : work[3] - onAxis.sum;

		local = gap > 0 ? local : undefined;
		return local;
	}

	/**
	 * @method - select the best candidate for match to the art work.
	 * @param { Array:Array: Number | String } emptyArea
	 */
	#selectPositionCandidate(emptyArea, art) {
		const zerOption = { x: null, y: null };
		const center = this.#centerWork.center.at(-1);
		const x = this.#centerWork.x.get(center) ?? 0;
		const y = this.#centerWork.y.get(center) ?? 0;
		const { works } = this.#centerWork;
		const lastWork = this.#centerWork.linked.at(-1);
		let location = false;
		let position;
		let pos;
		let index = 0;

		if (position === undefined)
			for (pos of emptyArea) {
				const gapX = pos[0] < pos[2] ? pos[2] - pos[0] : false;
				const gapY = pos[1] < pos[3] ? pos[3] - pos[1] : false;
				const validLocation =
					(gapX && gapX >= art[1] && gapY && gapY >= art[3]) ||
					(gapX && gapX >= art[3] && gapY && gapY >= art[1]);

				if (validLocation) location = index;
				if (!pos[0]) zerOption.x = index;
				if (!pos[1]) zerOption.y = index;
				if (position) break;
				index++;
			}
		if(!position) {
			if (location) position = location;
			else if (zerOption.y) position = zerOption.y;
			else if (zerOption.x) position = zerOption.x;
			else position = emptyArea.length - 1;
		}
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
			this.#centerWork = {
				center: [],
				works: [],
				linked: [],
				x: new Map(),
				y: new Map(),
			};
			return info;
		}
		const { emptyArea, feat } = info;
		const art = list[len];
		const pos = this.#selectPositionCandidate(emptyArea, art);
		const data = { emptyArea, found: false, art, pos };
		let result = this.#featRecursionLayer(data);
		let tmp;

		if (!result)
			result = this.#secondCheckExtension(art, pos, emptyArea, result);
		if (result) {
			const raw = this.#rawList.findIndex((data) => data.code === art[0]);
			tmp = list.splice(len, 1).flat();
			feat.push({ work: tmp, list: len, raw });
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
