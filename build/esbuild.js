"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minify = void 0;
const esbuild_1 = require("esbuild");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const minify = async (entrypoint, destination) => {
    const __root = (0, node_path_1.join)(require.main?.path || process.cwd());
    const __destination = (0, node_path_1.join)(__root, destination);
    const __packageJson = (0, node_path_1.join)(__root, 'package.json');
    const __entrypoint = (0, node_path_1.join)(__root, entrypoint);
    const packageJson = JSON.parse((0, node_fs_1.readFileSync)(__packageJson, 'utf-8'));
    await (0, esbuild_1.build)({
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
exports.minify = minify;
