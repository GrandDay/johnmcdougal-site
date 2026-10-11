---
# Files starting with "_" are ignored by the content loader. Copy to a new file named after the series slug (e.g. my-series.md); the filename is the series ID.
title: ""           # displayed on /series, the blog index strip, project pages, and the graph
description: ""     # one or two sentences; also used for cards, meta tags, and llms.txt
pubDate: YYYY-MM-DD # date the series was started
# updatedDate: YYYY-MM-DD   # optional; must be on or after pubDate
# status: ongoing           # ongoing (default) | complete
# projects: ["project-id"]  # optional project IDs (filenames in src/content/projects); first entry is the primary project, e.g. ["homelab", "phred"]
---

<!--
Series files are metadata only; the body is optional and shown as an intro on /series/[id].

Posts join a series from their own frontmatter, using this file's ID:
  series: "my-series"
  seriesPart: 1          # contiguous, starting at 1
A post's projectRef (string or list) must be one of this series' projects.
-->
