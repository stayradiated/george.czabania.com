import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '{notes,posts}/**/*.md', base: '../' }),
  schema: z.object({
    title: z.string().optional(),
    date: z.string().transform(str => new Date(str)),
    publish: z.boolean(),
    type: z.enum(['note', 'post']),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }).refine((data) => {
    if (data.type === 'post') {
      return data.title != null;
    }
    return true;
  }, {
    message: "Posts must have a title",
    path: ["title"],
  }),
});

export const collections = { blog };
