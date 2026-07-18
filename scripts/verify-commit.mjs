import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const maxBuffer = 16 * 1024 * 1024;

function samePath(left, right) {
	const normalize = (value) => {
		const resolved = realpathSync.native(value).replaceAll('\\', '/');
		return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
	};
	return normalize(left) === normalize(right);
}

function runGit(args, { allowFailure = false, encoding = 'utf8' } = {}) {
	const result = spawnSync('git', args, {
		cwd: repoRoot,
		encoding,
		maxBuffer,
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

function parseNameStatus(output) {
	const fields = output.split('\0');
	if (fields.at(-1) === '') fields.pop();

	const records = [];
	for (let index = 0; index < fields.length; ) {
		const status = fields[index++];
		if (!status) break;

		if (status.startsWith('R') || status.startsWith('C')) {
			records.push({ status, from: fields[index++], path: fields[index++] });
		} else {
			records.push({ status, path: fields[index++] });
		}
	}

	return records;
}

function recordPaths(records) {
	return new Set(records.flatMap((record) => [record.from, record.path].filter(Boolean)));
}

function printList(label, values) {
	console.error(`${label}:`);
	for (const value of values) console.error(`- ${value}`);
}

const prohibitedRules = [
	{
		label: 'generated build output',
		matches: (value) => value === 'dist' || value.startsWith('dist/'),
	},
	{
		label: 'generated Astro state',
		matches: (value) => value === '.astro' || value.startsWith('.astro/'),
	},
	{
		label: 'dependency output',
		matches: (value) => value === 'node_modules' || value.startsWith('node_modules/'),
	},
	{
		label: 'local review state or logs',
		matches: (value) => value === '.tmp' || value.startsWith('.tmp/'),
	},
	{
		label: 'local baseline screenshots',
		matches: (value) => value === '.baseline-images' || value.startsWith('.baseline-images/'),
	},
	{
		label: 'local environment file',
		matches: (value) => /^\.env(?:\.|$)/.test(path.posix.basename(value)),
	},
	{
		label: 'package-manager debug log',
		matches: (value) => /^(?:npm-debug\.log|yarn-debug\.log|yarn-error\.log|pnpm-debug\.log)/.test(path.posix.basename(value)),
	},
	{
		label: 'operating-system metadata',
		matches: (value) => path.posix.basename(value) === '.DS_Store',
	},
];

const gitRootResult = runGit(['rev-parse', '--show-toplevel']);
const gitRoot = gitRootResult.stdout.trim();
if (!gitRoot || !samePath(repoRoot, gitRoot)) {
	console.error(`Repository-root mismatch: script=${repoRoot}, git=${gitRoot || 'unknown'}.`);
	process.exit(1);
}

console.log(`Repository root: ${repoRoot}`);

const stagedRecords = parseNameStatus(
	runGit(['diff', '--cached', '--name-status', '-z', '--find-renames']).stdout,
);
if (stagedRecords.length === 0) {
	console.error('Commit check refused: no staged changes.');
	console.error('Stage only the approved paths, inspect `git diff --cached`, then retry `npm run commit:check`.');
	process.exit(1);
}

console.log('\nStaged changes:');
for (const record of stagedRecords) {
	const detail = record.from ? `${record.from} -> ${record.path}` : record.path;
	console.log(`${record.status.padEnd(4)} ${detail}`);
}

console.log('\nStaged diff stat:');
const stat = runGit(['diff', '--cached', '--stat']);
process.stdout.write(stat.stdout || '(no textual stat)\n');

console.log('\n== Exact staged checks ==');
const whitespace = runGit(['diff', '--cached', '--check'], { allowFailure: true });
if (whitespace.status !== 0) {
	if (whitespace.stdout) process.stdout.write(whitespace.stdout);
	if (whitespace.stderr) process.stderr.write(whitespace.stderr);
	console.error('Commit check refused: the staged diff contains whitespace errors.');
	console.error('Fix the listed lines, stage the intended files again, and retry `npm run commit:check`.');
	process.exit(whitespace.status ?? 1);
}
console.log('Staged whitespace check passed.');

const prohibited = [];
for (const record of stagedRecords) {
	if (record.status === 'D') continue;
	const candidate = record.path.replaceAll('\\', '/');
	for (const rule of prohibitedRules) {
		if (rule.matches(candidate)) prohibited.push(`${candidate} (${rule.label})`);
	}
}

if (prohibited.length > 0) {
	printList('Commit check refused: prohibited staged paths', prohibited);
	console.error('Unstage them with `git restore --staged -- <path>` and retry `npm run commit:check`.');
	process.exit(1);
}
console.log('Staged path policy passed.');

const stagedPaths = recordPaths(stagedRecords);
const unstagedRecords = parseNameStatus(runGit(['diff', '--name-status', '-z', '--find-renames']).stdout);
const unstagedPaths = recordPaths(unstagedRecords);
const overlap = [...stagedPaths].filter((value) => unstagedPaths.has(value)).sort();

if (overlap.length > 0) {
	printList('Commit check refused: paths contain both staged and unstaged changes', overlap);
	console.error('Review `git diff` and `git diff --cached`, then stage the complete intended versions or separate the work before retrying.');
	process.exit(1);
}

if (unstagedRecords.length > 0) {
	printList('Commit check refused: tracked unstaged changes would make worktree validation differ from the proposed commit', [...unstagedPaths].sort());
	console.error('Stage the approved changes or move unrelated work to a separate clean worktree, then retry.');
	process.exit(1);
}

const untracked = runGit(['ls-files', '--others', '--exclude-standard', '-z']).stdout
	.split('\0')
	.filter(Boolean)
	.sort();
if (untracked.length > 0) {
	printList('Commit check refused: nonignored untracked files would make repository validation ambiguous', untracked);
	console.error('Stage approved source files or move unrelated files outside this worktree, then retry.');
	process.exit(1);
}

console.log('Staged/worktree state check passed: no tracked unstaged or nonignored untracked files.');
console.log('\n== Repository-wide validation ==');
console.log('The nonignored worktree matches the staged snapshot; ignored local/generated files remain outside the exact staged checks.');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const validation = spawnSync(npmCommand, ['run', 'validate'], {
	cwd: repoRoot,
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

if (validation.error) {
	console.error(`Canonical validation failed to start: ${validation.error.message}`);
	process.exit(1);
}
if (validation.status !== 0) {
	console.error(`Canonical validation failed with exit code ${validation.status}.`);
	console.error('Correct the reported failure without rewriting or restaging unrelated files, then retry `npm run commit:check`.');
	process.exit(validation.status ?? 1);
}

console.log('\nCommit check passed. Review `git diff --cached` and obtain human authorization before committing.');
