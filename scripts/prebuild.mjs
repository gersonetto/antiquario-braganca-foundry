import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(readFileSync('static/module.json', 'utf8'));

manifest.version = pkg.version;
manifest.download = `${manifest.url}/releases/download/v${pkg.version}/module.zip`;

writeFileSync('static/module.json', `${JSON.stringify(manifest, null, 2)}\n`);
