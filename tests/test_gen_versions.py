"""Unit tests for .ci/gen_versions.py.

Builds the docs version switcher + root/latest redirects. A bug here breaks the
versioned-docs URLs (the dev/vX.Y.Z switch, the "/" and "/latest/" redirects).
"""
import json


def test_version_key(load_ci):
    gv = load_ci("gen_versions")
    assert gv.version_key("v5.0.1") == (5, 0, 1)
    assert gv.version_key("v4.8") == (4, 8)
    assert gv.version_key("dev") == ()


def test_compute_versions_orders_dev_current_legacy(load_ci):
    gv = load_ci("gen_versions")
    present = ["v5.0.0", "dev", "v5.1.0", "v4.8.1"]
    versions, latest = gv.compute_versions(present, {})
    assert [v["id"] for v in versions] == ["dev", "v5.1.0", "v5.0.0", "v4.8.1"]
    assert latest == "v5.1.0"
    label = next(v["label"] for v in versions if v["id"] == "v5.1.0")
    assert label == "v5.1.0 (latest)"


def test_compute_versions_no_release_yet(load_ci):
    gv = load_ci("gen_versions")
    versions, latest = gv.compute_versions(["dev"], {})
    assert [v["id"] for v in versions] == ["dev"]
    assert latest is None


def test_compute_versions_alias_is_never_latest(load_ci):
    gv = load_ci("gen_versions")
    versions, latest = gv.compute_versions(["dev", "v5.0.0"], {"v5.0.1": "v5.0.0"})
    # The alias sorts newest but must not become "latest"; the real folder does.
    assert latest == "v5.0.0"
    alias_entry = next(v for v in versions if v["id"] == "v5.0.1")
    assert alias_entry["snapshot"] == "v5.0.0"


def test_redirect_html(load_ci):
    gv = load_ci("gen_versions")
    html = gv.redirect_html("/latest/")
    assert "url=/latest/" in html
    assert "https://docs.openmv.io/latest/" in html


def test_main_writes_versions_and_redirects(load_ci, tmp_path):
    gv = load_ci("gen_versions")
    (tmp_path / "dev").mkdir()
    (tmp_path / "v5.0.0").mkdir()
    (tmp_path / "not-a-version").mkdir()  # ignored
    gv.main([str(tmp_path)])

    data = json.loads((tmp_path / "versions.json").read_text(encoding="utf-8"))
    assert data["latest"] == "v5.0.0"
    assert [v["id"] for v in data["versions"]] == ["dev", "v5.0.0"]
    assert (tmp_path / "index.html").exists()
    assert (tmp_path / "latest" / "index.html").exists()
