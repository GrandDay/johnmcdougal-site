import { spawnSync } from 'node:child_process';

const npmCommand = 'npm';
const useShell = process.platform === 'win32';

const steps = [
	['Whitespace check', 'git', ['diff', '--check']],
	['Astro check', npmCommand, ['run', 'check']],
	['Fresh build', npmCommand, ['run', 'build']],
	['Generated output verification', npmCommand, ['run', 'verify:build']],
];

for (const [label, command, args] of steps) {
	console.log(`\n== ${label} ==`);
	const result = useShell
		? spawnSync([command, ...args].join(' '), { stdio: 'inherit', shell: true })
		: spawnSync(command, args, { stdio: 'inherit', shell: false });

	if (result.error) {
		console.error(`${label} failed to start: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status !== 0) {
		console.error(`${label} failed with exit code ${result.status}.`);
		process.exit(result.status ?? 1);
	}
}

console.log('\nValidation passed.');
