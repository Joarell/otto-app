import assert from "node:assert";
import { describe, it } from "node:test";
import ArtWork from "../app/core2/ArtWork.class.mjs";

describe("Testing the Artwork class:", () => {
	const material = [["Cardboard", 160, 0.02, 120, 3.5, "Sheet"]];
	const materialRB = [["Cardboard", 3000, 0.02, 120, 3.5, "Roll"]];
	const materialRS = [["Cardboard", 100, 0.02, 120, 3.5, "Roll"]];

	it("Test-1: returns the artwork object.", () => {
		const art = new ArtWork("001", 180, 5, 120, material);
		const current = art instanceof ArtWork;
		const expected = true;

		assert.strictEqual(current, expected);
	});

	it("Test-2: returns false when code value is passed through.", () => {
		const current = new ArtWork(" ", "180", "5", "120");
		const error = `Please, provide a valid code. Current:  `;
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-3: returns false when none code value is passed through.", () => {
		const current = new ArtWork("", "180", "5", "120", material);
		const error = `Please, provide a valid code. Current: `;
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-4: returns the array of the artwork.", () => {
		const art = new ArtWork("001", "180", "5", "120", material);
		const current = Array.isArray(art.arr);
		const expected = true;

		assert.strictEqual(current, expected);
	});

	it("Test-5: returns cubed value as air company calculation.", () => {
		const art = new ArtWork("001", "180", "5", "120", material);
		const current = art.cAir;
		const expected = 18;

		assert.strictEqual(current, expected);
	});

	it("Test-6: returns undefined to cubed air company calculation.", () => {
		const art = new ArtWork("001", "a", "5", "120", material);
		const current = art.cAir;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-7: returns false to cubed air company calculation.", () => {
		const art = new ArtWork("001", 180, "a", 120, material);
		const current = art.cAir;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-8: returns false to cubed air company calculation.", () => {
		const art = new ArtWork("001", "180", "5", "-", material);
		const current = art.cAir;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-9: returns the cubic calculation.", () => {
		const art = new ArtWork("001", 180, 5, 120, material);
		const current = art.cubed;
		const expected = 0.108;

		assert.strictEqual(current, expected);
	});

	it("Test-10: returns an Error to cubic calculation.", () => {
		const art = new ArtWork("001", "a", "5", "120", material);
		const current = art.cubed;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-11: returns an Error to cubic calculation.", () => {
		const art = new ArtWork("001", "180", "a", "120", material);
		const current = art.cubed;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-12: returns an Error to cubic calculation.", () => {
		const art = new ArtWork("001", 180, 5, "a", material);
		const current = art.cubed;
		const error = "Not a valid entry to RegexChecker!";
		const expected = new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("Test-13: returns an object with art work data.", () => {
		const art = new ArtWork("001", 180, 5, 100, material);
		const current = art.data;
		const expected = { code: "001", x: 180, z: 5, y: 100, packing: material };

		assert.deepStrictEqual(current, expected);
	});

	it("Test-14: returns the unit conversion from in to cm.", () => {
		const current = new ArtWork("001", 70.866, 1.968, 39.37, material)
			.autoConvert;
		const expected = ["001", 180, 5, 100];

		assert.deepStrictEqual(current, expected);
	});

	it("Test-15: return the packed work sizes.", () => {
		const art = new ArtWork("001", 180, 5, 100, material);
		const current = art.packedSized;
		const expected = { code: "001", x: 180.04, z: 5.04, y: 100.04 };

		assert.deepStrictEqual(current, expected);
	});

	it("Test-16: return the packed work sizes.", () => {
		const art = new ArtWork("001", 180, 5, 100, material);
		const current = art.packingDemanded;
		const expected = 388;

		assert.deepStrictEqual(current, expected);
	});

	it("Test-17: return the packed work sizes.", () => {
		const art = new ArtWork("001", 180, 5, 100, material);
		const current = art.packInfo;
		const expected = {
			demand: 388,
			percent: [["Cardboard", 202]],
			reuse: [["Cardboard", false]],
			residual: [["Cardboard", 98]],
			types: [["Sheet", 192]],
			cost: [["Cardboard", 7.07]],
			quantity: [["Cardboard", 3]],
		};

		assert.deepStrictEqual(current, expected);
	});

	it("Test-18: return the packed work sizes.", () => {
		const art = new ArtWork("001", 180, 5, 100, materialRB);
		const current = art.packInfo;
		const expected = {
			demand: 388,
			percent: [["Cardboard", 11]],
			reuse: [["Cardboard", true]],
			residual: [["Cardboard", 89]],
			types: [["Roll", 3600]],
			cost: [["Cardboard", 0.39]],
			quantity: [["Cardboard", 0.11]],
		};

		assert.deepStrictEqual(current, expected);
	});

	it("Test-19: return the packed work sizes.", () => {
		const art = new ArtWork("001", 180, 5, 100, materialRS);
		const current = art.packInfo;
		const expected = {
			demand: 388,
			percent: [["Cardboard", 323]],
			reuse: [["Cardboard", false]],
			residual: [["Cardboard", 77]],
			types: [["Roll", 120]],
			cost: [["Cardboard", 11.3]],
			quantity: [["Cardboard", 3.23]],
		};

		assert.deepStrictEqual(current, expected);
	});
});
