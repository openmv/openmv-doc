# /latest/ redirect Worker

docs.openmv.io is served by GitHub Pages behind Cloudflare. GitHub Pages can't
send HTTP redirects, so `/latest/` only resolves in a browser, through the
JavaScript in `docs/latest/index.html` and `docs/404.html`. Clients that don't
run JavaScript (curl, crawlers, LLM fetch tools, intersphinx) get a 404 for any
`/latest/<page>`.

This Worker fixes that at the Cloudflare edge. It answers `/latest` and
`/latest/*` with a **302** to the same path under the newest release, keeping
the query string:

```
/latest/library/index.html?x=1  ->  /v5.0.1/library/index.html?x=1
```

The newest release comes from `/versions.json`, which `.ci/gen_versions.py`
regenerates on every deploy. It is cached at the edge for 5 minutes. A 302
rather than a 301 is used because the target changes with each release. If
`versions.json` can't be fetched, the request passes through to GitHub Pages,
where the browser redirects still work.

## Releases

Nothing to do. A new release is picked up within 5 minutes of its deploy.

## Deploying

`.github/workflows/cloudflare-worker.yml` deploys the Worker automatically when
anything in this folder changes on `master`. It can also be run by hand from
the Actions tab.

It needs two repository secrets:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Custom API token (`docs-latest-redirect-deploy`), permissions below |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID shown on the `openmv.io` zone overview page |

The token needs only:

- **Account (OpenMV LLC):** Workers Scripts, Edit. This uploads the Worker.
- **Zone (`openmv.io`):** Workers Routes, Edit. This attaches the route.
- **Zone (`openmv.io`):** Zone, Read. Wrangler uses it to look up the zone named
  in `wrangler.toml`.

Leave the token without IP filtering, because GitHub's runners don't have
fixed addresses.

To deploy from a local machine instead, log in to that account and run:

```sh
cd .ci/cloudflare && npx wrangler deploy
```

## Files

- `latest-redirect.js`: the Worker.
- `wrangler.toml`: the Worker name (`docs-latest-redirect`) and its route,
  `docs.openmv.io/latest*` on the `openmv.io` zone. Only matching requests run
  the Worker, so the rest of the site never touches it.

The machine-read files `llms.txt`, `llms-full.txt` and `objects.inv` don't
depend on this Worker. `gen_versions.py` also writes real copies of them into
`docs/latest/`, and of the `llms` files into the site root.
