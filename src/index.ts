import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env, HandlesPayload } from "./types";
import { normalizeHandles } from "./validate";
import { renderPage } from "./page";

const HANDLES_KEY = "handles";

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({ origin: "*", allowMethods: ["GET", "PUT", "OPTIONS"] }));

app.get("/", (c) => {
  const name = c.env.APP_NAME || "Curated X Feed";
  return c.html(renderPage(name), 200, {
    // Allow official X widgets; see README for CSP notes.
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://platform.twitter.com https://cdn.syndication.twimg.com",
      "style-src 'self' 'unsafe-inline' https://platform.twitter.com https://ton.twimg.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://ton.twimg.com https://*.twimg.com",
      "frame-src https://platform.twitter.com https://syndication.twitter.com https://twitter.com https://x.com https://*.twitter.com https://*.x.com",
      "connect-src 'self' https://cdn.syndication.twimg.com https://syndication.twitter.com https://api.twitter.com https://*.twitter.com https://*.x.com https://*.twimg.com",
      "child-src https://platform.twitter.com https://syndication.twitter.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  });
});

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    kv: Boolean(c.env.HANDLES),
    app: c.env.APP_NAME || "Curated X Feed",
  }),
);

app.get("/api/handles", async (c) => {
  const kv = c.env.HANDLES;
  if (!kv) {
    return c.json(
      { error: "KV binding HANDLES is not configured", handles: [] as string[], storage: "unavailable" },
      503,
    );
  }
  try {
    const stored = await kv.get<HandlesPayload>(HANDLES_KEY, "json");
    const handles = Array.isArray(stored?.handles) ? stored!.handles : [];
    return c.json({
      handles,
      updatedAt: stored?.updatedAt ?? null,
      storage: "kv",
    });
  } catch {
    return c.json({ error: "Failed to read from KV", handles: [] as string[] }, 500);
  }
});

app.put("/api/handles", async (c) => {
  const kv = c.env.HANDLES;
  if (!kv) {
    return c.json({ error: "KV binding HANDLES is not configured" }, 503);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const handles = normalizeHandles((body as { handles?: unknown })?.handles);
  if (!handles) {
    return c.json(
      {
        error:
          "Invalid handles. Provide { handles: string[] } with 1–15 char alphanumeric/underscore values (optional leading @).",
      },
      400,
    );
  }
  if (handles.length > 50) {
    return c.json({ error: "Maximum 50 handles" }, 400);
  }

  const payload: HandlesPayload = {
    handles,
    updatedAt: new Date().toISOString(),
  };

  try {
    await kv.put(HANDLES_KEY, JSON.stringify(payload));
    return c.json({ ok: true, ...payload, storage: "kv" });
  } catch {
    return c.json({ error: "Failed to write to KV" }, 500);
  }
});

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.redirect("/");
});

export default app;
