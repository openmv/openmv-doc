"""Unit tests for .ci/rechannel.py.

A release is a copy of the dev build with the baked /dev/ channel rewritten to
/vX.Y.Z/. The rewrite must hit the canonical/og/hreflang/switcher URL forms but
leave content like /dev/ttyUSB0 in a code block alone.
"""


def test_rechannel_rewrites_abs_and_rel(load_ci, tmp_path):
    rc = load_ci("rechannel")
    page = tmp_path / "page.html"
    page.write_text(
        'a <link rel="canonical" href="https://docs.openmv.io/dev/x.html"> '
        'b <a href=/dev/en/y.html> '
        'c /dev/ttyUSB0 in a code block',
        encoding="utf-8")

    changed, scanned = rc.rechannel(str(tmp_path), "dev", "v5.0.0")

    out = page.read_text(encoding="utf-8")
    assert "docs.openmv.io/v5.0.0/x.html" in out          # absolute URL form
    assert "href=/v5.0.0/en/y.html" in out                # root-relative attr form
    assert "/dev/ttyUSB0 in a code block" in out          # bare content untouched
    assert (changed, scanned) == (1, 1)


def test_rechannel_only_scans_html_and_txt(load_ci, tmp_path):
    rc = load_ci("rechannel")
    (tmp_path / "data.json").write_text("docs.openmv.io/dev/", encoding="utf-8")
    changed, scanned = rc.rechannel(str(tmp_path), "dev", "v5.0.0")
    assert (changed, scanned) == (0, 0)


def test_rechannel_no_match_leaves_file_unchanged(load_ci, tmp_path):
    rc = load_ci("rechannel")
    (tmp_path / "page.txt").write_text("nothing to rewrite here", encoding="utf-8")
    changed, scanned = rc.rechannel(str(tmp_path), "dev", "v5.0.0")
    assert (changed, scanned) == (0, 1)
