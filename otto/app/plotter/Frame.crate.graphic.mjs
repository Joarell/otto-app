import DesignWalls from "./Plotly.fill.colors.class.mjs";
import TraceMaker from "./Plotly.trace.class.mjs";

export default class CratesFrame {
	#sized;
	#pine;
	#feet;
	#meta;
	#ply;

	constructor(meta, data) {
		const { finalSize } = data;
		const available = JSON.parse(localStorage.getItem("crating"));
		const used = available.map((opt) => data.usedMaterials.get(opt));

		this.#meta = meta;
		this.#pine = used.find((list) => list.at(-1) === "Pinewood");
		this.#feet = used.find((list) => list.at(-1) === "Wooden Post");
		this.#ply = used.find((list) => list.at(-1) === "Plywood");
		this.#sized = finalSize;
		this.#pine[1] = +this.#pine[1];
		this.#pine[2] = +this.#pine[2];
		this.#pine[3] = +this.#pine[3];
	}

	#offsetFrame() {
		const allOffset = {
			offsetFacesRightBackV: {
				type: "faceV",
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height:
					this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: 0,
				offsetZ: +this.#feet[3] + this.#pine[3],
			},
			offsetFacesLeftBackV: {
				type: "faceVR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height:
					this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: 0,
				offsetZ: +this.#feet[3] + this.#pine[3],
			},
			offsetFacesRightFrontV: {
				type: "faceVB",
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height:
					this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: +this.#feet[3] + this.#pine[3],
			},
			offsetFacesLeftFrontV: {
				type: "faceVBR",
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height:
					this.#sized[2] - (+this.#feet[3] + 2 * this.#pine[3] + this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: +this.#feet[3] + this.#pine[3],
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
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2],
			},
			offsetSidesLeftHDown: {
				type: "sideLeftHDown",
				x: this.#sized[0],
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - 2 * this.#pine[2],
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2],
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
				y: 2 * this.#pine[2],
				z: 0,
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: 0,
				offsetZ: 2 * this.#pine[2],
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
				y: 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#sized[0],
				depth: this.#pine[2],
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: 2 * this.#pine[2],
			},
			offsetSidesRightVBack: {
				type: "sideV",
				x: 0,
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesRightVFront: {
				type: "sideRightFrontV",
				x: 0,
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesLeftVBack: {
				type: "sideLeftV",
				x: this.#sized[0],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesLeftVFront: {
				type: "sideLeftFrontV",
				x: this.#sized[0],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
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
		const upFeet = 2 * this.#pine[2];
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
			feet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: this.#pine[2], z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[2], z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: this.#pine[2], z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: this.#pine[2], z: this.#sized[1] }, // Vertex 7
			],
			feetR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: this.#pine[2], z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[2], z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: this.#pine[2], z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: this.#pine[2], z: this.#sized[1] }, // Vertex 7
			],
			feetUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: upFeet, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFeet, z: this.#sized[1] }, // Vertex 7
			],
			feetUpR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: upFeet, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFeet, z: this.#sized[1] }, // Vertex 7
			],
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
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: this.#pine[2] }, // Vertex 7
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
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: vDepth }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: vDepth }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: vDepth }, // Vertex 7
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
				{ x: this.#pine[2], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: tinySide }, // Vertex 5
				{ x: this.#pine[2], y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 7
			],
			sideLeftHDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: tinySide }, // Vertex 5
				{ x: tinyRightSide, y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 7
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
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 1:
					if (data[1].y === 0) data[1].y = y;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 2:
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 3:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].z === 0) data[1].z = z;
					return data;
				case 4:
					if (data[1].x === 0) data[1].x = x;
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 5:
					if (data[1].y === 0) data[1].y = y;
					return data;
				case 7:
					if (data[1].x === 0) data[1].x = x;
					return data;
			}
			return data;
		});
		return change;
	}

	#bluePrintExtraPineHorizontal({ x, y, z }, lastX) {
		const offX =
			lastX === 0 && this.#sized[0] !== x
				? this.#pine[3] + this.#pine[2]
				: lastX - 2 * this.#pine[3];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1] - this.#pine[2];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);

		const pine = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: lastX === 0 ? x - this.#pine[3] - this.#pine[2] : x - lastX,
			depth: z === this.#pine[3] ? z : -offZ + z,
			height: y - offY,
			offsetX: lastX === 0 ? offX : offX + this.#pine[3],
			offsetY: z === this.#pine[2] ? offZ : this.#sized[1] - this.#pine[2],
			offsetZ: offY,
		};
		return pine;
	}

	#bluePrintExtraPineDepth({ x, y, z }, lastX) {
		const offX = lastX === 0 ? 0 : this.#sized[0];
		const offY = +this.#feet[3] + (+this.#ply[3] - this.#pine[3]);
		const offZ = this.#pine[3];

		const pine = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: lastX === 0 ? this.#pine[2] : lastX - this.#pine[2],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX,
			offsetY: offZ,
			offsetZ: offY,
		};
		return pine;
	}

	#bluePrintExtraPineVertical({ x, y, z }, lastX, lastY) {
		const offX = lastX + +this.#ply[1] - +this.#pine[3] / 2 + this.#pine[2];
		const offY =
			lastY === 0
				? +this.#feet[3] + this.#pine[3]
				: this.#sized[2] - this.#pine[3] - this.#pine[2];
		const offZ = z === this.#pine[2] ? 0 : this.#sized[1];

		const pine = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: this.#pine[3],
			depth: this.#pine[2],
			height: y - offY,
			offsetX: offX,
			offsetY: z === this.#pine[2] ? offZ : z,
			offsetZ: offY,
		};
		return pine;
	}

	#bluePrintExtraPineTop({ x, y, z }) {
		const offX = +this.#ply[1] + +this.#ply[2] + this.#pine[3] / 2;
		const offY = this.#sized[2] - this.#pine[2];
		const offZ = this.#pine[3];

		const pine = {
			coordinates: [
				{ x: offX, y: offY, z: offZ }, // Vertex 0
				{ x, y: offY, z: offZ }, // Vertex 1
				{ x, y, z: offZ }, // Vertex 2
				{ x: offX, y, z: offZ }, // Vertex 3
				{ x: offX, y: offY, z }, // Vertex 4
				{ x, y: offY, z }, // Vertex 5
				{ x, y, z }, // Vertex 6
				{ x: offX, y, z }, // Vertex 7
			],
			width: this.#pine[3],
			depth: z - offZ,
			height: y - offY,
			offsetX: offX - this.#pine[3],
			offsetY: offZ,
			offsetZ: offY,
		};
		return pine;
	}

	#setFacesExtraPineHorizontal(data) {
		let { x, y, z, faceA } = data;

		if (x === 0)
			x =
				this.#pine[1] > this.#sized[0]
					? this.#sized[0] - this.#pine[3] - this.#pine[2]
					: this.#pine[1] + this.#pine[3] + this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = faceA === 0 ? this.#pine[2] : this.#sized[1];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return { x, y, z };
	}

	#setFacesExtraPineVertical(data) {
		let { x, y, z, faceA } = data;

		x += +this.#ply[1] - this.#pine[3] / 2 + this.#pine[3] + this.#pine[2];
		y = y === 0 ? +this.#ply[3] - this.#pine[3] / 2 : y + this.#pine[3];
		z = faceA === 0 ? this.#pine[2] : this.#sized[1] - this.#pine[2];
		if (data.x > 0) x = this.#sized[0] - x - this.#pine[3] - this.#pine[2];
		return { x, y, z };
	}

	#setTopExtraPine(data) {
		let { x, y, z } = data;

		x = +this.#ply[1] - this.#pine[3] / 2 + this.#pine[2];
		y = this.#sized[2];
		z = this.#sized[1] - this.#pine[3];
		return { x, y, z };
	}

	#setFacesExtraPineSides(data) {
		let { x, y, z, right } = data;

		if (right === 0) x = this.#pine[2];
		else x = this.#sized[0] - this.#pine[2];
		y = +this.#ply[3] - this.#pine[3] / 2 + this.#feet[3] + this.#pine[3] / 2;
		z = this.#sized[1] - this.#pine[3];
		return { x, y, z };
	}

	#frontAndBackFacesPineJoinVertical(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineVertical(join);

		data.push(this.#bluePrintExtraPineVertical(extraPine, join.x, join.y));
		join.y += extraPine.y;
		if (join.y >= this.#sized[2] && faceA === 0) {
			join.faceA = 1;
			join.y = 0;
		} else if (faceA === 1 && join.y >= this.#sized[2]) join.faceB = 1;
		return this.#frontAndBackFacesPineJoinVertical(data, join);
	}

	#frontAndBackFacesPineJoinHorizontal(data, join) {
		const { faceA, faceB } = join;
		if (faceA === 1 && faceB === 1) return data;
		const extraPine = this.#setFacesExtraPineHorizontal(join);

		data.push(this.#bluePrintExtraPineHorizontal(extraPine, join.x));
		if (faceA === 0) join.faceA = 1;
		else join.faceB = 1;
		return this.#frontAndBackFacesPineJoinHorizontal(data, join);
	}

	#sidePineJoin(data, join) {
		const { right, left } = join;
		if (right === 1 && left === 1) return data;
		const extraPine = this.#setFacesExtraPineSides(join);

		data.push(this.#bluePrintExtraPineDepth(extraPine, join.x, join.y));
		join.x += extraPine.x;
		if (right === 0) join.right = 1;
		else join.left = 1;
		return this.#sidePineJoin(data, join);
	}

	#topJoinExtrapine(data, join) {
		const extraPine = this.#setTopExtraPine(join);

		data.push(this.#bluePrintExtraPineTop(extraPine));
		join.y += extraPine.x + this.#pine[3];
		if (join.y >= this.#sized[2]) join.top = 1;
		return data;
	}

	#setJoins(data) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
		const show = false;

		data.map((part) => {
			const { coordinates, offsetX, offsetY, offsetZ, width, depth, height } =
				part;

			trace.data = {
				info: this.#meta,
				coordinates,
				name: "frame",
				show,
			};
			this.#meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: this.#meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
			};
			this.#meta = fill.designSides;
			return part;
		});
	}

	#extraPainForPlyJoins() {
		const lengthSize = this.#sized[0] > +this.#ply[1];
		const heightSize = this.#sized[2] > +this.#ply[3] - +this.#feet[3];
		const pineJoins = [];

		if (lengthSize) {
			this.#frontAndBackFacesPineJoinVertical(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0,
			});
			this.#topJoinExtrapine(pineJoins, { x: 0, y: 0, z: 0, top: 0 });
		}
		if (heightSize) {
			this.#frontAndBackFacesPineJoinHorizontal(pineJoins, {
				x: 0,
				y: 0,
				z: 0,
				faceA: 0,
				faceB: 0,
			});
			this.#sidePineJoin(pineJoins, { x: 0, y: 0, z: 0, right: 0, left: 0 });
		}
		if (pineJoins.length > 0) this.#setJoins(pineJoins);
	}

	#setAllParts(meta, component, offsets) {
		const trace = new TraceMaker();
		const fill = new DesignWalls();
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
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: "frame",
				offsetX,
				offsetY,
				offsetZ,
			};
			meta = fill.designSides;
			show = false;
			return part;
		});
		return meta;
	}

	#designFrame() {
		const components = this.#defineFrameComponents();
		const offset = this.#offsetFrame();

		this.#meta = this.#setAllParts(this.#meta, components, offset);
		this.#extraPainForPlyJoins();
		return this.#meta;
	}

	get setFrame() {
		return this.#designFrame();
	}
}
