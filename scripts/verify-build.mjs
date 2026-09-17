import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
	articleDateProperties,
	formatCalendarDate,
	getLatestRelatedActivity,
	isUtcCalendarDate,
	isValidDateOrder,
	rawMarkdownDateLines,
} from '../src/lib/content-dates.mjs';

const root = process.cwd();
const dist = path.resolve(root, process.env.VERIFY_BUILD_DIST ?? 'dist');
const site = 'https://johnmcdougal.com';
const failures = [];
const lintWarnings = [];
const strictTagLint = process.env.VERIFY_BUILD_STRICT_TAG_LINT === '1';
const expectedSeries = [
	{
		key: 'How I built johnmcdougal.com',
		label: 'How I Built johnmcdougal.com',
		description: 'How this Astro site, its analytics, and its custom-domain email infrastructure were built and hardened.',
	},
	{
		key: 'Working with AI in 2026',
		label: 'Working with AI in 2026',
		description: 'A practical series on context, iteration, prompts, reusable workflows, and human judgment in AI-assisted work.',
	},
];
const homelabPost = 'trusted-proxmox-certificates-with-acme-dns-01';
const standalonePosts = ['how-to-backup-and-restore-the-windows-registry', 'proxmox-from-pets-to-cattle-and-how-to-balance-these-ideas-at-home', 'site-automation-workflow-updates', 'whoops-i-accidentally-misassociated-this-file-extension', 'trusted-proxmox-certificates-with-acme-dns-01', 'hello-world'];
const expectedSourceDates = {
	'blog/custom-email-routing-cloudflare-smtp2go.md': '2026-05-03',
	'blog/dmarc-reporting-postmark-digest.md': '2026-05-04',
	'blog/email-authentication-spf-dkim-dmarc.md': '2026-05-04',
	'blog/hello-world.md': '2026-04-16',
	'blog/how-i-built-johnmcdougal-com-with-claude-and-astro.md': '2026-05-03',
	'blog/How-to-Backup-and-Restore-the-Windows-Registry.md': '2026-09-17',
	'blog/parked-domain-email-authentication.md': '2026-05-04',
	'blog/posthog-analytics-astro-cloudflare-proxy.md': '2026-05-03',
	'blog/proxmox-from-pets-to-cattle-and-how-to-balance-these-ideas-at-home.md': '2026-09-17',
	'blog/site-automation-workflow-updates.md': '2026-09-17',
	'blog/trusted-proxmox-certificates-with-acme-dns-01.md': '2026-07-17',
	'blog/Whoops-I-accidentally-misassociated-this-file-extension.md': '2026-09-17',
	'blog/working-with-ai-context-is-the-interface.md': '2026-05-04',
	'blog/working-with-ai-iteration-as-method.md': '2026-05-05',
	'blog/working-with-ai-systems-that-build-systems.md': '2026-05-05',
	'blog/working-with-ai-the-it-guy-who-listens.md': '2026-05-05',
	'blog/working-with-ai-the-latent-space.md': '2026-05-04',
	'blog/working-with-ai-the-prompt-is-a-draft.md': '2026-05-05',
	'projects/aeon-desktop.md': '2026-04-15',
	'projects/cue-verse.md': '2026-04-15',
	'projects/homelab.md': '2026-04-15',
	'projects/johnmcdougal-site.md': '2026-04-15',
	'projects/phred.md': '2026-07-15',
	'projects/userspace.md': '2026-04-15',
};
const expectedProjectUpdatedDates = {
	'projects/aeon-desktop.md': '2026-07-16',
	'projects/cue-verse.md': '2026-07-16',
	'projects/homelab.md': '2026-09-17',
	'projects/johnmcdougal-site.md': '2026-07-16',
	'projects/phred.md': '2026-07-16',
	'projects/userspace.md': '2026-07-16',
};
const expectedBaseline = {
	sitemapRouteCount: 87,
	tagDetailRouteCount: 57,
	chronologicalPostCount: 18,
	seriesGroupCount: 2,
	seriesMemberCount: 12,
	rssItemCount: 18,
	graphNodeCount: 81,
	graphEdgeCount: 143,
	graphNodeHash: '024484804dbeadc8a70b27d28bc7a8dd46740eb798cab719bf9a8e491720cb2b',
	graphEdgeHash: '5f19cf9670977e9a11dc1db7777fc480da81e43f6c008c2dc03a0b77141b4dfd',
};

function fail(message) {
	failures.push(message);
}

function warn(message) {
	lintWarnings.push(message);
}

function countMatches(value, pattern) {
	return [...value.matchAll(pattern)].length;
}

function sortedHash(values) {
	return createHash('sha256').update(JSON.stringify([...values].sort())).digest('hex');
}

function attributeValue(html, attribute) {
	return html.match(new RegExp(`${attribute}="([^"]+)"`))?.[1] ?? null;
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasLabeledDate(html, label, date) {
	const rendered = formatCalendarDate(date);
	return new RegExp(
		`${escapeRegExp(label)}\\s*<time datetime="${escapeRegExp(date.toISOString())}">\\s*${escapeRegExp(rendered)}\\s*</time>`,
	).test(html);
}

function filePath(...parts) {
	return path.join(dist, ...parts);
}

function sourceFilePath(relativePath) {
	return path.join(root, 'src', 'content', ...relativePath.split('/'));
}

function sourceFrontmatterValue(source, key) {
	return source.match(new RegExp(`^${key}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})["']?\\s*$`, 'm'))?.[1] ?? null;
}

function sourceFrontmatterString(source, key) {
	return source.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, 'm'))?.[1] ?? null;
}

function sourceFrontmatterArray(source, key) {
	const match = source.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]\\s*$`, 'm'));
	if (!match) return [];

	return match[1]
		.split(',')
		.map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
		.filter(Boolean);
}

function normalizeTag(value) {
	return value
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
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

for (const [relativePath, expectedPubDate] of Object.entries(expectedSourceDates)) {
	const source = readFileSync(sourceFilePath(relativePath), 'utf8');
	const actualPubDate = sourceFrontmatterValue(source, 'pubDate');
	const actualUpdatedDate = sourceFrontmatterValue(source, 'updatedDate');
	const rawTags = sourceFrontmatterArray(source, 'tags');
	const normalizedTags = [];
	const seenTags = new Set();
	for (const tag of rawTags) {
		const normalized = normalizeTag(tag);
		if (!normalized || seenTags.has(normalized)) continue;
		seenTags.add(normalized);
		normalizedTags.push(normalized);
	}

	if (rawTags.join('|') !== normalizedTags.join('|')) {
		warn(
			`Tag normalization adjusted ${relativePath}: source=[${rawTags.join(', ')}] canonical=[${normalizedTags.join(', ')}].`,
		);
	}

	if (actualPubDate !== expectedPubDate) {
		fail(`Source pubDate changed for ${relativePath}: expected ${expectedPubDate}, found ${actualPubDate ?? 'none'}.`);
	}

	if (relativePath.startsWith('projects/')) {
		const expectedUpdatedDate = expectedProjectUpdatedDates[relativePath] ?? null;
		if (expectedUpdatedDate === null && actualUpdatedDate !== null) {
			fail(`Unexpected project updatedDate for ${relativePath}: found ${actualUpdatedDate}.`);
		} else if (expectedUpdatedDate !== null && actualUpdatedDate !== expectedUpdatedDate) {
			fail(`Project updatedDate mismatch for ${relativePath}: expected ${expectedUpdatedDate}, found ${actualUpdatedDate ?? 'none'}.`);
		}
	} else if (actualUpdatedDate !== null) {
		fail(`Unexpected blog updatedDate for ${relativePath}: found ${actualUpdatedDate}.`);
	}
}

const projectBaselineDateById = new Map();
for (const [relativePath, sourceDate] of Object.entries(expectedSourceDates)) {
	if (!relativePath.startsWith('projects/')) continue;
	const id = path.basename(relativePath, '.md');
	const updatedDate = expectedProjectUpdatedDates[relativePath] ?? sourceDate;
	projectBaselineDateById.set(id, new Date(`${updatedDate}T00:00:00.000Z`));
}

const latestRelatedByProject = new Map();
for (const [relativePath, sourceDate] of Object.entries(expectedSourceDates)) {
	if (!relativePath.startsWith('blog/')) continue;
	const source = readFileSync(sourceFilePath(relativePath), 'utf8');
	const projectRef = sourceFrontmatterString(source, 'projectRef');
	if (!projectRef) continue;

	const entry = {
		id: path.basename(relativePath, '.md'),
		date: new Date(`${sourceDate}T00:00:00.000Z`),
	};
	const projectBaselineDate = projectBaselineDateById.get(projectRef);
	if (projectBaselineDate && entry.date.valueOf() <= projectBaselineDate.valueOf()) continue;

	const current = latestRelatedByProject.get(projectRef);
	if (
		!current ||
		entry.date.getTime() > current.date.getTime() ||
		(entry.date.getTime() === current.date.getTime() && entry.id.localeCompare(current.id) > 0)
	) {
		latestRelatedByProject.set(projectRef, entry);
	}
}

const calendarExamples = [
	['2026-04-15', 'Apr 15, 2026'],
	['2026-05-05', 'May 5, 2026'],
	['2026-07-15', 'Jul 15, 2026'],
	['2026-07-16', 'Jul 16, 2026'],
];
for (const [sourceDate, expectedLabel] of calendarExamples) {
	const date = new Date(`${sourceDate}T00:00:00.000Z`);
	if (!isUtcCalendarDate(date) || formatCalendarDate(date) !== expectedLabel) {
		fail(`UTC calendar formatting mismatch for ${sourceDate}.`);
	}
}
if (isUtcCalendarDate(new Date('2026-04-15T12:00:00.000Z'))) {
	fail('Calendar-date validation accepted a non-midnight timestamp.');
}
if (!isValidDateOrder(new Date('2026-04-15T00:00:00.000Z'), new Date('2026-07-16T00:00:00.000Z'))) {
	fail('Date-order validation rejected a valid update date.');
}
if (isValidDateOrder(new Date('2026-07-16T00:00:00.000Z'), new Date('2026-04-15T00:00:00.000Z'))) {
	fail('Date-order validation accepted an update before publication.');
}

const fixturePublished = new Date('2026-04-15T00:00:00.000Z');
const fixtureUpdated = new Date('2026-07-16T00:00:00.000Z');
const fixtureArticleDates = articleDateProperties(fixturePublished, fixtureUpdated);
if (
	fixtureArticleDates.datePublished !== fixturePublished.toISOString() ||
	fixtureArticleDates.dateModified !== fixtureUpdated.toISOString()
) {
	fail('Article metadata date fixture did not emit publication and modification dates.');
}
if ('dateModified' in articleDateProperties(fixturePublished)) {
	fail('Article metadata emitted dateModified without an updatedDate.');
}
if (rawMarkdownDateLines(fixturePublished, fixtureUpdated).join('\n') !== 'date: 2026-04-15\nupdated: 2026-07-16') {
	fail('Raw Markdown date fixture did not preserve publication and optional update values.');
}

const fixtureProject = { id: 'fixture-project', data: { pubDate: fixturePublished, updatedDate: fixtureUpdated } };
const olderFixturePost = {
	id: 'older-post',
	data: { projectRef: 'fixture-project', pubDate: new Date('2026-05-04T00:00:00.000Z') },
};
const newerFixturePost = {
	id: 'newer-post',
	data: { projectRef: 'fixture-project', pubDate: new Date('2026-07-17T00:00:00.000Z') },
};
if (getLatestRelatedActivity(fixtureProject, [olderFixturePost]) !== undefined) {
	fail('Related-activity fixture exposed an older related post.');
}
if (getLatestRelatedActivity(fixtureProject, [olderFixturePost, newerFixturePost])?.post.id !== 'newer-post') {
	fail('Related-activity fixture did not expose the newer related post.');
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
for (const name of readdirSync(dist).filter((entry) => /^sitemap.*\.xml$/.test(entry))) {
	if (readRequired(name).includes('<lastmod>')) {
		fail(`Sitemap unexpectedly contains lastmod data: ${name}.`);
	}
}
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

if (sitemapLocs.length !== expectedBaseline.sitemapRouteCount) {
	fail(`Sitemap route count changed: expected ${expectedBaseline.sitemapRouteCount}, found ${sitemapLocs.length}.`);
}

const tagDetailLocs = sitemapLocs.filter((loc) => {
	const pathname = new URL(loc).pathname;
	return pathname.startsWith('/tags/') && pathname !== '/tags/';
});
if (tagDetailLocs.length !== expectedBaseline.tagDetailRouteCount) {
	fail(`Tag detail route count changed: expected ${expectedBaseline.tagDetailRouteCount}, found ${tagDetailLocs.length}.`);
}

const blogIndex = readRequired('blog/index.html');
const chronologicalIds = [...blogIndex.matchAll(/data-chronological-post="([^"]+)"/g)]
	.map((match) => match[1]);
if (
	chronologicalIds.length !== expectedBaseline.chronologicalPostCount ||
	new Set(chronologicalIds).size !== expectedBaseline.chronologicalPostCount
) {
	fail(
		`Chronological Writing index must contain ${expectedBaseline.chronologicalPostCount} unique posts; found ${chronologicalIds.length} entries and ${new Set(chronologicalIds).size} unique IDs.`,
	);
}

for (const [relativePath, sourceDate] of Object.entries(expectedSourceDates)) {
	const id = path.basename(relativePath, '.md');
	const date = new Date(`${sourceDate}T00:00:00.000Z`);

	if (relativePath.startsWith('blog/')) {
		const html = readRequired(`blog/${id}/index.html`);
		if (!hasLabeledDate(html, 'Published', date)) {
			fail(`Blog entry "${id}" is missing its UTC-stable Published label.`);
		}
		if (!html.includes(`"datePublished":"${date.toISOString()}"`)) {
			fail(`Blog entry "${id}" is missing its datePublished metadata.`);
		}
		if (html.includes('"dateModified":')) {
			fail(`Blog entry "${id}" exposes dateModified without an updatedDate.`);
		}
		continue;
	}

	const html = readRequired(`projects/${id}/index.html`);
	const expectedUpdatedDate = expectedProjectUpdatedDates[relativePath];
	const updatedDate = expectedUpdatedDate ? new Date(`${expectedUpdatedDate}T00:00:00.000Z`) : null;
	if (!hasLabeledDate(html, 'Page published', date)) {
		fail(`Project entry "${id}" is missing its UTC-stable Page published label.`);
	}
	if (updatedDate && !hasLabeledDate(html, 'Page updated', updatedDate)) {
		fail(`Project entry "${id}" is missing its approved Page updated label.`);
	}

	const latestRelated = latestRelatedByProject.get(id);
	if (latestRelated) {
		if (!html.includes('Latest related activity') || !html.includes(`/blog/${latestRelated.id}/`)) {
			fail(`Project entry "${id}" is missing the expected latest related activity from "${latestRelated.id}".`);
		}
		const expectedTime = `<time datetime="${latestRelated.date.toISOString()}">`;
		if (!html.includes(expectedTime) || !html.includes(formatCalendarDate(latestRelated.date))) {
			fail(`Project entry "${id}" latest related activity date does not match ${latestRelated.date.toISOString()}.`);
		}
	} else if (html.includes('Latest related activity')) {
		fail(`Project entry "${id}" incorrectly exposes current Latest related activity.`);
	}
}

if (countMatches(blogIndex, /data-series-group=/g) !== expectedBaseline.seriesGroupCount) {
	fail(`Writing index must render exactly ${expectedBaseline.seriesGroupCount} series groups.`);
}
if (countMatches(blogIndex, /data-series-member=/g) !== expectedBaseline.seriesMemberCount) {
	fail(`Writing index must render exactly ${expectedBaseline.seriesMemberCount} ordered series-member links.`);
}

const membersBySeries = new Map();
for (const series of expectedSeries) {
	const groupStart = blogIndex.indexOf(`data-series-group="${series.key}"`);
	if (groupStart < 0) {
		fail(`Writing index is missing series group "${series.key}".`);
		continue;
	}
	const groupEnd = blogIndex.indexOf('</article>', groupStart);
	const groupHtml = groupEnd >= 0 ? blogIndex.slice(groupStart, groupEnd) : '';
	const members = [...groupHtml.matchAll(/data-series-member="([^"]+)"/g)].map((match) => match[1]);
	membersBySeries.set(series.key, members);
	if (members.length !== 6 || new Set(members).size !== 6) {
		fail(`Writing index series "${series.key}" must contain six unique ordered members; found ${members.length}.`);
	}
	if (!groupHtml.includes(`>${series.label}</h3>`)) {
		fail(`Writing index is missing public label "${series.label}".`);
	}
	if (!blogIndex.includes(series.description)) {
		fail(`Writing index is missing the description for series "${series.key}".`);
	}
}

const orderedSeriesIds = expectedSeries.flatMap((series) => membersBySeries.get(series.key) ?? []);
if (new Set(orderedSeriesIds).size !== 12) {
	fail('Series organizer contains a duplicate member across series.');
}
const standaloneIds = chronologicalIds.filter((id) => !orderedSeriesIds.includes(id));
if (
	standaloneIds.length !== standalonePosts.length ||
	standaloneIds.some((id, index) => id !== standalonePosts[index])
) {
	fail(`Expected standalone posts ${standalonePosts.join(', ')}; found ${standaloneIds.join(', ') || 'none'}.`);
}

const relatedProjectResults = [];
for (const series of expectedSeries) {
	const members = membersBySeries.get(series.key) ?? [];
	for (const [index, id] of members.entries()) {
		const route = `/blog/${id}/`;
		assertRoute(route);
		if (!sitemapLocs.includes(expectedCanonical(route))) {
			fail(`Sitemap missing blog route: ${expectedCanonical(route)}`);
		}

		const html = readRequired(routeFile(route));
		if (countMatches(html, /data-series-module=/g) !== 1) {
			fail(`Series entry "${id}" must render exactly one series module.`);
		}
		if (!html.includes(`data-series-current="${id}"`) || !html.includes('aria-current="page"')) {
			fail(`Series entry "${id}" is missing its semantic current-article state.`);
		}

		const renderedMemberCount =
			countMatches(html, /data-series-index-item=/g) + countMatches(html, /data-series-current=/g);
		if (renderedMemberCount !== members.length) {
			fail(`Series entry "${id}" renders ${renderedMemberCount} index members; expected ${members.length}.`);
		}

		const expectedPrev = members[index - 1] ?? null;
		const expectedNext = members[index + 1] ?? null;
		const actualPrev = attributeValue(html, 'data-series-prev');
		const actualNext = attributeValue(html, 'data-series-next');
		if (actualPrev !== expectedPrev) {
			fail(`Series entry "${id}" previous mismatch: expected ${expectedPrev ?? 'none'}, found ${actualPrev ?? 'none'}.`);
		}
		if (actualNext !== expectedNext) {
			fail(`Series entry "${id}" next mismatch: expected ${expectedNext ?? 'none'}, found ${actualNext ?? 'none'}.`);
		}

		const actualProject = attributeValue(html, 'data-related-project');
		if (actualProject) relatedProjectResults.push({ id, project: actualProject });
	}
}

for (const id of standalonePosts) {
	const route = `/blog/${id}/`;
	assertRoute(route);
	const html = readRequired(routeFile(route));
	if (/data-series-module=|data-series-current=|data-series-prev=|data-series-next=/.test(html)) {
		fail(`Standalone post "${id}" renders series navigation.`);
	}
}

const helloWorldHtml = readRequired(routeFile('/blog/hello-world/'));
if (helloWorldHtml.includes('data-related-project=')) {
	fail('Standalone post "hello-world" renders a fabricated related project.');
}
const homelabPostHtml = readRequired(routeFile(`/blog/${homelabPost}/`));
if (attributeValue(homelabPostHtml, 'data-related-project') !== 'homelab') {
	fail(`Standalone post "${homelabPost}" is missing its resolved Homelab project relationship.`);
}

if (
	relatedProjectResults.length !== 6 ||
	relatedProjectResults.some(({ project }) => project !== 'johnmcdougal-site')
) {
	fail(`Expected six resolved johnmcdougal-site relationships; found ${JSON.stringify(relatedProjectResults)}.`);
}

for (const id of chronologicalIds) {
	const raw = readRequired(`blog/${id}.md`);
	const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
	if (!frontmatter.includes(`canonical: ${site}/blog/${id}/`)) {
		fail(`Raw Markdown canonical mismatch for "${id}".`);
	}
	if (/^(series|seriesPart|projectRef):/m.test(frontmatter)) {
		fail(`Raw Markdown contract changed for "${id}": relationship metadata was exposed.`);
	}
	if (/^updated:/m.test(frontmatter)) {
		fail(`Raw Markdown exposed an update for unchanged blog entry "${id}".`);
	}
}

const rss = readRequired('rss.xml');
if (!/<rss[\s>]/i.test(rss) || !/<item>/i.test(rss)) {
	fail('RSS output is missing an rss root or item entries.');
}
const rssItems = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]);
if (rssItems.length !== expectedBaseline.rssItemCount) {
	fail(`RSS item count changed: expected ${expectedBaseline.rssItemCount}, found ${rssItems.length}.`);
}
const rssDates = rssItems.map((item) => {
	const value = item.match(/<pubDate>([^<]+)<\/pubDate>/)?.[1];
	return value ? Date.parse(value) : Number.NaN;
});
if (rssDates.some(Number.isNaN)) {
	fail('RSS contains an item without a valid publication date.');
} else {
	for (let index = 1; index < rssDates.length; index += 1) {
		if (rssDates[index] > rssDates[index - 1]) {
			fail(`RSS is not newest-first at item ${index + 1}.`);
			break;
		}
	}
}

const llms = readRequired('llms.txt');
for (const series of expectedSeries) {
	if (!llms.includes(`### Series: ${series.key}`)) {
		fail(`llms.txt is missing series "${series.key}".`);
	}
	for (const id of membersBySeries.get(series.key) ?? []) {
		if (!llms.includes(`${site}/blog/${id}/`)) {
			fail(`llms.txt is missing series member "${id}".`);
		}
	}
}
if (!llms.includes(`${site}/blog/hello-world/`)) {
	fail('llms.txt is missing standalone post "hello-world".');
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

	if (graph.nodes?.length !== expectedBaseline.graphNodeCount) {
		fail(`Graph node count changed: expected ${expectedBaseline.graphNodeCount}, found ${graph.nodes?.length ?? 'none'}.`);
	}
	if (graph.edges?.length !== expectedBaseline.graphEdgeCount) {
		fail(`Graph edge count changed: expected ${expectedBaseline.graphEdgeCount}, found ${graph.edges?.length ?? 'none'}.`);
	}

	if (Array.isArray(graph.nodes)) {
		const nodeHash = sortedHash(graph.nodes.map((node) => node.id));
		const expectedNodeHash = expectedBaseline.graphNodeHash;
		if (nodeHash !== expectedNodeHash) {
			fail(`Graph node-ID set changed: expected ${expectedNodeHash}, found ${nodeHash}.`);
		}
	}
	if (Array.isArray(graph.edges)) {
		const endpointHash = sortedHash(graph.edges.map((edge) => `${edge.source}->${edge.target}`));
		const expectedEndpointHash = expectedBaseline.graphEdgeHash;
		if (endpointHash !== expectedEndpointHash) {
			fail(`Graph edge-endpoint set changed: expected ${expectedEndpointHash}, found ${endpointHash}.`);
		}
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

if (strictTagLint && lintWarnings.length > 0) {
	console.error('Generated-site tag-lint strict mode failed:');
	for (const warning of lintWarnings) {
		console.error(`- ${warning}`);
	}
	process.exit(1);
}

if (lintWarnings.length > 0) {
	console.warn('Generated-site tag-lint warnings (non-blocking):');
	for (const warning of lintWarnings) {
		console.warn(`- ${warning}`);
	}
	if (!strictTagLint) {
		console.warn('Set VERIFY_BUILD_STRICT_TAG_LINT=1 to fail on tag-lint warnings.');
	}
}

console.log('Generated-site verification passed.');
