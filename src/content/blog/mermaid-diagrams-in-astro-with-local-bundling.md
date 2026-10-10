---
title: "Mermaid Diagrams in Astro with Local Bundling"
description: "How I added lazy, locally bundled Mermaid rendering to blog and project content, with theme-aware SVGs and a Proxmox layering article to exercise it."
pubDate: 2026-10-07
series: "How I built johnmcdougal.com"
seriesPart: 8
projectRef: "johnmcdougal-site"
tags: ["astro", "mermaid", "site-build", "accessibility", "documentation"]
---

> **TL;DR:** Mermaid now renders from ordinary Markdown code fences on blog and project pages, loads only when a page uses it, and follows the site's light, dark, and OLED themes.

I wanted diagrams to live beside the explanation, not in a separate drawing file that would drift away from the content. The site already builds Markdown and MDX into static pages, so the goal was to add Mermaid without changing that authoring model or sending readers to a third-party script host.

## Keep the source in the post

A diagram is still a fenced block in the Markdown. Astro leaves the `mermaid` code language identifiable while skipping normal syntax highlighting, which lets the renderer read the authored source directly. The renderer is included only when a blog or project entry contains a Mermaid fence, and the Mermaid module is dynamically imported only on those pages.

After rendering, the SVG is responsive and its colors come from the current site theme. Changing between light, dark, and OLED redraws the existing diagrams. If JavaScript is unavailable or Mermaid rejects the syntax, the original code block remains readable; after a successful render, readers can expand a source disclosure to inspect the definition.

## Keep diagrams understandable

Mermaid can put an accessible title and description into its SVG with `accTitle` and `accDescr`. I added both to the diagrams in the new [Proxmox homelab layering guide](/blog/layering-a-proxmox-homelab/). That article is intentionally an abstract recommendation rather than a map of my current lab: it covers host and storage boundaries, workload-specific guests, LXC's shared-kernel tradeoff, network access, and recovery planning.

The Mermaid renderer keeps strict security settings and uses Dagre as its default layout. The full package can emit a large optional layout asset during the build, but the browser check confirmed the ordinary diagrams do not request the ELK chunk with this configuration. `npm audit` is clean after pinning Mermaid's compatible patched KaTeX dependency and applying available nonbreaking fixes.

## What validation covered

I checked blog rendering, project rendering, multiple diagrams on one page, theme changes, mobile overflow, accessible SVG labels, malformed-diagram fallback, and the raw Markdown endpoint in the local preview. The full site validation and commit gates passed before the feature and guide were pushed.

There is still a production bundle warning for an emitted chunk over the default 500 kB threshold. It did not become a request for the normal diagrams I tested, but it is a useful signal to revisit if Mermaid use expands or other diagram families need different layout engines.

---

*The useful part of a diagram is not that it looks finished; it is that the source stays close enough to the system that it can be corrected when the system changes.*
