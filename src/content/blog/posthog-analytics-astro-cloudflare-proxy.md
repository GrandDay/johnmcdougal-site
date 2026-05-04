---
title: "Setting Up PostHog Analytics on a Static Site (and Fixing What the Wizard Broke)"
description: "PostHog Cloud + a Cloudflare reverse proxy gives you real analytics without Google -- but skip the AI wizard and read the docs first."
pubDate: 2026-05-03
tags: ["posthog", "analytics", "astro", "cloudflare", "privacy"]
series: "How I built johnmcdougal.com"
seriesPart: 3
---

> **TL;DR:** PostHog Cloud + a Cloudflare reverse proxy = analytics that bypass adblockers and blocklists -- but skip the wizard and read the docs first.

The Copilot wizard set up PostHog for me. I ran it, looked at the output, thought it looked right. Then I read the manual docs and found it was wrong in two places.

This is not a story about AI being unreliable. The wizard was trained on docs that have since been updated -- the PostHog snippet changed, and the wizard didn't know. That's a different kind of failure mode, and it's worth naming correctly before you hit it yourself.

Here's what the current setup looks like, and how to get it actually working on Cloudflare Pages.

## Why PostHog

The short version: 1M events per month on the free tier, privacy-forward defaults, and you own your data. No Google Analytics. No third-party ad network sitting in the middle of everything.

For a personal site that I'm also using to document what I'm building, it matters that the analytics tooling is consistent with what I'm saying I care about. PostHog clears that bar. If the site ever scaled past what the free tier handles, there's a self-hosted path -- but we're a long way from that.

## What the wizard got wrong

I used the GitHub Copilot PostHog setup wizard. It ran cleanly, generated a component, and I committed it. Then I read the PostHog docs directly to verify, and found two divergences.

**First: outdated asset CDN URL.** The PostHog loader snippet dynamically constructs the asset host URL using a `.replace()` call. The current snippet does this:

```js
p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js"
```

The wizard generated a hardcoded URL pointing at the old subdomain directly -- no `.replace()`, wrong host. Subtle enough that I wouldn't have caught it without reading the docs.

**Second: missing `defaults` option.** The current PostHog snippet requires `defaults: '2026-01-30'` in the init config. This opts into PostHog's current behavior defaults -- without it, you may see unexpected behavior depending on when your snippet was last synced. The wizard omitted it:

```js
// Wizard output -- missing defaults
posthog.init(posthogKey, {
  api_host: posthogHost,
  person_profiles: 'identified_only',
});

// Current docs -- defaults required
posthog.init(posthogKey, {
  api_host: posthogHost,
  person_profiles: 'identified_only',
  defaults: '2026-01-30',
});
```

Both failures have the same root cause: the wizard was working from a version of the PostHog docs that predates recent changes. The docs moved; the wizard didn't. This is a predictable problem with any AI-assisted setup that touches a fast-moving library.

## The current setup

After correcting the wizard output against the manual docs, here's the full component:

```astro
---
// PostHog analytics — loaded only in production to avoid polluting data in dev
const isProd = import.meta.env.PROD;
const posthogKey = import.meta.env.PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://b.johnmcdougal.com';
---

{isProd && posthogKey && (
  <script is:inline define:vars={{ posthogKey, posthogHost }}>
    // PostHog loader snippet — copy from posthog.com/docs, not from an AI wizard
    !function(t,e){/* ... */}(document,window.posthog||[]);
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      defaults: '2026-01-30',
    });
  </script>
)}
```

The loader snippet itself is minified boilerplate from PostHog's docs -- copy it verbatim from there, not from anywhere else. The interesting parts are everything around it.

The `import.meta.env.PROD` guard means this script block only runs in production. During local development with `npm run dev`, nothing fires.

The `posthogKey` guard means if the environment variable is missing or empty, the script block is omitted entirely. No console errors, no broken page -- just no analytics until you set the var.

The `posthogHost` fallback hardcodes the proxy URL. This is intentional -- if `PUBLIC_POSTHOG_HOST` is missing from the environment, it still routes through the Cloudflare proxy instead of hitting PostHog directly. I'll explain why that matters in a moment.

`person_profiles: 'identified_only'` disables persistent profiles for anonymous visitors -- consistent with not running Google Analytics.

`defaults: '2026-01-30'` is the one the wizard missed. It's required in the current snippet version.

## The Cloudflare proxy

PostHog requests going directly to `us.i.posthog.com` will be blocked by adblockers and some privacy-focused DNS setups. If analytics are silent after setup, a blocklist may be the cause -- the Cloudflare proxy fixes it.

PostHog has a native Cloudflare integration: go to Settings > Reverse proxy > Cloudflare, and PostHog walks you through adding a CNAME record pointing to their proxy target. The subdomain is arbitrary; I used `b.johnmcdougal.com`. Once the CNAME propagates, PostHog confirms the proxy is active, and all analytics requests route through your own domain instead of PostHog's.

One catch specific to Astro on Cloudflare Pages: `PUBLIC_*` env vars are baked into the static output at build time. They're not evaluated at runtime. If `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` aren't set in your Cloudflare Pages environment settings before the build runs, they won't be in the output -- and the fallback in the component handles the host gracefully, but the key has no fallback. Add both to the CF Pages environment tab first, then trigger a fresh deploy.

## Verification

Once it's deployed, the check is straightforward:

- View source on any page and search for "posthog" -- you should see `posthogHost = "https://b.yoursubdomain.com"` with the correct proxy URL
- Open DevTools > Network, filter by your subdomain -- a `/decide` request and `/e/` request should both return 200
- PostHog dashboard > Activity tab shows `$pageview` events within seconds of a page load

If the requests appear in the Network tab but events aren't showing up in PostHog, check that the API key in your environment matches what's in your PostHog project settings.

## What this builds on

This is the third piece of the site's foundation. [The first post](/blog/how-i-built-johnmcdougal-com-with-claude-and-astro) covered the full stack decision -- PostHog was on the list there but without implementation detail. [The second](/blog/custom-email-routing-cloudflare-smtp2go) covered email routing.

At some point the site will likely be big enough to consider the self-hosted PostHog path -- a Docker Compose setup on a dedicated VM. For now, the free tier handles everything with no operational overhead.
