import { build } from 'esbuild';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';

const __sourceFile = './src/index.ts';
const __destinationFile = './build/index.js';
const prefix = '#! /usr/bin/env node';

if (existsSync(__destinationFile)) {
	rmSync(__destinationFile, { force: true, recursive: true });
}

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
await build({
	entryPoints: [__sourceFile],
	platform: 'node',
	bundle: true,
	outfile: __destinationFile,
	logLevel: 'debug',
	minify: true,
	format: 'cjs',
	external: [
		...Object.keys(packageJson.optionalDependencies || {}),
		...Object.keys(packageJson.bundledDependencies || {}),
		...Object.keys(packageJson.peerDependencies || {}),
		...Object.keys(packageJson.devDependencies || {}),
		...Object.keys(packageJson.dependencies || {}),
	],
});

writeFileSync(
	__destinationFile,
	prefix + EOL + readFileSync(__destinationFile, 'utf-8'),
	'utf-8',
);
