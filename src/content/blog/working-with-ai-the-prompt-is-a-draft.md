---
title: "The Prompt is a Draft"
description: "Most people treat prompts as instructions. They're not -- they're the starting position for a context window that already has shape. Treating the prompt as a draft you revise before sending is the simplest way to change what comes back."
pubDate: 2026-05-05
heroImage: ""
tags: ["ai", "workflow", "productivity", "knowledge-work"]
series: "Working with AI in 2026"
seriesPart: 4
---

> **TL;DR:** The model isn't following your instructions -- it's navigating from them. Treating the prompt as a draft you revise before sending is the simplest way to change what comes back.

Part 3 of this series made the case for iteration: generate, evaluate, refine as a deliberate cycle. If that's the method, the prompt is where the cycle starts. It determines the starting position. And most people, myself included for a while, don't treat it like something worth revising.

The shift that changed how I think about this came from Part 1's framing -- the latent space, the model as something you navigate rather than instruct. If that's the actual mechanism, then the prompt isn't a command that gets executed. It's the starting position for a context window that already has shape, already has probability mass distributed across it. What I put in the prompt adjusts that distribution. So writing a prompt and writing an instruction are not the same job.

Once I started thinking about it that way, what I put in the prompt changed.

---

There are a few things I've learned to ask myself before I hit send. Not a checklist -- I don't run through them sequentially. More like a filter that runs quietly in the background when I catch myself about to send something that probably won't land.

First: have I blended the context and the ask into one blob? There's a tendency to write a long preamble -- here's the situation, here's the background, here's what I've tried, here's what I'm working on -- and then bury the actual ask somewhere inside it. The model has to extract the ask from the context. Sometimes it does. Often it doesn't, because the context is doing too many things at once and it's not clear what the ask is. The cleaner version: context first, then a clear break, then what I actually want. That separation takes thirty seconds and changes the hit rate noticeably.

Second: have I said what shape I want back? Not just the topic -- the shape. Paragraph or list? Long form or short? Should it take a position or lay out options? If I leave that unspecified, the model picks. It usually picks something reasonable, but "reasonable" is a range. Specifying the shape isn't over-constraining -- it's telling the model what to optimize for.

---

The other thing that's changed how I work: I treat the prompt as a draft.

Not every prompt -- "what's the syntax for X" doesn't need revising. But when I'm doing real work, the kind where the quality of the first output actually matters and I'm going to iterate on it, I'll take thirty seconds before sending and read the prompt back. Is it clear? Is the ask specific? Is there anything in here that's noise -- detail I included out of habit or anxiety rather than because it helps? Does it say what good looks like?

That last one is the one I most often skip and most often regret. "Make this better" is not a useful prompt. "The argument is there but the conclusion is missing" is. Naming the gap specifically is most of the input craft. The model can close a gap I've identified. It's much worse at identifying the gap for me when I haven't named it.

---

This is Part 4 of "Working with AI in 2026." Part 5 gets into something I've been circling around the whole series: what it means to build recursive workflows -- systems that help you build systems -- and where the AI fits in that loop when the thing you're making is the process itself.
