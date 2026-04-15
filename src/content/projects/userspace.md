---
title: Userspace
description: "A framework for maintaining ownership and interoperability across your digital life -- tools, data, knowledge, and the systems that hold them."
pubDate: 2026-04-15
tags: ["userspace", "pkm", "tools", "obsidian", "notion", "self-hosted", "linux", "windows", "dotfiles"]
status: wip
---

*The human side of the stack.*

## What this is

Userspace is how I think about and document the human layer of computing -- the tools, operating systems, configurations, commands, and knowledge systems I use to actually get things done. It's a living catalog: what I run, where I run it, how I set it up, and why those choices exist. If CUE-Verse is the infrastructure side of the coin, Userspace is the people-and-operations side.

## Why it exists

Everyone wants to sell you a different shovel. Amazing shovels, genuinely -- but each one digs a slightly different hole, locks your dirt in a proprietary format, and makes it your problem when you want to move it somewhere else.

Data portability shouldn't be a privilege. I've always been someone who keeps my own notes, archives my own content, and maintains access to my own knowledge on my own terms. Userspace is the structured version of that instinct: how do you maintain ownership and interoperability across your personal digital life without accumulating massive technical debt?

It started coming into focus alongside CUE-Verse and Aeon Desktop -- all three projects inform each other. The more I broke down my infrastructure, the more I needed a parallel framework for how *I* move through it. Tools, workflows, contexts -- the human half of the system.

## Current state

Right now Userspace is a knowledge hub: organized databases (primarily in Notion) tracking the tools I use across systems, the commands I use with them, how they're configured, and where they live -- which hosts, which containers, which devcontainers. Heavy use of inline tagging to relate everything across contexts.

I'm in the middle of a partial migration toward Obsidian -- not abandoning Notion, which genuinely has no peer as an interconnected AI workspace, but working through what lives where. The friction is real: Notion-flavored Markdown is opaque in ways that Obsidian-flavored Markdown isn't. Synced blocks get obfuscated on export. Data that should be linked ends up duplicated. Navigating that without making a mess is the current active problem.

## What I'm figuring out

- Where the Notion / Obsidian boundary actually belongs for my workflows
- How to make the tool catalog interoperable and portable as the stack evolves
- What "Userspace for Windows" looks like alongside the Linux side (it has to work on both)
- How this layer connects back into CUE-Verse as the broader context and memory system