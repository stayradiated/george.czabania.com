---
title: "Keeping Dependencies up to date with PNPM"
date: "2025-09-26 11:53"
publish: false
type: post
tags: ["pnpm", "dependencies", "tldraw"]
description: ""
---

Nearly all of the projects I work on are written in JavaScript and use NPM dependencies.

My package management tool of choice is [PNPM](https://pnpm.io/).

I also like to keep my dependencies up to date. Each day I'm working on [Rough.app](https://rough.app), the first thing I do is update all dependencies to the latest version.

This has it's pros and cons. By updating frequently, I'm getting the latest features ad security patches. Each change is often smaller and any breaking changes are often easier to apply incrementally. If a bug appears, it's easier to narrow it down to which dependency recently updated and track it down.

It also means I hit bugs more often. I love Svelte and SvelteKit - but I've hit several edge case bugs where the latest version changed something unexpectedly and my app no longer works. This can take some time to figure out the root cause (my first thought is it's something I've done). Then I'll rollback the dependency and wait until a fix is released before upgrading. 

---

I like to have my `package.json` define exact dependency versions, instead of ranges.  For example:

```json title="package.json"
{
  // ...
  "devDependencies": {
    "jsdom": "27.0.0",
    "kanel": "3.14.4",
    "kanel-kysely": "0.7.1",
    "kanel-zod": "1.5.2",
    "knip": "5.64.0",
  }
}
```

I like knowing _exactly_ which version of a dependency I'm using.  I could use a semantic version like `^1.5.2` or `~0.7.1` - but then I would need to check the lockfile to see which version is installed. I guess it's not that difficult - but I'd rather just have it specified exactly in the `package.json`.

---

I used to use [`npm-check-updates`](https://github.com/tjunnone/npm-check-updates) to upgrade my packages. However, when PNPM released [catalogs](https://pnpm.io/catalogs) (which is a fantastic feature)- it wasn't supported by this tool (though it looks like [it's currently being built](https://github.com/raineorshine/npm-check-updates/pull/1533)).

I've since switched to using the `pnpm update` command to keep my dependencies to update.

The full command is:

```bash frame="terminal"
pnpm update --latest --recursive
```

The `--latest` flag is key for this to work for me. Without this flag, PNPM will _not_ change the `package.json` file. It will only update the dependencies to the latest version that matches the specified version range. If you are using semantic versions, this works for you. But not for me - I want my `package.json` to be updated with the latest version of each package available on the registry. 

I also have multiple packages in the same git repo, using [PNPM workspaces](https://pnpm.io/workspaces) - so I use the `--recursive` flag to update all packages in the repo.

I also don't want to have the hottest freshest version that has just been pushed to NPM minutes ago. The risk of installing a malicious package version is too high. Fortunately, PNPM has the [`minimumReleaseAge`](https://pnpm.io/blog/releases/10.16) setting - which can reduces the chance of installing a compromised package. The hope is that the community will notice a compromised package soon after it's available and take it down. I have my workspace configured to only install packages that have been public for 24 hours.

---

Sometimes, I'll need to hold a dependency back. Such as when the latest version has a bug, or if it's a major breaking change that requires time to refactor. Or when there is a license change.

I love [tldraw](https://tldraw.dev/) - it's a very high quality collaborative whiteboard library I use on Rough.app. We've been fortunate that there licensing has been very permissive towards commercial applications - we can use it for free [as long as we display a watermark](https://tldraw.dev/releases/v3.0.0). However, with their latest release, commercial applications are [now required to pay $6,000 USD year](https://tldraw.dev/releases/v4.0.0). I don't blame them for trying to make money - but I can't afford to pay that... So I'm sticking with tldraw v3 until Rough.app starts making enough cash to make upgrading worth it.

So, how do I keep all my dependencies up to date, but leave some dependencies on their current versions? I tried a couple different ways before I found an approach that is simple and works reliably.

Inside the `package.json`, I define [the `pnpm.updateConfig.ignoreDependencies` configuration](https://pnpm.io/settings#updateconfigignoredependencies).

This is a list of dependencies that will be skipped when running `pnpm update`. Note you can use globs to match multiple dependencies:

```json title="package.json"
{
  // ...
  "pnpm": {
    "updateConfig": {
      "ignoreDependencies": [
        "@tldraw/*",
        "tldraw"
      ]
    }
  }
}
```

Now when I run `pnpm update --latest --recursive`, my `tldraw` is left on it's current version, which everything else is updated.