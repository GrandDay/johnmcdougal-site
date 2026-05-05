---
title: "Iteration as Method"
description: "The first output isn't the work. It's the starting point. What changes when you treat AI-assisted work as a cycle -- generate, evaluate, refine -- rather than a prompt waiting for the right answer."
pubDate: 2026-05-05
heroImage: ""
tags: ["ai", "workflow", "iteration", "productivity", "knowledge-work"]
series: "Working with AI in 2026"
seriesPart: 3
---

> **TL;DR:** The first output isn't the answer -- it's material. What changes when you treat AI-assisted work as a deliberate cycle of generate, evaluate, and refine rather than a prompt waiting for the right response.

Parts 1 and 2 of this series got you to a working session: a well-navigated context window, a deliberately primed environment, a model that's oriented and responsive. That's the foundation. For simple, contained work -- get me the syntax for this, reformat this block, summarize that paragraph -- one well-constructed pass is often the right call. Iteration on that kind of task is just overhead. But for work that has real shape -- something you're building, refining, or reasoning through across multiple exchanges -- there's a move that changes what's possible.

The move is treating the first output as a starting point rather than a result.

---

There's a pattern I've watched in myself and others. You send a well-crafted message. Something useful comes back -- not perfect, but in the right neighborhood. And then you stop. You take the output, clean it up a bit, move on. Or you get something that misses the mark, and you either tweak the prompt and try again from scratch, or give up and do it yourself.

Neither of those moves is iteration. The first is luck converted into a deliverable -- fine for simple tasks, not enough for complex ones. The second is a failed attempt followed by a reset. Both skip the part where AI-assisted work on harder problems actually gets good.

What I mean by iteration is a deliberate cycle: generate, evaluate, refine -- run repeatedly, with each pass informed by the last. Not "prompt until something acceptable comes out." A working method where the output improves in a traceable direction and you're the one steering it there.

---

The shift starts with evaluation. Not "is this good?" -- that question is usually not the right one. The more useful question is: what is this close to, and what's the gap?

A first output from a well-primed session usually has shape. It has a direction, a register, a structure that's either right or wrong. Evaluation is about reading that shape accurately. Is the argument there but under-developed? Is the structure wrong but the content right? Is it hitting the right tone but not the right level of specificity? Those are different problems with different fixes -- and identifying them is more useful than deciding whether the output "passes."

What I've found: when I can articulate the gap clearly, the next iteration almost always closes it. When I can't -- when I just know "this isn't right" -- the next pass usually misses too, because I'm asking the model to hit a target I haven't located yet. The evaluation step is where I locate the target.

---

Refinement is where most of the work happens, and it's different from iteration -- the two are often conflated.

Refinement is directed movement toward the same target: the output I have is close, I know what's wrong, the next pass corrects it. Iteration is the full cycle: I generate, I evaluate, I refine, I generate again -- and in doing that repeatedly, I arrive somewhere I couldn't have gotten to in one pass.

The distinction matters because they fail differently. People get stuck refining when they should be iterating -- grinding at a prompt that's fundamentally misframed, trying to force an output into a shape it doesn't naturally fit. And they iterate when they should be refining -- sending the whole thing back repeatedly when one specific, targeted follow-up would get them there faster.

Learning to tell the difference changed how I work. Refinement question: "is this the right direction, just not far enough?" Restart question: "was the direction wrong?" If the answer to the first is yes, refine. If the answer to the second is yes, back up -- not to a new session necessarily, but to a reframing of the task.

---

There's a third thing that iteration requires, especially once you're working on something across multiple sessions: you need to know where you are.

This sounds trivial. It isn't. In a long project, with multiple AI-assisted passes over a document or idea, it gets genuinely hard to track what version you're working from, what you've changed, and why. The model doesn't remember previous sessions. The history in a single chat scrolls up and becomes noise. And you, the human, lose the thread faster than you expect.

What I do is treat AI-assisted work like code -- because in most of my projects, it is. I use git. Not as a metaphor, but literally: documents, prompts, drafts, workflow files, session logs -- all under version control. The commit history becomes a readable record of what changed, when, and why. Branching means I can try a direction without losing where I was. When I come back to a project weeks later, the progression is there.

That record isn't just for me. If a model has access to that history -- via an MCP server, a pasted log, a referenced file -- it can reason from the progression of the work the same way it reasons from anything else in the context window. The thread you maintain is context you can load. Without it, you're not iterating across sessions; you're redoing from a standing start each time.

---

The output side of this is worth naming, because it's where the method starts to compound.

When you run a real iterative cycle -- not just a few tries at the same prompt but genuine generate-evaluate-refine loops over something you care about -- you don't just end up with a better output. You end up with material: a refined prompt, a priming sequence that worked, a structural approach that proved out, a worked draft that can be reused or adapted. These are assets, not one-time results.

I started noticing this when I had to revisit something I'd built months earlier. The outputs I'd iterated through were immediately reusable. The ones I'd accepted on first pass needed to be done again almost from scratch. The iteration work had made the artifact durable. The "good enough" outputs hadn't.

That durability is the return on the method. It's not visible on the first pass, but it compounds across a project.

---

This is Part 3 of "Working with AI in 2026." Part 4 gets into input craft -- how I think about the prompts themselves before I send them. This becomes more important the more deliberately you're iterating: once you're running real cycles, the quality of the input is the thing that determines how far each cycle can actually take you.
