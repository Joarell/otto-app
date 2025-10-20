/**
 * @typedef { HTMLElement } templateMaterials;
 */
export const templateMaterials = document.createElement("template");
templateMaterials.innerHTML = `
<div class="select-materials" aria-hidden="false" role="option">
	<h3>Select the packing materials to apply to the artwork:</h3>
</div>
`;

/**
 * @typedef { HTMLElement } availableMaterials
 */
export const availableMaterials = document.createElement("template");
availableMaterials.innerHTML = `
<div class="packing-materials" id="" aria-hidden="false" role="none" content="0">
	<h3>Packing materials for updating in ${globalThis.localStorage.getItem("metrica").split("-")[1]}:</h3>
	<p>Press this pane to save your updates.</p>
</div>
`;

/**
 * @typedef { HTMLElement } newMaterials
 */
export const newMaterials = document.createElement("template");
newMaterials.innerHTML = `
	<div class="new-material" id="new-material" aria-hidden="false" role="none">
		<h3 class="material-report">Add new packing material and playwood:</h3>
		<div>
			<p>
				Please, press the "<i class="nf nf-fa-circle_plus"></i>", button below for adding new materials in
				${globalThis.localStorage.getItem("metrica").split("-")[1]}, or click in "<i class="nf nf-oct-x_circle_fill"></i>" for removing it".
				Then, press this pane to save all materials.
			</p>
		</div>
	</div>
`;
// Then, hit the "<i class="nf nf-fa-check_circle"></i>", to save.

/**
 * @typedef { HTMLElement } newOption
 */
export const newOption = document.createElement("template");
newOption.innerHTML = `
<div class='material-sizes' id="new-field">
	<input class="material-name" type="text" pattern="^[a-zA-Z0-9 ]*$" inputmode="text" placeholder="Type" required></input>
	<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(?:\\.d]+)?$" placeholder="L" name="length" maxlength="7" required>
	<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(?:\\.d]+)?$" name="depth" placeholder="D" maxlength="7" required>
	<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(?:\\.d]+)?$" placeholder="H" name="height" maxlength="7" required>
	<input class="material-price" type="number" inputmode="numeric" placeholder="Price" pattern="d+(.d{1,2})?" required></input>
	<select>
		<option selected>Sheet</option>
		<option>Roll</option>
		<option>Pinewood</option>
		<option>Plywood</option>
		<!-- <option>Tape</option> -->
		<option>Foam Sheet</option>
	</select>
</div>
`;

/**
 * @typedef { HTMLElement } cratesPacked
 */
export const cratesPacked = document.createElement("template");
cratesPacked.innerHTML = `
<div class="upPane" id="first-pane" aria-hidden="false">
	<h3 class="material-report">Crates and artworks packing list:</h3>
</div>`;

/**
 * @typedef { HTMLElement } materialsTable
 */
export const materialsTable = document.createElement("template");
materialsTable.innerHTML = `
<div class="downPane" id="second-pane">
	<h3 class="material-report">Used material applied to the list:</h3>
</div>`;
