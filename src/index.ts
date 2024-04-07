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

(async () => {
	const __root = join(require.main?.path || process.cwd());
	const pathFromRegex = /%1:\s/;
	const pathToRegex = /%2:\spath-to-executable/;

	const copyMap = new Map<string, { from: string; to: string }>();

	const configFile = join(__root, 'pkg.config.json');

	// building pkgs
	console.log('Building pkg(s)...');
	const pkgConfigDefaultEntries = {
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
		writeFileSync(
			configFile,
			JSON.stringify(pkgConfigDefaultEntries, null, '\t'),
			'utf-8',
		);

		process.exit(0);
	}

	const pkgConfigRaw = readFileSync(configFile, 'utf-8');
	const pkgConfig = JSON.parse(pkgConfigRaw);

	// Remove old files
	console.log('Removing old files...');
	const pkgFolderContents = readdirSync(
		join(__root, pkgConfig.pkg.outputPath),
	);
	for (const file of pkgFolderContents) {
		rmSync(join(__root, pkgConfig.pkg.outputPath, file), {
			recursive: true,
			force: true,
		});
	}

	// Minify script(s)
	console.log('Minifying script(s)...');
	const main = pkgConfig.main || 'src/index.ts';
	const bin = pkgConfig.bin || 'build/index.js';
	const binPath = dirname(bin);
	await minify(main, binPath);

	// Compile executable
	const additional = pkgConfig.pkg.additional || {
		compress: 'brotli',
	};
	const compress = additional.compress || 'brotli';

	console.log('Compiling executable...');
	const pkgProcess = spawn('cmd', [
		'/r',
		join(__root, 'node_modules', '.bin', 'pkg'),
		configFile,
		'--compress',
		compress,
	]);

	for await (const text of pkgProcess.stdout) {
		const lines: Array<string> = text.toString().split('\n');

		for (const line of lines) {
			if (line.match(pathFromRegex)) {
				const from =
					__root +
					line
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
		console.log('Copying needed files into pkg directory...');
		for (const [filename, { from, to }] of copyMap) {
			if (extname(filename) !== '') {
				console.log(`Copying: ${from}\n       > ${to}`);
				if (!existsSync(dirname(to))) {
					mkdirSync(dirname(to), { recursive: true });
				}
				copyFileSync(from, to);
			}
		}
	});
})();
