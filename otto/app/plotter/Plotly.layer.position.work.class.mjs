import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";
import FillGaps from "./Plotly.crate.gaps.mjs";

export default class PositionWorksInSideCrate {
	#crate;
	#data;
	#info;
	#threshold;
	#div;
	#pad
	#inner;

	constructor(crate, data, meta) {
		const available =	JSON.parse(localStorage.getItem('crating'));
		const used =		available.map(opt => data.at(-1)[0].usedMaterials.get(opt));
		const pine =		used.find(list => list.at(-1) === 'Pinewood');
		const ply =			used.find(list => list.at(-1) === 'Plywood');
		this.#pad =			used.find(list => list.at(-1) === 'Foam Sheet' && list[2] > 2.5);
		this.#div =			used.find(list => list.at(-1) === 'Foam Sheet' && list[2] <= 2.5);
		this.#crate =		crate;
		this.#data =		meta;
		this.#info =		data.at(-1)[0];
		this.#threshold =	[];
		this.#inner =		crate.innerSize;
		const populate =	(size) => {
			this.#threshold.push(size);
			this.#threshold.push(size);
			this.#threshold.push(size);
		};
		const addSides = 	(size) => {
			this.#threshold[0] += size;
			this.#threshold[1] += size;
			this.#threshold[2] += size;
		};

		[pine, ply, this.#pad].map(info => {
			if(Array.isArray(info)) {
				switch(info.at(-1)) {
					case 'Pinewood':
						const x = info[2];
						const z = info[2];
						const y = 2 * info[2];
						if(!this.#threshold.length) {
							this.#threshold.push(x);
							this.#threshold.push(z);
							this.#threshold.push(y);
							return(info);
						};
						this.#threshold[0] += x;
						this.#threshold[1] += y;
						this.#threshold[2] += z;
						break;
					case 'Plywood':
						if(!this.#threshold.length) {
							populate(info[2]);
							return(info);
						};
						addSides(info[2]);
						break;
					case 'Foam Sheet':
						if(!this.#threshold.length) {
							populate(info[2]);
							return(info);
						};
						addSides(info[2]);
						break;
					default :
						return(info);
				};
			};
		});
		this.#div[1] =	+this.#div[1];
		this.#div[2] =	+this.#div[2];
		this.#div[3] =	+this.#div[3];
	};

	#worksOffset(works, depth, layer) {
		Object.entries(works).map(data => {
			const { coordinates, code, art } = data[1];
			const x = this.#threshold[0];
			const y = this.#threshold[2];
			const z = ~~this.#threshold[1] + ~~coordinates.z + depth;

			data[1]['layer'] = { code, name: `layer-${layer}`, color: 'works' };
			art.map((info, i) => {
				switch(i) {
					case 0:
						info.x === 0 ? info.x = x: 0;
						info.y === 0 ? info.y = y: 0;
						info.z === 0 ? info.z = z: 0;
						return(info);
					case 1:
						info.y === 0 ? info.y = y: 0;
						info.z === 0 ? info.z = z: 0;
						return(info);
					case 2:
						info.z === 0 ? info.z = z: 0;
						return(info);
					case 3:
						info.x === 0 ? info.x = x: 0;
						info.z === 0 ? info.z = z: 0;
						return(info);
					case 4:
						info.x === 0 ? info.x = x: 0;
						info.y === 0 ? info.y = y: 0;
						return(info);
					case 5:
						info.y === 0 ? info.y = y: 0;
						return(art);
					case 7:
						info.x === 0 ? info.x = x: 0;
						return(info);
				};
				return(info);
			}, 0);
		});
		return(works);
	};

	#workGraphicPosition(dim, local, depth, one) {
		let x =		dim.length > 4 ? +dim[3] + this.#threshold[0]:
			+dim[1] + this.#threshold[0] - this.#pad[2];
		let y =		dim.length > 4 ? +dim[1] + Math.ceil(this.#threshold[2]):
			+dim[3] + Math.ceil(this.#threshold[2] - this.#pad[2]);
		const z =	this.#threshold[1] + depth;
		const { coordinates, code } = local;

		if(one > 1) {
			x -= this.#pad[2];
			y -= this.#pad[2];
		};
		!coordinates.x ? x += this.#pad[2]: x += this.#pad[2] + coordinates.x;
		const work = {
			coordinates,
			code,
			art: [
				{ x: 0, y: 0, z: 0 },	// Vertex 0
				{ x, y: 0, z: 0 },		// Vertex 1
				{ x, y, z: 0 },			// Vertex 2
				{ x: 0, y, z: 0 },		// Vertex 3
				{ x: 0, y: 0, z },		// Vertex 4
				{ x, y: 0, z },			// Vertex 5
				{ x, y, z },			// Vertex 6
				{ x: 0, y, z }			// Vertex 7
			],
			width: x - this.#threshold[0],
			depth: ~~dim[2],
			height: y - this.#threshold[2],
			offsetX: this.#threshold[0],
			offsetY: this.#threshold[1] + depth,
			offsetZ: this.#threshold[2],
		};
		return(work);
	};

	#defineDivSize({ x, y }, depth, layer) {
		const z =		depth + ~~this.#div[2];
		const offX =	this.#threshold[0];
		const offZ =	~~depth;
		const offY =	this.#threshold[2];

		y += Math.ceil(this.#div[2] - this.#pad[2]);
		const divisor = {
			div: [
				{ x: offX, y: offY, z: offZ },	// Vertex 0
				{ x, y: offY, z: offZ },		// Vertex 1
				{ x, y, z: offZ },				// Vertex 2
				{ x: offX, y, z: offZ },		// Vertex 3
				{ x: offX, y: offY, z },		// Vertex 4
				{ x, y: offY, z },				// Vertex 5
				{ x, y, z },					// Vertex 6
				{ x: offX, y, z }				// Vertex 7
			],
			width: x - 2 * this.#pad[2],
			depth: this.#div[2] + 0.3,
			height: y - 2 * this.#pad[2] - this.#div[2],
			offsetX: this.#threshold[0],
			offsetY: ~~depth,
			offsetZ: this.#threshold[2],
			layer: { name: `layer-${layer}`, color: 'div' },
		};
		return(divisor);
	};

	#setDivLayer(layer, depth, inner, data = []) {
		if(inner[0] <= 0 && inner[2] <= 0)
			return(data);
		let x = inner[0] < this.#div[1] ? inner[0] : inner[0] - this.#div[0];
		let y = inner[2] < this.#div[3] ? inner[2] : inner[2] - this.#div[3];

		x !== inner[0] ? inner[0] -= x: inner[0] = 0;
		y !== inner[2] ? inner[2] -= y: inner[2] = 0;
		data.push(this.#defineDivSize({ x, y }, depth, layer));
		return(this.#setDivLayer(layer, depth, inner, data));
	};

	#buildTraceAndFill(list) {
		let meta =		structuredClone(this.#data);
		const trace =	new TraceMaker();
		const fill =	new DesignWalls();
		let tmp;

		list.map(info => {
			info.map(data => {
				const { div, layer, art, offsetX, offsetY, offsetZ, width, depth, height } = data;

				trace.data = {
					info: meta,
					coordinates: art ? art: div,
					name: layer ?? div,
					show: div || tmp && tmp.name === layer.name ? false: true,
				};
				meta = trace.defineTrace;
				fill.objectData = {
					width,
					depth,
					height,
					info: meta,
					name: layer ?? div,
					offsetX,
					offsetY,
					offsetZ,
				};
				meta = fill.designSides;
				tmp = layer;
			})
		});
		return(meta)
	};

	#populateLayerTubeCrate() {
	};

	#populateLayerNotCanvas() {
	};

	#populateLayerHugeCanvas() {
	};

	#populateLayerSameSizes() {
	};

	#populateLayerStandard() {
		const { layers, fillGaps, artLocation } = this.#info;
		const onLayers =	[]
		let depthSum =		0;

		layers.map((data, i) => {
			let thickness = 0;
			const { vacuum, works } =	data;
			const allWorks =			works.map(info => this.#workGraphicPosition(info.work, artLocation.get(info.work[0]), depthSum, layers.length));
			const checkGap = 			vacuum.length >= 1 && vacuum[0] < vacuum[2] && vacuum[1] < vacuum[3];

			onLayers.push(this.#worksOffset(allWorks, depthSum, i + 1));
			works.filter(info => !thickness || thickness  < info.work[2] ? thickness = info.work[2] : 0);
			depthSum += +(thickness).toFixed(2);
			if(layers.length > 1){
				depthSum += this.#div[2];
				i ? onLayers.push(this.#setDivLayer(i + 1, depthSum, structuredClone(this.#inner))): 0;
			}
			if(checkGap) {
				const gaps = new FillGaps(vacuum, fillGaps);
			};
		}, 0);
		return(this.#buildTraceAndFill(onLayers));
	};

	#defineWorksLocation() {
		switch(this.#crate.type) {
			case 'tubeCrate':
				return(this.#populateLayerTubeCrate());
			case 'sameSizeCrate':
				return(this.#populateLayerSameSizes());
			case 'largestCrate':
				return(this.#populateLayerHugeCanvas());
			case 'noCanvasCrate':
				return(this.#populateLayerNotCanvas());
			case 'standardCrate':
				return(this.#populateLayerStandard());
		};
	};

	get arrange() {
		return(this.#defineWorksLocation());
	};
}
