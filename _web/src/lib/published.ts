import { type CollectionEntry, getCollection } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type Note = CollectionEntry<"notes">;
export type BlogPost = Post | Note;

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const notes = await getCollection("notes");
  const posts = await getCollection("posts");

  return [...notes, ...posts]
    .filter((post) => post.data.publish)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedNotes(): Promise<Note[]> {
  const notes = await getCollection("notes");

  return notes
    .filter((post) => post.data.publish)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => post.data.publish)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPublishedPosts();
  return posts.filter((post) => post.data.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPublishedPosts();
  const tagSet = new Set<string>(posts.flatMap((post) => post.data.tags));
  return Array.from(tagSet).sort();
}

export function groupPostsByYearMonth(
  posts: BlogPost[],
): Map<string, BlogPost[]> {
  const grouped = new Map<string, BlogPost[]>();

  posts.forEach((post) => {
    const date = post.data.date;
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!grouped.has(yearMonth)) {
      grouped.set(yearMonth, []);
    }
    grouped.get(yearMonth)?.push(post);
  });

  return grouped;
}
