import { getCollection, type CollectionEntry } from 'astro:content';
import { getProjectRefs } from './project-refs.mjs';

type BlogEntry = CollectionEntry<'blog'>;
type SeriesEntry = CollectionEntry<'series'>;

export interface SeriesGroup {
  key: string;
  entry: SeriesEntry;
  members: BlogEntry[];
  /** Project IDs declared by the series; the first is the primary project. */
  projects: string[];
}

function assertMemberFields(post: BlogEntry): asserts post is BlogEntry & {
  data: BlogEntry['data'] & { series: string; seriesPart: number };
} {
  const { series, seriesPart } = post.data;
  const hasSeries = series !== undefined;
  const hasSeriesPart = seriesPart !== undefined;

  if (hasSeries !== hasSeriesPart) {
    throw new Error(
      `Series metadata error in entry "${post.id}": series=${JSON.stringify(series)}, seriesPart=${JSON.stringify(seriesPart)}; both fields must be present or absent.`,
    );
  }

  if (!hasSeries || !hasSeriesPart) {
    throw new Error(`Series metadata error in entry "${post.id}": expected a series member.`);
  }

  if (!Number.isInteger(seriesPart) || seriesPart < 1) {
    throw new Error(
      `Series "${series}" entry "${post.id}" has invalid seriesPart=${JSON.stringify(seriesPart)}; expected a positive integer.`,
    );
  }
}

export function buildSeriesGroups(
  posts: BlogEntry[],
  seriesEntries: SeriesEntry[],
  projectIds: Set<string>,
): SeriesGroup[] {
  const seriesById = new Map(seriesEntries.map((entry) => [entry.id, entry]));
  const membersBySeries = new Map<string, BlogEntry[]>();

  for (const entry of seriesEntries) {
    const seen = new Set<string>();
    for (const projectId of entry.data.projects) {
      if (!projectIds.has(projectId)) {
        throw new Error(`Series "${entry.id}" references missing public project "${projectId}".`);
      }
      if (seen.has(projectId)) {
        throw new Error(`Series "${entry.id}" lists project "${projectId}" more than once.`);
      }
      seen.add(projectId);
    }
  }

  for (const post of posts) {
    const { series, seriesPart } = post.data;
    if (series === undefined && seriesPart === undefined) continue;

    assertMemberFields(post);
    const validatedSeries = post.data.series;
    const validatedPart = post.data.seriesPart;
    const seriesEntry = seriesById.get(validatedSeries);
    if (!seriesEntry) {
      throw new Error(
        `Series "${validatedSeries}" referenced by entry "${post.id}" has no series entry in src/content/series; received seriesPart=${validatedPart}.`,
      );
    }

    for (const ref of getProjectRefs(post)) {
      if (!seriesEntry.data.projects.includes(ref)) {
        throw new Error(
          `Entry "${post.id}" has projectRef "${ref}" which is not listed in the projects of series "${validatedSeries}" (${JSON.stringify(seriesEntry.data.projects)}).`,
        );
      }
    }

    const members = membersBySeries.get(validatedSeries) ?? [];
    members.push(post);
    membersBySeries.set(validatedSeries, members);
  }

  const orderedSeries = [...seriesEntries].sort(
    (a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf() || a.id.localeCompare(b.id),
  );

  return orderedSeries.map((entry) => {
    const key = entry.id;
    const members = membersBySeries.get(key);
    if (!members || members.length === 0) {
      throw new Error(`Series "${key}" has no active member entries.`);
    }

    const sortedMembers = [...members].sort(
      (a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0),
    );
    const memberAtPart = new Map<number, BlogEntry>();

    for (const member of sortedMembers) {
      const part = member.data.seriesPart;
      if (part === undefined) {
        throw new Error(`Series "${key}" entry "${member.id}" is missing seriesPart.`);
      }

      const duplicate = memberAtPart.get(part);
      if (duplicate) {
        throw new Error(
          `Series "${key}" has ambiguous seriesPart=${part}: entries "${duplicate.id}" and "${member.id}".`,
        );
      }
      memberAtPart.set(part, member);
    }

    sortedMembers.forEach((member, index) => {
      const expectedPart = index + 1;
      const actualPart = member.data.seriesPart;
      if (actualPart !== expectedPart) {
        throw new Error(
          `Series "${key}" entry "${member.id}" has seriesPart=${JSON.stringify(actualPart)}; expected ${expectedPart} for a contiguous sequence beginning at 1.`,
        );
      }
    });

    return { key, entry, members: sortedMembers, projects: [...entry.data.projects] };
  });
}

export async function getSeriesGroups(): Promise<SeriesGroup[]> {
  const [posts, seriesEntries, projects] = await Promise.all([
    getCollection('blog'),
    getCollection('series'),
    getCollection('projects'),
  ]);
  return buildSeriesGroups(posts, seriesEntries, new Set(projects.map((project) => project.id)));
}

export function getSeriesForProject(groups: SeriesGroup[], projectId: string): SeriesGroup[] {
  return groups.filter((group) => group.projects.includes(projectId));
}

export function getSeriesActivityDate(group: SeriesGroup): Date {
  return group.members.reduce(
    (latest, post) => {
      const date = post.data.updatedDate ?? post.data.pubDate;
      return date.valueOf() > latest.valueOf() ? date : latest;
    },
    group.entry.data.updatedDate ?? group.entry.data.pubDate,
  );
}
