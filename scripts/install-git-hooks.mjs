import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desiredValue = '.githooks';
const desiredPath = path.join(repoRoot, desiredValue);
const hookPath = path.join(desiredPath, 'pre-commit');

function samePath(left, right) {
	const normalize = (value) => {
		const resolved = path.resolve(value).replaceAll('\\', '/');
		return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
	};
	return normalize(left) === normalize(right);
}

function git(args, { allowMissing = false } = {}) {
	const result = spawnSync('git', args, {
		cwd: repoRoot,
		encoding: 'utf8',
		shell: false,
	});

	if (result.error) throw new Error(`Git failed to start: ${result.error.message}`);
	if (allowMissing && result.status === 1) return '';
	if (result.status !== 0) throw new Error((result.stderr || result.stdout || 'Git command failed.').trim());
	return result.stdout.trim();
}

function verifyRepository() {
	const gitRoot = git(['rev-parse', '--show-toplevel']);
	if (!samePath(realpathSync.native(repoRoot), realpathSync.native(gitRoot))) {
		throw new Error(`Repository-root mismatch: script=${repoRoot}, git=${gitRoot}.`);
	}
}

function inspectHook() {
	if (!existsSync(hookPath) || !statSync(hookPath).isFile()) {
		return { ok: false, detail: `missing tracked adapter: ${hookPath}` };
	}

	const firstLine = readFileSync(hookPath, 'utf8').split(/\r?\n/, 1)[0];
	if (firstLine !== '#!/bin/sh') {
		return { ok: false, detail: 'tracked adapter must begin with #!/bin/sh' };
	}

	if (process.platform !== 'win32' && (statSync(hookPath).mode & 0o111) === 0) {
		return { ok: false, detail: 'tracked adapter is not executable' };
	}

	const indexEntry = git(['ls-files', '--stage', '--', '.githooks/pre-commit']);
	if (!indexEntry) {
		return { ok: true, detail: 'source ready; pending first commit with mode 100755' };
	}
	if (!indexEntry.startsWith('100755 ')) {
		return { ok: false, detail: 'tracked adapter mode must be 100755' };
	}

	return { ok: true, detail: 'tracked executable (100755)' };
}

function readState() {
	const configuredValue = git(['config', '--get', 'core.hooksPath'], { allowMissing: true });
	const localValue = git(['config', '--local', '--get', 'core.hooksPath'], { allowMissing: true });
	const origins = git(
		['config', '--show-origin', '--show-scope', '--get-all', 'core.hooksPath'],
		{ allowMissing: true },
	);
	const effectivePath = git(['rev-parse', '--path-format=absolute', '--git-path', 'hooks']);
	const hook = inspectHook();

	let status = 'not configured';
	if (configuredValue) status = samePath(effectivePath, desiredPath) ? 'already correct' : 'conflicting';

	return { configuredValue, localValue, origins, effectivePath, hook, status };
}

function report(state, status = state.status) {
	console.log(`Git hooks status: ${status}`);
	console.log(`Repository: ${repoRoot}`);
	console.log(`Desired repository-local value: ${desiredValue}`);
	console.log(`Effective hooks path: ${state.effectivePath}`);
	console.log(`Effective configured value: ${state.configuredValue || '(none)'}`);
	console.log(`Repository-local value: ${state.localValue || '(none)'}`);
	console.log(`Origin/scope: ${state.origins || '(not configured)'}`);
	console.log(`Hook adapter: ${state.hook.detail}`);
}

function main() {
	verifyRepository();
	const command = process.argv[2] ?? 'status';
	if (!['status', 'install'].includes(command)) {
		throw new Error('Usage: node scripts/install-git-hooks.mjs [status|install]');
	}

	const before = readState();
	if (command === 'status') {
		report(before);
		if (before.status === 'conflicting') process.exitCode = 2;
		return;
	}

	if (!before.hook.ok) {
		report(before);
		throw new Error(`Refusing installation: ${before.hook.detail}.`);
	}
	if (before.status === 'conflicting') {
		report(before);
		throw new Error('Refusing installation: a nonmatching effective core.hooksPath is already configured. Git configuration was not changed.');
	}
	if (before.status === 'already correct') {
		report(before);
		return;
	}

	git(['config', '--local', 'core.hooksPath', desiredValue]);
	const after = readState();
	if (after.localValue !== desiredValue || !samePath(after.effectivePath, desiredPath)) {
		throw new Error('Repository-local hook installation could not be verified.');
	}

	report(after, 'installed');
}

try {
	main();
} catch (error) {
	console.error(error.message);
	process.exitCode = 2;
}
