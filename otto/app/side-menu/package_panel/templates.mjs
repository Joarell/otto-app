export const materials = document.createElement('template');
// <h3>Artwork package materials and price per m²:</h3>

materials.innerHTML = `
<div class="materials">
	<input class="IO__add--form" type="text" autofocus class="IO__top__estimate" id="input_estimate" name="estimate" required="true" placeholder="Quote">
	<div class="LDH">
		<span>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_length" placeholder="Length" name="length" maxlength="7" required>
		</span>
		<span>
			<input  class="IO__add--form" type="text" inputmode="numeric" id="input_depth" name="depth" placeholder="Depth" maxlength="7" required>
		</span>
		<span>
			<input class="IO__add--form" type="text" inputmode="numeric" id="input_height" placeholder="Height" name="height" maxlength="7" required>
		</span>
	</div>
</div>
`;
