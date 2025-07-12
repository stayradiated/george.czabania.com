import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getAllPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts
    .filter(post => post.data.publish)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getPublishedNotes(): Promise<BlogPost[]> {
  const posts = await getAllPublishedPosts();
  return posts.filter(post => post.data.type === 'note');
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPublishedPosts();
  return posts.filter(post => post.data.type === 'post');
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPublishedPosts();
  return posts.filter(post => post.data.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPublishedPosts();
  const tags = new Set<string>();
  posts.forEach(post => {
    post.data.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function groupPostsByYearMonth(posts: BlogPost[]): Map<string, BlogPost[]> {
  const grouped = new Map<string, BlogPost[]>();
  
  posts.forEach(post => {
    const date = post.data.date;
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(yearMonth)) {
      grouped.set(yearMonth, []);
    }
    grouped.get(yearMonth)!.push(post);
  });
  
  return grouped;
}