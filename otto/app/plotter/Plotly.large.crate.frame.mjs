
import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class LargeCratesFrame {
	#sized;
	#pine;
	#baseFinalSize;
	#meta;
	#feet;
	#ply;
	#depth;

	constructor(meta, sized, material, finalSize, extraDepth) {
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => material.usedMaterials.get(opt));
		const parser = (data) => data.map((info, i) => {
			if(i === 1 || i === 2 || i === 3) data[i] = +data[i];
			return info;
		})

		this.#meta = meta;
		this.#baseFinalSize = [ finalSize[0], finalSize[1] - sized[1], finalSize[2] ];
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#sized = sized;
		parser(this.#feet)
		parser(this.#ply);
		parser(this.#pine);
		this.#depth = extraDepth + this.#pine[2];
	}

	#offsetFrame() {
		const structOffset = this.#depth - 2 * this.#pine[2] + +this.#feet[3];
		const allOffset = {
			offsetFacesRightBackV: {
				type: "faceV",
				x: this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3],
			},
			offsetFacesLeftBackV: {
				type: "faceVR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3],
			},
			offsetFacesRightFrontV: {
				type: "faceVB",
				x: this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset + this.#pine[3],
			},
			offsetFacesLeftFrontV: {
				type: "faceVBR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + structOffset,
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset + this.#pine[3],
			},
			offsetSidesRightVUp: {
				type: "sideHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2]),
			},
			offsetSidesLeftVUp: {
				type: "sideLeftHUp",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2]),
			},
			offsetSidesRightHDown: {
				type: "sideHDown",
				x: 0,
				y: structOffset,
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: structOffset,
			},
			offsetSidesLeftHDown: {
				type: "sideLeftHDown",
				x: this.#sized[0],
				y: structOffset,
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: structOffset,
			},
			offsetFacesBackUpH: {
				type: "faceHUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3]),
			},
			offsetFacesBackDownH: {
				type: "faceH",
				x: 0,
				y: structOffset,
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: structOffset,
			},
			offsetFacesFrontUpH: {
				type: "faceHBackUp",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[2] + this.#pine[3]),
			},
			offsetFacesFrontDownH: {
				type: "faceHBackDown",
				x: 0,
				y: structOffset,
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: structOffset,
			},
			offsetSidesRightVBack: {
				type: "sideV",
				x: 0,
				y: structOffset + this.#pine[3],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3],
			},
			offsetSidesRightVFront: {
				type: "sideRightFrontV",
				x: 0,
				y: structOffset + this.#pine[3],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: structOffset + this.#pine[3],
			},
			offsetSidesLeftVBack: {
				type: "sideLeftV",
				x: this.#sized[0],
				y: structOffset + this.#pine[3],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: 0,
				offsetZ: structOffset + this.#pine[3],
			},
			offsetSidesLeftVFront: {
				type: "sideLeftFrontV",
				x: this.#sized[0],
				y: structOffset + this.#pine[3],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - structOffset - 2 * this.#pine[3] - this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: structOffset + this.#pine[3],
			},
			offsetTopFrontH: {
				type: "topFace",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopBackH: {
				type: "topComp",
				x: this.#pine[3],
				y: this.#sized[2] - this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopRight: {
				type: "topFeet",
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopLeft: {
				type: "topLeftFeet",
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
		};
		return allOffset;
	}

	#defineFrameComponents() {
		const offSetFeet = this.#depth - 2 * this.#ply[2] + this.#feet[3];
		const vertical = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const rightFeet = this.#sized[0] - this.#pine[3];
		const vDepth = this.#sized[1] - this.#pine[2];
		const upFace = this.#sized[2] - this.#pine[3] - this.#pine[2];
		const tinySide = this.#sized[1] - this.#pine[2];
		const tinyRightSide = this.#sized[0] - this.#pine[2];
		const sideComp = this.#pine[3] + this.#pine[2];
		const rightComp = this.#sized[0] - this.#pine[3] - this.#pine[2];
		const topZ = this.#sized[2];
		const topzComp = this.#sized[1] - this.#pine[3];
		const allParts = {
			faceV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: sideComp, y: 0, z: 0 }, // Vertex 1
				{ x: sideComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: sideComp, y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: sideComp, y: vertical, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: vertical, z: this.#pine[2] }, // Vertex 7
			],
			faceVR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightComp, y: 0, z: 0 }, // Vertex 1
				{ x: rightComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: rightComp, y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: rightComp, y: vertical, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: vertical, z: this.#pine[2] }, // Vertex 7
			],
			faceVB: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: sideComp, y: 0, z: 0 }, // Vertex 1
				{ x: sideComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: sideComp, y: 0, z: vDepth }, // Vertex 5
				{ x: sideComp, y: vertical, z: vDepth }, // Vertex 6
				{ x: 0, y: vertical, z: vDepth }, // Vertex 7
			],
			faceVBR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightComp, y: 0, z: 0 }, // Vertex 1
				{ x: rightComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: rightComp, y: 0, z: vDepth }, // Vertex 5
				{ x: rightComp, y: vertical, z: vDepth }, // Vertex 6
				{ x: 0, y: vertical, z: vDepth }, // Vertex 7
			],
			faceH: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + offSetFeet, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: this.#pine[3] + offSetFeet, z: this.#pine[2] }, // Vertex 7
			],
			faceHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: this.#sized[0], y: upFace, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[2] }, // Vertex 7
			],
			faceHBackUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: vDepth }, // Vertex 5
				{ x: this.#sized[0], y: upFace, z: vDepth }, // Vertex 6
				{ x: 0, y: upFace, z: vDepth }, // Vertex 7
			],
			faceHBackDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: vDepth }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + offSetFeet, z: vDepth }, // Vertex 6
				{ x: 0, y: this.#pine[3] + offSetFeet, z: vDepth }, // Vertex 7
			],
			sideHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: tinySide }, // Vertex 5
				{ x: this.#pine[2], y: vertical, z: tinySide }, // Vertex 6
				{ x: 0, y: vertical, z: tinySide }, // Vertex 7
			],
			sideLeftHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: tinySide }, // Vertex 5
				{ x: tinyRightSide, y: vertical, z: tinySide }, // Vertex 6
				{ x: 0, y: vertical, z: tinySide }, // Vertex 7
			],
			sideHDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: tinySide }, // Vertex 5
				{ x: this.#pine[2], y: this.#pine[3] + offSetFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + offSetFeet, z: tinySide }, // Vertex 7
			],
			sideLeftHDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + offSetFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: tinySide }, // Vertex 5
				{ x: tinyRightSide, y: this.#pine[3] + offSetFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + offSetFeet, z: tinySide }, // Vertex 7
			],
			sideV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: this.#pine[2], y: upFace, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[3] }, // Vertex 7
			],
			sideRightFrontV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[2], y: upFace, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#sized[1] }, // Vertex 7
			],
			sideLeftV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: tinyRightSide, y: upFace, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[3] }, // Vertex 7
			],
			sideLeftFrontV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: tinyRightSide, y: upFace, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#sized[1] }, // Vertex 7
			],
			topFace: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: rightFeet, y: topZ, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#pine[3] }, // Vertex 7
			],
			topComp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: topzComp }, // Vertex 4
				{ x: rightFeet, y: 0, z: topzComp }, // Vertex 5
				{ x: rightFeet, y: topZ, z: topzComp }, // Vertex 6
				{ x: 0, y: topZ, z: topzComp }, // Vertex 7
			],
			topFeet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: topZ, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#sized[1] }, // Vertex 7
			],
			topLeftFeet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: topZ, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#sized[1] }, // Vertex 7
			],
		};
		return allParts;
	}

	#definePosition(offset, comp) {
		const { x, y, z } = offset;
		const change = structuredClone(comp);

		Object.entries(change).map((data, i) => {
			switch (i) {
				case 0:
					if(data[1].x === 0) data[1].x = +x;
					if(data[1].y === 0) data[1].y = +y;
					if(data[1].z === 0) data[1].z = +z;
					break;
				case 1:
					if(data[1].y === 0) data[1].y = +y;
					if(data[1].z === 0) data[1].z = +z;
					break;
				case 2:
					if(data[1].z === 0) data[1].z = +z;
					break;
				case 3:
					if(data[1].x === 0) data[1].x = +x;
					if(data[1].z === 0) data[1].z = +z;
					break;
				case 4:
					if(data[1].x === 0) data[1].x = +x;
					if(data[1].y === 0) data[1].y = +y;
					break;
				case 5:
					if(data[1].y === 0) data[1].y = +y;
					break;
				case 7:
					if(data[1].x === 0) data[1].x = +x;
					break;
			}
			return data;
		});
		return change;
	}

	#setAllParts(meta, component, offsets) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const align = this.#feet[3];
		const sizes = {
			dep: this.#sized[1] - this.#depth,
			high: this.#baseFinalSize[2]
		};
		let show = true;

		Object.entries(offsets).map((part) => {
			const { type, offsetX, offsetY, offsetZ, width, depth, height } = part[1];
			const design = component[type];
			const defined = this.#definePosition(part[1], design);

			trace.data = {
				info: meta,
				coordinates: defined,
				name: "frame",
				show,
				sizes,
				align,
			};
			meta = trace.defineHugeTrace;
			fill.objectData = {
				align,
				width,
				depth,
				height,
				info: meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
				sizes,
			};
			meta = fill.largestCanvas;
			show = false;
			return part;
		});
		return meta;
	}

	#designFrame() {
		const components = this.#defineFrameComponents();
		const offset = this.#offsetFrame();

		this.#meta = this.#setAllParts(this.#meta, components, offset);
		return this.#meta;
	}

	get setFrame() {
		return this.#designFrame();
	}
}
