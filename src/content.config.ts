import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[!_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image()),
      tags: z.array(z.string()).default([]),
      series: z.string().optional(),
      seriesPart: z.number().optional(),
      projectRef: z.string().optional(),
    }).superRefine((entry, ctx) => {
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
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.optional(image()),
      tags: z.array(z.string()).default([]),
      status: z.enum(['active', 'wip', 'archived']).default('active'),
      repoUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
    }),
});

export const collections = { blog, projects };
