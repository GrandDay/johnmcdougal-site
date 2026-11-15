---
title: "Why I Use a Split Programmable Keyboard"
description: "How a split SliceMK ErgoDox and a layered ZMK keymap give my hands a flexible foundation for typing, navigation, and games."
pubDate: 2026-11-14
tags: ["userspace", "workflow", "input-devices", "keyboard", "zmk"]
series: "slicemk-keyboard-layers"
seriesPart: 1
projectRef: "userspace"
---

> **TL;DR:** My split keyboard gives each hand its own working space, while thumb clusters and ZMK layers put more useful controls within reach.

*Part 1 of Building My Keyboard Layer with a SliceMK ErgoDox, a series about the keyboard foundation of my input setup.*

My hands settle on the two halves of the keyboard, with my thumbs near their own clusters of keys. From there I can type, navigate, reach a modifier, or switch to another layer without treating the conventional keyboard layout as a fixed boundary. The two halves give me room to position each hand, and the thumb controls make use of fingers that would otherwise spend much of their time on the space bar.

The keyboard I use is a SliceMK ErgoDox Wireless Lite. What matters to me is the combination of its split layout and programmability: I can arrange frequently used actions around where my hands already work, then adjust the arrangement as I learn what feels natural. That is a personal fit, shaped by the tasks I do and the time I spend using the layout. Other hands and workflows may call for different choices.

---

The thumb clusters are especially useful because they give repeated actions a place near my resting position. My current keymap puts Space, Backspace, Delete, Escape, Tab, Return, Home, End, Page Up, and Page Down on the thumb clusters and nearby positions. Fn access and an explicit transition to the gaming layer also live there. Moving some of that work to the thumbs changes which combinations are practical while the other fingers stay available for typing, modifiers, movement, or another action.

This does not make every combination effortless. It gives me another set of placement choices. A mapping that looks clever on paper still has to be comfortable to use, memorable in context, and worth keeping after the novelty wears off.

---

The keyboard's firmware is **ZMK**, and my current keymap has seven layers: Main, Numpad, Mouse, Symbols, FPS Gaming, Fn, and Bluetooth. Each layer changes what some positions do. Main remains the familiar typing foundation; the other layers make room for numeric entry, pointer and media controls, symbols, game-specific behavior, function keys, and connection controls.

A layer does not have to take a key away from its usual job. On Main, tapping `P` types `P`, while holding that position accesses the Mouse layer. Tapping semicolon types semicolon; holding it accesses Symbols. The keymap also has direct Symbol holds, plus both a toggle and a momentary hold for Numpad. Those choices let me reach another set of controls and return to typing without filling the main layout with every possible action.

Typing and games ask different things of the keyboard. The FPS Gaming layer keeps letters, numbers, arrows, and selected utilities available, while restricting access to the Mouse, Symbol, and Numpad layers. It uses explicit transitions, including a path to Fn and a return to Main. I will get into the layer relationships and the reasons for those boundaries later in the series; for now, they show how the same physical keyboard can serve different contexts deliberately.

| Design need | Keyboard response | Example in my keymap | Why I keep it here | Beyond the keyboard |
| --- | --- | --- | --- | --- |
| Frequent typing and navigation | Give thumbs and nearby positions useful work. | Space, Backspace, Tab, Return, Home, and End. | These are familiar actions I use across contexts. | Application-specific commands can remain in the application. |
| More reachable controls | Use holds and layers around the Main layout. | `P` and semicolon layer taps; Symbol holds and Numpad access. | The keymap carries these controls with the keyboard. | Mouse profiles can place pointing-related actions under the other hand. |
| A distinct gaming context | Select a layer with deliberate boundaries. | FPS Gaming keeps a path back to Main and limits utility-layer access. | The keyboard can retain useful movement and modifier positions. | Mouse profiles can add controls needed while aiming. |

---

The keyboard is the foundation of my input layer, and the other surfaces extend it. Mouse profiles can put actions under the pointing hand; a Stream Deck can make contextual controls visible and labeled. Native application shortcuts give those surfaces actions to invoke without changing both the application binding and the device mapping. Later software automation is another option when the available device controls and native shortcuts need help.

Keeping much of the application-specific work outside firmware lets the keyboard retain a recognizable role as I move between activities. The surfaces can also work together: one hand can hold a keyboard modifier while the mouse sends a base key, leaving other fingers available for the task at hand.

*Next, I want to map how these seven ZMK layers fit together, including the paths into and out of each one.*
