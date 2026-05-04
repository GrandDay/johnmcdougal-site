---
title: "This Site"
description: "An Astro 5 blog and project journal. Built in public, deployed on Cloudflare Pages, and documented one post at a time."
pubDate: 2026-04-15
status: active
tags: ["astro", "cloudflare", "web", "blog", "site-build", "email"]
repoUrl: "https://github.com/GrandDay/johnmcdougal-site"
liveUrl: "https://johnmcdougal.com"
---

## What this is

The site you're on. An Astro 5 blog and project journal, deployed on Cloudflare
Pages, with a full email and DNS stack behind it. Built from scratch and
documented publicly.

## Why it exists

I needed somewhere to put the work. Not a portfolio in the traditional sense --
a place where the process is as visible as the output. The documentation
constraint forces clarity. If I can't explain what I built and why, I don't
understand it well enough.

## Current state

- Astro 5 with MDX, deployed to Cloudflare Pages via GitHub push-to-main
- Three-mode theme (OLED / dark / light), teal accent
- PostHog analytics proxied through a subdomain to avoid blockers
- Email infrastructure: Cloudflare Email Routing (receive) + SMTP2Go (send) +
  full SPF / DKIM / DMARC authentication on the primary domain
- Five parked domains (.co / .dev / .io / .tech / .online) all locked with null
  MX, SPF hard fail, DMARC reject, and wildcard DKIM null -- redirecting to
  the primary domain
- Six published posts in the "How I built johnmcdougal.com" series documenting
  all of the above

## What I am figuring out

- Project pages and their relationship to the blog series -- the site build
  documentation lives in the blog; this page is the anchor for the series
- A consulting landing page: whether that lives here as a section, or gets its
  own subdomain and identity
- Long-term content architecture: the site build series is closing; next up is
  the AI workflow and tools cluster
- Whether "building in public" is still the right tagline, or if the framing
  has evolved past it
