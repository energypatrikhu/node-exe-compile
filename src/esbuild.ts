import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

export default async function esbuildMinify(
	entrypoint: string,
	destination: string,
) {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

	await build({
		entryPoints: [entrypoint],
		bundle: true,
		platform: 'node',
		outdir: destination,
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
}
