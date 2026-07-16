import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.resolve(root, process.env.VERIFY_BUILD_DIST ?? 'dist');
const site = 'https://johnmcdougal.com';
const failures = [];

function fail(message) {
	failures.push(message);
}

function filePath(...parts) {
	return path.join(dist, ...parts);
}

function requireFile(relativePath) {
	const fullPath = filePath(...relativePath.split('/'));
	if (!existsSync(fullPath) || !statSync(fullPath).isFile()) {
		fail(`Missing required file: ${relativePath}`);
		return null;
	}
	return fullPath;
}

function readRequired(relativePath) {
	const fullPath = requireFile(relativePath);
	return fullPath ? readFileSync(fullPath, 'utf8') : '';
}

function routeFile(route) {
	const trimmed = route.replace(/^\/|\/$/g, '');
	return trimmed ? `${trimmed}/index.html` : 'index.html';
}

function expectedCanonical(route) {
	return `${site}${route}`;
}

function canonicalFrom(html) {
	const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
	return match?.[1] ?? null;
}

function assertRoute(route) {
	const relativePath = routeFile(route);
	const html = readRequired(relativePath);
	if (!html) return;

	const canonical = canonicalFrom(html);
	const expected = expectedCanonical(route);
	if (canonical !== expected) {
		fail(`Canonical mismatch for ${route}: expected ${expected}, found ${canonical ?? 'none'}`);
	}
}

function listXmlLocs(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function readSitemapLocs() {
	if (existsSync(filePath('sitemap.xml'))) {
		return listXmlLocs(readRequired('sitemap.xml'));
	}

	const indexXml = readRequired('sitemap-index.xml');
	const sitemapFiles = listXmlLocs(indexXml)
		.map((loc) => new URL(loc).pathname.split('/').filter(Boolean).pop())
		.filter(Boolean);

	if (sitemapFiles.length === 0) {
		fail('Sitemap index contains no sitemap locations.');
		return [];
	}

	return sitemapFiles.flatMap((name) => listXmlLocs(readRequired(name)));
}

const routes = [
	'/',
	'/about/',
	'/blog/',
	'/projects/',
	'/projects/homelab/',
	'/projects/phred/',
	'/projects/userspace/',
	'/tags/ai/',
];

for (const route of routes) {
	assertRoute(route);
}

if (existsSync(filePath('projects', 'homelab-iac'))) {
	fail('Unexpected standalone homelab-iac project route exists.');
}

const sitemapLocs = readSitemapLocs();
for (const route of routes) {
	const loc = expectedCanonical(route);
	if (!sitemapLocs.includes(loc)) {
		fail(`Sitemap missing expected route: ${loc}`);
	}
}

for (const forbidden of [`${site}/tags/AI/`, `${site}/projects/homelab-iac/`]) {
	if (sitemapLocs.includes(forbidden)) {
		fail(`Sitemap exposes forbidden route: ${forbidden}`);
	}
}

const rss = readRequired('rss.xml');
if (!/<rss[\s>]/i.test(rss) || !/<item>/i.test(rss)) {
	fail('RSS output is missing an rss root or item entries.');
}

const graphText = readRequired('graph.json');
let graph;
try {
	graph = JSON.parse(graphText);
} catch (error) {
	fail(`graph.json does not parse as JSON: ${error.message}`);
}

if (graph) {
	if (!Array.isArray(graph.nodes)) {
		fail('graph.json nodes is not an array.');
	} else {
		const ids = new Set();
		for (const node of graph.nodes) {
			if (!node?.id) {
				fail('graph.json contains a node without an id.');
				continue;
			}
			if (ids.has(node.id)) {
				fail(`Duplicate graph node id: ${node.id}`);
			}
			ids.add(node.id);
		}

		if (!ids.has('tag:ai')) {
			fail('Graph is missing canonical tag node tag:ai.');
		}
		if (ids.has('tag:AI')) {
			fail('Graph contains duplicate uppercase AI tag node.');
		}
		if (ids.has('homelab-iac')) {
			fail('Graph contains forbidden standalone homelab-iac project node.');
		}
	}

	if (!Array.isArray(graph.edges)) {
		fail('graph.json edges is not an array.');
	}
}

const forbiddenTokens = ['tag:AI', '/tags/AI/', '/projects/homelab-iac/'];
for (const token of forbiddenTokens) {
	if (graphText.includes(token)) {
		fail(`graph.json contains forbidden token: ${token}`);
	}
}

if (existsSync(dist)) {
	for (const name of readdirSync(dist)) {
		if (name === '.env' || name.startsWith('.env.')) {
			fail(`Environment file exposed in dist: ${name}`);
		}
	}
}

if (failures.length > 0) {
	console.error('Generated-site verification failed:');
	for (const failure of failures) {
		console.error(`- ${failure}`);
	}
	process.exit(1);
}

console.log('Generated-site verification passed.');
