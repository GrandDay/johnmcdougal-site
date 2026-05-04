---
title: "SPF, DKIM, and DMARC: the full lockdown after setting up custom email"
description: "SMTP2Go's wizard gives you SPF. That's one of three records. Here's how to add DKIM and DMARC -- in the right order -- and why the order matters."
pubDate: 2026-05-04
tags: ["email", "cloudflare", "smtp2go", "dmarc", "security", "homelab"]
series: "How I built johnmcdougal.com"
seriesPart: 4
---

> **TL;DR:** SPF proves you're allowed to send. DKIM proves the message wasn't changed. DMARC enforces what happens when either check fails. Here's how to add all three -- in the right order.

In the last post I said SPF, DKIM, and DMARC deserve the full treatment, not a footnote. This is the full treatment.

## What SMTP2Go's wizard actually gives you

When you complete SMTP2Go's setup flow, it walks you through adding a few DNS records. One of them is an SPF record: a TXT entry at your root domain that says "SMTP2Go's servers are authorized to send on behalf of this domain." That record is in place. Email is working.

What SPF doesn't do: prove the message content hasn't been tampered with in transit, or tell receiving servers what to do when the check fails. Those are DKIM and DMARC respectively. Without them, SPF alone is half a system -- the policy exists, but there's no signature verification and no enforcement instruction.

## The three-record system

Think of the three records as layers of the same problem.

**SPF** (Sender Policy Framework) is an authorization list. It answers the question: "Is this mail server allowed to send from this domain?" A receiving server checks your DNS, compares the sending IP against the list, and gets a pass or fail. SPF alone doesn't block anything -- it just provides a data point.

**DKIM** (DomainKeys Identified Mail) is a cryptographic signature. When SMTP2Go sends a message, it signs it with a private key that only they hold. The public half of that key pair lives in your DNS. Any receiving server can look up the public key, verify the signature, and confirm the message body hasn't been modified since it left SMTP2Go's infrastructure. If someone intercepts and alters the message, the signature breaks.

**DMARC** (Domain-based Message Authentication, Reporting & Conformance) is the policy record. It tells receiving servers what to do with mail that fails SPF or DKIM -- and critically, it requires one of the two to *align* with your actual domain, not just any passing check. DMARC is also what enables aggregate reporting: a weekly digest showing which servers are sending mail that claims to be from your domain, and how much of it is passing or failing authentication.

Without DMARC, SPF and DKIM produce verdicts that mail servers read and then largely ignore. The policy is what makes the verdicts mean something.

## Why order matters

A lot of guides present all three records together with "add these to your DNS." That's not wrong, but it can cause problems if you skip the sequence.

The safe order:

1. Add DKIM first -- SMTP2Go provides the exact record to add; verify it's working before proceeding
2. Add DMARC at `p=none` with aggregate reporting -- this monitors without blocking
3. Review the reports for a week or two, confirm your legitimate mail is passing cleanly
4. Harden to `p=quarantine`, then `p=reject`

The reason to not jump straight to `p=reject`: if your DKIM record is misconfigured, or if you're sending from a tool that bypasses SMTP2Go, `p=reject` will cause those messages to be dropped. `p=none` gives you visibility before enforcement. It's not optional caution -- it's how the system is designed to be deployed.

## Adding DKIM

In SMTP2Go's dashboard, go to **Settings** → **Sender Domains** → click your domain → **DKIM Setup**. SMTP2Go generates the key pair, gives you a TXT record to add, and the private key never leaves their infrastructure.

The record they give you will look something like this:

```
Type: TXT
Name: smtpgo._domainkey.yourdomain.com
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqh... [public key]
```

Note that SMTP2Go uses a *subdomain CNAME approach* -- the envelope sender is `em601125.yourdomain.com` (their subdomain, not your root domain). This means you do NOT need `include:spf.smtp2go.com` in your SPF record; the SPF pass happens on their subdomain, and DMARC alignment works through the DKIM signature on your root domain. Add the DKIM TXT record SMTP2Go provides, set TTL to `Auto`, and save.

Verify it propagated: [MXToolbox DKIM Lookup](https://mxtoolbox.com/dkim.aspx) → enter your domain and `smtpgo` as the selector → should return the public key.

Send a test message through SMTP2Go and check the email headers. Look for:
```
DKIM-Signature: v=1; a=rsa-sha256; d=yourdomain.com; s=smtpgo;
```
A passing DKIM check confirms the signature is working before you add DMARC enforcement.

## Adding DMARC

Once DKIM is confirmed working, add the DMARC record. In Cloudflare DNS:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:your-report-address@example.com; aspf=r; adkim=r
```

A few decisions here:

**`p=none`** starts in monitor-only mode. Nothing gets blocked. You're just collecting data about what's happening with mail that claims to be from your domain.

**`rua=`** is where aggregate reports go. Two good free options:
- **Postmark DMARC Digests** (free, single domain) -- weekly email with a clean human-readable summary: what passed, what failed, from where. Sign up at [dmarc.postmarkapp.com](https://dmarc.postmarkapp.com/). You get an `rua` address like `rua=mailto:re+XXXXXX@dmarc.postmarkapp.com`.
- **Cloudflare DMARC Management** (free for your zones) -- raw XML aggregate reports archived in Cloudflare. Useful for detailed forensics; less readable than Postmark's digest.

You can use both as a comma-separated `rua` list:
```
rua=mailto:re+XXXXXX@dmarc.postmarkapp.com,mailto:XXXXXX@dmarc-reports.cloudflare.net
```

**`aspf=r` and `adkim=r`** are alignment modes -- `r` means relaxed (subdomains match), `s` would be strict (exact domain match only). For most setups, relaxed is correct.

## Hardening

After your first clean report cycle -- or after a week of `p=none` with no surprises -- tighten the policy:

Move to `p=quarantine`:
```
v=DMARC1; p=quarantine; pct=100; rua=...
```

Quarantine tells receiving servers to move failing messages to spam rather than drop them. This is the middle stage: enforcement with a safety net. Wait for another clean cycle, then:

Move to `p=reject`:
```
v=DMARC1; p=reject; pct=100; rua=...
```

`p=reject` instructs receiving servers to drop any message that fails DMARC alignment. This is the locked state. My `johnmcdougal.com` DMARC record has been at `p=reject` since the second clean Postmark digest came through. Single sender, DKIM confirmed working, no surprises in the reports -- it was safe to move fast.

For most setups, the whole process from first DKIM record to `p=reject` takes a week and about 30 minutes of actual work across two or three sessions.

## Verification

Once all three records are in place, [MXToolbox Email Health](https://mxtoolbox.com/emailhealth.aspx) will show you a full summary: SPF pass, DKIM pass, DMARC policy, and any misconfiguration flags.

Send a test message to a Gmail or Outlook address and check the full message headers. In Gmail: three-dot menu → Show original. Look for:

```
Authentication-Results: mx.google.com;
  dkim=pass header.i=@yourdomain.com
  spf=pass
  dmarc=pass (p=REJECT)
```

All three passing is the finish line. At that point your domain is fully locked -- SPF authorization, DKIM signature verification, and DMARC enforcement are all in place.

---

*That covers the active domain. If you also own domains you don't send email from -- parked, redirected, or just sitting there -- those need a different (shorter) set of records. That's the next post: [Do your parked domains need email authentication? Yes -- and it's four records.](/blog/parked-domain-email-authentication)*

*Part 3 of this series covered [PostHog analytics and the Cloudflare proxy setup](/blog/posthog-analytics-astro-cloudflare-proxy). Part 2 is [where this email setup started](/blog/custom-email-routing-cloudflare-smtp2go).*

---

*-- John*
