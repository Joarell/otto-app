/**
* @typedef { HTMLElement } templateMaterials;
*/
export const templateMaterials = document.createElement('template');
templateMaterials.innerHTML = `
<div class="select-materials" aria-hidden="false" role="option">
	<h3>Select the packing materials to apply to the artwork:</h3>
</div>
`;

/**
* @typedef { HTMLElement } availableMaterials
*/
export const availableMaterials = document.createElement('template');
availableMaterials.innerHTML = `
<div class="packing-materials" aria-hidden="false" role="none">
	<h3>Packing materials for updating in ${globalThis.localStorage.getItem('metrica').split('-')[1]}:</h3>
</div>
`;

/**
* @typedef { HTMLElement } newMaterials
*/
export const newMaterials = document.createElement('template');
newMaterials.innerHTML = `
	<div class="new-material" id="new-material" aria-hidden="false" role="none">
		<h3 class="material-report">Add new packing material and playwood:</h3>
		<div>
			<p>
				Please, press the "<i class="nf nf-fa-circle_plus"></i>", button below for adding new materials in
				${globalThis.localStorage.getItem('metrica').split('-')[1]}, or click in "<i class="nf nf-oct-x_circle_fill"></i>" for removing it".
				Then, hit the "<i class="nf nf-fa-check_circle"></i>", to save.
			</p>
		</div>
	</div>
`;

/**
* @typedef { HTMLElement } newOption
*/
export const newOption = document.createElement('template');
newOption.innerHTML = `
<div class='material-sizes'>
	<input class="material-name" type="text" pattern="^[A-Za-z0-9\s]+$" inputmode="text" placeholder="Type" required></input>
	<input class="IO__add--form" type="number" inputmode="numeric" id="input_length" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="L" name="length" maxlength="7" required>
	<input  class="IO__add--form" type="number" inputmode="numeric" id="input_depth" pattern="^[0-9]+(?:\\.[0-9]+)?$" name="depth" placeholder="D" maxlength="7" required>
	<input class="IO__add--form" type="number" inputmode="numeric" id="input_height" pattern="^[0-9]+(?:\\.[0-9]+)?$" placeholder="H" name="height" maxlength="7" required>
	<input class="material-price" type="number" inputmode="numeric" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
	<select>
		<option selected>Sheet</option>
		<option>Roll</option>
		<option>Wood</option>
	</select>
</div>
`;


/**
* @typedef { HTMLElement } cratesPacked
*/
export const cratesPacked = document.createElement('template');
cratesPacked.innerHTML = `
<div class="upPane" id="first-pane" aria-hidden="false">
	<h3 class="material-report">Crates and artworks packing list:</h3>
	<details>
		<summary>
			crate 01 - 123 x 32x 128 - cm
		</summary>
		<details>
			<summary>layer1</summary>
			<ol>
				<li><a href="#estimate_getter">work01 - 100 x 10 x 100 - cm</a></li>
				<li><a href="#">work02 - 100 x 10 x 100 - cm</a></li>
				<li><a href="#">work03 - 100 x 10 x 100 - cm</a></li>
				<li><a href="#">work04 - 100 x 10 x 100 - cm</a></li>
			</ol>
		</details>
		<details>
			<summary>layer2</summary></details>
		<details>
			<summary>layer3</summary></details>
		<details>
			<summary>layer4</summary></details>
	</details>
</div>
`;

/**
* @typedef { HTMLElement } materialsTable
*/
export const materialsTable = document.createElement('template');
materialsTable.innerHTML = `
<div class="package downPane" id="second-pane">
	<table class="work1" id="work1" aria-hidden="true" role="none">
		<tr>
			<th><h4>Work2</h3></th>
		</tr>
		<tr>
			<th>Type</th>
			<th>Demand</th>
			<th>Prop/Area</th>
			<th>Reuse</th>
			<th>Residual</th>
			<th>Material unit</th>
			<th>Total cost $</th>
		</tr>
		<tr>
			<td>Glassine</td>
			<td>22 m²</td>
			<td>40%</td>
			<td>Yes</td>
			<td>60%</td>
			<td>roll</td>
			<td>$ 2.50</td>
		</tr>
		<tr>
			<td>Card board</td>
			<td>22 m²</td>
			<td>40%</td>
			<td>No</td>
			<td>60%</td>
			<td>sheet</td>
			<td>$ 10.00</td>
		</tr>
		<tr>
			<td>Subtotal:</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td>$ 15.00</td>
		</tr>
		<tr></tr>
	</table>
	<table>
		<h3 class="material-report">Whole used material to the list:</h3>
		<tr>
			<th>Type</th>
			<th>Used total</th>
			<th>Residual total</th>
		</tr>
		<tr>
			<td>Glassine</td>
			<td>44 m²</td>
			<td>120 m²</td>
		</tr>
		<tr>
			<td>Card boards</td>
			<td>2</td>
			<td>110 m²</td>
		</tr>
	</table>
	<table class="work1" id="work1" aria-hidden="true" role="none">
		<tr>
			<th><h3>Work2</h3></th>
		</tr>
		<tr>
			<th>Type</th>
			<th>Used</th>
			<th>Total cost $</th>
		</tr>
		<tr>
			<td>Glassine</td>
			<td>22 m²</td>
			<td>$ 5.00</td>
		</tr>
		<tr>
			<td>Card board</td>
			<td>22 m²</td>
			<td>$ 10.00</td>
		</tr>
		<tr>
			<td>Subtotal:</td>
			<td></td>
			<td>$ 15.00</td>
		</tr>
	</table>
</div>
<svg class="copy-message" preserveAspectRatio="none"><use href="#copy-content-icon"></use></svg>
</div>
`;
