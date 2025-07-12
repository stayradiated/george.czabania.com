import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '{notes,posts}/**/*.md', base: '../' }),
  schema: z.object({
    title: z.string(),
    date: z.string().transform(str => new Date(str)),
    publish: z.boolean(),
    type: z.enum(['note', 'post']),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

export const collections = { blog };
