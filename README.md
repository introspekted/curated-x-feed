# Curated X Feed

A small Cloudflare Workers app that shows a curated list of X/Twitter accounts using official profile timeline embeds (platform.twitter.com widgets.js / publish.twitter.com style).

- **No X API keys**
- **No scraping**
- Add / remove handles in the UI
- Persist via **Cloudflare KV** when configured; otherwise **localStorage** so `wrangler dev` works immediately
- Dark, modern, mobile-friendly UI
- No auth (v1)

## Quick start

```bash
npm install
npm run dev
```

Open the URL Wrangler prints (usually `http://127.0.0.1:8787`).

### Deploy

```bash
npm run deploy
```

Optional typecheck:

```bash
npm run typecheck
```

## Adding accounts

1. Open the app.
2. Type a handle (@Cloudflare or Cloudflare) and click **Add account**.
3. Or tap a one-click example chip.
4. **Remove** from the pill list under “Your list”.

Handles are validated as **1-15 characters**, alphanumeric + underscore (leading @ is stripped).

## Persistence

| Mode | When | Behavior |
|------|-----|---------|
| **KV** | `HANDLES` binding configured in `wrangler.toml` | `GET/PUT /api/handles` stores a shared list |
| **localStorage** | KV missing or API returns 503 | List is kept in the browser; UI still fully works |

### Create a KV namespace

```bash
npx wrangler kv namespace create HANDLES
npx wrangler kv namespace create HANDLES --preview
```

Uncomment the `[[kv_namespaces]]` block in `wrangler.toml` and paste the returned ids:

```toml
[[kv_namespaces]]
binding = "HANDLES"
id = "<production_namespace_id>"
preview_id = "<preview_namespace_id>"
```

Then redeploy (`npm run deploy`) or restart `npm run dev`.

## Stack

- Cloudflare Workers + Wrangler
- TypeScript
- Hono for routing / HTML / JSON API

## API

| Method | Path | Description |
|--------|-----|------------|
| `GET` | `/api/health` | Liveness + whether KV is bound |
| `GET`| `/api/handles` | `{ handles: string[], storage: "kv" }` |
| `PUT` | `/api/handles` | Body `{ handles: string[] }` (max 50) |

## Content Security Policy & X widgets

Official embeds need third-party scripts and frames from X/Twitter. This app sets a CSP on the HTML response that allows:

| Directive | Needed for |
|---------|----------|
| `script-src` • `https://platform.twitter.com` `https://cdn.syndication.twimg.com` | widgets.js and syndication scripts |
| `frame-src` • `platform.twitter.com` `syndication.twitter.com` `twitter.com` `x.com` | Timeline iframes |
| `img-src` `https:`  | Avatars / media in embeds |
| `style-src` `'unsafe-inline'` + Twitter/ton hosts | Widget chrome |
| `connect-src` syndication / twimg hosts | Widget XHR |

 Inline app script/styles use `'unsafe-inline'` for this single-page MVP. If you harden later, move assets to hashed files and drop `unsafe-inline`.

If widgets fail (network, extension, or CSP), each card shows a **profile link fallback**.

### Manual embed reference

```html
<a class="twitter-timeline"
   data-theme="dark"
   data-chrome="noheader nofooter noborders transparent"
   data-height="520"
   href="https://twitter.com/Cloudflare?ref_src=twsrc%5Etfw">
  Tweets by @Cloudflare
</a>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
```

## Project layout

```
package.json
wrangler.toml
              # Worker config (+ optional KV binding)
tsconfig.json
worker-configuration.d.ts
README.md
src/index.ts         # Hono worker: page + API
src/page.ts          # Dark UI + client logic + embeds
src/validate.ts      # Handle normalization
src/types.ts         # Env / payload types
```

## Scripts

| Script | Command |
|--------|--------|
| `npm run dev` | `wrangler dev` |
| `npm run deploy` | `wrangler deploy` |
| `npm run typecheck` | `tsc --noEmit` |

## Notes

- Embed appearance is controlled by X’s widget; timelines may be limited for some accounts or regions.
- Reorder is not in v1 (nice-to-have); order is insert order.
- Do not commit real secrets; this app does not need an X API key.
