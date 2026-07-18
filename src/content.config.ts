import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isUtcCalendarDate, isValidDateOrder } from './lib/content-dates.mjs';

const calendarDate = z.coerce.date().refine(isUtcCalendarDate, {
  message: 'Calendar dates must resolve to midnight UTC.',
});

function validateDateOrder(
  entry: { pubDate: Date; updatedDate?: Date },
  ctx: z.RefinementCtx,
) {
  if (!isValidDateOrder(entry.pubDate, entry.updatedDate)) {
    ctx.addIssue({
      code: 'custom',
      path: ['updatedDate'],
      message: `updatedDate ${entry.updatedDate?.toISOString()} must be on or after pubDate ${entry.pubDate.toISOString()}.`,
    });
  }
}

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[!_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: calendarDate,
      updatedDate: calendarDate.optional(),
      heroImage: z.optional(image()),
      tags: z.array(z.string()).default([]),
      series: z.string().optional(),
      seriesPart: z.number().optional(),
      projectRef: z.string().optional(),
    }).superRefine((entry, ctx) => {
      validateDateOrder(entry, ctx);

      const hasSeries = entry.series !== undefined;
      const hasSeriesPart = entry.seriesPart !== undefined;

      if (hasSeries !== hasSeriesPart) {
        ctx.addIssue({
          code: 'custom',
          path: hasSeries ? ['seriesPart'] : ['series'],
          message: `Series metadata must be paired; received series=${JSON.stringify(entry.series)} and seriesPart=${JSON.stringify(entry.seriesPart)}.`,
        });
      }

      const { seriesPart } = entry;
      if (seriesPart !== undefined && (!Number.isInteger(seriesPart) || seriesPart < 1)) {
        ctx.addIssue({
          code: 'custom',
          path: ['seriesPart'],
          message: `seriesPart for series ${JSON.stringify(entry.series)} must be a positive integer; received ${JSON.stringify(seriesPart)}.`,
        });
      }
    }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/[!_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: calendarDate,
      updatedDate: calendarDate.optional(),
      heroImage: z.optional(image()),
      tags: z.array(z.string()).default([]),
      status: z.enum(['active', 'wip', 'archived']).default('active'),
      repoUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
    }).superRefine(validateDateOrder),
});

export const collections = { blog, projects };
