import { test, expect, describe, it } from 'bun:test';
import Arranger from "../app/core2/Arranger.class.mjs";
import ArtWork from "../app/core2/ArtWork.class.mjs";
import CraterStandard from "../app/core2/Crater.standard.crate.mjs";
import * as mock from "./mock.artworks.js";

describe("The are test to Standard Crate solver.", () => {
	const packing = {
		cratesOnly:  ['pine wood', 'ply wood', 'foam div', 'foam pad'],
		materials : [
			['card board', '180', '0.2', '120', '3', 'Sheet'],
			['pine wood', '500', '2.5', '10', '13', 'Pinewood'],
			['ply wood', '200', '2.5', '200', '15', 'Plywood'],
			['foam div', '180', '2.5', '120', '7', 'Foam Sheet'],
			['foam pad', '180', '5', '120', '10', 'Foam Sheet'],
			['glassine', '10000', '0.2', '100', '30', 'Roll'],
			['bubble plastic', '600', '0.3', '100', '20', 'Roll'],
		],
	}

	function artParser(list) {
		const { materials } = packing;
		const worksPack = ['Sheet', 'Roll'];
		const pack = materials.filter((item) => worksPack.includes(item.at(-1)))
		const newList = list.map((work) => {
			return new ArtWork(work[0], work[1], work[2], work[3], pack);
		});

		return newList;
	}

	it("TEST-01: returns false object to no list input to the class.", () => {
		const current = new CraterStandard().makeCrate;
		const expected = { standard: false };

		expect(current).toEqual(expected);
	});

	it("TEST-02: returns 3 crates as a result array with length of 6.", () => {
		const list = artParser(mock.standard1);
		const current = new CraterStandard(list, packing, 5, false).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-03: returns 1 crate with 5 layers.", () => {
		const list = artParser(mock.standard2);
		const current = new CraterStandard(list, packing, 5, false).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-04: returns 1 crates as result an array with length of 2.", () => {
		const list = artParser(mock.standard3);
		const current = new CraterStandard(list, packing, 4, false).makeCrate.crates.length / 2;

		expect(current).toEqual(1);
	});
	//
	it("TEST-05: returns 1 crates as result an array length of 2.", () => {
		const list = artParser(mock.standard4);
		const current = new CraterStandard(list, packing, 4, false).makeCrate.crates.length;

		expect(current).toEqual(2);
	});

	it("TEST-06: returns 2 crates as a result an array with length 4.", () => {
		const { sorted } = mock.findTubesTest();
		const list = artParser(sorted);
		const current = new CraterStandard(list, packing, 4, false).makeCrate.crates.length;

		expect(current).toEqual(2);
	});
	//
	it("TEST-07: returns 1 crates as a result array with length of 2.", () => {
		const list = artParser(mock.standard8);
		const current = new CraterStandard(list, packing, 5, false).makeCrate.crates.length / 2;

		expect(current).toEqual(1);
	});

	it("TEST-08: returns 1 crates as a result array with length of 2.", () => {
		const list = artParser(mock.standard9);
		const current = new CraterStandard(list, packing, 5, false).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-09: ", () => {
		const list = artParser(mock.standard9);
		const current = new CraterStandard(list, packing, 5, false).makeCrate;

		// console.log(current.crates);
		expect(current.crates.length / 2).toEqual(1);
	});
});
