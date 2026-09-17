import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verifyBuildPath = path.join(repoRoot, 'scripts', 'verify-build.mjs');
const distDir = path.join(repoRoot, 'dist');
const blogDir = path.join(repoRoot, 'src', 'content', 'blog');
const projectDir = path.join(repoRoot, 'src', 'content', 'projects');
const seriesPath = path.join(repoRoot, 'src', 'lib', 'series.ts');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, { cwd = repoRoot, allowFailure = false } = {}) {
	const result = spawnSync(command, args, {
		cwd,
		encoding: 'utf8',
		stdio: 'pipe',
		shell: false,
	});

	if (result.error) {
		throw new Error(`${command} failed to start: ${result.error.message}`);
	}

	if (!allowFailure && result.status !== 0) {
		const detail = (result.stderr || result.stdout || '').trim();
		throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.${detail ? `\n${detail}` : ''}`);
	}

	return result;
}

function posixJoin(...parts) {
	return parts.join('/');
}

function toEntryId(value) {
	return value.toLowerCase().replace(/\s+/g, '-');
}

function listContentFiles(baseDir, prefix) {
	const output = [];
	const entries = readdirSync(baseDir, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			output.push(...listContentFiles(path.join(baseDir, entry.name), posixJoin(prefix, entry.name)));
			continue;
		}

		if (!entry.isFile()) continue;
		const ext = path.extname(entry.name).toLowerCase();
		if (ext !== '.md' && ext !== '.mdx') continue;
		if (entry.name.startsWith('_')) continue;
		output.push({
			relativePath: posixJoin(prefix, entry.name),
			absolutePath: path.join(baseDir, entry.name),
			slug: toEntryId(path.basename(entry.name, ext)),
		});
	}

	return output;
}

function parseFrontmatter(filePath) {
	const source = readFileSync(filePath, 'utf8');
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};

	const data = {};
	for (const rawLine of match[1].split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const kv = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.+?)\s*$/);
		if (!kv) continue;
		const key = kv[1];
		let value = kv[2];
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		data[key] = value;
	}
	return data;
}

function parseDate(value, label) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) {
		throw new Error(`Invalid or missing ${label}: ${value ?? 'none'}`);
	}
	return value;
}

function sortedHash(values) {
	return createHash('sha256').update(JSON.stringify([...values].sort())).digest('hex');
}

function listXmlLocs(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function readSitemapLocs() {
	const sitemap = path.join(distDir, 'sitemap.xml');
	if (existsSync(sitemap)) return listXmlLocs(readFileSync(sitemap, 'utf8'));

	const indexPath = path.join(distDir, 'sitemap-index.xml');
	const indexXml = readFileSync(indexPath, 'utf8');
	const sitemapFiles = listXmlLocs(indexXml)
		.map((loc) => new URL(loc).pathname.split('/').filter(Boolean).pop())
		.filter(Boolean);

	return sitemapFiles.flatMap((name) => listXmlLocs(readFileSync(path.join(distDir, name), 'utf8')));
}

function formatSeries(series) {
	if (series.length === 0) return '[]';
	const lines = ['['];
	for (const item of series) {
		lines.push('\t{');
		lines.push(`\t\tkey: '${item.key}',`);
		lines.push(`\t\tlabel: '${item.label}',`);
		lines.push(`\t\tdescription: '${item.description}',`);
		lines.push('\t},');
	}
	lines.push(']');
	return lines.join('\n');
}

function formatArray(values) {
	if (values.length === 0) return '[]';
	return `[${values.map((value) => `'${value}'`).join(', ')}]`;
}

function formatObject(map) {
	const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
	if (keys.length === 0) return '{}';
	const lines = ['{'];
	for (const key of keys) {
		lines.push(`\t'${key}': '${map[key]}',`);
	}
	lines.push('}');
	return lines.join('\n');
}

function parseSeriesDefinitions() {
	const source = readFileSync(seriesPath, 'utf8');
	const regex = /'([^']+)'\s*:\s*\{\s*label:\s*'([^']+)',\s*description:\s*'([^']+)'/g;
	const values = [];
	for (const match of source.matchAll(regex)) {
		values.push({ key: match[1], label: match[2], description: match[3] });
	}
	if (values.length === 0) {
		throw new Error('Could not parse SERIES_DEFINITIONS from src/lib/series.ts.');
	}
	return values;
}

function replaceBlock(source, pattern, replacement, label) {
	if (!pattern.test(source)) {
		throw new Error(`Could not find ${label} block in scripts/verify-build.mjs.`);
	}
	return source.replace(pattern, replacement);
}

function main() {
	console.log('Refreshing dist for baseline sync...');
	const build = spawnSync(npmCommand, ['run', 'build'], {
		cwd: repoRoot,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	if (build.error) throw new Error(`Build failed to start: ${build.error.message}`);
	if (build.status !== 0) throw new Error(`Build failed with exit code ${build.status}.`);

	if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
		throw new Error('dist/ was not created by build.');
	}

	const blogFiles = listContentFiles(blogDir, 'blog').sort((a, b) => a.relativePath.localeCompare(b.relativePath));
	const projectFiles = listContentFiles(projectDir, 'projects').sort((a, b) => a.relativePath.localeCompare(b.relativePath));

	const expectedSourceDates = {};
	const expectedProjectUpdatedDates = {};
	const standalonePosts = [];

	for (const item of blogFiles) {
		const frontmatter = parseFrontmatter(item.absolutePath);
		expectedSourceDates[item.relativePath] = parseDate(frontmatter.pubDate, `${item.relativePath} pubDate`);
		if (frontmatter.updatedDate) {
			throw new Error(`Blog entry ${item.relativePath} has updatedDate; verify-build expects blog updatedDate to be absent.`);
		}
		if (!frontmatter.series) {
			standalonePosts.push({ slug: item.slug, pubDate: frontmatter.pubDate });
		}
	}

	for (const item of projectFiles) {
		const frontmatter = parseFrontmatter(item.absolutePath);
		expectedSourceDates[item.relativePath] = parseDate(frontmatter.pubDate, `${item.relativePath} pubDate`);
		if (frontmatter.updatedDate) {
			expectedProjectUpdatedDates[item.relativePath] = parseDate(frontmatter.updatedDate, `${item.relativePath} updatedDate`);
		}
	}

	standalonePosts.sort((a, b) => {
		if (a.pubDate !== b.pubDate) return a.pubDate > b.pubDate ? -1 : 1;
		return a.slug.localeCompare(b.slug);
	});

	const sitemapLocs = readSitemapLocs();
	const tagDetailRouteCount = sitemapLocs.filter((loc) => {
		const pathname = new URL(loc).pathname;
		return pathname.startsWith('/tags/') && pathname !== '/tags/';
	}).length;

	const blogIndex = readFileSync(path.join(distDir, 'blog', 'index.html'), 'utf8');
	const chronologicalPostCount = [...blogIndex.matchAll(/data-chronological-post="([^"]+)"/g)].length;
	const seriesGroupCount = [...blogIndex.matchAll(/data-series-group=/g)].length;
	const seriesMemberCount = [...blogIndex.matchAll(/data-series-member=/g)].length;

	const rss = readFileSync(path.join(distDir, 'rss.xml'), 'utf8');
	const rssItemCount = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].length;

	const graph = JSON.parse(readFileSync(path.join(distDir, 'graph.json'), 'utf8'));
	const graphNodeCount = Array.isArray(graph.nodes) ? graph.nodes.length : 0;
	const graphEdgeCount = Array.isArray(graph.edges) ? graph.edges.length : 0;
	const graphNodeHash = Array.isArray(graph.nodes) ? sortedHash(graph.nodes.map((node) => node.id)) : '';
	const graphEdgeHash = Array.isArray(graph.edges)
		? sortedHash(graph.edges.map((edge) => `${edge.source}->${edge.target}`))
		: '';

	const expectedSeries = parseSeriesDefinitions();

	let verifyBuild = readFileSync(verifyBuildPath, 'utf8');
	verifyBuild = replaceBlock(
		verifyBuild,
		/const expectedSeries = \[[\s\S]*?\];/,
		`const expectedSeries = ${formatSeries(expectedSeries)};`,
		'expectedSeries',
	);
	verifyBuild = replaceBlock(
		verifyBuild,
		/const standalonePosts = \[[\s\S]*?\];/,
		`const standalonePosts = ${formatArray(standalonePosts.map((entry) => entry.slug))};`,
		'standalonePosts',
	);
	verifyBuild = replaceBlock(
		verifyBuild,
		/const expectedSourceDates = \{[\s\S]*?\};/,
		`const expectedSourceDates = ${formatObject(expectedSourceDates)};`,
		'expectedSourceDates',
	);
	verifyBuild = replaceBlock(
		verifyBuild,
		/const expectedProjectUpdatedDates = \{[\s\S]*?\};/,
		`const expectedProjectUpdatedDates = ${formatObject(expectedProjectUpdatedDates)};`,
		'expectedProjectUpdatedDates',
	);
	verifyBuild = replaceBlock(
		verifyBuild,
		/const expectedBaseline = \{[\s\S]*?\};/,
		[
			'const expectedBaseline = {',
			`\tsitemapRouteCount: ${sitemapLocs.length},`,
			`\ttagDetailRouteCount: ${tagDetailRouteCount},`,
			`\tchronologicalPostCount: ${chronologicalPostCount},`,
			`\tseriesGroupCount: ${seriesGroupCount},`,
			`\tseriesMemberCount: ${seriesMemberCount},`,
			`\trssItemCount: ${rssItemCount},`,
			`\tgraphNodeCount: ${graphNodeCount},`,
			`\tgraphEdgeCount: ${graphEdgeCount},`,
			`\tgraphNodeHash: '${graphNodeHash}',`,
			`\tgraphEdgeHash: '${graphEdgeHash}',`,
			'};',
		].join('\n'),
		'expectedBaseline',
	);

	writeFileSync(verifyBuildPath, verifyBuild, 'utf8');
	run('git', ['add', '--', 'scripts/verify-build.mjs']);

	console.log('verify-build baseline synced and staged.');
	console.log(`Sitemap routes: ${sitemapLocs.length}; tags: ${tagDetailRouteCount}; blog index: ${chronologicalPostCount}; RSS: ${rssItemCount}`);
}

try {
	main();
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
}
