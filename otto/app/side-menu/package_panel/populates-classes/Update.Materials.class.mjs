import { availableMaterials, newMaterials } from "../templates.mjs";
import AvailableMaterials from "./Available.Materials.class.mjs";

export default class AddPackingMaterials {
	/** @type { Worker } COMMANDWORKER */
	#COMMANDWORKER = new Worker(
		new URL("./commands/worker.save.materials.mjs", import.meta.url),
		{ type: "module" },
	);
	#entry;
	#materials;

	/**
	 * @param { HTMLElement } entry1
	 * @param { HTMLElement } entry2
	 */
	constructor(entry) {
		if (!entry) return undefined;
		this.#entry = entry;
	}

	/**
	 * @method - updates all panels based on the new materials added.
	 */
	async populatePanels(panel) {
		const clone1 = newMaterials.content.cloneNode(true);
		const clone2 = availableMaterials.content.cloneNode(true);
		const node1 = document.importNode(clone1, true);
		const node2 = document.importNode(clone2, true);
		const fragment1 = new DocumentFragment();
		const fragment2 = new DocumentFragment();

		fragment1.append(node1);
		fragment2.append(node2);
		return panel === 1 ? fragment1 : fragment2;
	}

	/**
	 * @method - restore all materials already added.
	 */
	async #grabNewMaterials() {
		const packing = new AvailableMaterials(this.#entry);
		const packIDB = await packing.allMaterials;

		return packIDB;
	}

	/**
	 * @method = setup the second panel to update each material addition.
	 */
	async #updateDownPanel() {
		const { shadowRoot } = document.querySelector(".update-materials");
		const content =
			shadowRoot.querySelector(".data-update") ||
			shadowRoot.querySelector(".packing-materials");
		const fragment = new DocumentFragment();
		const clone = availableMaterials.content.cloneNode(true);
		const node = document.importNode(clone, true);

		content.className = "data-update";
		content.id = "update-info";
		fragment.append(node);
		!this.#materials ? (this.#materials = await this.#grabNewMaterials()) : 0;
		this.#materials.types.map((pack, i) => {
			const material = document.createElement("div");
			const select = document.createElement("select");
			const opts = [
				"Sheet",
				"Roll",
				"Pinewood",
				"Plywood",
				"Tape",
				"Foam Sheet",
			];
			const target = opts.findIndex((item) => item === pack[5]);

			select.innerHTML = `
			<option>Sheet</option>
			<option>Roll</option>
			<option>Pinewood</option>
			<option>Plywood</option>
			<option>Tape</option>
			<option>Foam Sheet</option>`;

			material.className = "material-info";
			select.children.item(target).selected = true;
			material.innerHTML = `
				<div class="check-material">
					<input type="checkbox" id="material-${i}" name="${pack[0]}"></input>
					<label for="material-${i}" name="material-${i}">${pack[0]}:</label>
				</div>
				<div class="material-sizes">
					<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(.[0-9]+)?$" placeholder="${pack[1]}" name="length" maxlength="7" required>
					<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(.[0-9]+)?$" name="depth" placeholder="${pack[2]}" maxlength="7" required>
					<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(.[0-9]+)?$" placeholder="${pack[3]}" name="height" maxlength="7" required>
				</div>
				<input class="material-price" type="number" placeholder="$ ${pack[4]}" pattern="d+(.d{1,2})?" required></input>
			`;
			material.appendChild(select);
			fragment.appendChild(material);
		}, 0);
		while (content?.firstChild) content.removeChild(content.firstChild);
		return content.appendChild(fragment);
	}

	/**
	 * @method - analyse and return the materials updated.
	 * @param { Array } list the existent list to compare with.
	 */
	#diffUpdateList(list, opt) {
		if (!list.length) return list;
		const stored = new Set(list);
		const updated = new Set(this.#materials.types);
		const diff = !opt ? updated.difference(stored) : stored.difference(updated);
		const entries = diff.entries();
		const result = [];
		let check;
		let item;

		for (item of entries) !Array.isArray(item[0][0]) ? result.push(item[0]) : 0;
		if (list.length >= result.length) {
			result.map((item) => {
				list.map((data) => {
					if (data[0] === item[0]) {
						for (let i = 0; i in data; i++)
							item[i] && data[i] !== item[i] ? (data[i] = item[i]) : 0;
					}
					return data;
				});
			});
		}
		check = list.some((material) => material[0] === result[0]);
		!check && list.length !== result.length ? list.push(...result) : 0;
		return opt && check ? this.#materials.types.concat(result) : list;
	}

	/**
	 * @method - save all materials data in browser localStorage.
	 */
	#browserStorege(opt) {
		const LS = localStorage;
		const materials = JSON.parse(LS.getItem("materials"));

		materials
			? LS.setItem(
					"materials",
					JSON.stringify(this.#diffUpdateList(materials), opt),
				)
			: LS.setItem("materials", JSON.stringify(this.#materials.types));
		document.querySelector(".materials").setAttribute("name", "update");
	}

	/**
	 * @method - save all materials in IDB.
	 */
	async #storeNewMaterials() {
		const checkMaterials = await this.#grabNewMaterials();
		const woods = ["Pinewood", "Plywood", "Foam Sheet"];
		const wrap = ["Sheet", "Roll", "Tape"];
		const checkWrap1 = this.#materials.types.some((item) =>
			wrap.includes(item[5]),
		);
		const checkWrap2 =
			checkMaterials &&
			checkMaterials.types.some((item) => wrap.includes(item[5]));
		const crateMaterial1 = this.#materials.types.some((item) =>
			woods.includes(item[5]),
		);
		const crateMaterial2 =
			checkMaterials &&
			checkMaterials.types.some((item) => woods.includes(item[5]));
		const check =
			checkMaterials &&
			checkMaterials.types.length >= this.#materials.types.length
				? 0
				: 1;

		if (!checkWrap1 && !checkWrap2) return "wrap";
		if (!crateMaterial1 && !crateMaterial2) return "wood";
		if (checkMaterials)
			checkMaterials.types = this.#diffUpdateList(checkMaterials.types, check);
		else this.#browserStorege(1);
		checkMaterials && checkMaterials.types.length
			? this.#COMMANDWORKER.postMessage(checkMaterials)
			: this.#COMMANDWORKER.postMessage(this.#materials);
		checkMaterials
			? localStorage.setItem("materials", JSON.stringify(checkMaterials.types))
			: localStorage.setItem(
					"materials",
					JSON.stringify(this.#materials.types),
				);
		// check  ? this.#browserStorege(0): 0;
		const message = await new Promise((resolve) => {
			this.#COMMANDWORKER.onmessage = (res) => {
				resolve(res.data);
			};
		});
		checkMaterials ? (this.#materials = checkMaterials) : 0;
		return message === "Saved" ? this.#updateDownPanel() : 0;
	}

	/**
	 * @method - remove and update materials on panels.
	 */
	async #removeAndUpdateMaterials() {
		const { shadowRoot } = document.querySelector(".materials");
		const content = shadowRoot.querySelector(".select-materials");
		const materials = await this.#grabNewMaterials();
		const updated = materials.types.filter(
			(pack) => !this.#materials.includes(pack[0]),
		);

		while (content && content.children.length > 1)
			content.removeChild(content.lastElementChild);
		this.#materials = { materials: "packing", types: updated };
		this.#COMMANDWORKER.postMessage(this.#materials);
		this.#updateDownPanel();
		this.#browserStorege(0);
		return this.#entry.setAttribute("name", "update");
	}

	/**
	 * @method - adds a new packing field.
	 */
	#addsNewFieldForNewMaterial() {
		const newOption = document.createElement("div");

		newOption.className = "material-sizes";
		newOption.innerHTML = `
			<input class="material-name" type="text" pattern="^[A-Za-z0-9s]+$" inputmode="text" placeholder="Type" required></input>
			<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(?:\\.[0-9]+)?$" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="H" name="height" maxlength="7" required>
			<input class="material-price" type="number" inputmode="numeric" placeholder="Price" pattern="d+(.d{1,2})?" required></input>
			<select>
				<option selected>Sheet</option>
				<option>Roll</option>
				<option>Pinewood</option>
				<option>Plywood</option>
				<option>Type</option>
				<option>Foam Sheet</option>
			</select>
		`;
		return newOption;
	}

	get secondPanelPopulate() {
		return this.#updateDownPanel();
	}

	get plusOne() {
		return this.#addsNewFieldForNewMaterial();
	}

	get saveinfo() {
		return this.#storeNewMaterials();
	}

	get removeMaterials() {
		return this.#removeAndUpdateMaterials();
	}

	/**
	 * @field - save the materials in IDB and server.
	 * @typedef { Object } Material;
	 * @property { [ Array: number | string ] } materials - the material list data.
	 * @param { Material } materials
	 */
	set saveMaterials(materials) {
		return (this.#materials = materials);
	}
}
