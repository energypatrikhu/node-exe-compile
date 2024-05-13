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
			spinner.fail(text);
		},
	};
}

const __sourceFile = './src/index.ts';
const __destinationFile = './build/index.js';
const prefix = '#! /usr/bin/env node';

const ora__removeOldFiles = oraStatus('Removing old file...');
try {
	if (existsSync(__destinationFile)) {
		rmSync(__destinationFile, { force: true, recursive: true });
	}
	ora__removeOldFiles.succeed('Removed old file');
} catch {
	ora__removeOldFiles.fail('Failed to remove old file');
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
		treeShaking: true,
		minify: true,
		format: 'cjs',
		external: (() => {
			const dependencies = new Set();
			for (const key in packageJson) {
				if (key.toLowerCase().endsWith('dependencies')) {
					for (const dep in packageJson[key]) {
						dependencies.add(dep);
					}
				}
			}
			return [...dependencies.values()];
		})(),
	});
	ora__building.succeed('Built package');
} catch {
	ora__building.fail('Failed to build package');
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
	ora__addingShebang.fail('Failed to add shebang');
}
