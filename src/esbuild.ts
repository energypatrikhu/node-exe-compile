import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const minify = async (entrypoint: string, destination: string) => {
	const __root = join(require.main?.path || process.cwd());
	const __destination = join(__root, destination);
	const __packageJson = join(__root, 'package.json');
	const __entrypoint = join(__root, entrypoint);

	const packageJson = JSON.parse(readFileSync(__packageJson, 'utf-8'));

	await build({
		entryPoints: [__entrypoint],
		bundle: true,
		platform: 'node',
		outdir: __destination,
		logLevel: 'debug',
		minify: true,
		format: 'cjs',
		external: Object.keys(packageJson.dependencies || {}),
	});
};
