# johnmcdougal.com

Personal site and blog for John McDougal — Sacramento-based IT Consultant, Homelabber, and chronic pattern-finder.

**Live:** [johnmcdougal.com](https://johnmcdougal.com)

---

## About this project

Built in public. This is the source for my personal site — a place to document what I'm building, thinking, and learning across IT, homelabbing, cybersecurity, and knowledge work.

The stack is deliberately boring in the best way: static files, no client-side framework, fast everywhere. Content lives in Markdown and MDX. Deploys automatically on every push via Cloudflare Pages.

## Stack

- **[Astro 6](https://astro.build)** — static site generator
- **[Cloudflare Pages](https://pages.cloudflare.com)** — hosting + CDN + deploy pipeline
- **Markdown / MDX** — all content authored here
- **Custom CSS** — three-theme system (light / dark / true black OLED), teal accent (`#14b8a6`)

## Project structure

```
src/
├── components/       # Header, Footer, BaseHead, etc.
├── content/
│   ├── blog/         # Blog posts (.md / .mdx)
│   └── projects/     # Project entries (.md / .mdx)
├── layouts/          # Page layouts
├── pages/            # Routes (index, about, blog, projects, tags)
└── styles/
    └── global.css    # Entire theme system lives here
public/
├── robots.txt        # AI crawler governance
└── llms.txt          # Machine-readable site inventory for LLMs
```

## Local development

> **Note:** Run install and dev/build commands from a local directory that is **not** inside a cloud-synced folder (Google Drive, OneDrive, etc.). Synced folders cause file-lock errors with `node_modules`. Keep source in your synced folder for backup; clone or copy to a local path for building.

Expected local runtime:

- Node `22.22.0` (`.nvmrc`)
- npm `10.9.4`
- clean install path: `npm ci`

| Command                 | Action                                                           |
| :---------------------- | :--------------------------------------------------------------- |
| `npm ci`                | Install exactly from `package-lock.json`                         |
| `npm run dev`           | Start local dev server at `localhost:4321`                       |
| `npm run check`         | Run Astro content and type checks                                |
| `npm run build`         | Build production site to `./dist/`                               |
| `npm run verify:build`  | Verify selected generated-site invariants in `./dist/`           |
| `npm run validate`      | Run whitespace check, Astro check, fresh build, and verification |
| `npm run review`        | Validate, refresh, and leave a local preview server running      |
| `npm run review:status` | Report repository, build, and owned preview-server state         |
| `npm run review:stop`   | Stop only the script-owned preview server                        |

The review server binds to `127.0.0.1` by default and writes ignored state/logs under `.tmp/`. When human testing is complete, stop it with `npm run review:stop` before committing unless the active packet gives different closure instructions.

Validation policy:

1. Run deterministic checks first with `npm run validate`.
2. Use generated output and HTTP checks for route behavior.
3. Use the persistent localhost review server for human visual review.
4. Do not use the known failing in-app/sandbox browser path as an acceptance gate.
5. Do not install Playwright or browser binaries during normal implementation packets.
6. Use a known-working host browser only when a packet explicitly requires browser rendering.

Branch and release policy:

- Keep feature work local until localhost validation and human review pass.
- Do not commit, push, merge, reset, or discard changes without explicit authorization.
- Treat body-copy word counts as diagnostics only; fit, evidence, truth boundaries, and reader comprehension govern narrative copy.
- Generated directories (`dist/`, `.astro/`, `.tmp/`) and local environment files are not source changes.

Cloudflare Pages deploys automatically on every push to `main`.

## Future: self-hosting path

The site builds to pure static files in `dist/` — portable to any host. To move off Cloudflare Pages:
1. Point an A record at your VPS IP
2. Serve `dist/` with nginx or Caddy + Let's Encrypt
3. Set up a CI step to build and rsync on push

No site code changes required.

## Related

- [GitHub profile](https://github.com/GrandDay)
- [LinkedIn](https://www.linkedin.com/in/john-mcdougal-012a02370/)
