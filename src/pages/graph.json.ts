import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const projects = await getCollection('projects');

  type Node = { id: string; type: 'post' | 'project' | 'tag'; label: string; url: string };
  type Edge = { source: string; target: string; type: 'tag' | 'projectRef' };

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const tagSet = new Set<string>();

  [...posts, ...projects].forEach((item) => {
    item.data.tags.forEach((tag: string) => tagSet.add(tag));
  });

  tagSet.forEach((tag) => {
    nodes.push({ id: `tag:${tag}`, type: 'tag', label: tag, url: `/tags/${tag}` });
  });

  posts.forEach((post) => {
    nodes.push({
      id: post.id,
      type: 'post',
      label: post.data.title,
      url: `/blog/${post.id}/`,
    });
    post.data.tags.forEach((tag: string) => {
      edges.push({ source: post.id, target: `tag:${tag}`, type: 'tag' });
    });
    if (post.data.projectRef) {
      edges.push({ source: post.id, target: post.data.projectRef, type: 'projectRef' });
    }
  });

  projects.forEach((project) => {
    nodes.push({
      id: project.id,
      type: 'project',
      label: project.data.title,
      url: `/projects/${project.id}/`,
    });
    project.data.tags.forEach((tag: string) => {
      edges.push({ source: project.id, target: `tag:${tag}`, type: 'tag' });
    });
  });

  return new Response(JSON.stringify({ nodes, edges }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
