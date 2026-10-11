import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { assertProjectRefsExist, getProjectRefs } from '../lib/project-refs.mjs';
import { getSeriesGroups } from '../lib/series';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const projects = await getCollection('projects');
  const seriesGroups = await getSeriesGroups();
  const projectIds = new Set(projects.map((project) => project.id));

  type Node = { id: string; type: 'post' | 'project' | 'tag' | 'series'; label: string; url: string };
  type Edge = { source: string; target: string; type: 'tag' | 'projectRef' | 'series' | 'seriesProject' };

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
    assertProjectRefsExist(post, projectIds);
    getProjectRefs(post).forEach((ref) => {
      edges.push({ source: post.id, target: ref, type: 'projectRef' });
    });
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

  seriesGroups.forEach((group) => {
    const seriesNodeId = `series:${group.key}`;
    nodes.push({
      id: seriesNodeId,
      type: 'series',
      label: group.entry.data.title,
      url: `/series/${group.key}/`,
    });
    group.members.forEach((member) => {
      edges.push({ source: member.id, target: seriesNodeId, type: 'series' });
    });
    group.projects.forEach((projectId) => {
      edges.push({ source: seriesNodeId, target: projectId, type: 'seriesProject' });
    });
  });

  return new Response(JSON.stringify({ nodes, edges }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
