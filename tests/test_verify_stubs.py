"""Unit tests for the pure helpers in verify_stubs.py.

verify_stubs is the CI gate that fails the build when the generated .pyi stubs
drift from the documented API, so its signature-rendering must stay exact.
"""
import ast

import verify_stubs


def test_norm_strips_all_whitespace():
    assert verify_stubs.norm("  a  b\n") == "ab"
    assert verify_stubs.norm(None) == ""
    assert verify_stubs.norm("") == ""


def test_sig_str_full_grammar():
    fn = ast.parse("def f(a, b=1, /, c=2, *args, d, e=3, **kw) -> int: ...").body[0]
    assert verify_stubs.sig_str(fn.args, fn.returns) == (
        "(a, b = 1, /, c = 2, *args, d, e = 3, **kw) -> int")


def test_sig_str_no_return_annotation():
    fn = ast.parse("def f(): ...").body[0]
    assert verify_stubs.sig_str(fn.args, fn.returns) == "() -> "


def test_expected_sig_modernizes_return():
    assert verify_stubs.expected_sig("a, b=1", "Optional[int]", False) == (
        "(a, b = 1) -> int | None")


def test_expected_sig_method_default_return():
    # No params, no return: 'self' is prepended and the return defaults to Any.
    assert verify_stubs.expected_sig("", "", True) == "(self) -> Any"


def test_expected_sig_typed_param():
    assert verify_stubs.expected_sig("x: List[int]", "None", False) == (
        "(x: list[int]) -> None")
