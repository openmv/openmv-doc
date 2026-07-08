#!/usr/bin/env python3
"""Make docs snapshots English-only and hide the navs they no longer need.

Only the rolling ``dev`` channel and the current ``latest`` release ship all 26
languages. Every other release snapshot is reduced to English to keep each
version folder small, and the offline OpenMV IDE ships an English-only build of
the latest release. This script does those reductions.

Modes:

  reconcile <docs-dir> --locales-dir <locale>
      Enforce the invariant across docs/: read docs/versions.json's "latest";
      every release folder that is not "dev" and not "latest" is made
      English-only (web). Idempotent -- run after gen_versions.py on every CI
      build, so the previous latest is demoted automatically at each release.

  web <snapshot-dir> --locales-dir <locale>
      In place: delete the per-language subdirs, hide the LANGUAGE switcher
      (the version switcher stays), and neutralize the locale auto-redirect.

  offline <release-dir> <out-dir> --locales-dir <locale> [--stubs <dir>]
      Build the committed offline/ bundle for desktop apps: copy the English
      root only (no language subdirs), keep _sources/ (OpenMV Studio reads it),
      add the prebuilt stubs/ (--stubs; they live only here, not the online
      docs), drop llms, hide BOTH switchers, neutralize the auto-redirect. The
      Qt IDE displays the HTML; Studio reads offline/_sources/library/.

Hiding is one rule appended to the snapshot's _static/custom.css (loaded by
every page -- frozen-safe, no per-page edits). The auto-redirect is neutralized
by truncating _static/lang-redirect.js. All steps are idempotent (marker-guarded
/ existence-checked), so re-running is safe.
"""
import argparse
import json
import os
import shutil

MARK = "/* openmv-english-only */"
NOOP_JS = "/* openmv: locale auto-redirect disabled for this English-only build */\n"


def locale_names(locales_dir):
    return sorted(d for d in os.listdir(locales_dir)
                  if os.path.isdir(os.path.join(locales_dir, d)))


def strip_langs(root, locs):
    n = 0
    for l in locs:
        p = os.path.join(root, l)
        if os.path.isdir(p):
            shutil.rmtree(p)
            n += 1
    return n


def hide_switchers(root, hide_versions):
    """Append a display:none rule to the snapshot's _static/custom.css. Only if
    that file exists (old pre-theme snapshots have no switcher to hide)."""
    css = os.path.join(root, "_static", "custom.css")
    if not os.path.isfile(css):
        return False
    txt = open(css, encoding="utf-8").read()
    if MARK in txt:
        return False
    rule = ".nav-languages{display:none!important}"
    if hide_versions:
        rule += ".nav-versions{display:none!important}"
    with open(css, "a", encoding="utf-8") as f:
        f.write("\n" + MARK + rule + "\n")
    return True


def neutralize_redirect(root):
    js = os.path.join(root, "_static", "lang-redirect.js")
    if os.path.isfile(js) and open(js, encoding="utf-8").read() != NOOP_JS:
        open(js, "w", encoding="utf-8").write(NOOP_JS)


def make_web(snapshot, locs):
    stripped = strip_langs(snapshot, locs)
    hid = hide_switchers(snapshot, hide_versions=False)
    neutralize_redirect(snapshot)
    print(f"  web english-only {snapshot}: removed {stripped} lang dirs, "
          f"lang switcher {'hidden' if hid else 'already/none'}")


def make_offline(release_dir, out_dir, locs, stubs_dir=None):
    """Build the committed offline/ bundle that desktop apps consume:
      * the Qt IDE displays the rendered English HTML,
      * OpenMV Studio reads _sources/library/ to generate stubs,
    so this keeps the English HTML + _sources (and the prebuilt stubs/), drops
    the per-language subdirs and llms, hides BOTH switchers, and neutralizes the
    locale redirect. Mirrors the channel of the commit it is built on (dev at
    HEAD, the release at a tag)."""
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)
    # The Legacy (CMUcam history) section is preservation-only: it lives on the
    # website but is deliberately kept OUT of the desktop/IDE bundle so the app
    # doesn't carry the historical pages and their downloads.
    OFFLINE_SKIP = set(locs) | {"legacy"}
    # copy English root only -- skip the per-language subdirs and legacy/
    for entry in os.listdir(release_dir):
        if entry in OFFLINE_SKIP:
            continue
        src = os.path.join(release_dir, entry)
        dst = os.path.join(out_dir, entry)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    # Drop the assets that ONLY the Legacy pages reference -- the camera photos,
    # demo videos, and every download file -- from the shared collected dirs, so
    # the desktop/IDE bundle carries none of the historical downloads. Anything
    # also referenced by a non-legacy page is kept.
    import re as _re

    def _asset_refs(html_root, want_legacy):
        # _downloads files have URL-encoded names in hrefs, so match them at the
        # per-file hash-dir level (hashes are always clean hex); _images/_sources
        # match at the full path.
        refs = set()
        for root, _dirs, files in os.walk(html_root):
            rel = os.path.relpath(root, html_root)
            in_legacy = rel == "legacy" or rel.startswith("legacy" + os.sep)
            if in_legacy != want_legacy:
                continue
            for fn in files:
                if not fn.endswith(".html"):
                    continue
                with open(os.path.join(root, fn), encoding="utf-8",
                          errors="ignore") as fh:
                    txt = fh.read()
                for m in _re.findall(r"_downloads/[0-9a-f]+", txt):
                    refs.add(m)
                for m in _re.findall(r"(?:_images|_sources)/[^\s\"'<>()]+", txt):
                    refs.add(m.split("#")[0].split("?")[0])
        return refs

    legacy_only = _asset_refs(release_dir, True) - _asset_refs(release_dir, False)
    for rel in legacy_only:
        p = os.path.join(out_dir, *rel.split("/"))
        if os.path.isdir(p):
            shutil.rmtree(p)
        elif os.path.isfile(p):
            os.remove(p)
    # drop llms (unused by either consumer); KEEP _sources for Studio's genpyi
    for rel in ("llms.txt", "llms-full.txt"):
        p = os.path.join(out_dir, rel)
        if os.path.isfile(p):
            os.remove(p)
    # prebuilt stubs live only in the offline bundle, not the online docs
    if stubs_dir and os.path.isdir(stubs_dir):
        dst = os.path.join(out_dir, "stubs")
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(stubs_dir, dst)
    hide_switchers(out_dir, hide_versions=True)
    neutralize_redirect(out_dir)
    print(f"  offline bundle {out_dir}: English-only (HTML + _sources + stubs), "
          f"both switchers hidden")


# The versioning era starts at v5.0.0; older snapshots (v4.x) predate the
# translations and switchers entirely, so they are left completely untouched.
LEGACY_BEFORE = (5, 0, 0)


def version_key(name):
    import re
    return tuple(int(n) for n in re.findall(r"\d+", name))


def cmd_reconcile(args):
    locs = locale_names(args.locales_dir)
    vj = os.path.join(args.docs, "versions.json")
    latest = None
    if os.path.isfile(vj):
        latest = json.load(open(vj, encoding="utf-8")).get("latest")
    full = {"dev", latest}
    print(f"reconcile: full channels = {sorted(c for c in full if c)}; "
          f"english-only every other v5.0.0+ release")
    for name in sorted(os.listdir(args.docs)):
        d = os.path.join(args.docs, name)
        if not os.path.isdir(d) or name in full:
            continue
        # only release folders (vX.Y.Z) in the versioning era; never dev, the
        # latest, the redirect shims, or the legacy v4.x snapshots.
        if not (name[0] == "v" and name[1:2].isdigit()):
            continue
        if version_key(name) < LEGACY_BEFORE:
            continue
        make_web(d, locs)


def cmd_web(args):
    make_web(args.snapshot, locale_names(args.locales_dir))


def cmd_offline(args):
    make_offline(args.release_dir, args.out_dir, locale_names(args.locales_dir),
                 stubs_dir=args.stubs)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("reconcile")
    r.add_argument("docs")
    r.add_argument("--locales-dir", required=True)
    r.set_defaults(func=cmd_reconcile)
    w = sub.add_parser("web")
    w.add_argument("snapshot")
    w.add_argument("--locales-dir", required=True)
    w.set_defaults(func=cmd_web)
    o = sub.add_parser("offline")
    o.add_argument("release_dir")
    o.add_argument("out_dir")
    o.add_argument("--locales-dir", required=True)
    o.add_argument("--stubs", help="stubs dir to copy into <out>/stubs")
    o.set_defaults(func=cmd_offline)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
