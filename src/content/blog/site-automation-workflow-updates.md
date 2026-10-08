---
title: "How The Site Started Validating Itself Before I Can Commit It"
description: "A quick note on the automation, content linting, and workflow cleanup added to johnmcdougal.com today."
pubDate: 2026-09-17
projectRef: "johnmcdougal-site"
tags: ["site-build", "automation", "workflow", "documentation", "meta"]
---

> **TL;DR:** The site now normalizes content tags, refreshes its generated-output baselines during the commit workflow, and checks blog routes against normalized filenames instead of raw source names.

The first pass at this workflow removed some repetitive cleanup, but a new standalone post exposed a gap: Astro built the route from a lowercased, hyphenated filename while the verifier expected the source filename verbatim. The page built correctly, then the commit check failed while looking for a route that did not exist.

The verifier now keeps those two identities separate. It reads content using the real source path, then normalizes the filename when checking the generated route. Lowercase kebab-case filenames are still the convention; the check is simply aligned with the route Astro actually builds.

## The posting loop

For a new post, the important order is now explicit: create it from the template, fill the required frontmatter, run `npm run check`, then stage the post before running `npm run verify-build:sync-baseline`. The sync rebuilds the site, updates and stages the `verify-build` expectations, and avoids hand-editing counts or hashes. `npm run commit:check` then verifies that the staged snapshot matches the worktree. The pre-commit hook repeats baseline sync, trims staged trailing whitespace, and runs that check before Git creates the commit. Push comes after a successful commit.

That staging step matters: the commit check rejects untracked files so it can validate exactly what is proposed for the commit. In my failed attempt, I pushed before a commit had succeeded, so Git correctly had nothing new to send.

The blog template now shows every supported frontmatter field. The common fields stay active; less-used fields such as `updatedDate`, `heroImage`, `projectRef`, `series`, and `seriesPart` are commented out until needed. Series metadata must be added as a pair, and a new series also needs a definition in `src/lib/series.ts`.

## Generated versus curated

Most publishing surfaces follow the collections automatically. Adding content generates its detail route, tag pages, raw Markdown endpoint for blog posts, RSS item, sitemap entry, and graph node and edges. A blog post joins a project in the graph when its `projectRef` matches that project’s entry ID.

The exception is `public/llms.txt`, which is a curated inventory rather than a live list of every entry. Update it when the public index should feature a new post, project, or series. The project index also has optional editorial priority and evidence text for selected projects; ordinary projects still appear without adding those highlights.

## Why this matters

This site is supposed to be a live record of the work, not just a polished front end. If the workflow is fragile, writing slows down; if validation checks the wrong route, it becomes noise instead of protection. The changes make the routine path clearer while keeping the exceptions visible.

I am still iterating on the workflow, but the direction is clear: fewer manual fixes, generated surfaces that follow their source data, and a small number of intentional editorial inventories.

---

*What other publishing checks should happen automatically, and which parts should stay deliberately curated?*