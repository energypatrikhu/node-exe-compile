import { build } from 'esbuild';
import { existsSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';
import ora from 'ora-classic';

function oraStatus(text) {
	const performanceNow = performance.now();
	const spinner = ora(text).start();

	return {
		succeed: (text) => {
			spinner.succeed(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
		fail: (text) => {
			spinner.fail(
				`${text} in ${Math.round(
					performance.now() - performanceNow,
				)}ms`,
			);
		},
	};
}

const __sourceFile = './src/index.ts';
const __destinationFile = './build/index.js';
const prefix = '#! /usr/bin/env node';

const ora__removeOldFiles = oraStatus('Removing old files...');
try {
	if (existsSync(__destinationFile)) {
		rmSync(__destinationFile, { force: true, recursive: true });
	}
	ora__removeOldFiles.succeed('Removed old files');
} catch {
	ora__removeOldFiles.failed('Failed to remove old files');
}

const ora__building = oraStatus('Building package...');
try {
	const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
	await build({
		entryPoints: [__sourceFile],
		platform: 'node',
		bundle: true,
		outfile: __destinationFile,
		logLevel: 'silent',
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
	ora__building.succeed('Built package');
} catch {
	ora__building.failed('Failed to build package');
}

const ora__addingShebang = oraStatus('Adding shebang...');
try {
	writeFileSync(
		__destinationFile,
		prefix + EOL + readFileSync(__destinationFile, 'utf-8'),
		'utf-8',
	);
	ora__addingShebang.succeed('Added shebang');
} catch {
	ora__addingShebang.failed('Failed to add shebang');
}
