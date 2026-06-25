"""Unit tests for the pure parsing/formatting helpers in genpyi.py.

genpyi turns the documented Python API (RST) into the .pyi stubs shipped to
users, so a regression here ships wrong signatures/autocomplete. These cover
the signature parsing and the typing-modernization logic without needing a
real Sphinx build.
"""
import genpyi


def test_valid_identifier():
    assert genpyi.valid_identifier("foo")
    assert genpyi.valid_identifier("_x1")
    assert not genpyi.valid_identifier("")
    assert not genpyi.valid_identifier("class")  # reserved keyword
    assert not genpyi.valid_identifier("1x")
    assert not genpyi.valid_identifier("a-b")


def test_parse_sig_qualified_method():
    assert genpyi.parse_sig("sensor.Camera.snapshot(timeout=0) -> Image") == (
        "snapshot", "timeout=0", "Image")


def test_parse_sig_class_prefix_and_default_return():
    assert genpyi.parse_sig("class image.Image(path)") == ("Image", "path", "Any")


def test_parse_sig_no_parens():
    assert genpyi.parse_sig("module.thing") == ("thing", "", "Any")


def test_parse_sig_nested_brackets():
    # The comma inside the tuple default must not end the parameter list.
    assert genpyi.parse_sig("f(a, b=(1, 2)) -> None") == ("f", "a, b=(1, 2)", "None")


def test_parse_attr_sig():
    assert genpyi.parse_attr_sig("machine.FREQ: int") == ("FREQ", "int")
    assert genpyi.parse_attr_sig("FREQ") == ("FREQ", "")


def test_sanitize_params_drops_bare_star():
    # A lone '*' with only **kwargs after it is illegal in Python -- drop it.
    assert genpyi.sanitize_params("*, **kwargs") == "**kwargs"


def test_sanitize_params_keeps_kwonly_separator():
    assert genpyi.sanitize_params("*, x") == "*, x"
    assert genpyi.sanitize_params("a, b") == "a, b"
    assert genpyi.sanitize_params("") == ""


def test_split_top_level_respects_brackets():
    assert genpyi._split_top_level("a, b[c, d], e", ",") == ["a", " b[c, d]", " e"]


def test_modernize_types_basics():
    assert genpyi._modernize_types("Optional[int]") == "int | None"
    assert genpyi._modernize_types("List[int]") == "list[int]"
    assert genpyi._modernize_types("Union[int, str]") == "int | str"
    assert genpyi._modernize_types("Dict[str, int]") == "dict[str, int]"
    assert genpyi._modernize_types("") == ""


def test_modernize_types_nested():
    assert genpyi._modernize_types("Optional[List[int]]") == "list[int] | None"
