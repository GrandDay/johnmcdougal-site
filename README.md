# johnmcdougal.com

Personal site and blog for John McDougal — Sacramento-based IT Consultant, Homelabber, and chronic pattern-finder.

**Live:** [johnmcdougal.com](https://johnmcdougal.com)

---

## About this project

Built in public. This is the source for my personal site — a place to document what I'm building, thinking, and learning across IT, homelabbing, cybersecurity, and knowledge work.

The stack is deliberately boring in the best way: static files, no client-side framework, fast everywhere. Content lives in Markdown and MDX. Deploys automatically on every push via Cloudflare Pages.

## Stack

- **[Astro 7](https://astro.build)** — static site generator
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

- Node `24.19.0` (`.nvmrc`)
- npm `12.0.2`
- clean install path: `npm ci`

| Command                 | Action                                                           |
| :---------------------- | :--------------------------------------------------------------- |
| `npm ci`                | Install exactly from `package-lock.json`                         |
| `npm run dev`           | Start local dev server at `localhost:4321`                       |
| `npm run check`         | Run Astro content and type checks                                |
| `npm run verify-build:sync-baseline` | Rebuild and auto-sync `scripts/verify-build.mjs` expectation baselines |
| `npm run whitespace:fix-staged` | Trim trailing whitespace in staged text files and re-stage them |
| `npm run build`         | Build production site to `./dist/`                               |
| `npm run commit:check`  | Verify the explicit staged scope and run canonical validation     |
| `npm run hooks:status`  | Report the effective Git hooks path and configuration origin      |
| `npm run hooks:install` | Opt in to the repository-local tracked pre-commit hook            |
| `npm run verify:build`  | Verify selected generated-site invariants in `./dist/`           |
| `npm run validate`      | Run whitespace check, Astro check, fresh build, and verification |
| `npm run review`        | Validate, refresh, and leave a local preview server running      |
| `npm run review:status` | Report repository, build, and owned preview-server state         |
| `npm run review:stop`   | Stop only the script-owned preview server                        |

The review server binds to `127.0.0.1` by default and writes ignored state/logs under `.tmp/`. When human testing is complete, stop it with `npm run review:stop` before committing unless the active packet gives different closure instructions.

## Content addition guide

When adding a new blog post or project page, follow this sequence to keep generated output and validation in sync.

1. Create content from templates:
    - blog: `src/content/blog/_template-blog.md` (or series template when applicable)
    - projects: `src/content/projects/_template-project.md`
2. Fill frontmatter carefully:
    - set `pubDate` as `YYYY-MM-DD`
    - keep blog slugs stable and lowercase URL-safe
    - only set `updatedDate` for project entries when intentionally updating project state
3. Run build checks:
    - `npm run check`
    - `npm run build`
    - `npm run verify:build`
4. If `npm run verify:build` fails after intentional content additions, update baseline expectations in `scripts/verify-build.mjs`:
    - add the new source file/date in `expectedSourceDates`
    - update `standalonePosts` if a non-series post is added
    - update expected counts (sitemap, tags, chronological index, RSS)
    - update graph expectations (node/edge counts and hashes) to match the new content graph
5. Re-run full validation:
    - `npm run validate`
6. If you changed published content inventories, also verify generated inventories in `dist/` (for example `llms.txt`, `rss.xml`, and `graph.json`) reflect the new page.
7. Trailing whitespace is now auto-trimmed for staged text files by the pre-commit hook. You can also run `npm run whitespace:fix-staged` manually before `npm run commit:check`.
8. `scripts/verify-build.mjs` baselines are auto-synced during pre-commit (build + rewrite + restage). You can run `npm run verify-build:sync-baseline` manually before staging if you want to inspect the baseline update explicitly.
9. `npm run verify:build` now includes source tag lint reporting. It warns when source tags normalize to different canonical values (case, spaces, duplicate variants). Warnings are non-blocking by default; set `VERIFY_BUILD_STRICT_TAG_LINT=1` to make tag-lint warnings fail validation.

### Session automation summary

- Pre-commit now runs baseline sync and staged whitespace normalization before commit validation.
- Baseline sync rewrites `scripts/verify-build.mjs` expectations from current content and generated output.
- Content schema now normalizes tags at ingest (trim, lowercase, spaces to hyphens, dedupe), which prevents casing/spacing route drift.
- Verify-build now checks latest related project activity dynamically from content relationships instead of hardcoded post IDs.

Commit workflow:

1. Stage only the approved paths and inspect `git diff --cached`.
2. Keep the nonignored worktree free of unstaged and untracked changes so validation reads the proposed commit state.
3. Run `npm run commit:check`; it reports staged names/stat, checks the staged diff, and invokes `npm run validate` without rewriting or staging files.
4. Install the convenience hook with `npm run hooks:install` only after `npm run hooks:status` reports no conflict. The script is canonical; the hook only calls it.
5. On the hook's first Git-for-Windows commit, preserve its executable mode with `git add --chmod=+x .githooks/pre-commit`; later commits retain mode `100755`.
6. Correct failures explicitly, stage the intended versions again, and rerun the check. A `--no-verify` bypass must be disclosed in closure evidence.
7. Commit only after human authorization. These commands never add, commit, merge, or push.

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
