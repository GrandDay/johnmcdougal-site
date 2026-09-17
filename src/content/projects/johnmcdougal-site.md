---
title: "This Site"
description: "The Astro 7 public documentation site for projects, writing, metadata, tags, RSS, and Cloudflare deployment behavior."
pubDate: 2026-04-15
updatedDate: 2026-07-16
status: active
tags: ["astro", "cloudflare", "web", "blog", "site-build", "email"]
repoUrl: "https://github.com/GrandDay/johnmcdougal-site"
liveUrl: "https://johnmcdougal.com"
---

## What this is

The site you're on. It is my operational public site and documentation system:
an Astro 7 project with separate content collections for writing and projects,
generated routes for posts, project pages, tags, RSS, sitemap output, and a
content graph. It is deployed on Cloudflare Pages and documented through the
site itself.

## Why it exists

I needed somewhere to put the work. Not a portfolio in the traditional sense --
a place where the process is as visible as the output. The documentation
constraint forces clarity. If I can't explain what I built and why, I don't
understand it well enough.

## Current state

- Astro 7 with MDX and Markdown content, deployed to Cloudflare Pages from the
  repository.
- Separate Astro content collections for blog posts and projects, with project
  frontmatter for status, tags, repository links, and live links.
- Generated routes for `/blog/`, individual blog posts, `/projects/`,
  individual project pages, tag indexes, RSS, sitemap output, and `graph.json`.
- Raw Markdown endpoints for blog posts at `/blog/[slug].md`; project pages are
  generated as HTML detail routes.
- A three-mode theme system for light, dark, and OLED modes, plus responsive
  primary navigation and keyboard-operable theme/mobile-menu controls.
- PostHog analytics proxied through a subdomain, with public writing about the
  setup and the operational tradeoffs.
- Email infrastructure using Cloudflare Email Routing for receive, SMTP2Go for
  send, and SPF, DKIM, and DMARC authentication on the primary domain.
- Parked-domain email hardening through null MX, SPF hard fail, DMARC reject,
  and wildcard DKIM null records.
- Published writing across the site-build, email, analytics, and AI-workflow
  series, with the "How I built johnmcdougal.com" series linked back to this
  project through `projectRef`.

## What I implemented

The important implementation choice is that the public site is source-driven.
Markdown and MDX files hold the authored content. Astro content collections
validate the shape of posts and projects. The route templates render cards,
detail pages, linked writing, canonical URLs, tags, and metadata from that
source instead of hand-maintaining separate pages.

The project and blog collections stay separate because they serve different
jobs. Blog posts are dated writing. Project pages are living references with
status, tags, source links, live links, and related writing. That separation is
what lets the site behave like a documentation system instead of a flat archive.

## Validation

The generated site exposes the public surfaces I expect: HTML pages for posts
and projects, tag pages, RSS, sitemap output, raw Markdown endpoints for blog
posts, and `graph.json` for the Graph page.

The graph is intentionally simple today. It emits post, project, and tag nodes;
tag edges come from frontmatter tags, and project edges come from blog
`projectRef` fields. Inline Markdown links are for readers, while future graph
work can decide whether parsed links or backlinks should become data edges.

## What I am figuring out

- How project pages should relate to blog series over time. This page is the
  anchor for the "How I built johnmcdougal.com" series; that pattern should
  stay useful without turning every project into a content hub.
- Generalized publishing automation, parsed-link graph edges, automated
  accessibility and link testing, project structured data, and a reusable
  image/diagram platform.
- A consulting or services page, if it belongs on this site rather than under a
  separate identity.
- The next writing cluster after the current AI workflow series.

## Related work

- [Userspace](/projects/userspace/) is the source, prompt, review, and publication workflow behind the project documentation.
- [How I Built johnmcdougal.com with Claude and Astro](/blog/how-i-built-johnmcdougal-com-with-claude-and-astro/) is the first post in the public build series for this site.
- [PostHog Analytics on Astro with a Cloudflare Reverse Proxy](/blog/posthog-analytics-astro-cloudflare-proxy/) documents the analytics path.
