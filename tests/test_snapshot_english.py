"""Unit tests for .ci/snapshot_english.py.

Reduces non-latest release snapshots (and the offline IDE bundle) to English
and hides the navs they no longer need. A bug here ships the wrong languages or
a broken offline bundle to the desktop apps.
"""
import json
import types


def test_version_key(load_ci):
    se = load_ci("snapshot_english")
    assert se.version_key("v5.0.1") == (5, 0, 1)


def test_strip_langs_removes_only_locales(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    (tmp_path / "de").mkdir()
    (tmp_path / "fr").mkdir()
    (tmp_path / "_static").mkdir()
    n = se.strip_langs(str(tmp_path), ["de", "fr", "ja"])  # ja absent
    assert n == 2
    assert not (tmp_path / "de").exists()
    assert not (tmp_path / "fr").exists()
    assert (tmp_path / "_static").exists()  # non-locale dir kept


def test_hide_switchers_appends_and_is_idempotent(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    static = tmp_path / "_static"
    static.mkdir()
    css = static / "custom.css"
    css.write_text("body{}", encoding="utf-8")

    assert se.hide_switchers(str(tmp_path), hide_versions=True) is True
    txt = css.read_text(encoding="utf-8")
    assert se.MARK in txt
    assert ".nav-languages{display:none!important}" in txt
    assert ".nav-versions{display:none!important}" in txt

    # Second call is a marker-guarded no-op.
    assert se.hide_switchers(str(tmp_path), hide_versions=True) is False


def test_hide_switchers_missing_css(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    assert se.hide_switchers(str(tmp_path), hide_versions=False) is False


def test_neutralize_redirect(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    static = tmp_path / "_static"
    static.mkdir()
    js = static / "lang-redirect.js"
    js.write_text("location.replace('/de/')", encoding="utf-8")
    se.neutralize_redirect(str(tmp_path))
    assert js.read_text(encoding="utf-8") == se.NOOP_JS


def test_make_offline(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    rel = tmp_path / "release"
    (rel / "_static").mkdir(parents=True)
    (rel / "_static" / "custom.css").write_text("x", encoding="utf-8")
    (rel / "index.html").write_text("<html>", encoding="utf-8")
    (rel / "de").mkdir()  # language subdir -> excluded from the bundle
    (rel / "_sources").mkdir()
    (rel / "_sources" / "a.txt").write_text("s", encoding="utf-8")
    (rel / "llms.txt").write_text("x", encoding="utf-8")
    stubs = tmp_path / "stubs"
    stubs.mkdir()
    (stubs / "foo.pyi").write_text("x", encoding="utf-8")
    out = tmp_path / "offline"

    se.make_offline(str(rel), str(out), ["de"], stubs_dir=str(stubs))

    assert (out / "index.html").exists()
    assert not (out / "de").exists()             # language subdir excluded
    assert (out / "_sources" / "a.txt").exists()  # _sources kept (Studio reads it)
    assert not (out / "llms.txt").exists()        # llms dropped
    assert (out / "stubs" / "foo.pyi").exists()   # prebuilt stubs added
    css = (out / "_static" / "custom.css").read_text(encoding="utf-8")
    assert se.MARK in css and ".nav-versions" in css  # both switchers hidden


def test_cmd_reconcile_demotes_only_non_latest_current(load_ci, tmp_path):
    se = load_ci("snapshot_english")
    docs = tmp_path / "docs"
    docs.mkdir()
    locales = tmp_path / "locale"
    (locales / "de").mkdir(parents=True)
    (docs / "versions.json").write_text(json.dumps({"latest": "v5.1.0"}), encoding="utf-8")
    for name in ("dev", "v5.1.0", "v5.0.0", "v4.8.1"):
        snap = docs / name
        (snap / "_static").mkdir(parents=True)
        (snap / "_static" / "custom.css").write_text("x", encoding="utf-8")
        (snap / "de").mkdir()

    se.cmd_reconcile(types.SimpleNamespace(docs=str(docs), locales_dir=str(locales)))

    assert (docs / "dev" / "de").exists()       # dev stays full
    assert (docs / "v5.1.0" / "de").exists()    # latest stays full
    assert not (docs / "v5.0.0" / "de").exists()  # previous latest demoted
    assert (docs / "v4.8.1" / "de").exists()    # legacy v4.x untouched
