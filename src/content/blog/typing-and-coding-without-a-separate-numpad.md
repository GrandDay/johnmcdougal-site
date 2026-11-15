---
title: "Typing and Coding Without a Separate Numpad"
description: "How the Symbols and Numpad layers on my SliceMK bring punctuation, numbers, and navigation into the flow of typing."
pubDate: 2026-11-15
tags: ["userspace", "workflow", "input-devices", "keyboard", "zmk"]
series: "slicemk-keyboard-layers"
seriesPart: 3
projectRef: "userspace"
---

> **TL;DR:** Symbol holds and two ways into Numpad let me choose a short visit or a longer numeric session without adding a separate keypad to my desk.

*Part 3 of Building My Keyboard Layer with a SliceMK ErgoDox, a series about the keyboard foundation of my input setup.*

Typing a sentence can become a punctuation-heavy task halfway through: a little code, a configuration value, or a path with brackets and quotes. Another task might call for a run of numbers. My SliceMK does not have a separate physical numpad, but its ZMK keymap gives familiar positions additional jobs for those moments.

How long I need the extra controls helps me choose how to reach them. A hold fits a short visit; a longer numeric session can stay on Numpad until I deliberately return to Main.

---

For a few symbols, I can hold the semicolon position to bring up Symbols, then release it and continue typing. A tap on that same position types a semicolon. There are also two direct momentary Symbol controls on the lower row, so I can choose a hold that fits what my hands are doing. For repeated punctuation I can stay on Symbols while holding the entry key and use its navigation and editing controls before releasing it.

The layer groups pairs such as braces, parentheses, and brackets alongside other punctuation useful when writing code. Arrows sit on the right-hand home row, and Home and End are near the thumbs. Function keys and editing controls are also available, so a visit can include moving through or editing text.

| Symbol family | Verified examples | Access | Where it helps | Return |
| --- | --- | --- | --- | --- |
| Paired punctuation | `{ }`, `( )`, `[ ]` | Hold semicolon or either direct Symbol key | Delimiters in code or configuration | Release the hold or select Main |
| Operators and punctuation | `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `\|`, `~` | Same Symbol holds | Expressions and other punctuation | Release the hold or select Main |
| Quotes and editing | Single and double quotes, Backspace, Delete | Same Symbol holds | Quoted text and corrections | Release the hold or select Main |
| Navigation and functions | Arrows, Home, End, F1–F12 | Same Symbol holds | Move through text or reach a function key | Release the hold or select Main |

Keeping these actions together gives me a familiar place to reach for punctuation and navigation, then return to ordinary typing.

---

The two Numpad controls give me options based on what my hands are doing. If I am working through paperwork, I can use my left hand to toggle Numpad on, then hold or sort the papers while entering numbers with my right. When I am done, I return to Main with the thumb-cluster control, in the same position as the Main return on the other supporting layers.

For a quick number, I can hold the right-side Numpad control with my pinky while entering digits, then release it when I am ready to use another key or shortcut. If I am already on Mouse, I can also switch directly to Numpad and use the thumb control to return to Main.

| Input family | Verified controls | Access | Typical duration | Return |
| --- | --- | --- | --- | --- |
| Digits | Right-side calculator-style keypad, including two zero positions | Hold Numpad briefly, toggle it for longer work, or select it from Mouse | A short number or repeated entry | Release a hold; otherwise select Main |
| Operators | Keypad divide, multiply, minus, plus, and equals | Same Numpad paths | A calculation or a longer numeric task | Release a hold; otherwise select Main |
| Navigation | Home and End | Same Numpad paths | Move within the current task | Release a hold; otherwise select Main |
| Media | Volume up/down, play/pause, mute | Same Numpad paths | Adjust media during numeric work | Release a hold; otherwise select Main |

Choosing between a hold and a toggle depends on the task and where my hands are. Practice helps me remember which layer I am using, and keeping the Main return in a consistent position makes it easier to get back if I lose my place.

---

*These layers make room for punctuation and numbers during ordinary work. Next, I want to look at the other side of that choice: the controls I deliberately restrict when I switch to the gaming layer.*
