import { expect, describe, it } from 'bun:test';
import CraterTube from "../app/core2/Crater.tube.crate.mjs";
import ArtWork from "../app/core2/ArtWork.class.mjs";
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

	it("TEST-01: returns false object to no list passe to the class.", () => {
		const current = new CraterTube().makeCrate;
		const expected = { tube: false };

		expect(current).toEqual(expected);
	});

	it("TEST-02: returns the same size crate to the list passed.", () => {
		const list = artParser(mock.caseTube1);
		const current = new CraterTube(list, packing).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-03: returns the same size crate to the list passed.", () => {
		const list = artParser(mock.caseTube2);
		const current = new CraterTube(list, packing).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-04: returns the same size crate to the list passed.", () => {
		const list = artParser(mock.caseTube3);
		const current = new CraterTube(list, packing).makeCrate;

		expect(current.crates.length / 2).toEqual(1);
	});

	it("TEST-05: returns the same size crate to the list passed.", () => {
		const list = artParser(mock.caseTube4);
		const current = new CraterTube(list, packing).makeCrate;

		expect(current.crates.length / 2).toEqual(2);
	});
});
