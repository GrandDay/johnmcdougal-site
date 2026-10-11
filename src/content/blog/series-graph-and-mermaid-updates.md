---
title: "Series, Graph, and Mermaid Updates"
description: "Series became their own content collection, posts can belong to more than one project, the graph gained series hubs and layout controls, and Mermaid diagrams got a viewer."
pubDate: 2026-10-10
series: "site-changelog"
seriesPart: 3
projectRef: "johnmcdougal-site"
tags: ["site-build", "astro", "graph", "mermaid", "documentation"]
---

> **TL;DR:** Series are now their own content collection with their own pages, a post can belong to more than one project, the graph gained series hubs and layout controls, and Mermaid diagrams got a viewer for reading large ones.

## Series moved from code to content

**What changed:** Series definitions used to live in `src/lib/series.ts`. Each series is now a file in `src/content/series/`, with a `/series` index, a page per series, a nav link, and series cards on project pages.

**Why:** Adding a series meant editing code and the verifier. Now it is a content file like everything else, which fits the goal that content changes should not need script edits.

## A post can belong to more than one project

**What changed:** `projectRef` accepts a single project or a list, and a series declares the projects it relates to. A post's project refs must be among the projects of its series.

**Why:** Some writing spans projects, such as the homelab and Phred, and a single value forced a false choice.

## Series in the graph, with layout controls

**What changed:** Series nodes pull their member posts together and link to their projects. The graph has a layout panel with sliders for pull and spacing that persist in the browser, and the menu is a bordered collapsible.

**Why:** Adding series nodes made the graph denser, so readers need a way to tune it instead of getting one fixed layout.

## Mermaid viewer and label fix

**What changed:** Diagrams stay at natural size in a scrollable area, with an opt-in Pan mode and a full-size viewer with Zoom in, Zoom out, Fit, and 1:1. A CSS fix stops the page's prose line-height from clipping wrapped diagram labels.

**Why:** Shrinking a wide diagram to the article column made its labels unreadable. The label clipping was a real bug that the diagram checks turned up.

---

*Which of these changes would you want explained further, and which belong in the project page instead of the changelog?*
