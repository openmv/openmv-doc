// Cloudflare Worker: real HTTP redirects for docs.openmv.io/latest/*.
//
// The site is GitHub Pages, which can't issue redirects. /latest/index.html
// (meta refresh + JS) and the 404.html shim handle browsers, but clients that
// don't run JavaScript (curl, crawlers, LLM fetchers) get a 404 for any
// /latest/<page>. This Worker answers /latest and /latest/* with a 302 to the
// same path under the newest release, keeping the query string. The site root
// "/" gets a 302 straight to the newest release too (one hop, not via
// /latest/).
//
// The newest release is read from /versions.json (written by gen_versions.py
// on every deploy), so nothing here changes between releases. 302, not 301,
// because the target moves with each release.
//
// Routes: docs.openmv.io/latest* and docs.openmv.io/ (root only; see
// wrangler.toml)

const VERSIONS_TTL = 300; // seconds to cache versions.json at the edge

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const m = url.pathname === "/" ? [] : url.pathname.match(/^\/latest(\/.*)?$/);
    if (!m) return fetch(request);

    let latest = null;
    try {
      const r = await fetch(new URL("/versions.json", url), {
        cf: { cacheTtl: VERSIONS_TTL, cacheEverything: true },
      });
      if (r.ok) latest = (await r.json()).latest;
    } catch (e) {
      // fall through to the origin
    }
    if (!latest) return fetch(request); // origin's redirect pages still work

    url.pathname = "/" + latest + (m[1] || "/");
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), "Cache-Control": "no-cache" },
    });
  },
};
