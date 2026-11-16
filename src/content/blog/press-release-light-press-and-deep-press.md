---
title: "Press, Release, Light Press, and Deep Press"
description: "How press states and force regions give mouse controls more than one useful action, and how I keep those actions deliberate."
pubDate: 2026-11-15
tags: ["userspace", "workflow", "input-devices", "mouse", "swiftpoint"]
series: "swiftpoint-mouse-profiles"
seriesPart: 4
projectRef: "userspace"
---

> **TL;DR:** A mouse control can do more with a press, release, or deeper push when its actions are related and easy to trigger on purpose.

*Part 4 of Building High-Density Mouse Profiles with Swiftpoint, a series about shaping mouse controls around the work and play already happening under my hand.*

One control can hold several useful actions close together. That can give the mouse hand more to do without asking another finger to find a separate button. The tradeoff is that each action needs to feel distinct enough to use when attention is on the task.

A **tap** sends a complete press and release of a key or mouse button. Separate **down and up** outputs leave an input held between the two events, which is useful when an application expects a sustained input. A force region adds another way to trigger an action: an ordinary or lighter press can do one thing, while pushing farther reaches a deeper region and starts another. The available combinations depend on the control and how its profile is configured.

---

In my Tarkov profile, the right fingertip control puts two medical-slot inputs in the same place. An ordinary press sends a tap of `5`; a deeper press sends a tap of `7` with haptic feedback. Both slots belong to the same general kind of task, so the location gives me a useful cue about what to expect. What each slot contains is determined in the game.

The left fingertip uses press and release differently: pressing sends a tap of `2`, and releasing sends a tap of `3`. Each is a complete key tap, even though they happen at different points in the gesture. A deeper press reaches the force threshold for `1`, my quickdraw slot: a panic button for drawing a pistol. It also gives haptic feedback, and the deeper action suppresses the ordinary release output. On the left mouse button, an ordinary press sends a click; reaching its force region sends a left-button down with a haptic cue, followed by an up when the region is released. That gives a held input a distinct gesture and a way back to neutral.

In Enshrouded, I use a right-button down and up mapping so I can hold right-click for the game's aim or block control. The input stays held for as long as I press the button and ends when I release it.

| Profile and control | Trigger | Saved output | Related action and feedback |
| --- | --- | --- | --- |
| Tarkov, right fingertip | Ordinary press / deeper force | Tap `5` / tap `7` | Medical slots; haptic on the deeper action |
| Tarkov, left fingertip | Press / release / deeper force | Tap `2` / tap `3` / `1` | Weapon slots and pistol quickdraw; haptic on the deeper action |
| Tarkov, left button | Ordinary press / force-region down and up | Left-click tap / left-button down and up | A click and a held left button; haptic on force activation |
| Enshrouded, right button | Press / release | Right-button down / up | Hold right-click to aim or block |
| Notion, fingertip force region | Deeper force | No additional key or mouse action assigned | The ordinary fingertip action remains available |

The table describes the saved mappings. The application decides what the inputs mean, and testing on the mouse confirms how the boundaries and feedback feel.

---

I tune the deep-press threshold to the amount of force that feels natural to me, testing it as I adjust so I can reach it deliberately without triggering it by accident. I like haptic feedback for confirmation that the deeper action went off.

Related actions are easier to group than unrelated ones. Two medical slots have a reason to live together; a rarely used command with a very different purpose may be easier to remember on its own control. More available regions give us options, and leaving some open gives the useful ones room to become familiar.

*Press, release, and force give a single control room for related actions that fit the task at hand. Next, I'll look at tilt, which brings another set of gestures to the mouse hand while it continues to point and aim.*
