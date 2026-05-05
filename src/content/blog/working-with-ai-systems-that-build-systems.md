---
title: "Systems That Build Systems"
description: "The most useful thing AI changes isn't individual tasks -- it's the economics of building the systems that do the tasks. When scaffolding gets cheap enough, you build infrastructure you'd have skipped. That infrastructure compounds."
pubDate: 2026-05-05
tags: ["productivity", "tools", "workflow", "systems-thinking", "AI"]
series: "Working with AI in 2026"
seriesPart: 5
---

> **TL;DR:** The most useful thing AI changes isn't individual tasks -- it's the economics of building the systems that do the tasks. When scaffolding gets cheap enough, you start building infrastructure you'd have skipped. That infrastructure compounds.

There's a point in a project where you stop using AI to do work and start using it to build the thing that does the work. The shift is small -- a decision to make something reusable instead of throwing it away when you're done -- but it changes the whole shape of what you're building.

I've hit that point enough times now that I recognize it. And once you do, you start seeing it everywhere.

---

Parts 1 through 4 of this series tracked a progression: from how AI actually processes language, to how context management changes what's possible, to iteration as the real method, to how much the quality of your input matters. Each post described one layer. What they add up to is a method. And a method, accumulated and codified, is a system.

The question this post is asking is: what happens when you apply AI to building the system itself?

---

The economics argument is simple but easy to underestimate.

Before AI, scaffolding a reusable workflow was expensive in the one currency that's always scarce: time and cognitive overhead. You'd do the task, move on, repeat the setup cost next time. The break-even point for building infrastructure -- a real template, a session structure, a repeatable process -- was high enough that most of the time, you just didn't. You kept it in your head. You rebuilt it from scratch when you needed it again.

AI drops the cost of that scaffolding by an order of magnitude. The thing you'd have skipped is now cheap to build. And cheap to build means you actually build it.

But here's the part that matters more: it doesn't remove work. It shifts work. When the system runs, your role changes -- the overhead that used to be execution becomes review, judgment, architectural sense. Did the steps actually happen? Is the context getting carried forward? Is something drifting? You're the auditor now, not the laborer.

But the shift doesn't just redistribute responsibility. It opens something. When the scaffolding handles the logistics of a domain, you can move across domains -- designer, engineer, writer, researcher -- without rebuilding from zero every time you cross a line. The infrastructure becomes the interface through which you get to explore whatever you want to apply yourself to. You stop being the person executing one thing and become the person who gets to decide what's worth building at all.

---

Here's what that looks like in practice.

I built a system for running this series. Not just a writing workflow -- a session structure, a set of templates, a way of moving an article from idea to published post in discrete phases with clear handoffs. Each session type has a brief format and a set of outputs. I know what Session A produces and what Session B needs from it. The system doesn't write the posts; I write the posts. But the scaffolding means I spend almost no overhead on process. The infrastructure handles the logistics. I handle the thinking.

That system exists because AI made it cheap enough to build. Before, I would have kept the process in my head, reconstructed it imperfectly each time, and lost half the context between sessions. Building it properly would have taken longer than just doing it manually. That calculus flipped.

A different example: I built a macronutrient tracker. It's a prompt plus a multimodal LLM that produces structured YAML -- food log entries that go into an Obsidian-based tracking system. I'd been thinking about something like this since I started journaling in Obsidian. I made a few rough versions. The AI-scaffolded version is the one I actually use, because the cost of building it to the point of being usable finally dropped below the point where I'd abandon it. It runs through OpenWebUI. It's not finished. But it works, and it's been running for months.

Those are two very different domains -- writing workflow, personal health tracking -- and they share the same pattern. The infrastructure exists because it got cheap enough to build. The project pipelines I've been building across everything else have the same shape.

---

The recursive piece is where it gets interesting.

The system you're building can help you build more of itself. Once the scaffolding is in place, improving it is also cheap. You add a session type, refine a template, extend a workflow -- and because the cost of improvement is low, you actually do it. The infrastructure compounds. Not because AI is getting smarter (though it is), but because you're building on a foundation that keeps getting better without requiring the same overhead it took to build the first version.

That compounding is what actually changes. Not any individual task. The accumulation of infrastructure you'd have otherwise skipped.

---

There's a catch in the compounding argument, though. Infrastructure only compounds if it's maintained. Not as an afterthought -- as part of the design.

When I build a session structure or a prompt template, one of the questions I ask is: can I read this in six months? Can I fix it when something drifts? A system you can't understand is a system you can't fix. And a system that can't be fixed doesn't compound -- it accumulates debt.

The economics of building got better. The cost of neglect didn't.

---

There's a larger question underneath all of this, though. The infrastructure doesn't think. It executes. The judgment about what's worth scaffolding, the architectural sense of how pieces should connect, the ability to recognize when a process is drifting and needs correction -- none of that is in the system. It's in the person running it.

Part 6 is about that part.
