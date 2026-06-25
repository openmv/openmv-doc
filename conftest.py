# Put the repository root on sys.path so the tooling under test (genpyi.py,
# verify_stubs.py) is importable from tests/ regardless of pytest's rootdir.
import importlib.util
import os
import sys

import pytest

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)


@pytest.fixture
def load_ci():
    """Load a .ci/<name>.py helper as a module.

    The .ci directory is not an importable package (leading dot, no __init__),
    so tests load its scripts by file path. Coverage still tracks them by their
    real path (see --cov=.ci)."""
    def _load(name):
        path = os.path.join(ROOT, ".ci", name + ".py")
        spec = importlib.util.spec_from_file_location("ci_" + name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    return _load
