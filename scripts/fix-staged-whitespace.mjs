import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();

function runGit(args, { allowFailure = false, encoding = 'utf8' } = {}) {
	const result = spawnSync('git', args, {
		cwd: repoRoot,
		encoding,
		shell: false,
	});

	if (result.error) {
		console.error(`Git failed to start: ${result.error.message}`);
		process.exit(1);
	}

	if (!allowFailure && result.status !== 0) {
		if (result.stdout) process.stdout.write(result.stdout);
		if (result.stderr) process.stderr.write(result.stderr);
		process.exit(result.status ?? 1);
	}

	return result;
}

function parseNullList(value) {
	return value.split('\0').filter(Boolean);
}

function trimTrailingWhitespace(content) {
	return content
		.replace(/[ \t]+(\r\n|\n|\r)/g, '$1')
		.replace(/[ \t]+$/g, '');
}

const stagedPaths = parseNullList(
	runGit(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR']).stdout,
);

if (stagedPaths.length === 0) {
	console.log('No staged files to normalize.');
	process.exit(0);
}

const fixed = [];
for (const relativePath of stagedPaths) {
	const filePath = path.join(repoRoot, relativePath);
	if (!existsSync(filePath) || !statSync(filePath).isFile()) continue;

	const buffer = readFileSync(filePath);
	if (buffer.includes(0)) continue;

	const content = buffer.toString('utf8');
	const normalized = trimTrailingWhitespace(content);
	if (normalized === content) continue;

	writeFileSync(filePath, normalized, 'utf8');
	runGit(['add', '--', relativePath]);
	fixed.push(relativePath);
}

if (fixed.length === 0) {
	console.log('No trailing whitespace changes were needed in staged text files.');
	process.exit(0);
}

console.log('Trimmed trailing whitespace in staged files:');
for (const item of fixed) {
	console.log(`- ${item}`);
}