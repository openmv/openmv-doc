#!/usr/bin/env python3
"""Regenerate the version index + root/latest redirects for the docs site.

Run after syncing a channel build into docs/<channel>/. Enumerates the version
folders actually present (``dev`` + ``vX.Y.Z`` snapshots) and writes:

  docs/versions.json        -- consumed by static/nav-versions.js (the switcher)
  docs/index.html           -- root redirect to /latest/
  docs/latest/index.html    -- redirect to the newest release (or /dev/ if none)

"dev" is the rolling master build; each "vX.Y.Z" is a frozen snapshot. "latest"
is an alias for the newest release. Usage: gen_versions.py <docs-dir>
"""
import sys
import os
import re
import json

docs = sys.argv[1] if len(sys.argv) > 1 else "docs"

VERSION_RE = re.compile(r"^v\d+\.\d+")

# The versioning era starts at v5.0.0. Older tags (e.g. v4.8.1) are kept as
# reachable "legacy" snapshots in the switcher but are never treated as the
# newest/"latest" release, so the root never redirects to them.
LEGACY_BEFORE = (5, 0, 0)


def version_key(name):
    return tuple(int(n) for n in re.findall(r"\d+", name))


present = [
    name for name in os.listdir(docs)
    if os.path.isdir(os.path.join(docs, name))
    and (name == "dev" or VERSION_RE.match(name))
]
all_releases = sorted((n for n in present if n != "dev"), key=version_key, reverse=True)
current = [r for r in all_releases if version_key(r) >= LEGACY_BEFORE]
legacy = [r for r in all_releases if version_key(r) < LEGACY_BEFORE]
latest = current[0] if current else None

# dev first, then current releases newest-first, then legacy snapshots.
ordered = (["dev"] if "dev" in present else []) + current + legacy
versions = []
for v in ordered:
    if v == latest:
        label = v + " (latest)"
    elif v in legacy:
        label = v + " (legacy)"
    else:
        label = v
    versions.append({"id": v, "label": label})
with open(os.path.join(docs, "versions.json"), "w", encoding="utf-8") as f:
    json.dump({"versions": versions, "latest": latest}, f, indent=1)

# Root "/" -> "/latest/" (the stable entry point). /latest/ itself resolves to
# the newest release, or to /dev/ before the first release exists.
latest_target = "/{}/".format(latest if latest else "dev")


def redirect_html(target):
    return (
        "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
        "<meta charset=\"utf-8\">\n"
        "<meta http-equiv=\"refresh\" content=\"0; url={t}\">\n"
        "<link rel=\"canonical\" href=\"https://docs.openmv.io{t}\">\n"
        "<title>OpenMV Documentation</title>\n"
        "<script>location.replace(\"{t}\" + location.search + location.hash);</script>\n"
        "</head>\n<body>Redirecting to <a href=\"{t}\">{t}</a>…</body>\n</html>\n"
    ).format(t=target)


with open(os.path.join(docs, "index.html"), "w", encoding="utf-8") as f:
    f.write(redirect_html("/latest/"))

os.makedirs(os.path.join(docs, "latest"), exist_ok=True)
with open(os.path.join(docs, "latest", "index.html"), "w", encoding="utf-8") as f:
    f.write(redirect_html(latest_target))

print("versions.json:", [v["id"] for v in versions], "latest:", latest)
