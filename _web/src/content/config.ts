import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const $Note = z.object({
  type: z.literal("note").default("note"),
  date: z.coerce.date(),
  publish: z.boolean(),
  tags: z.array(z.string()).default([]),
});

const $Post = z.object({
  type: z.literal("post").default("post"),
  slug: z.string(),
  title: z.string(),
  date: z.coerce.date(),
  publish: z.boolean(),
  tags: z.array(z.string()).default([]),
  description: z.string(),
});

const notes = defineCollection({
  loader: glob({ pattern: "notes/**/*.{md,mdx}", base: "../" }),
  schema: $Note,
});

const posts = defineCollection({
  loader: glob({ pattern: "posts/**/*.{md,mdx}", base: "../" }),
  schema: $Post,
});

export const collections = { notes, posts };
