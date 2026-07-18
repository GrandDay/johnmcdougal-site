import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { rawMarkdownDateLines } from '../../lib/content-dates.mjs';

export async function getStaticPaths() {
const posts = await getCollection('blog');
return posts.map((post) => ({
params: { slug: post.id },
props: { post },
}));
}

export const GET: APIRoute = ({ props }) => {
const { post } = props;
const { title, description, pubDate, updatedDate, tags } = post.data;

const frontmatter = [
'---',
`title: "${title}"`,
`description: "${description}"`,
...rawMarkdownDateLines(pubDate, updatedDate),
`tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]`,
`canonical: https://johnmcdougal.com/blog/${post.id}/`,
'---',
'',
].join('\n');

return new Response(frontmatter + post.body, {
headers: {
'Content-Type': 'text/markdown; charset=utf-8',
'Cache-Control': 'public, max-age=3600',
},
});
};
