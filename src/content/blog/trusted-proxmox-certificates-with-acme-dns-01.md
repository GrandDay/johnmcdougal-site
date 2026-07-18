---
title: "Trusted Proxmox Certificates with ACME DNS-01"
description: "Proxmox already has the pieces to get trusted certificates with ACME DNS-01, without exposing a node or pointing a public IP record at it."
pubDate: 2026-07-17
tags: ["proxmox", "homelab", "dns", "security"]
projectRef: "homelab"
---

> **TL;DR:** Proxmox has ACME support built in. Add a Let's Encrypt account, add a DNS challenge plugin, choose the name for the node, and order the certificate. DNS-01 does not require the node to be open to the internet or have a public A or AAAA record pointing at it. I did this on Proxmox VE 8.4 and confirmed the setup by running a manual renewal.

## Why this is worth doing

It is easy to treat certificate warnings as part of running a homelab. Open the Proxmox page, click through the warning, and move on.

I do not love that habit. A browser warning should mean something is wrong, not that I am visiting my own infrastructure. Putting a trusted certificate on Proxmox removes that noise, but it also gives you a small, useful ACME project: accounts, challenges, DNS automation, certificate installation, and renewal are all visible in one place.

The nice surprise was how little machinery it took. Proxmox already had the workflow. I did not need a reverse proxy, a separate certificate container, or a script copying certificates into place.

## Why DNS-01 fits a private node

HTTP-01 works by asking the certificate authority to reach a web server over the internet. My Proxmox management interface is not public, and making it public for a certificate challenge would defeat the point.

DNS-01 proves control another way. The ACME client creates a temporary TXT record, Let's Encrypt checks it, and the record is removed after validation. The node itself never needs to accept an inbound connection from Let's Encrypt.

It also does not need a public A or AAAA record pointing at the node. The public side only needs the TXT challenge record. Inside your network, the certificate name still needs to resolve to the node when you use it, but that can stay in private DNS. The [Let's Encrypt challenge documentation](https://letsencrypt.org/docs/challenge-types/) covers the mechanics in more detail.

## The certificate Proxmox actually serves

Proxmox already has an internal cluster CA and its own node certificate. That is separate from the certificate the browser sees through `pveproxy`.

The ACME workflow installs a publicly trusted certificate as `pveproxy-ssl.pem`. When I open Proxmox using the DNS name I put on the ACME order, the native Proxmox service presents the Let's Encrypt certificate instead of the internal one.

The name matters. A certificate ordered for one DNS name will not make every IP address or alternate name valid, so I test with the same name I configured in Proxmox.

## Add the ACME account

On Proxmox VE 8.4, the account lives under **Datacenter -> ACME -> Accounts**. I added a Let's Encrypt account there, then selected that account for the node later in the process.

This is a cluster-level account, so it is not something I recreated separately inside each node. The [Proxmox VE 8 Administration Guide](https://pve.proxmox.com/pve-docs-8/pve-admin-guide.pdf) documents the account model and the rest of the built-in certificate workflow.

## Add the DNS challenge plugin

The next piece is under **Datacenter -> ACME -> Challenge Plugins**. This is where Proxmox learns how to create and remove the TXT record with your DNS provider.

The fields depend on the provider, but the security rule does not: do not hand the plugin a broad account credential when a restricted token will do. I used a credential limited to the DNS-record operations needed for the intended zone.

That is worth checking rather than assuming. A token can be dedicated to Proxmox and still have more access than it needs.

## Connect the pieces on the node

The node-side setup is under **Node -> System -> Certificates -> ACME**. There are three choices to connect:

1. select the cluster ACME account;
2. add the DNS name you want on the certificate;
3. select the DNS challenge plugin for that name.

That is most of the setup. The account talks to Let's Encrypt, the plugin handles the temporary TXT record, and the node knows which name belongs on its `pveproxy` certificate.

From there, order the certificate from the same Certificates view. The task log makes the process easy to follow: Proxmox places the order, adds the TXT record, waits for validation, removes the record, installs the certificate, and reloads `pveproxy`.

My task finished with `Task OK`. I checked `pveproxy-ssl.pem` and saw Let's Encrypt as the issuer, then opened the node with the configured DNS name and confirmed the browser trusted it.

## Test renewal while the setup is fresh

I also ran a manual renewal from Proxmox. It repeated the DNS challenge and finished successfully, which was a quick way to confirm that the account, credential, plugin, DNS name, and certificate installation still worked together.

Proxmox supports automatic renewal for ACME-managed certificates. I have not personally watched an automatic renewal event complete on this setup yet, so the manual renewal is the test I can speak to.

## Before you start

The Proxmox guide recommends using the Let's Encrypt staging environment while experimenting or setting ACME up for the first time. Production endpoints have rate limits. I do not know whether I used staging during my original setup, but it is the sensible path for a fresh walkthrough.

If an order fails, the task log usually tells you which part to inspect: account selection, TXT-record creation, DNS validation, or certificate installation. I do not have a dramatic failure story or a propagation-time number to offer here. The setup was straightforward, and the useful lesson was that a private node can use normal, trusted certificates without becoming a public service.

That makes this a good homelab-sized security project. It removes a warning you should not train yourself to ignore, teaches the moving parts of ACME, and leaves the Proxmox management interface where it belongs: off the public internet.
