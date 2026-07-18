import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	renameSync,
	rmSync,
	unlinkSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, { cwd, env = process.env, allowFailure = false } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: 'utf8',
		env,
		shell: false,
	});
	if (result.error) throw result.error;
	if (!allowFailure && result.status !== 0) {
		throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
	}
	return { ...result, output: `${result.stdout}${result.stderr}` };
}

function git(repo, args, options = {}) {
	return run('git', args, { cwd: repo, ...options });
}

function write(repo, relativePath, content) {
	const fullPath = path.join(repo, relativePath);
	mkdirSync(path.dirname(fullPath), { recursive: true });
	writeFileSync(fullPath, content, 'utf8');
}

function fixture(t, { files = {}, validateExit = 0 } = {}) {
	const repo = mkdtempSync(path.join(tmpdir(), 'johnmcdougal-t2-'));
	t.after(() => rmSync(repo, { recursive: true, force: true }));

	git(repo, ['init', '--quiet']);
	git(repo, ['config', 'user.name', 'T2 Test']);
	git(repo, ['config', 'user.email', 't2@example.invalid']);
	git(repo, ['config', 'core.autocrlf', 'false']);
	git(repo, ['config', 'commit.gpgsign', 'false']);

	mkdirSync(path.join(repo, 'scripts'), { recursive: true });
	mkdirSync(path.join(repo, '.githooks'), { recursive: true });
	for (const name of ['verify-commit.mjs', 'install-git-hooks.mjs']) {
		copyFileSync(path.join(sourceRoot, 'scripts', name), path.join(repo, 'scripts', name));
	}
	copyFileSync(path.join(sourceRoot, '.githooks', 'pre-commit'), path.join(repo, '.githooks', 'pre-commit'));
	copyFileSync(path.join(sourceRoot, '.gitattributes'), path.join(repo, '.gitattributes'));

	write(
		repo,
		'package.json',
		`${JSON.stringify(
			{
				name: 'commit-workflow-fixture',
				private: true,
				type: 'module',
				scripts: {
					'commit:check': 'node scripts/verify-commit.mjs',
					validate: 'node scripts/fixture-validate.mjs',
				},
			},
			null,
			2,
		)}\n`,
	);
	write(repo, 'scripts/fixture-validate.mjs', "process.exit(Number(process.env.FIXTURE_VALIDATE_EXIT ?? 0));\n");
	write(
		repo,
		'.gitignore',
		'dist/\n.astro/\nnode_modules/\n.tmp/\n.baseline-images/\n.env\n.env.*\n*debug.log*\n.DS_Store\n',
	);
	write(repo, 'tracked.txt', 'baseline\n');
	for (const [name, content] of Object.entries(files)) write(repo, name, content);

	git(repo, ['add', '--', '.gitattributes', '.githooks/pre-commit', '.gitignore', 'package.json', 'scripts/fixture-validate.mjs', 'scripts/install-git-hooks.mjs', 'scripts/verify-commit.mjs', 'tracked.txt', ...Object.keys(files)]);
	git(repo, ['update-index', '--chmod=+x', '.githooks/pre-commit']);
	git(repo, ['commit', '--quiet', '-m', 'fixture baseline']);

	return {
		repo,
		env: { ...process.env, FIXTURE_VALIDATE_EXIT: String(validateExit) },
	};
}

function verify(repo, env = process.env) {
	return run(process.execPath, ['scripts/verify-commit.mjs'], { cwd: repo, env, allowFailure: true });
}

test('refuses a commit check with no staged changes', (t) => {
	const { repo } = fixture(t);
	const result = verify(repo);
	assert.notEqual(result.status, 0);
	assert.match(result.output, /no staged changes/i);
});

test('reports staged names/stat and handles spaces, renames, and deletions', (t) => {
	const { repo, env } = fixture(t, {
		files: {
			'delete me.txt': 'delete\n',
			'file with spaces.txt': 'old\n',
			'rename me.txt': 'rename\n',
		},
	});
	unlinkSync(path.join(repo, 'delete me.txt'));
	renameSync(path.join(repo, 'rename me.txt'), path.join(repo, 'renamed file.txt'));
	write(repo, 'file with spaces.txt', 'new\n');
	git(repo, ['add', '-A', '--', 'delete me.txt', 'rename me.txt', 'renamed file.txt', 'file with spaces.txt']);

	const result = verify(repo, env);
	assert.equal(result.status, 0, result.output);
	assert.match(result.output, /file with spaces\.txt/);
	assert.match(result.output, /rename me\.txt -> renamed file\.txt/);
	assert.match(result.output, /delete me\.txt/);
	assert.match(result.output, /Staged diff stat:/);
});

test('propagates staged whitespace failures', (t) => {
	const { repo } = fixture(t);
	write(repo, 'tracked.txt', 'trailing space \n');
	git(repo, ['add', '--', 'tracked.txt']);
	const result = verify(repo);
	assert.notEqual(result.status, 0);
	assert.match(result.output, /whitespace errors/i);
});

test('rejects every adopted prohibited-path category', async (t) => {
	const cases = [
		['dist/index.html', 'generated build output'],
		['.astro/types.d.ts', 'generated Astro state'],
		['node_modules/example/index.js', 'dependency output'],
		['.tmp/review-server.log', 'local review state or logs'],
		['.baseline-images/home.png', 'local baseline screenshots'],
		['.env', 'local environment file'],
		['npm-debug.log-test', 'package-manager debug log'],
		['.DS_Store', 'operating-system metadata'],
	];

	for (const [name, label] of cases) {
		await t.test(label, (subtest) => {
			const { repo } = fixture(subtest);
			write(repo, name, 'prohibited\n');
			git(repo, ['add', '-f', '--', name]);
			const result = verify(repo);
			assert.notEqual(result.status, 0);
			assert.match(result.output, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
		});
	}
});

test('refuses staged and unstaged overlap without mutating the index', (t) => {
	const { repo } = fixture(t);
	write(repo, 'tracked.txt', 'staged\n');
	git(repo, ['add', '--', 'tracked.txt']);
	write(repo, 'tracked.txt', 'unstaged\n');
	const before = git(repo, ['ls-files', '-s']).stdout;
	const result = verify(repo);
	assert.notEqual(result.status, 0);
	assert.match(result.output, /both staged and unstaged/i);
	assert.equal(git(repo, ['ls-files', '-s']).stdout, before);
});

test('refuses unrelated tracked and untracked worktree mismatches', async (t) => {
	await t.test('tracked mismatch', (subtest) => {
		const { repo } = fixture(subtest, { files: { 'other.txt': 'baseline\n' } });
		write(repo, 'tracked.txt', 'staged\n');
		git(repo, ['add', '--', 'tracked.txt']);
		write(repo, 'other.txt', 'unstaged\n');
		const result = verify(repo);
		assert.notEqual(result.status, 0);
		assert.match(result.output, /tracked unstaged changes/i);
	});

	await t.test('untracked mismatch', (subtest) => {
		const { repo } = fixture(subtest);
		write(repo, 'tracked.txt', 'staged\n');
		git(repo, ['add', '--', 'tracked.txt']);
		write(repo, 'untracked source.txt', 'untracked\n');
		const result = verify(repo);
		assert.notEqual(result.status, 0);
		assert.match(result.output, /nonignored untracked files/i);
	});
});

test('propagates canonical validation failures', (t) => {
	const { repo, env } = fixture(t, { validateExit: 7 });
	write(repo, 'tracked.txt', 'staged\n');
	git(repo, ['add', '--', 'tracked.txt']);
	const result = verify(repo, env);
	assert.equal(result.status, 7, result.output);
	assert.match(result.output, /Canonical validation failed with exit code 7/);
});

test('installer reports, installs locally, and is idempotent', (t) => {
	const { repo } = fixture(t);
	const status = run(process.execPath, ['scripts/install-git-hooks.mjs', 'status'], { cwd: repo });
	assert.match(status.output, /Git hooks status: not configured/);

	const installed = run(process.execPath, ['scripts/install-git-hooks.mjs', 'install'], { cwd: repo });
	assert.match(installed.output, /Git hooks status: installed/);
	assert.equal(git(repo, ['config', '--local', '--get', 'core.hooksPath']).stdout.trim(), '.githooks');

	const repeated = run(process.execPath, ['scripts/install-git-hooks.mjs', 'install'], { cwd: repo });
	assert.match(repeated.output, /Git hooks status: already correct/);
});

test('installer refuses local and inherited conflicts without config or index mutation', async (t) => {
	await t.test('local conflict', (subtest) => {
		const { repo } = fixture(subtest);
		git(repo, ['config', '--local', 'core.hooksPath', 'custom-hooks']);
		const configBefore = readFileSync(path.join(repo, '.git', 'config'), 'utf8');
		const indexBefore = git(repo, ['ls-files', '-s']).stdout;
		const result = run(process.execPath, ['scripts/install-git-hooks.mjs', 'install'], {
			cwd: repo,
			allowFailure: true,
		});
		assert.notEqual(result.status, 0);
		assert.match(result.output, /Git hooks status: conflicting/);
		assert.equal(readFileSync(path.join(repo, '.git', 'config'), 'utf8'), configBefore);
		assert.equal(git(repo, ['ls-files', '-s']).stdout, indexBefore);
	});

	await t.test('inherited conflict', (subtest) => {
		const { repo } = fixture(subtest);
		const globalConfig = path.join(repo, 'fixture-global.gitconfig');
		writeFileSync(globalConfig, '[core]\n\thooksPath = inherited-hooks\n', 'utf8');
		const env = { ...process.env, GIT_CONFIG_GLOBAL: globalConfig, GIT_CONFIG_NOSYSTEM: '1' };
		const result = run(process.execPath, ['scripts/install-git-hooks.mjs', 'install'], {
			cwd: repo,
			env,
			allowFailure: true,
		});
		assert.notEqual(result.status, 0);
		assert.match(result.output, /Git hooks status: conflicting/);
		assert.match(result.output, /global/);
		assert.equal(git(repo, ['config', '--local', '--get', 'core.hooksPath'], { allowFailure: true }).status, 1);
	});
});

test('tracked hook invokes the canonical verifier and preserves index state', (t) => {
	const { repo, env } = fixture(t, { validateExit: 9 });
	write(repo, 'tracked.txt', 'staged\n');
	git(repo, ['add', '--', 'tracked.txt']);
	run(process.execPath, ['scripts/install-git-hooks.mjs', 'install'], { cwd: repo });
	const indexBefore = git(repo, ['ls-files', '-s']).stdout;
	const result = git(repo, ['hook', 'run', 'pre-commit'], { env, allowFailure: true });
	assert.notEqual(result.status, 0);
	assert.match(result.output, /Canonical validation failed with exit code 9/);
	assert.equal(git(repo, ['ls-files', '-s']).stdout, indexBefore);
});

test('attributes classify representative text and binary files without renormalizing the fixture', (t) => {
	const { repo } = fixture(t, {
		files: {
			'example.astro': '---\n---\n',
			'example.ps1': "Write-Output 'ok'\n",
			'example.png': 'fixture-not-a-real-image\n',
		},
	});
	const attrs = git(repo, ['check-attr', 'text', 'eol', '--', 'example.astro', 'example.ps1', 'example.png']).stdout;
	assert.match(attrs, /example\.astro: text: set/);
	assert.match(attrs, /example\.astro: eol: lf/);
	assert.match(attrs, /example\.ps1: eol: lf/);
	assert.match(attrs, /example\.png: text: unset/);

	const indexBefore = git(repo, ['ls-files', '-s']).stdout;
	git(repo, ['add', '--renormalize', '--', '.']);
	assert.equal(git(repo, ['diff', '--cached', '--name-only']).stdout, '');
	assert.equal(git(repo, ['ls-files', '-s']).stdout, indexBefore);
});
