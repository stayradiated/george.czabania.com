# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Context

This is a mobile blogging system built with Astro. Key things to remember:

1. **Always work in the `_web/` directory** - All web development commands must be run from there
2. **Content lives in two places**:
   - Source markdown files in `notes/` and `posts/` directories (at root)
   - Processed by Astro via glob loader from `_web/src/content/config.ts`
3. **Publishing is controlled by front-matter** - Only posts with `publish: true` are displayed

## Common Tasks

When asked to:
- **Add features**: Check existing patterns in `_web/src/pages/` and `_web/src/components/`
- **Fix content issues**: Verify front-matter format matches schema in `_web/src/content/config.ts`
- **Debug builds**: Check date format (`YYYY-MM-DD HH:mm`) and that posts have required `title` field
- **Work with content**: Use helper functions in `_web/src/lib/published.ts`

## Code Patterns

- Astro uses `.astro` files with frontmatter scripts
- Components follow `PascalCase.astro` naming
- All content filtering happens through `getAllPublishedPosts()` and related functions
- Tailwind CSS is loaded via CDN in `Layout.astro`

@README.md