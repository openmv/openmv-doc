#!/usr/bin/env python3
"""Minify every .html in a built docs tree, in place.

Note on impact: Sphinx/Shibuya HTML only shrinks ~10-12% from minification, and
GitHub Pages already serves it gzipped (where minified vs raw is within ~1%). So
this does little for what web visitors download -- its value is the RAW size:
the committed folder, the 2 GB artifact headroom, and especially the English IDE
bundle (served from local files, no gzip).

Safety: minify-html preserves the contents of <pre>/<textarea> per spec, so code
blocks keep their whitespace. Inline JS is NOT minified (avoids touching the
theme's inline scripts); CSS is.

Usage: minify_html.py <dir>
"""
import argparse
import os

import minify_html


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    args = ap.parse_args()
    before = after = files = 0
    for dp, _, fs in os.walk(args.root):
        for fn in fs:
            if not fn.endswith(".html"):
                continue
            ap_ = os.path.join(dp, fn)
            src = open(ap_, encoding="utf-8").read()
            out = minify_html.minify(
                src,
                keep_closing_tags=True,
                keep_html_and_head_opening_tags=True,
                minify_css=True,
                minify_js=False,
            )
            if len(out) < len(src):
                before += len(src)
                after += len(out)
                files += 1
                with open(ap_, "w", encoding="utf-8") as f:
                    f.write(out)
    print(f"minified {files} html files: {before/1e6:.0f} MB -> {after/1e6:.0f} MB "
          f"(-{100*(before-after)/before:.0f}%)" if before else "nothing to minify")


if __name__ == "__main__":
    main()
