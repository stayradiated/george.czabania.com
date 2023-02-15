const plugins = []

const config = {
  siteMetadata: {
    title: 'george.czabania',
    author: 'George Czabania',
    description: 'My personal web space',
    siteUrl: 'https://george.czabania.com',
    social: {
      twitter: 'stayradiated',
    },
  },
  plugins,
}

/*
 * ============================================================================
 *                                                                      SOURCES
 * ============================================================================
 */

/*
 * [Plugin] Source Filesystem
 * https://www.npmjs.com/package/gatsby-source-filesystem
 *
 * A Gatsby source plugin for sourcing data into your Gatsby application from
 * your local filesystem.
 */

plugins.push(
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      path: `${__dirname}/content/blog`,
      name: 'blog',
      ignore: process.env.NODE_ENV === 'production' && ['**/__*']
    },
  },
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      path: `${__dirname}/content/assets`,
      name: 'assets',
    },
  },
  {
  resolve: 'gatsby-source-filesystem',
  options: {
    path: `${__dirname}/src/images`,
    name: 'images',
    },
  }
)

/*
 * ============================================================================
 *                                                               GATSBY PLUGINS
 * ============================================================================
 */

/*
 * [Plugin]: Typescript
 * https://www.gatsbyjs.org/packages/gatsby-plugin-typescript/
 *
 * Provides drop-in support for TypeScript and TSX.
 */
plugins.push({
  resolve: 'gatsby-plugin-typescript',
  options: {
    isTSX: true,
    allExtensions: true,
  },
})

/*
 * [Plugin] Manifest
 * https://www.npmjs.com/package/gatsby-plugin-manifest
 *
 * The web app manifest (part of the PWA specification) enabled by this plugin
 * allows users to add your site to their home screen on most mobile browsers.
 * The manifest provides configuration and icons to the phone.
 */

plugins.push({
  resolve: 'gatsby-plugin-manifest',
  options: {
    name: 'Blog: George Czabania',
    short_name: 'george.czabania',
    start_url: '/',
    background_color: '#ffffff',
    theme_color: '#663399',
    display: 'minimal-ui',
    icon: 'content/assets/gatsby-icon.png',
  },
})

/*
 * [Plugin] MDX
 * https://www.npmjs.com/package/gatsby-plugin-mdx
 *
 * MDX is markdown for the component era. It lets you write JSX embedded inside
 * markdown. It’s a great combination because it allows you to use markdown’s
 * often terse syntax (such as # heading) for the little things and JSX for
 * more advanced components.
 */

const gatsbyRemarkPlugins = []

plugins.push({
  resolve: 'gatsby-plugin-mdx',
  options: {
    extensions: ['.mdx', '.md'],
    defaultLayouts: require.resolve('./src/components/layout.js'),
    gatsbyRemarkPlugins,
    rehypePlugins: [
      require('rehype-slug'),
    ],
    plugins: [
      'gatsby-remark-images' // this remark plugin is special
    ],
  },
})

/*
 * [Plugin] Emotion
 * https://www.npmjs.com/package/gatsby-plugin-emotion
 *
 * Provide support for using the css-in-js library Emotion including server
 * side rendering.
 */

plugins.push({
  resolve: 'gatsby-plugin-emotion'
})

/*
 * [Plugin:Transformer] Sharp
 * https://www.npmjs.com/package/gatsby-transformer-sharp
 *
 * Creates ImageSharp nodes from image types that are supported by the Sharp
 * image processing library and provides fields in their GraphQL types for
  * processing your images in a variety of ways including resizing, cropping,
  * and creating responsive images.
 */

plugins.push({
  resolve: 'gatsby-transformer-sharp'
})

/*
 * [Plugin] Sharp
 * https://www.npmjs.com/package/gatsby-plugin-sharp
 *
 * Exposes several image processing functions built on the Sharp image
 * processing library. This is a low-level helper plugin generally used by
 * other Gatsby plugins. You generally shouldn't be using this directly but
 * might find it helpful if doing very custom image processing.
 */

plugins.push({
  resolve: 'gatsby-plugin-sharp'
})

/*
 * [Plugin] Sitempa
 * https://www.npmjs.com/package/gatsby-plugin-sitemap
 *
 * Create a sitemap for your Gatsby site.
 */

plugins.push({
  resolve: 'gatsby-plugin-sitemap'
})

/*
 * [Plugin] Feed
 * https://www.npmjs.com/package/gatsby-plugin-feed-mdx
 *
 * Create an RSS feed (or multiple feeds) for your Gatsby site.
 */

plugins.push({
  resolve: 'gatsby-plugin-feed-mdx',
  options: {
    query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
      `,
    feeds: [
      {
        serialize: ({ query: { site, allMdx } }) => {
          return allMdx.edges.map(edge => {
            return Object.assign({}, edge.node.frontmatter, {
              description: edge.node.excerpt,
              date: edge.node.frontmatter.date,
              url: site.siteMetadata.siteUrl + edge.node.fields.slug,
              guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
              custom_elements: [{ 'content:encoded': edge.node.html }],
            })
          })
        },

        /* if you want to filter for only published posts, you can do
         * something like this:
         * filter: { frontmatter: { published: { ne: false } } }
         * just make sure to add a published frontmatter field to all posts,
         * otherwise gatsby will complain
         **/
        query: `
        {
          allMdx(
            sort: { order: DESC, fields: [frontmatter___date] },
          ) {
            edges {
              node {
                excerpt
                html
                fields { slug }
                frontmatter {
                  title
                  date
                }
              }
            }
          }
        }
        `,
        output: '/rss.xml',
        title: 'Gatsby RSS feed',
      },
    ],
  },
})

/*
 * [Plugin] Offline
 * https://www.npmjs.com/package/gatsby-plugin-offline
 *
 * Adds drop-in support for making a Gatsby site work offline and more
 * resistant to bad network connections. It creates a service worker for the
 * site and loads the service worker into the client.
 */

plugins.push({
  resolve: 'gatsby-plugin-offline',
})

/*
 * [Plugin] React Helmet
 * https://www.npmjs.com/package/gatsby-plugin-react-helmet
 *
 * Provides drop-in support for server rendering data added with React Helmet.
 * With this plugin, attributes you add in their component, e.g. title, meta
 * attributes, etc. will get added to the static HTML pages Gatsby builds.
 */

plugins.push({
  resolve: 'gatsby-plugin-react-helmet',
})

/*
 * ============================================================================
 *                                                             MARKDOWN PLUGINS
 * ============================================================================
 */

/*
 * [Markdown] Images
 * https://www.npmjs.com/package/gatsby-remark-images
 *
 * Processes images in markdown so they can be used in the production build.
 */

gatsbyRemarkPlugins.push({
  resolve: 'gatsby-remark-images',
  options: {
    maxWidth: 1280,
  }
})

/*
 * [Markdown] Video
 * https://www.npmjs.com/package/gatsby-remark-video
 *
 * Embeds video tag in your gatsby project
 */

gatsbyRemarkPlugins.push({
  resolve: '@stayradiated/gatsby-remark-video',
  options: {
    defaultAttributes: {
      width: 'auto',
      height: 432,
      preload: 'auto',
      muted: true,
      autoplay: true,
      playsinline: true,
      controls: false,
      loop: true
    }
  }
})

/*
 * [Markdown] Responsive iFrames
 * https://www.npmjs.com/package/gatsby-remark-responsive-iframe
 *
 * Wraps iframes or objects (e.g. embedded YouTube videos) within
 * markdown files in a responsive elastic container with a fixed
 * aspect ratio. This ensures that the iframe or object will scale
 * proportionally and to the full width of its container.
 */

gatsbyRemarkPlugins.push({
  resolve: 'gatsby-remark-responsive-iframe',
  options: {
    wrapperStyle: 'margin-bottom: 1.0725rem',
  },
})

/*
 * [Markdown] Copy Linked Files
 * https://www.npmjs.com/package/gatsby-remark-copy-linked-files
 *
 * Copies local files linked to/from Markdown (.md|.markdown) files to the root
 * directory (i.e., public folder).
 */

gatsbyRemarkPlugins.push({
  resolve: 'gatsby-remark-copy-linked-files',
})

/*
 * [Markdown] Smartypants
 * https://www.npmjs.com/package/gatsby-remark-smartypants
 *
 * Replaces "dumb" punctuation marks with “smart” punctuation marks using the
 * retext-smartypants plugin.
 */

gatsbyRemarkPlugins.push({
  resolve: 'gatsby-remark-smartypants',
})

/*
 * [Markdown] PrismJS
 * https://www.npmjs.com/package/gatsby-remark-prismjs
 *
 * Adds syntax highlighting to code blocks in markdown files using PrismJS.
 */

gatsbyRemarkPlugins.push({
  resolve: 'gatsby-remark-prismjs',
  options: {
    classPrefix: 'language-',
    inlineCodeMarker: null,
    aliases: {},
    showLineNumbers: true,
    noInlineHighlight: false,
    languageExtensions: [],
    prompt: {
      user: 'george',
      host: 'localhost',
      global: false,
    },
  },
})

module.exports = config
