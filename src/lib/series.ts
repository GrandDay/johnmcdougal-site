import type { CollectionEntry } from 'astro:content';

type BlogEntry = CollectionEntry<'blog'>;

interface SeriesDefinition {
  label: string;
  description: string;
}

export const SERIES_DEFINITIONS = {
  'How I built johnmcdougal.com': {
    label: 'How I Built johnmcdougal.com',
    description:
      'How this Astro site, its analytics, and its custom-domain email infrastructure were built and hardened.',
  },
  'Working with AI in 2026': {
    label: 'Working with AI in 2026',
    description:
      'A practical series on context, iteration, prompts, reusable workflows, and human judgment in AI-assisted work.',
  },
} as const satisfies Record<string, SeriesDefinition>;

export type SeriesKey = keyof typeof SERIES_DEFINITIONS;

export interface SeriesGroup {
  key: SeriesKey;
  definition: SeriesDefinition;
  members: BlogEntry[];
}

function isSeriesKey(value: string): value is SeriesKey {
  return Object.prototype.hasOwnProperty.call(SERIES_DEFINITIONS, value);
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

export function getSeriesGroups(posts: BlogEntry[]): SeriesGroup[] {
  const membersBySeries = new Map<SeriesKey, BlogEntry[]>();

  for (const post of posts) {
    const { series, seriesPart } = post.data;
    if (series === undefined && seriesPart === undefined) continue;

    assertMemberFields(post);
    const validatedSeries = post.data.series;
    const validatedPart = post.data.seriesPart;
    if (!isSeriesKey(validatedSeries)) {
      throw new Error(
        `Series "${validatedSeries}" referenced by entry "${post.id}" has no definition; received seriesPart=${validatedPart}.`,
      );
    }

    const members = membersBySeries.get(validatedSeries) ?? [];
    members.push(post);
    membersBySeries.set(validatedSeries, members);
  }

  return (Object.entries(SERIES_DEFINITIONS) as [SeriesKey, SeriesDefinition][]).map(
    ([key, definition]) => {
      const members = membersBySeries.get(key);
      if (!members || members.length === 0) {
        throw new Error(`Series definition "${key}" has no active member entries.`);
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

      return { key, definition, members: sortedMembers };
    },
  );
}
