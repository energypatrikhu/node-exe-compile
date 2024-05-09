import { build } from 'esbuild';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';
import ora from 'ora';

const __sourceFile = './src/index.ts';
const __destinationFile = './build/index.js';
const prefix = '#! /usr/bin/env node';

const ora__removeOldFiles = ora('Removing old files...');
const ora__building = ora('Building package...');
const ora__addingShebang = ora('Adding shebang...');

ora__removeOldFiles.start();
try {
	if (existsSync(__destinationFile)) {
		rmSync(__destinationFile, { force: true, recursive: true });
	}
	ora__removeOldFiles.succeed('Removed old files!');
} catch {
	ora__removeOldFiles.fail('Failed to remove old files!');
}

ora__building.start();
try {
	const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
	await build({
		entryPoints: [__sourceFile],
		platform: 'node',
		bundle: true,
		outfile: __destinationFile,
		logLevel: 'silent',
		minify: true,
		format: 'esm',
		external: [
			...Object.keys(packageJson.optionalDependencies || {}),
			...Object.keys(packageJson.bundledDependencies || {}),
			...Object.keys(packageJson.peerDependencies || {}),
			...Object.keys(packageJson.devDependencies || {}),
			...Object.keys(packageJson.dependencies || {}),
		],
		outExtension: { '.js': '.mjs' },
	});
	ora__building.succeed('Built package!');
} catch {
	ora__building.fail('Failed to build package!');
}

ora__addingShebang.start();
try {
	writeFileSync(
		__destinationFile,
		prefix + EOL + readFileSync(__destinationFile, 'utf-8'),
		'utf-8',
	);
	ora__addingShebang.succeed('Added shebang!');
} catch {
	ora__addingShebang.fail('Failed to add shebang!');
}
