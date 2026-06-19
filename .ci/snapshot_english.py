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

  ide <release-dir> <out-dir>
      Copy the English root only to <out-dir> (no language subdirs), hide BOTH
      the language and version switchers, neutralize the auto-redirect, and drop
      _sources/ + llms (unused offline). For the qt-creator bundle.

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


def make_ide(release_dir, out_dir, locs):
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.makedirs(out_dir)
    # copy English root only -- skip the per-language subdirs
    for entry in os.listdir(release_dir):
        if entry in locs:
            continue
        src = os.path.join(release_dir, entry)
        dst = os.path.join(out_dir, entry)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    # drop offline-unused bulk
    for rel in ("_sources", "llms.txt", "llms-full.txt"):
        p = os.path.join(out_dir, rel)
        if os.path.isdir(p):
            shutil.rmtree(p)
        elif os.path.isfile(p):
            os.remove(p)
    hide_switchers(out_dir, hide_versions=True)
    neutralize_redirect(out_dir)
    print(f"  ide bundle {out_dir}: English-only, both switchers hidden")


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


def cmd_ide(args):
    make_ide(args.release_dir, args.out_dir, locale_names(args.locales_dir))


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
    i = sub.add_parser("ide")
    i.add_argument("release_dir")
    i.add_argument("out_dir")
    i.add_argument("--locales-dir", required=True)
    i.set_defaults(func=cmd_ide)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
