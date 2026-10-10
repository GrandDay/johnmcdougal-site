import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CONTACT_EMAIL, SITE_AUTHOR } from '../consts';
import { getSeriesGroups } from '../lib/series';

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://johnmcdougal.com')).origin;
  const url = (pathname: string) => `${origin}${pathname}`;

  const posts = await getCollection('blog');
  const projects = await getCollection('projects');

  const seriesGroups = getSeriesGroups(posts);
  const standalone = posts
    .filter((post) => post.data.series === undefined)
    .sort(
      (a, b) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id),
    );

  const lines: string[] = [
    `# ${SITE_AUTHOR}`,
    '',
    '> Sacramento-based infrastructure engineer and technical consultant documenting systems work at johnmcdougal.com.',
    '',
    '## About',
    `- [About ${SITE_AUTHOR}](${url('/about/')}): Professional background, systems focus, credentials, and contact context.`,
    '',
    '## Blog',
  ];

  for (const group of seriesGroups) {
    lines.push('', `### Series: ${group.key}`);
    for (const member of group.members) {
      lines.push(
        `- [${member.data.title}](${url(`/blog/${member.id}/`)}): Part ${member.data.seriesPart}. ${member.data.description}`,
      );
    }
  }

  if (standalone.length > 0) {
    lines.push('', '### Other posts');
    for (const post of standalone) {
      lines.push(`- [${post.data.title}](${url(`/blog/${post.id}/`)}): ${post.data.description}`);
    }
  }

  lines.push(
    '',
    '## Raw Markdown',
    'All blog posts are available as raw Markdown at `/blog/[slug].md` alongside their HTML counterparts.',
    '',
    '## Projects',
  );
  for (const project of projects) {
    lines.push(`- [${project.data.title}](${url(`/projects/${project.id}/`)}): ${project.data.description}`);
  }

  lines.push(
    '',
    '## Tags',
    `- [All tags](${url('/tags/')}): Browse all content by topic.`,
    '',
    '## Graph',
    `- [Content graph](${url('/graph/')}): Interactive force-directed graph of all posts, projects, and tags. Nodes link to content; edges show shared tags (dashed) and project relationships (solid). Select a node to inspect it and its connections, then use the explicit "Open selected node" link to open its page.`,
    '',
    '## RSS',
    `- [RSS Feed](${url('/rss.xml')}): Subscribe to new posts.`,
    '',
    '## Contact',
    `- ${CONTACT_EMAIL}`,
    '',
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
