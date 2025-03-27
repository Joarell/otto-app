import html from '@rollup/plugin-html';
import terser from '@rollup/plugin-terser';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
	input: './app/main.mjs',
	wtach: {
		includes: './app/**',
		clearScreen: false
	},
	output: [
		{
			file: './app/main.min.mjs',
			format: 'esm',
			assetFileNames: './app/[name]-[hash][extname]',
			preserverModules: true,
			plugins: [terser({
				format: 'cjs',
				maxWorkers: 4,
				keep_classnames: true,
				ecma: 2023
			})],
		},
	],
	dir: "./app/",
	assetFileNames: "./app/[name]-[hash][extname]"
};

// export default [
// 	{
// 		input: './app/main.mjs',
// 		output: [
// 			{
// 				file: './app/main.min.mjs',
// 				format: 'esm',
// 				assetFileNames: './app/[name]-[hash][extname]',
// 				preserverModules: true,
// 				plugins: [terser({
// 					format: 'cjs',
// 					maxWorkers: 4,
// 					keep_classnames: true,
// 					ecma: 2023
// 				})],
// 			},
// 		],
// 		dir: "./app/",
// 		assetFileNames: "./app/[name]-[hash][extname]"
// 	},
// 	{
// 		input: 'app/index.html', // Your main HTML file
// 		output: {
// 			dir: 'dist', // Output directory
// 			format: 'es', // or 'es' or other format
// 			entryFileNames: '[name].mjs', // Output file name
// 			assetFileNames: '[name].[ext]', // Asset file name
// 		},
// 		plugins: [
// 			html({
// 				input: 'src/index.html', // Your main HTML file
// 				output: {
// 					dir: 'dist', // Output directory
// 					format: 'es', // or 'es' or other format
// 					entryFileNames: '[name].js', // Output file name
// 					assetFileNames: '[name].[ext]', // Asset file name
// 				},
// 			}),
// 			css(), // Extracts CSS
// 			nodeResolve(), // Resolves node modules
// 			replace({
// 				preventAssignment: true, // Prevent assignment to the replaced values
// 				values: {
// 					'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), // Replace environment variables
// 				},
// 			}),
// 		],
// 	},
// ];
