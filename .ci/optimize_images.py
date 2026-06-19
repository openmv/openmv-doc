#!/usr/bin/env python3
"""Shrink the _images/ media in a built docs tree, in place, losslessly-looking.

Images are already-compressed formats, so HTTP gzip can't shrink them -- they
are the largest gzip-immune chunk of what GitHub Pages serves. The biggest win
is the board pinout diagrams: flat-colour line art currently stored as large
RGBA PNGs. Palette-quantising them to 256 colours is visually identical for line
art (verified per-image) and cuts them ~60-75%.

Everything is done IN PLACE keeping the same filename/extension, so no HTML
references change. Each candidate is replaced only if (a) it gets smaller and
(b) it passes a perceptual gate, so photos and anything that would degrade are
left untouched.

  PNG : quantise to <=256 colours (gate: <1.5% of pixels move by >24/255).
  GIF : re-save optimised (lossless frame optimisation).
  JPEG: re-save progressive at quality 85 (gate: same perceptual test).

Usage: optimize_images.py <html_root|images_dir> [--quality 85]
"""
import argparse
import io
import os

from PIL import Image, ImageChops

PNG_MOVE_PCT = 1.5     # max % of pixels allowed to move beyond the delta
DELTA = 24             # per-pixel luminance delta that counts as "moved"


def moved_pct(a, b):
    d = ImageChops.difference(a.convert("RGB"), b.convert("RGB")).convert("L")
    h = d.histogram()
    total = sum(h) or 1
    return 100.0 * sum(h[DELTA + 1:]) / total


def opt_png(path):
    im = Image.open(path)
    if im.mode not in ("RGB", "RGBA", "P", "L", "LA"):
        return 0
    rgba = im.convert("RGBA")
    q = rgba.quantize(colors=256)            # P-mode, preserves transparency
    if moved_pct(rgba, q) >= PNG_MOVE_PCT:
        return 0
    buf = io.BytesIO()
    q.save(buf, "PNG", optimize=True)
    if buf.tell() >= os.path.getsize(path):
        return 0
    saved = os.path.getsize(path) - buf.tell()
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    return saved


def opt_gif(path):
    im = Image.open(path)
    buf = io.BytesIO()
    try:
        im.save(buf, "GIF", optimize=True, save_all=getattr(im, "is_animated", False))
    except Exception:
        return 0
    if buf.tell() >= os.path.getsize(path):
        return 0
    saved = os.path.getsize(path) - buf.tell()
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    return saved


def opt_jpeg(path, quality):
    im = Image.open(path).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True, progressive=True)
    if buf.tell() >= os.path.getsize(path):
        return 0
    cand = Image.open(io.BytesIO(buf.getvalue()))
    if moved_pct(im, cand) >= PNG_MOVE_PCT:
        return 0
    saved = os.path.getsize(path) - buf.tell()
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    return saved


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="html tree or an _images dir")
    ap.add_argument("--quality", type=int, default=85)
    args = ap.parse_args()

    saved = files = 0
    for dp, _, fs in os.walk(args.root):
        # only touch _images trees (and the dir itself if pointed at one)
        if os.path.basename(args.root) != "_images" and (os.sep + "_images") not in (dp + os.sep):
            continue
        for fn in fs:
            ap_ = os.path.join(dp, fn)
            ext = fn.rsplit(".", 1)[-1].lower() if "." in fn else ""
            try:
                if ext == "png":
                    s = opt_png(ap_)
                elif ext == "gif":
                    s = opt_gif(ap_)
                elif ext in ("jpg", "jpeg"):
                    s = opt_jpeg(ap_, args.quality)
                else:
                    s = 0
            except Exception as e:
                print(f"  skip {ap_}: {e}")
                s = 0
            if s:
                saved += s
                files += 1
    print(f"optimized {files} images, saved {saved/1e6:.1f} MB")


if __name__ == "__main__":
    main()
