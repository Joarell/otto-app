import { defineConfig } from "rolldown";

export default defineConfig({
	input: "./app/main.mjs",
	wtach: {
		includes: "./app/**",
		clearScreen: false,
	},
	output: [
		{
			file: "./app/main.min.mjs",
			format: "esm",
			assetFileNames: "./app/[name]-[hash][extname]",
			preserverModules: true,
			output: {
				minify: {
					format: "cjs",
					maxWorkers: 4,
					keep_classnames: true,
					ecma: 2023,
				}
			},
		},
	],
	dir: "./app/",
	assetFileNames: "./app/[name]-[hash][extname]",
});
