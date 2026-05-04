---
title: "Do your parked domains need email authentication? Yes -- and it's four records."
description: "A domain you never use for email can still be spoofed. Four DNS records fix it: null MX, SPF reject-all, DMARC reject, wildcard DKIM null. No key generation, no sending infrastructure."
pubDate: 2026-05-04
tags: ["email", "cloudflare", "dmarc", "dns", "security", "homelab"]
series: "How I built johnmcdougal.com"
seriesPart: 5
---

> **TL;DR:** A domain you never use for email can still be spoofed. Four DNS records fix it: null MX, SPF reject-all, DMARC reject, wildcard DKIM null. No key generation, no sending infrastructure.

I own a handful of domains. Only two send email. Turns out the other ones still needed attention.

## The problem with "I never use that domain for email"

Not using a domain for email doesn't prevent someone else from spoofing it. There's no record that tells receiving mail servers "this domain doesn't send mail at all" -- by default, the absence of records is just silence. Silence is ambiguous. Attackers can send a phishing message with a `From:` header showing `@yourparked-domain.com`, and without explicit records in place, there's nothing a receiving server can check to call it invalid.

The fix isn't complicated. It's just four DNS records that together declare: no mail servers are authorized, the domain has no signing keys, and anything claiming to come from this domain should be rejected.

## The four records

In Cloudflare DNS, for each parked domain:

**1. Null MX**
```
Type: MX
Name: @
Priority: 0
Value: .
```
RFC 7505 defines this as the explicit declaration that a domain accepts no mail. Without it, a sending server that doesn't find an MX record might try a fallback delivery attempt to the root A record. The null MX closes that path.

> Cloudflare may show a warning about the `.` value -- it's valid and intentional.

**2. SPF reject-all**
```
Type: TXT
Name: @
Value: v=spf1 -all
```
The `-all` at the end with no preceding `include:` or `ip4:` entries means: no servers are authorized to send from this domain, hard fail. Not `~all` (soft fail) -- `-all`. Full stop.

**3. DMARC reject**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
```
`p=reject` tells receiving servers to drop anything that fails DMARC. `sp=reject` extends the policy to all subdomains. No `rua=` reporting address needed -- at full rejection with SPF `-all`, nothing legitimate should be reaching this check anyway. Reports from a domain that should never send mail are noise, not signal.

**4. Wildcard DKIM null**
```
Type: TXT
Name: *._domainkey
Value: v=DKIM1; p=
```
The empty `p=` value explicitly declares that no public key exists for any DKIM selector on this domain. Without this record, a DKIM check that finds no matching selector returns a "permerror" or "neutral" result -- which some validators treat more leniently than an explicit failure. The wildcard null record removes that ambiguity.

## What you don't need

No DKIM key generation. No SMTP credentials. No MX record pointing anywhere. No `rua=` reporting address.

The active-domain auth setup in the [previous post](/blog/email-authentication-spf-dkim-dmarc) involves generating a DKIM key pair through SMTP2Go, staging DMARC at `p=none` to monitor before enforcement, and managing aggregate reports. None of that applies here. A parked domain has no legitimate sending to protect -- you skip straight to full rejection.

## Verification

Once the records propagate, [MXToolbox DMARC Lookup](https://mxtoolbox.com/dmarc.aspx) will show the policy and confirm all four records are in place. Expected results: DMARC policy `reject`, SPF `v=spf1 -all`, null MX `0 .`.

Five minutes per domain. Set it once and forget it.

---

*This is the companion to [Part 4: SPF, DKIM, and DMARC -- the full lockdown after setting up custom email](/blog/email-authentication-spf-dkim-dmarc). If you're setting up email auth for a domain you actively send from, start there.*

*The full series starts with [how this site was built](/blog/how-i-built-johnmcdougal-com-with-claude-and-astro).*

---

*-- John*
