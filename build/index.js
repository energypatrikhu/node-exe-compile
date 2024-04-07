#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const node_child_process_1 = require("node:child_process");
const esbuild_1 = require("./esbuild");
(async () => {
    const __root = (0, node_path_1.join)(require.main?.path || process.cwd());
    const pathFromRegex = /%1:\s/;
    const pathToRegex = /%2:\spath-to-executable/;
    const copyMap = new Map();
    const configFile = (0, node_path_1.join)(__root, 'pkg.config.json');
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
    if (!(0, node_fs_1.existsSync)(configFile)) {
        console.log('pkg.config.json not found. Creating one...');
        (0, node_fs_1.writeFileSync)(configFile, JSON.stringify(pkgConfigDefaultEntries, null, '\t'), 'utf-8');
        console.log('pkg.config.json created. Please fill in the required fields.');
        process.exit(0);
    }
    console.log('Building started...');
    const pkgConfigRaw = (0, node_fs_1.readFileSync)(configFile, 'utf-8');
    const pkgConfig = JSON.parse(pkgConfigRaw);
    // Remove old files
    console.log('Removing old files...');
    const pkgFolderContents = (0, node_fs_1.readdirSync)((0, node_path_1.join)(__root, pkgConfig.pkg.outputPath));
    for (const file of pkgFolderContents) {
        (0, node_fs_1.rmSync)((0, node_path_1.join)(__root, pkgConfig.pkg.outputPath, file), {
            recursive: true,
            force: true,
        });
    }
    // Minify script(s)
    console.log('Minifying script(s)...');
    const main = pkgConfig.main || 'src/index.ts';
    const bin = pkgConfig.bin || 'build/index.js';
    const binPath = (0, node_path_1.dirname)(bin);
    await (0, esbuild_1.minify)(main, binPath);
    // Compile executable
    const additional = pkgConfig.pkg.additional || {
        compress: 'brotli',
    };
    const compress = additional.compress || 'brotli';
    console.log('Compiling executable...');
    const pkgProcess = (0, node_child_process_1.spawn)('cmd', [
        '/r',
        (0, node_path_1.join)(__root, 'node_modules', '.bin', 'pkg'),
        configFile,
        '--compress',
        compress,
    ]);
    for await (const text of pkgProcess.stdout) {
        const lines = text.toString().split('\n');
        for (const line of lines) {
            if (line.match(pathFromRegex)) {
                const from = __root +
                    line
                        .replace(pathFromRegex, '')
                        .replace(/\\/g, '\\\\')
                        .trim();
                copyMap.set((0, node_path_1.basename)(from), { from, to: '' });
            }
            else if (line.match(pathToRegex)) {
                const to = pkgConfig.pkg.outputPath +
                    line.replace(pathToRegex, '').replace(/\//g, '\\\\').trim();
                copyMap.set((0, node_path_1.basename)(to), {
                    from: copyMap.get((0, node_path_1.basename)(to))?.from || '',
                    to,
                });
            }
        }
    }
    pkgProcess.on('exit', async () => {
        console.log('Copying needed files into pkg directory...');
        for (const [filename, { from, to }] of copyMap) {
            if ((0, node_path_1.extname)(filename) !== '') {
                console.log(`Copying: ${from}\n       > ${to}`);
                if (!(0, node_fs_1.existsSync)((0, node_path_1.dirname)(to))) {
                    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(to), { recursive: true });
                }
                (0, node_fs_1.copyFileSync)(from, to);
            }
        }
    });
})();
