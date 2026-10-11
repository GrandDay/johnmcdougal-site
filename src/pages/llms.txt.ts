import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CONTACT_EMAIL, SITE_AUTHOR } from '../consts';
import { getSeriesGroups } from '../lib/series';

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://johnmcdougal.com')).origin;
  const url = (pathname: string) => `${origin}${pathname}`;

  const posts = await getCollection('blog');
  const projects = await getCollection('projects');

  const seriesGroups = await getSeriesGroups();
  const projectTitles = new Map(projects.map((project) => [project.id, project.data.title]));
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
    lines.push('', `### Series: ${group.entry.data.title}`, group.entry.data.description, '');
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
    '## Series',
    `- [All series](${url('/series/')}): Multi-part writing collected in reading order.`,
  );
  for (const group of seriesGroups) {
    const related = group.projects.map((id) => projectTitles.get(id) ?? id);
    lines.push(
      `- [${group.entry.data.title}](${url(`/series/${group.key}/`)}): ${group.entry.data.description}${related.length > 0 ? ` Related projects: ${related.join(', ')}.` : ''}`,
    );
  }

  lines.push(
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
    `- [Content graph](${url('/graph/')}): Interactive force-directed graph of all posts, projects, series, and tags. Nodes link to content; edges show shared tags (dashed), project relationships (solid), and series membership (series nodes cluster their posts and link to related projects). Select a node to inspect it and its connections, then use the explicit "Open selected node" link to open its page.`,
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
