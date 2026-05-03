---
title: "How I Built johnmcdougal.com with Claude and Astro"
description: "Building this site with Claude wasn't about delegating the work -- it was about having a thinking partner who helped me make real decisions and ship something instead of planning forever."
pubDate: 2026-05-03
tags: ["astro", "cloudflare", "ai", "building-in-public"]
series: "How I built johnmcdougal.com"
seriesPart: 1
---

> **TL;DR:** I built this site with Claude as a collaborator, not a code generator -- here's what that distinction actually means in practice.

This didn't start as "let's build a website."

It started as a GitHub audit. I wanted to clean up my profile, check for anything I shouldn't have exposed, and figure out how to present myself better as a knowledge worker. A two-hour project, maybe. But the audit surfaced the obvious question: present yourself where? And that's how we ended up here.

I'm telling you this because it matters for understanding what follows. The site wasn't planned from the top down. It evolved out of a conversation -- and that's not incidental to the story, it's the whole point of it.

## The stack, briefly

Before the process: what I actually built.

The site runs on Astro, hosted on Cloudflare Pages, deployed from GitHub on every push to main. Custom domain. Three-mode theme -- OLED, dark, light -- built with CSS variables. PostHog analytics proxied through a subdomain so it doesn't get swallowed by adblockers. Email routing through Cloudflare's free tier with SMTP2Go for custom domain sends. Blog and projects as separate content collections with different frontmatter schemas.

Not a complex system. But a real one. Each of those pieces required a decision, and most of those decisions required more than a Google search.

## How we made decisions

The part I want to be careful about here: I'm not going to tell you this is a workflow you should copy. I don't fully understand why it worked as well as it did, and I'd be lying if I presented it as a methodology.

What I can tell you is what it actually looked like.

Framework choice came first. I knew I wanted a static site -- I've run WordPress, I know what I'm getting into with a database, and I didn't want it. Beyond that I had opinions but no strong convictions. I brought that to Claude: here's what I care about (content-first, minimal client-side JavaScript, MDX support, active community, something I could understand fast), here's what I've looked at, what am I missing?

What followed wasn't a recommendation. It was questions back at me. What's the shape of your content? Are blog posts and project pages the same thing or different? How much do you care about the build system versus the output? That last one reframed the decision in a way I hadn't considered -- I cared almost entirely about the output, not the build tooling. Astro was the obvious fit once I thought about it that way.

Cloudflare Pages over Netlify and Vercel was faster. I was already at Cloudflare for DNS. The free tier is real. CI/CD from a GitHub push took about fifteen minutes. Done.

Content schema took longer.

## The schema conversation

My first instinct was to treat blog posts and project pages as the same thing. They're both markdown files, both have titles and dates -- why not.

Claude asked: what's the purpose difference?

Blog posts are time-stamped thinking. Project pages are living references -- the status changes, the stack evolves, you want to link from other posts to them over time. If they share a content type, you're fighting the data model every time you add a project-specific field.

Ten minutes. Two separate Astro content collections, different frontmatter schemas, clean separation from the start. That decision is invisible now because it's right -- but getting it wrong would have been annoying to unwind later.

I'm not saying I couldn't have figured that out alone. I probably would have. But "probably eventually" is different from "in ten minutes before building anything wrong."

## What surprised me

I've used AI as a code generator. You describe a thing, it writes the code, you check it, you adjust. Useful. Impersonal. Basically advanced autocomplete.

This was different in a specific way: continuity.

Every time I came back to the project -- across multiple sessions, picking up and putting down -- I didn't have to re-explain context. Not because the AI remembers between sessions (it doesn't). Because I'd built a practice of writing decisions to files as we made them. Those files were the shared memory. Pull the relevant ones in at the start of a session, pick up where we left off. The context wasn't in my head or in the chat history. It was on disk.

That shifted what the collaboration actually was. We weren't just talking -- we were both working on the same files. The chat was the interface. The files were the work.

I started thinking of it less as a tool and more as a collaborator that had been in the room for all the prior meetings. That shift changed how I asked questions. Less "how do I do X" and more "does this make sense given what we're building." The second type of question gets better answers.

I also noticed -- and I'm still figuring out what to make of this -- that having a thinking partner that doesn't get tired, doesn't have a stake in the outcome, and will tell you when your reasoning doesn't hold up is genuinely different from building alone. Not ready to turn that into a take. But it's true.

## The marble and the sculptor

The site exists now. That's not nothing -- I've had a version of this in my head for a few years and never shipped it.

I don't think the AI is why. The AI helped me move through decisions I would have gotten stuck on. But decisions also got written down in real time -- project docs, session logs, design choices committed to files as they were made. At some point I noticed something recursive: the documentation of the build process is as much a part of this project as the site itself. The marble kept taking notes while it was being carved.

That's going to be a theme here. I build in public not because everything is ready to show, but because the process is the point.

---

This is Part 1. The next posts in this series go deeper into specific layers: email routing with Cloudflare and SMTP2Go, the PostHog setup (including the part where the agentic install created a problem that manual docs had to fix), content schema decisions. The interesting stuff is in the details.

If any of this resonates -- if you're building something and getting stuck in the planning -- I'd say start with the conversation. The site can come from there.

---

*-- John*
