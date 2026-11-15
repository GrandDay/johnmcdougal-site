---
title: "What I Keep Out of Keyboard Firmware"
description: "Why my SliceMK keymap provides a portable foundation while mouse profiles, Stream Deck, and applications handle more contextual actions."
pubDate: 2026-11-15
tags: ["userspace", "workflow", "input-devices", "keyboard", "zmk"]
series: "slicemk-keyboard-layers"
seriesPart: 5
projectRef: "userspace"
---

> **TL;DR:** My keyboard carries the controls I want to recognize across contexts; the rest of my input setup has room for actions tied to a particular application or activity.

*Part 5 of Building My Keyboard Layer with a SliceMK ErgoDox, a series about the keyboard foundation of my input setup.*

I could put a shortcut for a particular application into my keyboard's keymap. Before I do, I want to know whether I will still want it there when I move to a different application or machine. A control that makes sense in one workspace can become one more thing to remember everywhere else.

My SliceMK's ZMK keymap gives me a familiar foundation: typing, thumb-cluster navigation, modifiers, Symbols and Numpad access, and a momentary Fn layer. The FPS Gaming layer keeps the utility layers out of the way while I play. Bluetooth profile selection and output controls stay with the keyboard as well. Those choices are useful across the work I do, and they travel with the device.

---

Application-specific actions change at a different pace. If every new workflow gets its own key or layer in firmware, I have more positions to remember and more of the keymap to revisit when an application changes. I also have to build, flash, and check the updated configuration. That can be worthwhile, but a one-off application action does not always need that kind of home.

My mouse profiles give the right hand more to do while it is already pointing or aiming. A small Notion profile, for example, puts frequent block actions under the mouse hand. Game profiles can place other controls there while the left hand stays on the keyboard. I can also hold a keyboard modifier while the mouse sends a base key, making the two devices part of the same action.

My Stream Deck gives me another kind of surface. Its `ds fault` workspace has visible pages and navigation, and selected application profiles can come forward with focus. Labeled controls are useful when I do not use an action often enough to remember a hidden binding. Some integrations provide state that is worth seeing; other buttons can simply send a native shortcut.

| Action | Where I might put it | Example | Why it fits | If it lived in firmware | A way back |
| --- | --- | --- | --- | --- | --- |
| Common typing or navigation | Keyboard firmware | Thumb navigation and layer access | Familiar controls travel with the keyboard. | They belong in the keymap I maintain. | Keep a versioned keymap. |
| Action needed while pointing | Mouse profile | A frequent Notion block action | The pointing hand can trigger it in context. | An app-specific keyboard binding adds another mapping to remember. | Use the application's normal controls. |
| Visible or stateful control | Stream Deck | A labeled control in an application profile | A label or integration can make the context easier to see. | A key cannot show the same label or plugin state. | Use the application or navigate to another profile. |
| Application command | Native shortcut, used directly or bound to a device | An application's default hotkey | One application binding can serve several controls. | A hard-coded custom binding can add maintenance when the application changes. | Use the application's existing shortcut or interface. |
| A need the other controls cannot express | Later software automation | A possible future experiment | Software can provide additional behavior when needed. | The workflow may depend on context the keymap does not have. | Keep the existing manual workflow available. |

---

I usually start with an application's default shortcut when it does what I need. I can press it on the keyboard, bind it to the mouse, or put it behind a Stream Deck button. Keeping the application binding in place means I have one fewer setting to maintain, and a button built around that default may be easier to reuse or share. Some applications need a custom binding; when they do, I keep track of that dependency alongside the device mapping.

A small firmware macro could still earn a place in the keymap. I would look for a short, stable sequence that is useful across applications and machines, needs no application state, and is used often enough to remember and maintain. That is an option I can consider as the setup evolves; the current keymap is the evidence for the controls described here.

If a workflow needs more than the device profiles and native shortcuts can provide, software automation is another place to explore later. It comes with its own configuration and maintenance, so I want a specific problem in hand before adding it.

I keep the keymap in version control, and I export Stream Deck profiles, buttons, macros, and folders so I can restore them or reuse a useful building block elsewhere. The original application shortcut can still be used where I have left it unchanged. Those habits make it easier to adjust one part of the setup without having to reconstruct the whole thing.

---

*The keyboard gives my hands a consistent place to start. Next I want to follow the actions that move with my pointing hand and look more closely at how the Swiftpoint profiles fit around it.*
