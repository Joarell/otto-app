export default class WorksLabel  {
	#data;
	#config;

	constructor() {
		this.#config = {
			type: 'scatter3d',
			mode: 'text',
			x: [],
			y: [],
			z: [],
			text: [],
			textposition: 'middle center',
			showlegend: false,
			hoverinfo: "none",
		}
	}

	#defineHugeLabel() {
		const { x, y, z, info, code, name, angle, align, base } = this.#data;
		const cosAngle = Math.cos(angle);
		const sinAngle = Math.sin(angle);
		const rotX = {
			valY : y * cosAngle - z * sinAngle + base,
			valZ: y * sinAngle + z * cosAngle + align
		};

		this.#config.x.push(x);
		this.#config.y.push(rotX.valY);
		this.#config.z.push(rotX.valZ);
		this.#config.text.push(code);
		this.#config.legendgroup = name;
		info.push(this.#config);
		return info;
	}

	#defineLabel() {
		const { x, y, z, info, code, name } = this.#data;

		this.#config.x.push(x);
		this.#config.y.push(y);
		this.#config.z.push(z);
		this.#config.text.push(code);
		this.#config.legendgroup = name;
		this.#config.name = name;
		info.push(this.#config);
		return info;
	}

	get setLabel() {
		return this.#defineLabel();
	}

	get setHugeLabel() {
		return this.#defineHugeLabel();
	}

	set data(info) {
		this.#data = info;
	}
}
