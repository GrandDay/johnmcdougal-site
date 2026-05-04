---
title: "How I read DMARC reports without reading DMARC reports"
description: "DMARC aggregate reports are XML zip files emailed by mail servers worldwide. Postmark DMARC Digests parses them and sends you a clean weekly summary -- free, no Postmark account required."
pubDate: 2026-05-04
series: "How I built johnmcdougal.com"
seriesPart: 6
tags: ["email", "dmarc", "postmark", "security", "monitoring", "homelab"]
---

> **TL;DR:** DMARC aggregate reports are XML nobody reads. Postmark DMARC Digests parses them and emails you a clean weekly summary -- free for one domain, no Postmark account required. Add one address to your `rua=` field and you're done.

When I [set up DMARC for johnmcdougal.com](/blog/email-authentication-spf-dkim-dmarc), I started at `p=none` -- watching but not acting. The `rua=` address in your DMARC record is what makes that watching possible: it's the destination for aggregate reports from mail servers worldwide.

Here's the catch. Those reports are raw XML delivered as `.zip` attachments. Point `rua=` at your inbox and you get a folder full of gzipped XML from servers you've never heard of, describing who sent mail from your domain in the past day or week. Technically correct and completely unreadable.

The first digest showed up automatically a week later. That's the whole setup.

## What Postmark DMARC Digests is

Postmark runs a free reporting service at [dmarc.postmarkapp.com](https://dmarc.postmarkapp.com/) that accepts your aggregate reports and turns them into a readable weekly email. This is completely separate from Postmark's email sending product. No Postmark account needed, no credit card, no sending infrastructure. You don't route a single message through them.

Every week, you get the actual signal: pass/fail rates for SPF, DKIM, and DMARC alignment, broken down by source. Which servers sent mail on behalf of your domain, how many messages, whether they passed.

## Setting it up

**Step 1:** Sign up at [dmarc.postmarkapp.com](https://dmarc.postmarkapp.com/) and enter your domain. They give you a reporting address in the format `re+XXXXXXXX@dmarc.postmarkapp.com`.

**Step 2:** Add it to your `_dmarc` TXT record as a second `rua=` recipient. I kept Cloudflare's aggregate endpoint alongside it -- more on that below. The full record looks like:

```
v=DMARC1; p=none; pct=100; rua=mailto:XXXX@dmarc-reports.cloudflare.net,mailto:re+XXXXXXXX@dmarc.postmarkapp.com
```

Done. Next week, the digest arrives.

## Using the digest to harden safely

A clean digest looks like this: 100% DKIM pass, 100% DMARC alignment, one sending source (your actual email provider), no mystery IPs. When I saw that two weeks in a row, I moved from `p=none` to `p=quarantine`, then to `p=reject` after a third clean digest. The digest was the feedback loop that made fast hardening feel safe rather than reckless.

If something is off -- a source you don't recognize, or a legitimate source failing alignment -- you see it before enforcement costs anyone a delivered message.

**Free tier limits worth knowing:** one domain, weekly cadence, no `ruf` (forensic) report processing. On the forensic question: Gmail, Yahoo, and Microsoft don't send forensic reports anyway, and I decided the weekly aggregate was enough visibility for my setup. I skipped `ruf`.

---

The C1 email auth arc started with [routing inbound mail through Cloudflare and outbound through SMTP2Go](/blog/custom-email-routing-cloudflare-smtp2go), moved through [SPF, DKIM, and DMARC end to end](/blog/email-authentication-spf-dkim-dmarc), and this is the last piece: closing the loop on the monitoring side.
