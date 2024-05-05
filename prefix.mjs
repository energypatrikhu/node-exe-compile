import { readFileSync, writeFileSync } from 'node:fs';
import { EOL } from 'node:os';

const prefix = '#! /usr/bin/env node';
const file = 'build/index.js';

writeFileSync(file, prefix + EOL + readFileSync(file, 'utf-8'), 'utf-8');
