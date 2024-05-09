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
import { minify } from './esbuild';
import picocolors from 'picocolors';

interface PkgConfig {
	name: string;
	main: string;
	bin: string;
	pkg: {
		targets: Array<string>;
		assets: Array<string>;
		outputPath: string;
		additional: {
			[key: string]: string | Array<string>;
		};
	};
}

(async () => {
	const buildTimeStart = performance.now();

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

	console.log('\nBuild started!\n');
	const pkgConfigRaw = readFileSync(configFile, 'utf-8');
	const pkgConfig: PkgConfig = JSON.parse(pkgConfigRaw);

	if (!existsSync(pkgConfig.pkg.outputPath)) {
		mkdirSync(pkgConfig.pkg.outputPath, { recursive: true });
	}

	// Remove old files from pkg folder
	console.log(`Removing old files from 'pkg' folder...\n`);
	const pkgFolderContents = readdirSync(pkgConfig.pkg.outputPath);
	for (const file of pkgFolderContents) {
		rmSync(join(pkgConfig.pkg.outputPath, file), {
			recursive: true,
			force: true,
		});
	}

	// Minify file main file
	const main = pkgConfig.main || 'src/index.ts';
	const bin = pkgConfig.bin || 'build/index.js';
	console.log(`Minifying '${main}' into '${bin}'...`);
	const binPath = dirname(bin);
	await minify(main, binPath);

	// Compile executable
	const additional = pkgConfig.pkg.additional || {
		compress: 'brotli',
	};

	const pkgArgs = ['/r', join('node_modules', '.bin', 'pkg'), configFile];

	for (let [optionKey, optionValue] of Object.entries(additional)) {
		if (Array.isArray(optionValue)) {
			optionValue = optionValue.join(',');
		}

		pkgArgs.push(`--${optionKey}`, optionValue);
	}

	console.log(
		`\nCompiling '${pkgConfig.bin}', scripts and assets into executable...\n`,
	);
	const pkgProcess = spawn('cmd', pkgArgs);

	for await (const text of pkgProcess.stdout) {
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
	}

	pkgProcess.on('exit', async () => {
		if (copyMap.size > 0) {
			console.log(
				`Copying needed files into '${pkgConfig.pkg.outputPath}' directory...\n`,
			);

			const copyTimeStart = performance.now();
			for (const [filename, { from, to }] of copyMap) {
				if (extname(filename) !== '') {
					console.log(`  ${from}\n  > ${to}\n`);
					if (!existsSync(dirname(to))) {
						mkdirSync(dirname(to), { recursive: true });
					}
					copyFileSync(from, to);
				}
			}

			console.log(
				picocolors.green(
					`Done in ${Math.round(
						performance.now() - copyTimeStart,
					)}ms`,
				),
			);
		}

		console.log(
			picocolors.green(
				`\nBuild finished in ${Math.round(
					performance.now() - buildTimeStart,
				)}ms\n`,
			),
		);
	});
})();
