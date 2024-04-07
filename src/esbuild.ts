import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

export const minify = async (entrypoint: string, destination: string) => {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

	await build({
		entryPoints: [entrypoint],
		bundle: true,
		platform: 'node',
		outdir: destination,
		logLevel: 'debug',
		minify: true,
		format: 'cjs',
		external: Object.keys(packageJson.dependencies || {}),
	});
};
