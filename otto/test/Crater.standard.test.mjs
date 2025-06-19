import { describe, it } from 'node:test';
import assert from 'node:assert';
import CraterStandard from '../app/core2/Crater.standard.crate.mjs';
import * as mock from './mock.artworks.mjs';
import Arranger from '../app/core2/Arranger.class.mjs';
import ArtWork from '../app/core2/ArtWork.class.mjs';

describe("The are test to Standard Crate solver.", () => {
	function artParser(list) {
		const material = [['Cardboard', 160, 0.02, 120, 3.50, 'Sheet']];
		const newList = list.map(work => {
			return (new ArtWork(work[0], work[1], work[2], work[3], work[4], material))
		});

		return (newList);
	};

	it("TEST-01: returns false object to no list input to the class.", () => {
		const current =		new CraterStandard();
		const expected =	{ standard: false };

		assert.deepStrictEqual(current, expected);
	});

	// it("TEST-02: returns 3 crates as a result array with length of 6.", () => {
	// 	const list = artParser(mock.standard1);
	// 	const current = new CraterStandard(list, true, 5, false).crates.length;
	// 	const expected = 2;
	//
	// 	assert.deepStrictEqual(current, expected);
	// });
	//
	// it("TEST-03: returns 1 crate with 5 layers.", () => {
	// 	const list =		artParser(mock.standard2);
	// 	const test =		new CraterStandard(list, true, 4, false);
	// 	const current =		new CraterStandard(list, true, 4, false).crates[1].works.length;
	// 	const expected =	3;
	//
	// 	console.log(test.crates)
	// 	console.log(test.crates[0][3])
	// 	assert.deepStrictEqual(current, expected);
	// });

	// it("TEST-04: returns 1 crates as result an array with length of 2.", () => {
	// 	const list =		artParser(mock.standard3);
	// 	const current =		new CraterStandard(list, true, 4, false).crates.length;
	// 	const expected =	4
	//
	// 	assert.deepStrictEqual(current, expected);
	// });
	//
	// it("TEST-05: returns 1 crates as result an array length of 2.", () => {
	// 	const list =		artParser(mock.standard4);
	// 	const current =		new CraterStandard(list, true, 4, false).crates.length;
	// 	const expected =	2;
	//
	// 	assert.deepStrictEqual(current, expected);
	// });
	//
	// it("TEST-06: returns 3 crates as a result an array with length 6.", () => {
	// 	const { sorted } =	mock.findTubesTest();
	// 	const list =		artParser(sorted);
	// 	const current =		new CraterStandard(list, true, 4, false).crates.length;
	// 	const expected =	6;
	//
	// 	assert.deepStrictEqual(current, expected);
	// });
	//
	it("TEST-07: .", () => {
		const newList =		artParser(mock.standard6);
		const works =		new Arranger(newList);
		const { sorted } =	works.list;
		const size =		new CraterStandard(sorted, true, 4, false).crates[0];
		const current =		[ size[0], size[1], size[2] ];
		const expected =	[ 173, 45.5, 158 ];

		assert.deepStrictEqual(current, expected);
	});
});
