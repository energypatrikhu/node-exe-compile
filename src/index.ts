import { basename, dirname, extname, join } from 'node:path';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { spawn } from 'node:child_process';
import esbuildMinify from './esbuild';
import type { PkgConfig } from './_types/Pkg';
import oraStatus from './oraStatus';

(async () => {
	const pathFromRegex = /%1:\s/;
	const pathToRegex = /%2:\spath-to-executable/;

	const copyMap = new Map<string, { from: string; to: string }>();

	const configFile = 'pkg.config.json';

	const pkgConfigDefaultEntries: PkgConfig = {
		name: 'name',
		main: 'src/index.ts',
		bin: 'build/index.js',
		pkg: {
			targets: ['latest'],
			scripts: [],
			assets: ['node_modules/**/*.node'],
			outputPath: 'pkg',
			additional: {
				compress: 'brotli',
			},
		},
	};

	if (!existsSync(configFile)) {
		console.log(`'pkg.config.json' not found. Creating it...`);
		writeFileSync(
			configFile,
			JSON.stringify(pkgConfigDefaultEntries, null, '\t'),
			'utf-8',
		);
		console.log(
			`'pkg.config.json' created. Please fill in the required fields.`,
		);

		process.exit(0);
	}

	const pkgConfigRaw = readFileSync(configFile, 'utf-8');
	const pkgConfig: PkgConfig = JSON.parse(pkgConfigRaw);

	if (!existsSync(pkgConfig.pkg.outputPath)) {
		mkdirSync(pkgConfig.pkg.outputPath, { recursive: true });
	}

	// Remove old files from pkg folder
	const status_removeOldFiles = oraStatus(
		"Removing old files from 'pkg' folder...",
	);
	const pkgFolderContents = readdirSync(pkgConfig.pkg.outputPath);
	for (const file of pkgFolderContents) {
		rmSync(join(pkgConfig.pkg.outputPath, file), {
			recursive: true,
			force: true,
		});
	}
	status_removeOldFiles.succeed("Old files removed from 'pkg' folder.");

	// Minify file main file
	const main = pkgConfig.main || 'src/index.ts';
	const bin = pkgConfig.bin || 'build/index.js';
	const binPath = dirname(bin);
	const status_minifying = oraStatus(`Minifying '${main}' into '${bin}'...`);
	await esbuildMinify(main, binPath);
	status_minifying.succeed(`Minified '${main}' into '${bin}'`);

	// Compile executable
	const additional =
		pkgConfig.pkg.additional || pkgConfigDefaultEntries.pkg.additional;

	const pkgArgs = ['/r', join('node_modules', '.bin', 'pkg'), configFile];

	for (let [optionKey, optionValue] of Object.entries(additional)) {
		if (Array.isArray(optionValue)) {
			optionValue = optionValue.join(',');
		}

		pkgArgs.push(`--${optionKey}`, optionValue);
	}

	const status_compiling = oraStatus(
		`Compiling '${pkgConfig.bin}', scripts and assets into executable...`,
	);
	const pkgProcess = spawn('cmd', pkgArgs);

	pkgProcess.stdout.on('data', (text) => {
		const lines: Array<string> = text.toString().split('\n');

		for (const line of lines) {
			if (line.match(pathFromRegex)) {
				const from = line
					.replace(pathFromRegex, '')
					.replace(/\\/g, '\\\\')
					.trim();

				copyMap.set(basename(from), { from, to: '' });
			} else if (line.match(pathToRegex)) {
				const to =
					pkgConfig.pkg.outputPath +
					line.replace(pathToRegex, '').replace(/\//g, '\\\\').trim();

				copyMap.set(basename(to), {
					from: copyMap.get(basename(to))?.from || '',
					to,
				});
			}
		}
	});

	pkgProcess.on('exit', async () => {
		status_compiling.succeed(
			`Compiled '${pkgConfig.bin}', scripts and assets into executable`,
		);

		const copyMapEntries = Array.from(copyMap.entries()).filter(
			([filename]) => extname(filename) !== '',
		);
		if (copyMapEntries.length > 0) {
			const status_copying = oraStatus(
				`Copying needed files into '${pkgConfig.pkg.outputPath}' directory...`,
			);

			for (const [_, { from, to }] of copyMapEntries) {
				console.log(`  ${from}\n  > ${to}\n`);
				if (!existsSync(dirname(to))) {
					mkdirSync(dirname(to), { recursive: true });
				}
				copyFileSync(from, to);
			}

			status_copying.succeed(
				`Copied needed files into '${pkgConfig.pkg.outputPath}' directory`,
			);
		}
	});
})();
