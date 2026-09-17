---
title: "Whoops, I accidentally misassociated this file extension"
description: "How to easily correct a broken or mis-selected file extension assosication in Windows"
pubDate: 2026-09-17
tags: ["windows","tips-n-tricks","macoS"]
# updatedDate: YYYY-MM-DD
# heroImage: ""
---

> **Ever accidentally mis-select the default software, then need to correct or "reset" the association? Here are a few ways to do it.**

We’ve all been there: you accidentally leave the "Always use this app" box checked, and suddenly every specialized config file on your PC is trying to open in Notepad, or your CNC machine's `.tap` files are trying to play as media.

Sometimes you just need to point the file to the correct software. Other times, you need a file to have *no default association at all* because it's purely meant to be imported, or because it shares an extension with another file type entirely. Here is how to fix it and get your workflow back to normal.

## Windows: The Easy Fix (Re-associating)

If you simply selected the wrong software and know exactly which program *should* open the file, you don't need any complex tricks. You just need to tell Windows to use the correct app from now on.

1. **Right-click** the file with the broken association.
2. Select **Open with > Choose another app**.
3. Select the correct software from the list. (If you don't see it, scroll down and click **More apps** or **Look for another app on this PC** to find it).
4. **Important:** Check the box that says **"Always use this app to open .[ext] files."**
5. Click **OK**. The file icon should update, and it will now open correctly.

## Windows: The Blank Slate (The "Bogus.exe" Trick)

But what if you want to completely *remove* the association? This happens a lot with configuration files that are only ever meant to be imported from within a program, not double-clicked.

To clear the association entirely so the file has no default program, we can use the "Bogus.exe" trick:

1. Right-click anywhere on your Desktop and select **New > Text Document**.
2. Rename the file to `bogus.exe`. *(Note: You must have "File name extensions" visible in Windows Explorer's View menu to do this. A prompt will warn you about changing the extension—click **Yes**.)*
3. Right-click the file with the messed-up association and select **Open with > Choose another app**.
4. Make sure to **check the box** that says "Always use this app to open .[ext] files."
5. Scroll to the bottom of the list, click **More apps**, scroll down again, and click **Look for another app on this PC**.
6. Browse to your Desktop and select the `bogus.exe` file you just created. Your file will fail to open, which is exactly what we want.
7. Finally, **delete** `bogus.exe` from your desktop.

Because the default program no longer exists, Windows will completely clear the file association, leaving the file as a blank slate.

## Windows: The Registry Edit (Backup Method)

If the bogus trick doesn't stick due to a stubborn system policy, you can force the association to reset via the Windows Registry.

*⚠️ **Warning:** Editing the registry can cause system instability if done incorrectly. Before proceeding, please read my guide on [How to Backup and Restore the Windows Registry](#link-to-your-backup-page-here) to ensure you can revert your changes if you make a mistake.*

1. Press `Win + R`, type `regedit`, and hit Enter.
2. Navigate to the following path:
   `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts`
3. Scroll down until you find the folder matching your problematic file extension (e.g., `.xyz`).
4. Expand that folder and look for a subkey named `UserChoice`.
5. Right-click the `UserChoice` folder and select **Delete**.
6. Close the Registry Editor and either restart your PC or restart Windows Explorer. The default association is now wiped.

## What about macOS?

If you're on a Mac, file associations are handled a bit differently, but both the "easy fix" and the "blank slate" are possible.

**The Easy Fix (Re-associating):**
1. Right-click (or Control-click) the file and select **Get Info** (`Cmd + I`).
2. Expand the **Open with:** section.
3. Select the correct application from the dropdown menu.
4. Click the **Change All...** button right below it, and confirm the prompt to apply this to all files of that type.

**The Blank Slate (The "Fake.app" trick):**
macOS doesn't natively let you "un-associate" a file type to a blank state easily, but we can adapt the Windows trick!
1. Create a new, empty folder on your Desktop.
2. Rename the folder to `Fake.app` (confirm the prompt to add the `.app` extension). The folder will turn into an application icon.
3. Go back to your file's **Get Info** window.
4. In the **Open with:** dropdown, choose **Other...**
5. Change the "Enable:" dropdown at the bottom to **All Applications**, navigate to your Desktop, and select `Fake.app`.
6. Click **Change All...**
7. Drag `Fake.app` to the Trash and empty it. The file is now orphaned and will prompt you to choose an application the next time you double-click it.

---
