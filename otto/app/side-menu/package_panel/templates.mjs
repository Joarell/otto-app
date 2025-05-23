export const materials = document.createElement('template');
materials.innerHTML = `
<div class="select-materials" aria-hidden="false" role="option">
	<div class="all-materials">
		<h3>Select the packing materials to apply on the artwork:</h3>
		<div id="populate-materials">
			<div>
				<input type="checkbox" name="material-1"></input>
				<label name="material-1">Glassine:</label>
			</div>
			<div>
				<input type="checkbox" name="material-2"></input>
				<label name="material-2">Glassine with silicon:</label>
			</div>
			<div>
				<input type="checkbox" name="material-3"></input>
				<label name="material-3">Cardboard:</label>
			</div>
			<div>
				<input type="checkbox" name="material-4"></input>
				<label name="material-4">Bubble plastic:</label>
			</div>
		</div>
	</div>
`;

export const availableMaterials = document.createElement('template');
availableMaterials.innerHTML = `
<div class="packing-materials" aria-hidden="false" role="none">
	<h3>Packing materials for updating:</h3>
	<div class="material-info">
		<div class="check-material">
			<input type="checkbox" name="material-1"></input>
			<label name="material-1">Glassine:</label>
		</div>
		<div class="material-sizes">
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_length" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="text" inputmode="numeric" id="input_depth" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_height" placeholder="H" name="height" maxlength="7" required>
		</div>
		<input class="material-price" type="number" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
	</div>
	<div class="material-info">
		<div class="check-material">
			<input type="checkbox" name="material-2"></input>
			<label name="material-3">Cardboard:</label>
		</div>
		<div class="material-sizes">
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_length" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="text" inputmode="numeric" id="input_depth" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_height" placeholder="H" name="height" maxlength="7" required>
		</div>
		<input class="material-price" type="number" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
	</div>
	<div class="material-info">
		<div class="check-material">
			<input type="checkbox" name="material-3"></input>
			<label name="material-3">Bubble plastic:</label>
		</div>
		<div class="material-sizes">
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_length" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="text" inputmode="numeric" id="input_depth" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_height" placeholder="H" name="height" maxlength="7" required>
		</div>
		<input class="material-price" type="number" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
	</div>
	<div class="material-info">
		<div class="check-material">
			<input type="checkbox" name="material4"></input>
			<label name="material-4">Tyvek:</label>
		</div>
		<div class="material-sizes">
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_length" placeholder="L" name="length" maxlength="7" required>
			<input  class="IO__add--form" type="text" inputmode="numeric" id="input_depth" name="depth" placeholder="D" maxlength="7" required>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_height" placeholder="H" name="height" maxlength="7" required>
		</div>
		<input class="material-price" type="number" placeholder="Price" pattern="\d+(\.\d{1,2})?" required></input>
	</div>
`
