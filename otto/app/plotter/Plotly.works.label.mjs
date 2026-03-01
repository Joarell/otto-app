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
			show: true,
		}
	}

	#defineHugeLabel() {
		const { x, y, z, info, code, dep, high, show } = this.#data;
		const cosAngle = Math.cos(dep / high);
		const sinAngle = Math.sin(high / dep);
		const rotX = {
			valY : y * cosAngle - z * sinAngle,
			valZ: y * sinAngle + z * cosAngle
		};

		this.#config.x.push(x);
		this.#config.y.push(rotX.valY);
		this.#config.z.push(rotX.valZ);
		this.#config.text.push(code);
		this.#config.show = show;
		info.push(this.#config);
		return info;
	}

	#defineLabel() {
		const { x, y, z, info, code, show } = this.#data;

		this.#config.x.push(x);
		this.#config.y.push(y);
		this.#config.z.push(z);
		this.#config.text.push(code);
		this.#config.show = show;
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
