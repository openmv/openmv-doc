#!/usr/bin/env python3
"""Report duplicate files (>= a size threshold) across the whole docs/ tree.

After the per-language dedup, the remaining large-file duplication is CROSS
VERSION: every frozen snapshot (docs/vX.Y.Z/) and the rolling docs/dev/ ship
their own copy of figures, downloads, and the hero video, many byte-identical
across versions. As quarterly releases pile up this grows without bound.

This is an ANALYSIS tool (read-only). It groups files >= --min-kb by content
hash, and prints the duplicate sets, the wasted bytes, and which top-level
docs/ subtrees (versions/channels) each set spans -- the input for deciding a
cross-version dedup strategy. It changes nothing.

Usage:
  find_dupes.py docs [--min-kb 128]
"""
import argparse
import collections
import hashlib
import os


def sha1(path, buf=1 << 20):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(buf), b""):
            h.update(chunk)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("root")
    ap.add_argument("--min-kb", type=int, default=128)
    ap.add_argument("--top", type=int, default=25, help="show N biggest dup sets")
    args = ap.parse_args()
    thresh = args.min_kb * 1024

    # group candidate files by size first (cheap), then hash within a size class
    by_size = collections.defaultdict(list)
    for dp, _, fs in os.walk(args.root):
        for fn in fs:
            ap_ = os.path.join(dp, fn)
            try:
                sz = os.path.getsize(ap_)
            except OSError:
                continue
            if sz >= thresh:
                by_size[sz].append(ap_)

    groups = collections.defaultdict(list)  # (sha,size) -> [paths]
    for sz, paths in by_size.items():
        if len(paths) < 2:
            continue
        for p in paths:
            groups[(sha1(p), sz)].append(p)

    dup_sets = {k: v for k, v in groups.items() if len(v) > 1}

    def top_seg(path):
        rel = os.path.relpath(path, args.root)
        return rel.split(os.sep)[0]

    total_waste = 0
    rows = []
    for (sha, sz), paths in dup_sets.items():
        waste = sz * (len(paths) - 1)
        total_waste += waste
        segs = sorted(set(top_seg(p) for p in paths))
        rows.append((waste, sz, len(paths), len(segs), paths[0], segs))
    rows.sort(reverse=True)

    print(f"=== duplicate files >= {args.min_kb} KB under {args.root} ===")
    print(f"{len(dup_sets)} duplicate sets, total wasted = {total_waste/1e6:.1f} MB "
          f"(content size if kept once vs every copy)")
    print()
    print(f"top {args.top} sets by wasted space:")
    for waste, sz, ncopy, nseg, sample, segs in rows[:args.top]:
        rel = os.path.relpath(sample, args.root)
        name = os.path.basename(rel)
        spans = ",".join(segs[:6]) + (" ..." if len(segs) > 6 else "")
        print(f"  {waste/1e6:6.1f} MB waste | {sz/1e6:5.1f} MB x{ncopy} copies "
              f"across {nseg} versions [{spans}] | {name}")

    # waste attributable purely to cross-version (same name in >1 top segment)
    cross = sum(w for w, sz, nc, nseg, s, segs in rows if nseg > 1)
    print()
    print(f"cross-version waste (sets spanning >1 top-level dir): {cross/1e6:.1f} MB")


if __name__ == "__main__":
    main()
