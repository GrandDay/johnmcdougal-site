---
title: "Custom Email Routing with Cloudflare and SMTP2Go"
description: "Custom domain email without Google Workspace: Cloudflare handles inbound for free, SMTP2Go handles outbound, and Gmail ties it together."
pubDate: 2026-05-03
tags: ["cloudflare", "email", "smtp2go", "homelab", "self-hosted"]
series: "How I built johnmcdougal.com"
seriesPart: 2
---

> **TL;DR:** Cloudflare Email Routing + SMTP2Go = free, real custom email on any domain you own -- and you can run the whole thing from inside Gmail.

I own a handful of domains. I want email at all of them. I don't want to pay $6/user/month for each one.

That's it. That's the whole motivation.

If you've looked at custom domain email at all, you know the default answer is Google Workspace: $6/user/month, clean interface, plays well with everything else you're already using. For one domain and one user it's almost reasonable. For multiple domains where you're not running a real team, it starts adding up fast. And there's something philosophically annoying about paying Google a monthly fee to receive email at your own domain.

So I went looking for the alternative, and what I found is that most guides treat receive and send as one problem. They're not.

## The split that matters

Receiving email and sending email are completely different infrastructure concerns. When you receive, you're managing MX records and a routing table -- the heavy lifting is done by someone else's servers. When you send, you're asking the world to trust your message isn't spam, which means IP reputation, authentication records, and sending infrastructure that isn't a fresh VPS with no history.

If you treat these as one problem, you usually end up paying for something that handles both adequately but neither particularly well. The split approach uses a purpose-built tool for each half.

For inbound: Cloudflare Email Routing. Free, and works for any domain where Cloudflare is your nameserver -- which it probably already is if you're reading this.

For outbound: SMTP2Go. The free tier is genuinely usable. Their sending infrastructure has the kind of reputation a fresh IP never will.

## Cloudflare Email Routing

The setup lives in your domain dashboard at Cloudflare, under the Email tab. Turn it on and Cloudflare auto-configures your MX records. Then you define where incoming messages go.

You have two approaches here. The first is targeted routing: define specific rules for only the addresses you actually want active -- `contact@yourdomain.com` forwards here, `hello@yourdomain.com` forwards there, everything else drops or bounces. Tight, intentional, nothing gets through that you didn't explicitly allow.

The second is catch-all: any address sent to your domain -- whether you defined it or not -- routes to a destination of your choice. Flexible and forgiving, but it means anything someone sends to any address at your domain will land somewhere. Which approach fits depends on what the domain is for, how much you care about exposure, and whether you want the flexibility of "reply-to aliases that just work" or prefer to keep the surface small.

Either way, the setup took about ten minutes. The only friction is a verification step confirming Cloudflare can actually route to your forwarding destination.

## SMTP2Go, and why you don't need to leave Gmail

SMTP2Go setup has two parts: verify that you own the domain (a couple of DNS records), and add an SPF record for sending. Those DNS entries are what authorize SMTP2Go to send on behalf of your domain. Once they propagate, you get SMTP credentials: hostname, port, username, password.

Here's where it gets clean. Gmail has a "Send mail as" feature under Settings > Accounts and Import. Add your custom domain address, point it at SMTP2Go's server with your credentials, and from then on you can compose and reply from `your-name@your-domain.com` without leaving Gmail. The message goes out through SMTP2Go's infrastructure. Recipients see your domain address.

If you prefer something else -- Thunderbird, Apple Mail, any client that takes an SMTP configuration -- the credentials are the same. SMTP2Go doesn't care what client sends through it.

## The authentication cliff

This setup gets your email working. It doesn't get it hardened.

SPF, DKIM, and DMARC are the three authentication records that tell mail servers your domain is legitimate, your messages haven't been tampered with, and what to do with anything that fails those checks. SMTP2Go's wizard will walk you through the SPF record for sending -- but DKIM and DMARC go beyond what fits here.

I'm not skipping them because they're optional. They're not. For any domain you use to communicate professionally, all three matter. I'm saving them for the next post because they deserve the full treatment, not a footnote at the end of a different article.

## What this unlocks

At the end of this setup, you have real email at your own domain -- without a Workspace subscription, without managing your own mail server, and without juggling multiple admin panels. Cloudflare handles the inbound routing. SMTP2Go handles the outbound reputation. Your email client of choice ties the two together.

The configuration is flexible. You can run it across multiple domains, mix targeted routing and catch-all depending on what each domain needs, and swap clients without changing the underlying infrastructure. What you don't need is a separate paid account for every domain you want to be reachable at.

This is the detail I glossed over in [Part 1 of this series](/blog/how-i-built-johnmcdougal-com-with-claude-and-astro) -- "email routing through Cloudflare's free tier with SMTP2Go for custom domain sends" got about half a sentence in the stack overview. It earned its own post.

Next up: SPF, DKIM, and DMARC -- the layer that turns a working email setup into one you don't have to think about again.

---

*-- John*
