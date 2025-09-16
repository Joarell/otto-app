import TraceMaker from "./Plotly.trace.class.mjs";
import DesignWalls from "./Plotly.fill.colors.class.mjs";

export default class CratesFrame {
	#edges;
	#sized;
	#pine;

	constructor(sized, material) {
		const available =	JSON.parse(localStorage.getItem('crating'));
		const used =		available.map(opt => material.usedMaterials.get(opt));

		this.#pine =		used.find(list => list.at(-1) === 'Pinewood');
		this.#sized =		sized;
		this.#edges =		[
			[0, 1], [1, 2], [2, 3], [3, 0], // Bottom face
			[4, 5], [5, 6], [6, 7], [7, 4], // Top face
			[0, 4], [1, 5], [2, 6], [3, 7]  // Vertical edges
		];
		this.#pine[1] = +this.#pine[1];
		this.#pine[2] = +this.#pine[2];
		this.#pine[3] = +this.#pine[3];
	};

	#boundaries(coordinates) {
		const matrix = [];
		this.#edges.forEach(edge => {
			const v1 = coordinates[edge[0]];
			const v2 = coordinates[edge[1]];

			matrix.push({
				x: [ v1.x, v2.x ],
				y: [ v1.y, v2.y ],
				z: [ v1.z, v2.z ],
				name: 'Frame',
				mode: 'lines',
				type: 'scatter3d',
				showlegend: false,
				opacity: 1,
				line: {
					color: '#F0000000'
				}
			});
		});
		return(matrix);
	};

	#offsetFrame() {
		const allOffset = {
			offsetFeetRightFirst: {
				type: 'feet',
				x: 0,
				y: 0,
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: 0,
			},
			offsetFeetLeftFirst: {
				type: 'feetR',
				x: this.#sized[0],
				y: 0,
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: 0,
			},
			offsetFeetRightSecond: {
				type: 'feetUp',
				x: 0,
				y: this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#pine[2],
			},
			offsetFeetLeftSecond: {
				type: 'feetUpR',
				x: this.#sized[0],
				y: this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: this.#pine[2],
			},
			offsetFacesRightBackV: {
				type: 'faceV',
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetFacesLeftBackV: {
				type: 'faceVR',
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetFacesRightFrontV: {
				type: 'faceVB',
				x: this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetFacesLeftFrontV: {
				type: 'faceVBR',
				x: this.#sized[0] - this.#pine[2],
				y: this.#pine[3] + 2 * this.#pine[2],
				z: this.#sized[1],
				width: this.#pine[3],
				depth: this.#pine[2],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - (this.#pine[3] + this.#pine[2]),
				offsetY: this.#sized[1] - this.#pine[2],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesRightVUp: {
				type: 'sideHUp',
				x: 0,
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - (2 * this.#pine[2]),
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2]),
			},
			offsetSidesLeftVUp: {
				type: 'sideLeftHUp',
				x: this.#sized[0],
				y: this.#sized[2] - this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - (2 * this.#pine[2]),
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: this.#sized[2] - (this.#pine[3] + this.#pine[2]),
			},
			offsetSidesRightHDown: {
				type: 'sideHDown',
				x: 0,
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - (2 * this.#pine[2]),
				height: this.#pine[3],
				offsetX: 0,
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2],
			},
			offsetSidesLeftHDown: {
				type: 'sideLeftHDown',
				x: this.#sized[0],
				y: 2 * this.#pine[2],
				z: this.#pine[2],
				width: this.#pine[2],
				depth: this.#sized[1] - (2 * this.#pine[2]),
				height: this.#pine[3],
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#pine[2],
				offsetZ: 2 * this.#pine[2],
			},
			offsetFacesBackUpH: {
				type: 'faceHUp',
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
				type: 'faceH',
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
				type: 'faceHBackUp',
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
				type: 'faceHBackDown',
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
				type: 'sideV',
				x: 0,
				y: this.#pine[3] + (2 * this.#pine[2]),
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesRightVFront: {
				type: 'sideRightFrontV',
				x: 0,
				y: this.#pine[3] + (2 * this.#pine[2]),
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: 0,
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesLeftVBack: {
				type: 'sideLeftV',
				x: this.#sized[0],
				y: this.#pine[3] + (2 * this.#pine[2]),
				z: 0,
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: 0,
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetSidesLeftVFront: {
				type: 'sideLeftFrontV',
				x: this.#sized[0],
				y: this.#pine[3] + (2 * this.#pine[2]),
				z: this.#sized[1] - this.#pine[3],
				width: this.#pine[2],
				depth: this.#pine[3],
				height: this.#sized[2] - (2 * this.#pine[3] + 3 * this.#pine[2]),
				offsetX: this.#sized[0] - this.#pine[2],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: 2 * this.#pine[2] + this.#pine[3],
			},
			offsetTopFrontH: {
				type: 'topFace',
				x: this.#pine[3],
				y: this.#sized[2],
				z: 0,
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopBackH: {
				type: 'topComp',
				x: this.#pine[3],
				y: this.#sized[2],
				z: this.#sized[1],
				width: this.#sized[0] - 2 * this.#pine[3],
				depth: this.#pine[3],
				height: this.#pine[2],
				offsetX: this.#pine[3],
				offsetY: this.#sized[1] - this.#pine[3],
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopRight: {
				type: 'topFeet',
				x: 0,
				y: this.#sized[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: 0,
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
			offsetTopLeft: {
				type: 'topLeftFeet',
				x: this.#sized[0],
				y: this.#sized[2],
				z: 0,
				width: this.#pine[3],
				depth: this.#sized[1],
				height: this.#pine[2],
				offsetX: this.#sized[0] - this.#pine[3],
				offsetY: 0,
				offsetZ: this.#sized[2] - this.#pine[2],
			},
		};
		return(allOffset);
	};

	#defineFrameComponents() {
		const upFeet =			2 * this.#pine[2];
		const vertical =		this.#sized[2] - this.#pine[3] - this.#pine[2];
		const rightFeet =		this.#sized[0] - this.#pine[3];
		const vDepth =			this.#sized[1] - this.#pine[2];
		const upFace =			this.#sized[2] - this.#pine[3] - this.#pine[2];
		const tinySide =		this.#sized[1] - this.#pine[2];
		const tinyRightSide =	this.#sized[0] - this.#pine[2];
		const sideComp =		this.#pine[3] + this.#pine[2];
		const rightComp =		this.#sized[0] - this.#pine[3] - this.#pine[2];
		const topZ =			this.#sized[2] - this.#pine[2];
		const topzComp =		this.#sized[1] - this.#pine[3];
		const allParts =		{
			feet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: this.#pine[2], z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[2], z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: this.#pine[2], z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: this.#pine[2], z: this.#sized[1] }  // Vertex 7
			],
			feetR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: this.#pine[2], z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[2], z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: this.#pine[2], z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: this.#pine[2], z: this.#sized[1] }  // Vertex 7
			],
			feetUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: upFeet, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFeet, z: this.#sized[1] }  // Vertex 7
			],
			feetUpR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: upFeet, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFeet, z: this.#sized[1] }  // Vertex 7
			],
			faceV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: sideComp, y: 0, z: 0 }, // Vertex 1
				{ x: sideComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: sideComp, y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: sideComp, y: vertical, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: vertical, z: this.#pine[2] }  // Vertex 7
			],
			faceVR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightComp, y: 0, z: 0 }, // Vertex 1
				{ x: rightComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: rightComp, y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: rightComp, y: vertical, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: vertical, z: this.#pine[2] }  // Vertex 7
			],
			faceVB: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: sideComp, y: 0, z: 0 }, // Vertex 1
				{ x: sideComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: sideComp, y: 0, z: vDepth }, // Vertex 5
				{ x: sideComp, y: vertical, z: vDepth }, // Vertex 6
				{ x: 0, y: vertical, z: vDepth }  // Vertex 7
			],
			faceVBR: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightComp, y: 0, z: 0 }, // Vertex 1
				{ x: rightComp, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: rightComp, y: 0, z: vDepth }, // Vertex 5
				{ x: rightComp, y: vertical, z: vDepth }, // Vertex 6
				{ x: 0, y: vertical, z: vDepth }  // Vertex 7
			],
			faceH: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: this.#pine[2] }  // Vertex 7
			],
			faceHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[2] }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: this.#pine[2] }, // Vertex 5
				{ x: this.#sized[0], y: upFace, z: this.#pine[2] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[2] }  // Vertex 7
			],
			faceHBackUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: vDepth }, // Vertex 5
				{ x: this.#sized[0], y: upFace, z: vDepth }, // Vertex 6
				{ x: 0, y: upFace, z: vDepth }  // Vertex 7
			],
			faceHBackDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#sized[0], y: 0, z: 0 }, // Vertex 1
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: vDepth }, // Vertex 4
				{ x: this.#sized[0], y: 0, z: vDepth }, // Vertex 5
				{ x: this.#sized[0], y: this.#pine[3] + upFeet, z: vDepth }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: vDepth }  // Vertex 7
			],
			sideHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: tinySide }, // Vertex 5
				{ x: this.#pine[2], y: vertical, z: tinySide }, // Vertex 6
				{ x: 0, y: vertical, z: tinySide }  // Vertex 7
			],
			sideLeftHUp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: vertical, z: 0 }, // Vertex 2
				{ x: 0, y: vertical, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: tinySide }, // Vertex 5
				{ x: tinyRightSide, y: vertical, z: tinySide }, // Vertex 6
				{ x: 0, y: vertical, z: tinySide }  // Vertex 7
			],
			sideHDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: tinySide }, // Vertex 5
				{ x: this.#pine[2], y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: tinySide }  // Vertex 7
			],
			sideLeftHDown: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 2
				{ x: 0, y: this.#pine[3] + upFeet, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: tinySide }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: tinySide }, // Vertex 5
				{ x: tinyRightSide, y: this.#pine[3] + upFeet, z: tinySide }, // Vertex 6
				{ x: 0, y: this.#pine[3] + upFeet, z: tinySide }  // Vertex 7
			],
			sideV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: this.#pine[2], y: upFace, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[3] }  // Vertex 7
			],
			sideRightFrontV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[2], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[2], y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[2], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[2], y: upFace, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#sized[1] }  // Vertex 7
			],
			sideLeftV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: tinyRightSide, y: upFace, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#pine[3] }  // Vertex 7
			],
			sideLeftFrontV: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: tinyRightSide, y: 0, z: 0 }, // Vertex 1
				{ x: tinyRightSide, y: upFace, z: 0 }, // Vertex 2
				{ x: 0, y: upFace, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: tinyRightSide, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: tinyRightSide, y: upFace, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: upFace, z: this.#sized[1] }  // Vertex 7
			],
			topFace: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#pine[3] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#pine[3] }, // Vertex 5
				{ x: rightFeet, y: topZ, z: this.#pine[3] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#pine[3] }  // Vertex 7
			],
			topComp: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: topzComp }, // Vertex 4
				{ x: rightFeet, y: 0, z: topzComp }, // Vertex 5
				{ x: rightFeet, y: topZ, z: topzComp }, // Vertex 6
				{ x: 0, y: topZ, z: topzComp }  // Vertex 7
			],
			topFeet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: this.#pine[3], y: 0, z: 0 }, // Vertex 1
				{ x: this.#pine[3], y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: this.#pine[3], y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: this.#pine[3], y: topZ, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#sized[1] }  // Vertex 7
			],
			topLeftFeet: [
				{ x: 0, y: 0, z: 0 }, // Vertex 0
				{ x: rightFeet, y: 0, z: 0 }, // Vertex 1
				{ x: rightFeet, y: topZ, z: 0 }, // Vertex 2
				{ x: 0, y: topZ, z: 0 }, // Vertex 3
				{ x: 0, y: 0, z: this.#sized[1] }, // Vertex 4
				{ x: rightFeet, y: 0, z: this.#sized[1] }, // Vertex 5
				{ x: rightFeet, y: topZ, z: this.#sized[1] }, // Vertex 6
				{ x: 0, y: topZ, z: this.#sized[1] }  // Vertex 7
			],

		}
		return(allParts);
	};

	#definePosition(offset, comp) {
		const { x, y, z } = offset;
		const change =		structuredClone(comp);

		Object.entries(change).map((data, i) => {
			switch(i) {
				case 0:
					data[1].x === 0 ? data[1].x = x: 0;
					data[1].y === 0 ? data[1].y = y: 0;
					data[1].z === 0 ? data[1].z = z: 0;
					return(data);
				case 1:
					data[1].y === 0 ? data[1].y = y: 0;
					data[1].z === 0 ? data[1].z = z: 0;
					return(data);
				case 2:
					data[1].z === 0 ? data[1].z = z: 0;
					return(data);
				case 3:
					data[1].x === 0 ? data[1].x = x: 0;
					data[1].z === 0 ? data[1].z = z: 0;
					return(data);
				case 4:
					data[1].x === 0 ? data[1].x = x: 0;
					data[1].y === 0 ? data[1].y = y: 0;
					return(data);
				case 5:
					data[1].y === 0 ? data[1].y = y: 0;
					return(data);
				case 7:
					data[1].x === 0 ? data[1].x = x: 0;
					return(data);
			};
		});
		return(change);
	};

	#setAllParts(meta, component, offsets) {
		const trace =	new TraceMaker();
		const fill =	new DesignWalls();
		let show =		true;

		Object.entries(offsets).map(part => {
			const { type, offsetX, offsetY, offsetZ, width, depth, height } = part[1];
			const design =		component[type];
			const defined =		this.#definePosition(part[1], design);

			trace.data = {
				info: meta,
				coordinates: defined,
				name: 'frame',
				show,
			};
			meta = trace.defineTrace;
			fill.objectData = {
				width,
				depth,
				height,
				info: meta,
				name: 'frame',
				offsetX,
				offsetY,
				offsetZ,
			};
			meta = fill.designSides;
			show = false;
		});
		return(meta);
	};

	#designFrame() {
		const X = Math.ceil(this.#sized[0]);
		const Y = Math.ceil(this.#sized[1]);
		const Z = Math.ceil(this.#sized[2]);
		const boundarie = [
			{ x: 0, y: 0, z: 0 }, // Vertex 0
			{ x: X, y: 0, z: 0 }, // Vertex 1
			{ x: X, y: Y, z: 0 }, // Vertex 2
			{ x: 0, y: Y, z: 0 }, // Vertex 3
			{ x: 0, y: 0, z: Z }, // Vertex 4
			{ x: X, y: 0, z: Z }, // Vertex 5
			{ x: X, y: Y, z: Z }, // Vertex 6
			{ x: 0, y: Y, z: Z }  // Vertex 7
		];
		let meta =			this.#boundaries(boundarie);

		if(!this.#pine)
			return(meta);
		const components =	this.#defineFrameComponents();
		const offset =		this.#offsetFrame();

		meta =				this.#setAllParts(meta, components, offset);
		return(meta);
	};

	get setFrame() {
		return(this.#designFrame());
	};
};
