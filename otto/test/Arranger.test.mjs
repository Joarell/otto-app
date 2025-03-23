
import Arranger from '../app/core2/Arranger.class.mjs';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as mock from './mock.artworks.mjs';
import ArrangerStarter from '../app/core2/Arranger.starter.class.mjs';
import ArrangerSameSize from '../app/core2/Arranger.same.size.class.mjs';
import ArrangerNoCanvas from '../app/core2/Arranger.no.canvas.mjs';
import ArrangerLargestCanvas from '../app/core2/Arranger.largest.works.mjs';
import ArrangerTube from '../app/core2/Arranger.tube.class.mjs';


describe("These are tests to Arranger class module.", () => {
	it("TEST-1: returns error to empty data.",  () => {
		const current =		 new Arranger();
		const error =		`Please, provide a type of 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-2: returns error to not 'ArtWork' type.", () => {
		const arr =			['11000', 100, 5, 100];
		const current =		 new Arranger(arr);
		const error =		`Some work is not of the type 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-3: returns error to string passed to the Arranger.", () => {
		const current =		 new Arranger('test');
		const error =		`Please, provide a type of 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-4: returns error to empty array.", () => {
		const current =		 new Arranger([]);
		const error =		`Please, provide a type of 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-5: returns error to string array.", () => {
		const current =		 new Arranger(['Test']);
		const error =		`Some work is not of the type 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-6: returns error to empty array.", () => {
		const current =		 new Arranger(['              ']);
		const error =		`Some work is not of the type 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-7: returns error to not 'ArtWork' type.", () => {
		const current =		 new Arranger(' ')
		const error =		`Please, provide a type of 'ArtWork' object.`;
		const expected =	new TypeError(error);

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-8: adds a list with cubed and sorted values", () => {
		const mocked =		mock.artWorksList();
		const current =		new ArrangerStarter(mocked);
		const expected =	mock.quickSortResult();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-9: adds an object list with same size works.", () => {
		const mocked =		mock.quickSortResult();
		const current =		new ArrangerSameSize(mocked);
		const expected =	mock.lessSameSize();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-10: adds an object list with no canvas elements.", () => {
		const mocked =		mock.lessSameSize();
		const current =		new ArrangerNoCanvas(mocked);
		const expected =	mock.noCanvasOut();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-11: adds an object with largest measures.", () => {
		const mocked =		mock.noCanvasOut();
		const current =		new ArrangerLargestCanvas(mocked);
		const expected =	mock.largestWorks();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-12: adds an object with respective cub values", () => {
		const mocked =		mock.largestWorks();
		const current =		new ArrangerTube(mocked);
		const expected =	mock.findTubesTest();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-13: returns the divided list with all procedures.", () => {
		const mocked =		mock.artWorksList();
		const current =		new Arranger(mocked);
		const expected =	mock.findTubes();

		assert.deepStrictEqual(current, expected);
	});

	it("TEST-14: returns a crate assuming the passed list.", () => {
		const list = [
			['ABC', 240, 10 , 240 ],
			['CBA', 237, 10, 243 ]
		];

		const test =		mock.artWorksList(list);
		const current =		new Arranger(mock.artWorksList(list)).list.largest.length;
		const expected =	2;

		assert.deepStrictEqual(current, expected);
	});
});
