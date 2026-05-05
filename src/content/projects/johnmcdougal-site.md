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
- Thirteen published posts across three series: "How I built johnmcdougal.com" (6 parts), "Working with AI in 2026" (6 parts), and a standalone hello world
- The "How I built" series is complete and documents the full site build, email stack, and analytics setup

## What I am figuring out

- A consulting landing page: whether that lives here as a section, or gets its
  own subdomain and identity
- How project pages relate to blog series -- this page is the anchor for the
  "How I built" series; that pattern needs to be consistent across projects
- C3B cluster next: the AI workflow series (C3A) is complete; the next
  content cluster is in planning
