# Obsidian-to-Astro Blog

A friction-free mobile blogging system that enables writing and publishing blog posts directly from iPhone using Obsidian, with automatic deployment to GitHub Pages via Astro.

## 🎯 Features

- **Mobile-first authoring** using Obsidian on iPhone
- **Two content types**: `note` (micro) and `post` (longer articles)
- **Draft/publish workflow** with front-matter flag
- **Tag-based organization** with dynamic tag pages
- **RSS feed** with full content
- **Archive page** organized by date
- **Zero-maintenance deployment** via GitHub Actions

## 🏗️ Architecture

```
iPhone Obsidian → Working Copy → GitHub → GitHub Actions → GitHub Pages
```

## 📁 Project Structure

```
├── .github/workflows/deploy.yml    # GitHub Actions deployment
├── public-blog/                    # Obsidian vault content
│   ├── notes/                      # Quick thoughts (type: note)
│   └── posts/                      # Longer articles (type: post)
├── .obsidian/templates/             # Templater templates
│   ├── new-note.md                 # Template for notes
│   └── new-post.md                 # Template for posts
└── src/
    ├── content/
    │   ├── config.ts               # Content collection schema
    │   └── blog/                   # Processed content (auto-synced)
    ├── pages/
    │   ├── index.astro             # Mixed feed homepage
    │   ├── notes.astro             # Notes-only feed
    │   ├── posts.astro             # Posts-only feed
    │   ├── archive.astro           # Date-organized archive
    │   ├── rss.xml.ts              # RSS feed generator
    │   ├── blog/[...slug].astro    # Individual post pages
    │   └── tags/[tag].astro        # Tag-based filtering
    ├── layouts/
    │   ├── Layout.astro            # Base layout
    │   └── BlogPost.astro          # Post layout
    └── components/
        └── PostCard.astro          # Post listing component
```

## 📝 Content Model

All content uses this front-matter structure:

```yaml
---
title: "Post Title"
date: "2025-07-12 09:05"    # YYYY-MM-DD HH:mm format
publish: false              # Set to true to publish
type: note                  # "note" or "post"
tags: [mobile, blogging]    # Array of tags
description: "Optional"     # Meta description
---
```

## 🚀 Getting Started

### 1. Development Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

### 2. Content Creation

**Option A: Manual Creation**
- Create `.md` files in `public-blog/notes/` or `public-blog/posts/`
- Follow the front-matter format above
- Copy files to `src/content/blog/` for processing

**Option B: Obsidian Templates (Recommended)**
- Install Templater plugin in Obsidian
- Use "New Note" or "New Post" commands
- Templates auto-populate front-matter and move files

### 3. Publishing Workflow

1. **Write**: Create content in Obsidian
2. **Draft**: Keep `publish: false` while editing
3. **Publish**: Change to `publish: true` when ready
4. **Deploy**: Push to main branch triggers auto-deployment

## 📱 Mobile Workflow (iPhone)

### Prerequisites
- Obsidian app with Templater plugin
- Working Copy app for Git sync
- Obsidian Sync or iCloud for vault sync

### Daily Workflow
1. **Pull latest**: Use Working Copy to sync latest changes
2. **Create content**: Tap template buttons in Obsidian
3. **Write**: Use Obsidian's mobile editor
4. **Publish**: Set `publish: true` in front-matter
5. **Push**: Use Working Copy to commit and push

### Shortcuts Setup
- **Obsidian open**: Auto-pull from Working Copy
- **Obsidian close**: Auto-push to Working Copy

## 🔧 Configuration

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Ensure proper permissions in workflow file

### Custom Domain (Optional)
1. Add `CNAME` file to `public/` directory
2. Configure DNS records
3. Enable HTTPS in GitHub settings

## 🎨 Customization

### Styling
- Uses Tailwind CSS via CDN for rapid prototyping
- Modify `src/layouts/Layout.astro` for global styles
- Consider switching to local Tailwind for production

### Content Schema
- Edit `src/content/config.ts` to modify front-matter fields
- Update templates in `.obsidian/templates/` accordingly

## 📊 Routes

| Route | Description |
|-------|-------------|
| `/` | Mixed feed (notes & posts) |
| `/notes` | Micro-notes only |
| `/posts` | Long posts only |
| `/tags/[tag]` | Posts by tag |
| `/archive` | Date-organized archive |
| `/rss.xml` | RSS 2.0 feed |
| `/blog/[slug]` | Individual post pages |

## 🧞 Commands

| Command | Action |
| :------------------------ | :----------------------------------------------- |
| `pnpm install` | Installs dependencies |
| `pnpm dev` | Starts local dev server at `localhost:4321` |
| `pnpm build` | Build your production site to `./dist/` |
| `pnpm preview` | Preview your build locally, before deploying |

## 🚨 Troubleshooting

### Build Fails
- Check front-matter syntax in all `.md` files
- Ensure dates are in correct format: `YYYY-MM-DD HH:mm`
- Verify `publish` field is boolean (`true`/`false`)

### Content Not Showing
- Ensure `publish: true` in front-matter
- Check files are in correct directory structure
- Verify content is copied to `src/content/blog/`

### Mobile Issues
- Confirm Templater plugin is installed and configured
- Check file permissions in Working Copy
- Verify Obsidian Sync is working properly

## 🔄 Content Sync

**Important**: This setup requires manual sync between `public-blog/` and `src/content/blog/`. For automatic sync, consider:

1. **Symbolic links**: Link directories (Unix/Linux only)
2. **Build hook**: Add copy step to build process
3. **Watch script**: Auto-copy on file changes during development

## 📄 License

MIT License - feel free to fork and customize for your own blog!
