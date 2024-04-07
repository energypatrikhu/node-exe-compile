"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minify = void 0;
const esbuild_1 = require("esbuild");
const node_fs_1 = require("node:fs");
const minify = async (entrypoint, destination) => {
    const packageJson = JSON.parse((0, node_fs_1.readFileSync)('package.json', 'utf-8'));
    await (0, esbuild_1.build)({
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
exports.minify = minify;
