import { build } from 'esbuild';
import { readFileSync } from 'fs';
import type { PkgConfig } from './_types/Pkg';

export default async function esbuildMinify(entrypoint: string, destination: string, config: PkgConfig['esbuild']) {
	const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

	await build({
		entryPoints: [entrypoint],
		platform: 'node',
		bundle: true,
		logLevel: 'warning',
		treeShaking: true,
		outdir: destination,
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
		...config,
	});
}
