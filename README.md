# Curated X Feed

A static site that shows curated lists of X/Twitter accounts using official profile timeline embeds (platform.twitter.com widgets.js), organized into **tabs**.

- **No X API keys**
- **No scraping**
- **Tabs** with per-tab account lists (add / rename / delete)
- Add / remove handles in the UI (per active tab)
- Persist via **browser localStorage** (`curated-x-feed-v2`)
- Migrates the older single-list key (`curated-x-feed:handles`) into a first tab when present
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

## Tabs

- Horizontal tab bar under the header.
- Each tab has its own handle list, manage UI, and embed feed.
- Actions: **+ Tab**, **Rename**, **Delete** (keeps at least one tab).
- Switching tabs tears down and rebuilds embeds so widgets stay clean.

### Starter defaults (first visit only)

When there is no saved `curated-x-feed-v2` state (and no legacy list to migrate):

| Tab | Handles |
| --- | --- |
| Tech | OpenAI, AnthropicAI, vercel, github |
| News | BBCWorld, Reuters, AP |
| Builders | levelsio, swyx, patrickc |

## Adding accounts

1. Select a tab.
2. Type a handle (`@github` or `github`) and click **Add account**.
3. Or tap a one-click example chip (shown when the active tab is empty).
4. **Remove** from the pill list under "Your list".

Handles are validated as **1–15 characters**, alphanumeric + underscore (leading `@` is stripped in storage).

## Persistence

State is stored in **localStorage** under **`curated-x-feed-v2`** as `{ activeTabId, tabs: [{ id, name, handles }] }`.

If that key is missing, any legacy list under `curated-x-feed:handles` is migrated into a single **My feed** tab. Clearing site data for this origin resets to the starter tabs. There is no server-side sync on the Pages deploy.

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
- Handle order within a tab is insert order.
- No X API key required.
