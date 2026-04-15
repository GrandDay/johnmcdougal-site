# johnmcdougal.com

Personal site and blog for John McDougal — Sacramento-based IT Consultant, Homelabber, and chronic pattern-finder.

**Live:** [johnmcdougal.com](https://johnmcdougal.com)

---

## About this project

Built in public. This is the source for my personal site — a place to document what I'm building, thinking, and learning across IT, homelabbing, cybersecurity, and knowledge work.

The stack is deliberately boring in the best way: static files, no client-side framework, fast everywhere. Content lives in Markdown and MDX. Deploys automatically on every push via Cloudflare Pages.

## Stack

- **[Astro 5](https://astro.build)** — static site generator
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

> **Note:** Run `npm install` and dev/build commands from a local directory that is **not** inside a cloud-synced folder (Google Drive, OneDrive, etc.). Synced folders cause file-lock errors with `node_modules`. Keep source in your synced folder for backup; clone or copy to a local path for building.

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start local dev server at `localhost:4321`  |
| `npm run build`   | Build production site to `./dist/`          |
| `npm run preview` | Preview build locally before deploying      |

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
