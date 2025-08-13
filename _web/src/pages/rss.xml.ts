import rss from "@astrojs/rss";
import { getAllPublishedPosts } from "../lib/published";

export async function GET(context) {
  const posts = await getAllPublishedPosts();

  return rss({
    title: "Personal Blog",
    description: "Personal blog with notes and posts",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description || "",
      link: `/blog/${post.id}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
