#!/usr/bin/env python3
"""Eliminate per-language asset duplication in a built docs tree.

A Sphinx multi-language build lays out English at the channel root and each
locale under <root>/<lang>/. Several large asset trees are byte-identical
across every locale and therefore duplicated 26x:

  * _images/, _downloads/, _sources/  -- figures, download files, page sources
  * _static/openmv-hero.mp4           -- the home-page hero video (4.9 MB)
  * llms.txt / llms-full.txt          -- LLM dumps (English source either way)

For each locale dir this script keeps only the channel-root copy and points the
locale's HTML at it:

  A) For _images/_downloads/_sources: rewrite every reference in the locale's
     .html by prepending exactly ONE "../" (the locale root sits exactly one
     level below the channel root, so this is correct at every page depth and
     channel-agnostic), then delete the locale's copy. Deletion only happens
     after verifying the locale copy is byte-identical to the root copy; a
     locale asset that differs from / is missing at root is kept untouched.
  B) For the hero video: rewrite only the <lang>/.../_static/openmv-hero.mp4
     references (NOT the rest of _static, which has per-language files) and
     delete the locale copy.
  C) llms.txt / llms-full.txt: delete the per-locale copies (the root copy is
     canonical; nothing in the HTML references them).

Idempotent: each rewrite is gated on the asset still existing in the locale, so
re-running a finished tree is a no-op (it will not double-rewrite "../").

Usage:
  dedup_assets.py <html_root> --locales-dir <path-to>/locale
  dedup_assets.py <html_root> --locales ja,de,zh_CN
"""
import argparse
import hashlib
import os
import re
import sys

SHARED_DIRS = ("_images", "_downloads", "_sources")
HERO = "_static/openmv-hero.mp4"
LLMS = ("llms.txt", "llms-full.txt")

# A reference begins at an attribute-value boundary: an opening quote, a CSS
# url( paren, or a srcset continuation (", "). Anchoring on these means a path
# embedded in a longer URL (e.g. https://host/_sources/...) or a substring is
# never matched -- the char before such a path is "/", which is not a boundary.
_BOUNDARY = r'''(?P<b>["'(]|,\s*)'''


def _sha1(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _tree_files(root):
    """relpath -> absolute path for every file under root."""
    out = {}
    for dirpath, _, names in os.walk(root):
        for n in names:
            ap = os.path.join(dirpath, n)
            out[os.path.relpath(ap, root)] = ap
    return out


def identical_subset(lang_dir, root_dir):
    """True iff every file under lang_dir exists at root_dir with identical
    bytes. (A locale-only or differing asset makes it unsafe to delete.)"""
    if not os.path.isdir(root_dir):
        return False
    root_files = _tree_files(root_dir)
    for rel, ap in _tree_files(lang_dir).items():
        rp = root_files.get(rel)
        if rp is None or os.path.getsize(ap) != os.path.getsize(rp):
            return False
        if _sha1(ap) != _sha1(rp):
            return False
    return True


def _dir_bytes(path):
    total = 0
    for dirpath, _, names in os.walk(path):
        for n in names:
            total += os.path.getsize(os.path.join(dirpath, n))
    return total


def rewrite_html(lang_root, names):
    """Prepend one '../' to every reference whose path starts with one of
    `names` (e.g. '_images/'), across all .html under lang_root. Returns the
    number of files modified."""
    if not names:
        return 0
    alt = "|".join(re.escape(n) for n in names)
    pat = re.compile(_BOUNDARY + r"(?P<rel>(?:\.\./)*)(?P<name>(?:" + alt + r")/)")
    repl = r"\g<b>\g<rel>../\g<name>"
    changed = 0
    for dirpath, _, fnames in os.walk(lang_root):
        for fn in fnames:
            if not fn.endswith(".html"):
                continue
            ap = os.path.join(dirpath, fn)
            with open(ap, encoding="utf-8") as f:
                src = f.read()
            new = pat.sub(repl, src)
            if new != src:
                with open(ap, "w", encoding="utf-8") as f:
                    f.write(new)
                changed += 1
    return changed


def rewrite_hero(lang_root):
    """Prepend one '../' to references to _static/openmv-hero.mp4 only."""
    pat = re.compile(_BOUNDARY + r"(?P<rel>(?:\.\./)*)_static/openmv-hero\.mp4")
    repl = r"\g<b>\g<rel>../_static/openmv-hero.mp4"
    changed = 0
    for dirpath, _, fnames in os.walk(lang_root):
        for fn in fnames:
            if not fn.endswith(".html"):
                continue
            ap = os.path.join(dirpath, fn)
            with open(ap, encoding="utf-8") as f:
                src = f.read()
            new = pat.sub(repl, src)
            if new != src:
                with open(ap, "w", encoding="utf-8") as f:
                    f.write(new)
                changed += 1
    return changed


def _rm_dir(path):
    import shutil
    shutil.rmtree(path)


def dedup_locale(root, lang):
    lang_root = os.path.join(root, lang)
    if not os.path.isdir(lang_root):
        return 0
    freed = 0

    # A) shared asset dirs
    to_delete = []
    for d in SHARED_DIRS:
        lang_dir = os.path.join(lang_root, d)
        if not os.path.isdir(lang_dir):
            continue
        root_dir = os.path.join(root, d)
        if identical_subset(lang_dir, root_dir):
            to_delete.append(d)
        else:
            print(f"  [{lang}] KEEP {d} (differs from / missing at root)", file=sys.stderr)
    if to_delete:
        rewrite_html(lang_root, to_delete)
        for d in to_delete:
            p = os.path.join(lang_root, d)
            freed += _dir_bytes(p)
            _rm_dir(p)

    # B) hero video
    hero = os.path.join(lang_root, HERO)
    root_hero = os.path.join(root, HERO)
    if os.path.isfile(hero) and os.path.isfile(root_hero) and _sha1(hero) == _sha1(root_hero):
        rewrite_hero(lang_root)
        freed += os.path.getsize(hero)
        os.remove(hero)

    # C) per-locale llms dumps (root copy is canonical; HTML never links them)
    for f in LLMS:
        p = os.path.join(lang_root, f)
        if os.path.isfile(p):
            freed += os.path.getsize(p)
            os.remove(p)

    print(f"  [{lang}] freed {freed/1e6:.1f} MB"
          f"  (dirs: {','.join(to_delete) or 'none'})")
    return freed


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("html_root", help="built tree: English root + <lang>/ dirs")
    ap.add_argument("--locales-dir", help="dir whose subdir names are the locales")
    ap.add_argument("--locales", help="comma-separated locale names (overrides --locales-dir)")
    args = ap.parse_args()

    if args.locales:
        locales = [x for x in args.locales.split(",") if x]
    elif args.locales_dir:
        locales = sorted(d for d in os.listdir(args.locales_dir)
                         if os.path.isdir(os.path.join(args.locales_dir, d)))
    else:
        ap.error("provide --locales-dir or --locales")

    root = args.html_root
    if not os.path.isdir(root):
        ap.error(f"no such tree: {root}")

    print(f"dedup {root}  ({len(locales)} known locales)")
    total = 0
    seen = 0
    for lang in locales:
        if os.path.isdir(os.path.join(root, lang)):
            seen += 1
            total += dedup_locale(root, lang)
    print(f"done: {seen} locale dirs processed, {total/1e6:.1f} MB freed")


if __name__ == "__main__":
    main()
