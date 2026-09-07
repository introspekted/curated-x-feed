# Curated X Feed

A static site that shows a curated list of X/Twitter accounts using official profile timeline embeds (platform.twitter.com widgets.js).

- **No X API keys**
- **No scraping**
- Add / remove handles in the UI
- Persist via **browser localStorage**
- Dark, modern, mobile-friendly UI
- Deployed on **GitHub Pages** (no build step)

**Live:** https://introspekted.github.io/curated-x-feed/

## Quick start (local)

Open the static page in a browser (any static server works):

```bash
python3 -m http.server 8080 --directory docs
# or: npx serve docs
```

Then visit http://127.0.0.1:8080 .

You can also open `docs/index.html` directly as a file URL; localStorage and embeds still work in most browsers.

## Deploy (GitHub Pages)

This repo serves from the **docs/** folder on the **main** branch.

1. Push to `main` (this updates `docs/`).
2. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / folder **/docs**
3. Site URL pattern: `https://<user>.github.io/curated-x-feed/`

Pages usually goes live within a minute after the first enable or a new push.

### Enable via gh CLI

```bash
gh api repos/introspekted/curated-x-feed/pages -X POST \
  -f build_type=legacy \
  -f source[branch]=main \
  -f source[path]=/docs
```

If Pages is already configured, use PATCH instead of POST.

## Adding accounts

1. Open the app.
2. Type a handle (`@github` or `github`) and click **Add account**.
3. Or tap a one-click example chip.
4. **Remove** from the pill list under "Your list".

Handles are validated as **1–15 characters**, alphanumeric + underscore (leading `@` is stripped).

## Persistence

Your curated list is stored in **localStorage** under the key `curated-x-feed:handles`. Clearing site data for this origin will reset the list. There is no server-side sync on the Pages deploy.

## X embeds

Official embeds need third-party scripts and frames from X/Twitter. GitHub Pages does not set a restrictive CSP by default, so `https://platform.twitter.com/widgets.js` can load normally.

If widgets fail (network, extension, or regional limits), each card shows a **profile link fallback**.

### Manual embed reference

```html
<a class="twitter-timeline"
   data-theme="dark"
   data-chrome="noheader nofooter noborders transparent"
   data-height="520"
   href="https://twitter.com/github?ref_src=twsrc%5Etfw">
  Tweets by @github
</a>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

## Project layout

Primary app: `docs/index.html` (GitHub Pages).
Legacy Workers sources remain under `src/` (optional / suspended path).

## Notes

- Embed appearance is controlled by X widgets; timelines may be limited for some accounts or regions.
- Reorder is not in v1; order is insert order.
- No X API key required.
