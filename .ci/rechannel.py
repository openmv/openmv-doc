#!/usr/bin/env python3
"""Rewrite the version channel baked into a copied docs snapshot.

A release is a *copy* of the rolling ``dev`` build (no rebuild). The build bakes
the channel into a few absolute/root-relative URLs:

  * ``https://docs.openmv.io/dev/...``  -- canonical, og:url, llms.txt, the
    "Open in ChatGPT" raw-source base.
  * ``href=/dev/<lang>/...``            -- hreflang alternates + the language
    switcher (minified HTML, so the value may be unquoted).

Page-to-page links are relative and need no change; the version-switcher list
and its button label are populated client-side by nav-versions.js. So this only
rewrites those channel-bearing URL/attribute forms, anchored so it never touches
content like ``/dev/ttyUSB0`` in a code block.

Usage: rechannel.py <dir> <from-channel> <to-channel>
"""
import os
import re
import sys

root, frm, to = sys.argv[1], sys.argv[2], sys.argv[3]

ABS = re.compile(r"docs\.openmv\.io/" + re.escape(frm) + r"/")
# (href|src)= , an optional quote, then /<frm>/
REL = re.compile(r"((?:href|src)=)(\"?)/" + re.escape(frm) + r"/")

abs_to = "docs.openmv.io/" + to + "/"
changed = 0
scanned = 0
for dp, _, files in os.walk(root):
    for fn in files:
        if not (fn.endswith(".html") or fn.endswith(".txt")):
            continue
        p = os.path.join(dp, fn)
        scanned += 1
        with open(p, encoding="utf-8") as f:
            s = f.read()
        n = ABS.sub(abs_to, s)
        n = REL.sub(lambda m: m.group(1) + m.group(2) + "/" + to + "/", n)
        if n != s:
            with open(p, "w", encoding="utf-8") as f:
                f.write(n)
            changed += 1

print("rechannel %s -> %s : %d/%d files rewritten" % (frm, to, changed, scanned))
