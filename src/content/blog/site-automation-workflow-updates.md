---
title: "How the site started validating itself before I can commit it"
description: "A quick note on the automation, content linting, and workflow cleanup added to johnmcdougal.com today."
pubDate: 2026-09-17
projectRef: "johnmcdougal-site"
tags: ["site-build", "automation", "workflow", "documentation", "meta"]
---

> **TL;DR:** I taught the site to keep its own house in order: better content normalization, safer pre-commit automation, and a build check that now reports tag drift before it turns into route drift.

Today’s cleanup was less about adding one feature and more about removing a little friction from the whole publishing loop.

The site now does a better job of policing its own content. Tags are normalized at ingest, so case and spacing differences do not create noisy variations later in the build. The generated-site verification step also reports tag-lint warnings when source frontmatter would normalize differently, which gives me a cheap signal before the mismatch turns into a mess.

## What changed

I also tightened the commit workflow so the boring parts happen automatically. The pre-commit path now syncs the `verify-build` baseline, trims staged trailing whitespace, and then runs the strict commit check. That means I can keep writing without manually babysitting the same cleanup steps every time.

The other part of the work was documentation. I updated the README to reflect the current runtime pinning, content-addition flow, and the new verification behavior so the process is visible instead of implicit.

## Why this matters

This site is supposed to be a live record of the work, not just a polished front end. If the workflow is fragile, the writing slows down. If the validation is stale, the site drifts. Today’s changes push the system a little closer to being something I can trust while I keep shipping content.

I am still iterating on the shape of the workflow itself, but the direction is clear: fewer manual fixes, more durable rules, and better feedback when the content starts to drift from the shape the site expects.

---

*What else should the site be able to verify for me before I ever open a commit?*