export default class WorksCoordinates {
	#info;
	#sizes;
	#rawList;
	#coordinates;
	#packedList;
	#centerWork;
	#packing;
	#lastTry;
	#newBaseSize;

	constructor(size = false, materials) {
		if (size && materials) {
			this.#lastTry = [];
			this.#sizes = [
				+size[0].toFixed(3),
				+size[1].toFixed(3),
				+size[2].toFixed(3),
			];
			this.#packing = materials;
			this.#layerMapObject();
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
	 * @method removes the obsolete locations
	 * @param { Array:Number:String } gaps possible locations
	 */
	async #cleanObsoleteLocations(gaps) {
		const minGap = 10;
		const removes = [];

		gaps.map((data, i) => {
			const check = data[2] - data[0] < minGap || data[3] - data[1] < minGap;

			if (data && check) removes.push(i);
			else {
				this.#rawList.map((info) => {
					if (info?.coordinates) {
						const { x, y } = info.coordinates;
						if (data[0] === x && data[1] === y) removes.push(i);
					}
					return info;
				});
			}
			return data;
		});
		removes.map((index, i) => gaps.splice(index + i, 1), 0);
		return gaps;
	}

	/**
	 * @method - update all coordinates based on the gap size.
	 * @param { Array:Array:number } gaps
	 */
	async #updateAllLocations(gaps) {
		if (!this.#centerWork?.center) return gaps;
		const { x, y, center } = this.#centerWork;
		const X = center.length > 4 ? center[3] : center[1];
		const Y = center.length > 4 ? center[1] : center[3];
		const shiftCenter = x.get(center[0]).sum >= X && y.get(center[0]).sum >= Y;
		const updater = (axis) => {
			let art;

			for (art of axis) {
				// const { sum } = art[1];
				const rand = center
					? Math.floor(Math.random() * center[1])
					: Math.floor(Math.random() * 1_0000);

				if (center[0] === art[0] && shiftCenter) {
					let pos;
					let properX = 0;
					let properY = 0;

					for (pos of gaps) {
						const valX = pos[0] > 0 && pos[1] > 0 && pos[0] < pos[2];
						const valY = pos[1] > 0 && pos[0] > 0 && pos[1] < pos[3];

						if (!pos[4] && valX && properY < pos[1]) properY = pos[1];
						if (!pos[4] && valX && properY > pos[1])
							pos.splice(5, 1, `${rand}-y`);

						if (pos[4] && valY && properX < pos[0]) properX = pos[0];
						if (pos[4] && valY && properX > pos[0])
							pos.splice(5, 1, `${rand}-x`);
					}
					this.#centerWork.center = false;
				}
			}
		};
		updater(x);
		updater(y);
		return await this.#cleanObsoleteLocations(gaps);
	}

	/**
	 * @method - define the inner location.
	 * @param { object } data all information needed to define new coordinates.
	 */
	#theEdgeLocations(data) {
		const { prevWork, local, onAxis, x, y } = data;
		const xThread = this.#centerWork.x.get(prevWork[0]);
		const yThread = this.#centerWork.y.get(prevWork[0]);
		const onCenter = this.#centerWork?.center
			? this.#centerWork?.center
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

		const properX = sumY >= onCenter[3] && onAxis ? sumX : xThread.sum;
		const properY = sumX >= onCenter[1] && !onAxis ? sumY : yThread.sum;
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
			postX = sumY >= onCenter[3] ? sumX : properX;
			postY = sumX >= onCenter[1] ? properY : sumY;

			newX = sumX < X ? postX : prevWork[1];
			newY = sumY < Y ? (local[1] > 0 ? sumY : postY) : prevWork[3];
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
		}
		if (extra?.x === newX && extra?.y === newY) extra = undefined;
		if (extra?.x === newX && extra?.y === newY) extra = undefined;
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
		const minGap = 10;

		if (extra && extra.x < X && extra.y < Y) {
			const extraAxis = extra.random.split("-")[1];
			plus = [extra.x, extra.y, X, Y, axis, extra.random, local.at(-1), code];
			extraAxis === "x"
				? nextX.splice(5, 1, extra.random)
				: nextY.splice(5, 1, extra.random);
			if (X - plus[0] > minGap && Y - plus[1] > minGap) {
				if (nextX[0] === plus[0] || nextX[1] === plus[1]) {
					nextX = plus;
					plus = false;
				}
				if (nextY[0] === plus[0] || nextY[1] === plus[1]) {
					nextY = plus;
					plus = false;
				}
			}
		}
		if (nextX[0] >= X || nextX[1] >= Y) nextX = false;
		else if (X - nextX[0] < minGap || Y - nextX[1] < minGap) nextX = false;
		if (nextY[0] >= X || nextY[1] >= Y) nextY = false;
		else if (X - nextY[0] < minGap || Y - nextY[1] < minGap) nextX = false;
		if (nextX[0] === nextY[0] && nextX[1] === nextY[1]) nextY = false;
		return { nextX, nextY, plus };
	}

	/**
	 * @param { boolean } axisXorY
	 * @param { Array:Number } emptyArea
	 * @@param { Object } opts
	 */
	async #addingNewCoordinates({ nextX, nextY, plus }, emptyArea) {
		if (!nextX && !nextY && !plus) return emptyArea;
		const existX = emptyArea.some(
			(data) => data[0] === nextX[0] && data[1] === nextX[1],
		);
		const existY = emptyArea.some(
			(data) => data[0] === nextY[0] && data[1] === nextY[1],
		);
		const addX = !existX && nextX && nextX[3] > nextX[1];
		const addY = !existY && nextY && nextY[2] > nextY[0];
		const totalX = nextX[0] + nextX[1];
		const totalY = nextY[0] + nextY[1];
		let includedX = 0;
		let includedY = 0;
		const existGap = (setup) =>
			emptyArea.some((gap) => gap[0] === setup[0] && gap[1] === setup[1]);

		if (addX && addY) {
			if (totalX < totalY) {
				emptyArea.push(nextX);
				includedX++;
			} else if (!includedY && totalY > totalX) {
				emptyArea.push(nextY);
				includedY++;
			}
			if (!includedX) emptyArea.push(nextX);
			if (!includedY) emptyArea.push(nextY);
		} else if (addX && !includedX && !existGap(nextX)) {
			emptyArea.push(nextX);
		} else if (addY && !includedY && !existGap(nextY)) emptyArea.push(nextY);
		if (plus && !existGap(plus)) emptyArea.push(plus);
		return this.#centerWork?.center
			? await this.#updateAllLocations(emptyArea)
			: emptyArea;
	}

	/**
	 * @method - updates the axis of the work attached to.
	 * @param { boolean } onAxis
	 * @param { string } newWork
	 * @param { string } lastWork
	 */
	#setLastWorkAxis(attached, newWork, onAxis) {
		if (attached === newWork[0]) return;
		const { center } = this.#centerWork;
		const x = this.#centerWork.x.get(attached);
		const y = this.#centerWork.y.get(attached);
		const newX = newWork.length > 4 ? newWork[3] : newWork[1];
		const newY = newWork.length > 4 ? newWork[1] : newWork[3];
		const artFlip = center.length > 4;

		if (onAxis && x && y) {
			if (artFlip && !x.codes.includes(newWork[0])) {
				y.sum += newX;
				y.codes.push(newWork[0]);
			} else if (!y.codes.includes(newWork[0])) {
				x.sum += newX;
				x.codes.push(newWork[0]);
			}
		} else {
			if (artFlip && !y.codes.includes(newWork[0])) {
				x.sum += newY;
				x.codes.push(newWork[0]);
			} else if (!x.codes.includes(newWork[0])) {
				y.sum += newY;
				y.codes.push(newWork[0]);
			}
		}
		if (x && y) {
			this.#centerWork.x.set(attached, x);
			this.#centerWork.y.set(attached, y);
		}
	}

	/**
	 * @method - adds a new work to the thread sequence.
	 * @param { string } work
	 * @param { Array:Number:String } local
	 */
	#newAttachedWork(work, local) {
		const art = this.#packedList.find((info) => info[0] === work);
		const X = art.length > 4 ? art[3] : art[1];
		const Y = art.length > 4 ? art[1] : art[3];
		const sumX = Y >= local[3] || Y === local[2] ? X : 0;
		const sumY = X >= local[2] || X === local[3] ? Y : 0;

		this.#centerWork.center = art;
		this.#centerWork.x.set(work, { sum: sumX, codes: [] });
		this.#centerWork.y.set(work, { sum: sumY, codes: [] });
	}

	/**
	 * @method - updates the adjacent previous work.
	 * @param { boolean } onAxis
	 * @param { string } newWork
	 * @param { string } thread
	 */
	#upDateLatestWork(thread, newArt, onAxis) {
		const { x, y, center } = this.#centerWork;
		const updateLinkedWorks = [];
		const updating = (axis, pos) => {
			let info;

			for (info of axis) {
				const { sum, codes } = info[1];
				const work = this.#packedList.find((data) => data[0] === info[0]);
				const X = work.length > 4 ? work[3] : work[1];
				const Y = work.length > 4 ? work[1] : work[3];
				const checkBeforeLast =
					codes?.includes(thread.at(-1)) &&
					info[0] === thread.at(-2) &&
					!codes?.includes(newArt);
				const foundOnCenter = updateLinkedWorks.length
					? updateLinkedWorks.some((data) => codes.includes(data)) &&
						!codes?.includes(newArt)
					: false;
				const greenLight =
					pos !== onAxis ? (pos === 0 ? sum < X : sum < Y) : false;

				if (greenLight) {
					if (checkBeforeLast && !updateLinkedWorks.includes(info[0])) {
						updateLinkedWorks.push(info[0]);
						this.#setLastWorkAxis(info[0], newArt, pos);
					}
					if (foundOnCenter && !updateLinkedWorks.includes(info[0])) {
						updateLinkedWorks.push(info[0]);
						this.#setLastWorkAxis(center[0], newArt, pos);
					}
				}
			}
		};
		updating(x, 0);
		updating(y, 1);
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
	#attachingWorksOrder(onAxis, closeTo, newWork, local) {
		const newArt = this.#packedList.find((art) => art[0] === newWork);

		this.#setLastWorkAxis(closeTo, newArt, onAxis);
		this.#newAttachedWork(newWork, local);
		if (!this.#centerWork.works.includes(closeTo))
			this.#centerWork.works.push(closeTo);
		if (local && local.length > 7)
			this.#upDateLatestWork(local, newArt, onAxis);
	}

	/**
	 * @method - used when there is only one option to select.
	 * @param { number } x axis.
	 * @param { number } y axis.
	 * @param { string } prev last art work code.
	 * @param { Array:Number:String } emptyArea available positions.
	 */
	#onOnePosition(emptyArea, x, y, prev) {
		const lastWork = this.#packedList.find((work) => work[0] === prev);
		const lastX = lastWork.length > 4 ? lastWork[3] : lastWork[1];
		const lastY = lastWork.length > 4 ? lastWork[1] : lastWork[3];
		const minGap = 10;
		const X = emptyArea[0][2];
		const Y = emptyArea[0][3];
		const firstWork = emptyArea[0].length > 4;
		const fullX = x === X || X - (x + emptyArea[0][0]) < minGap;
		const fullY = y === Y || Y - (y + emptyArea[0][1]) < minGap;
		let nextX;
		let nextY;

		if (!emptyArea[0][0] && !emptyArea[(0)[0]]) {
			nextX = x + lastX < X ? x + lastX : 0;
			nextY = y + lastY < Y ? y + lastY : 0;
		} else {
			nextX = x + lastX < X ? x + lastX : x;
			nextY = y + lastY < Y ? y + lastY : y;
		}
		const firstX = firstWork
			? [nextX, emptyArea[0][1], X, Y, 0, false, emptyArea[0].at(-1), prev]
			: [emptyArea[0][0] + x, emptyArea[0][1], X, Y, 0, false, prev];
		const firstY = firstWork
			? [emptyArea[0][0], nextY, X, Y, 1, false, emptyArea[0].at(-1), prev]
			: [nextX, emptyArea[0][1] + y, X, Y, 1, false, prev];

		if (fullX && fullY) {
			emptyArea[0] = [X, Y, X, Y];
			return emptyArea;
		}
		if (y >= Y) firstX[4] = 1;
		if (x >= X) firstY[4] = 0;
		if (x < X && X - firstX[0] > minGap && Y - firstX[1] > minGap)
			emptyArea.push(firstX);
		if (y < Y && X - firstY[0] > minGap && Y - firstY[1] > minGap)
			emptyArea.push(firstY);
		if (emptyArea.length > 1 && !emptyArea[0][0] && !emptyArea[0][1])
			emptyArea.splice(0, 1);
		if (firstWork) emptyArea.splice(0, 1);
		return emptyArea;
	}

	/**
	 * @method - update the available coordinates possible to feat the work
	 * @param { Number } pos the array index to be removed from the possibilities.
	 * @param { Array } local the position with the coordinates to place the work.
	 */
	async #updateLayerAvailableCoordinates(pos, { x, y }, code) {
		const { emptyArea } = this.#coordinates;
		const closeTo = emptyArea[pos].length > 4 ? emptyArea[pos].at(-1) : code;
		const onAxis = emptyArea[pos][4];

		this.#attachingWorksOrder(onAxis, closeTo, code, emptyArea[pos]);
		if (emptyArea.length > 1) {
			const options = this.#defineNewCoordinates(
				onAxis,
				emptyArea[pos],
				{ x, y },
				emptyArea,
				code,
			);
			emptyArea.splice(pos, 1);
			return await this.#addingNewCoordinates(options, emptyArea);
		}
		this.#onOnePosition(emptyArea, x, y, code);
		await this.#updateAllLocations(emptyArea);
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
			if (this.#centerWork?.center) {
				this.#attachingWorksOrder(0, coordinate.at(-1), art[0], coordinate);
			}
			const { center } = this.#centerWork;
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
				const checkSizes = extraX > this.#newBaseSize[2] ||
					extraY > this.#newBaseSize[3];
				emptyArea.map((info) => {
					if (extraX > 0) info[2] = extraX;
					if (extraY > 0) info[3] = extraY;

					return info;
				});
				if(checkSizes) {
					if(extraX > this.#newBaseSize[2])
						this.#newBaseSize.splice(2, 1, extraX);
					if(extraY > this.#newBaseSize[3])
						this.#newBaseSize.push(extraX)
						this.#newBaseSize.splice(3, 1, extraX);
				}
			}
		};
		if (check01 && !check02) {
			x = art[1];
			y = art[3];
			fillSpace(false, x, y);
		} else if (check02) {
			x = art[3];
			y = art[1];
			fillSpace(true, x, y);
		}
		if (found) {
			this.#updateLayerAvailableCoordinates(pos, { x, y }, art[0]);
			this.#lastTry = null;
			this.#lastTry = [];
		}
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
	async #secondCheckExtension(art, pos, emptyArea, found) {
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
			emptyArea.length &&
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

	/**
	 * @method - select the best candidate for match to the art work.
	 * @param { Array:Array: Number | String } emptyArea
	 */
	#selectPositionCandidate(emptyArea, art) {
		const zerOption = { x: null, y: null };
		let location = false;
		let position;
		let pos;
		let index = 0;
		let posCandidate = 0;

		for (pos of emptyArea) {
			const gapX = pos[0] < pos[2] ? pos[2] - pos[0] : false;
			const gapY = pos[1] < pos[3] ? pos[3] - pos[1] : false;
			const validLocation =
				(gapX && gapX >= art[1] && gapY && gapY >= art[3]) ||
				(gapX && gapX >= art[3] && gapY && gapY >= art[1]);
			const checkValidIndex = this.#lastTry.includes(index);
			const checker = emptyArea[posCandidate][0] + emptyArea[posCandidate][1];

			if (validLocation) location = index;
			if (!pos[0]) zerOption.x = index;
			if (!pos[1]) zerOption.y = index;
			if (checker > pos[0] + pos[1] && !checkValidIndex) posCandidate = index;
			index++;
		}
		if (location && !this.#lastTry.includes(location)) position = location;
		else if (zerOption.y !== null) position = zerOption.y;
		else if (zerOption.x !== null) position = zerOption.x;
		else if (!location && posCandidate !== undefined) position = posCandidate;
		else position = emptyArea.length - 1;
		this.#lastTry.push(position);
		return position;
	}

	#layerMapObject() {
		let onCenter;

		if (this.#centerWork?.center) {
			const { x, y, center } = this.#centerWork;
			const X = center.length > 4 ? center[3] : center[1];
			const Y = center.length > 4 ? center[1] : center[3];
			const sumX = x.get(center[0]);
			const sumY = y.get(center[0]);

			onCenter = sumX?.sum >= X || sumY?.sum >= Y ? false : center;
		}
		this.#centerWork = null;
		this.#centerWork = {
			center: onCenter,
			works: [],
			linked: [],
			x: new Map(),
			y: new Map(),
		};
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
			this.#layerMapObject();
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

		this.#newBaseSize = info.newBase;
		this.#rawList = raw;
		this.#packedList = structuredClone(list);
		const arrange = this.#fillCrateRecursion(info, list, len);
		arrange.neBase = this.#newBaseSize;
		return arrange;
	}

	/** @param { Object } data  */
	set fillPreparing(data) {
		this.#info = data;
	}
}
