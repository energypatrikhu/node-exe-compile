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
		external: ((): string[] => {
			const dependencies = new Set<string>();
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
}
