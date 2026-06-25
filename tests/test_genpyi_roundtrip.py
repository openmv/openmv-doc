"""End-to-end test: a tiny RST module -> genpyi stubs -> verify_stubs.

This exercises the real pipeline (run_sphinx -> build_modules -> emit_pyi and
the verifier's stub parsing) on a fixture, rather than just the pure helpers.
The strongest assertion is that verify_stubs reports the generated stubs as a
faithful match of the documented API (returns 0).
"""
import ast
import sys

import genpyi
import verify_stubs

FIXTURE = """\
:mod:`foo` --- example module
=============================

.. module:: foo
   :synopsis: Example module.

An example module used by the test-suite.

.. function:: do(a, b=1) -> int

   Do a thing.

.. class:: Thing(x)

   A thing.

   .. method:: run(timeout=0) -> None

      Run it.

.. data:: FLAG
   :type: int

   A flag.
"""


def _write_fixture(docs_dir):
    docs_dir.mkdir(parents=True, exist_ok=True)
    (docs_dir / "foo.rst.txt").write_text(FIXTURE, encoding="utf-8")


def test_genpyi_roundtrip(tmp_path, monkeypatch):
    docs = tmp_path / "docs"
    pyi = tmp_path / "stubs"
    _write_fixture(docs)

    monkeypatch.setattr(
        sys, "argv",
        ["genpyi.py", "--docs-dir", str(docs), "--pyi-dir", str(pyi)])
    genpyi.main()

    stub_path = pyi / "foo.pyi"
    assert stub_path.exists()

    tree = ast.parse(stub_path.read_text(encoding="utf-8"))
    funcs = {n.name for n in tree.body if isinstance(n, ast.FunctionDef)}
    classes = {n.name: n for n in tree.body if isinstance(n, ast.ClassDef)}
    data = {n.target.id for n in tree.body
            if isinstance(n, ast.AnnAssign) and isinstance(n.target, ast.Name)}

    assert "do" in funcs
    assert "FLAG" in data
    assert "Thing" in classes
    methods = {n.name for n in classes["Thing"].body if isinstance(n, ast.FunctionDef)}
    assert "run" in methods

    # The generated stubs must verify as a faithful match of the documented API.
    monkeypatch.setattr(
        sys, "argv",
        ["verify_stubs.py", "--docs-dir", str(docs), "--pyi-dir", str(pyi)])
    assert verify_stubs.main() == 0
