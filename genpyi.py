#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (C) 2026 OpenMV, LLC.
#
# Generates .pyi stub files from RST documentation using Sphinx.
# Runs a Sphinx build with the dummy builder, then extracts all Python
# domain objects (modules, functions, classes, methods, data) with their
# full signatures from the doctree.
#
# Usage:
#   python3 tools/genpyi.py \
#       --docs-dir openmv-doc/docs/_sources/library/ \
#       --pyi-dir openmv-ide/resources/stubs

import argparse
import keyword
import os
import re
import shutil
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

from docutils import nodes as docutils_nodes
from sphinx import addnodes
from sphinx.application import Sphinx


# ---------------------------------------------------------------------------
# Sphinx build
# ---------------------------------------------------------------------------

def render_list(node):
    """Render a bullet/enumerated list as tight '- item' lines, with an
    item's continuation lines indented under it."""
    items = []
    for li in node.children:
        if not isinstance(li, docutils_nodes.list_item):
            continue
        lines = [l.strip() for l in li.astext().strip().split("\n") if l.strip()]
        if lines:
            items.append("- " + lines[0] + "".join("\n  " + l for l in lines[1:]))
    return "\n".join(items)


def render_body_part(node):
    """Render one documentation body node as docstring text."""
    if isinstance(node, (docutils_nodes.bullet_list,
                         docutils_nodes.enumerated_list)):
        return render_list(node)
    if isinstance(node, docutils_nodes.block_quote):
        # An indented block; render its children individually so nested
        # lists and code keep their structure.
        parts = [render_body_part(child) for child in node.children]
        return "\n\n".join(p for p in parts if p)
    if isinstance(node, docutils_nodes.literal_block):
        # Keep example code, indented so it reads as a code block.
        code = node.astext().rstrip()
        return "\n".join("    " + line for line in code.split("\n")) if code else ""
    text = node.astext().strip()
    # Drop paragraphs holding unresolved substitution references (e.g.
    # |see_cpython_module|) -- the minimal conf.py used for this build does
    # not define the docs' substitutions.
    if text.startswith("|"):
        return ""
    return text


def run_sphinx(docs_dir):
    """Copy RST files, run Sphinx, return (domain objects, signatures)."""
    tmp = tempfile.mkdtemp()
    src = os.path.join(tmp, "src")
    out = os.path.join(tmp, "out")
    dtree = os.path.join(tmp, "dtree")
    os.makedirs(src)

    # Minimal conf.py
    with open(os.path.join(src, "conf.py"), "w", encoding="utf-8") as f:
        f.write("extensions = []\nsuppress_warnings = ['*']\n")

    # Copy .rst.txt files as .rst
    for rst in sorted(docs_dir.glob("*.rst.txt")):
        dst_name = rst.name[:-4]  # strip .txt
        shutil.copy(rst, os.path.join(src, dst_name))

    # Minimal index
    with open(os.path.join(src, "index.rst"), "w", encoding="utf-8") as f:
        f.write("X\n=\n\n")

    # Run Sphinx (suppress all output)
    app = Sphinx(src, src, out, dtree, "dummy",
                 status=None, warning=None)
    app.build()

    # Collect domain objects
    py = app.env.get_domain("py")
    objects = {}
    module_docnames = {}
    for name, entry in py.objects.items():
        objects[name] = entry.objtype
        if entry.objtype == "module":
            module_docnames[name] = entry.docname

    # Prune ".. only::" subtrees whose condition does not hold for this build
    # (e.g. port_pyboard content like pyb.LED.intensity, which the rendered
    # documentation excludes). The unresolved doctrees from get_doctree()
    # still carry that content; the html build filters it during resolve.
    # Objects defined only inside pruned subtrees are dropped from the domain
    # object set too, so they are not reported as missing later.
    def prune_only_nodes(doctree):
        pruned_fqns = set()
        for only_node in list(doctree.findall(addnodes.only)):
            try:
                keep = app.tags.eval_condition(only_node["expr"])
            except Exception:
                keep = False
            if keep:
                continue
            for sig_node in only_node.findall(addnodes.desc_signature):
                module = sig_node.get("module", "")
                fullname = sig_node.get("fullname", "")
                if fullname:
                    pruned_fqns.add(f"{module}.{fullname}" if module else fullname)
            only_node.parent.remove(only_node)
        return pruned_fqns

    # Walk doctrees for signatures and docstrings. A single directive can
    # carry multiple stacked signatures (overloaded callables / constructors),
    # so each fqn maps to a *list* of raw signatures.
    sigs = {}  # fullname -> (objtype, [raw signatures], docstring)
    all_pruned = set()
    for docname in sorted(app.env.found_docs):
        if docname == "index":
            continue
        doctree = app.env.get_doctree(docname)
        all_pruned |= prune_only_nodes(doctree)
        for node in doctree.findall(addnodes.desc):
            objtype = node.get("objtype", "")
            # Extract this node's own docstring only -- stop at the first
            # nested desc (method/attribute) so a class's docstring doesn't
            # absorb its members' bodies.
            doc = ""
            for child in node.children:
                if isinstance(child, addnodes.desc_content):
                    parts = []
                    for sub in child.children:
                        # Stop at the first nested object OR subsection: a
                        # section like "Methods" holds the members' own
                        # directives, whose text must not be absorbed into
                        # this object's docstring.
                        if isinstance(sub, (addnodes.desc, docutils_nodes.section)):
                            break
                        text = render_body_part(sub)
                        if text:
                            parts.append(text)
                    # Blank lines between the body's paragraphs, matching the
                    # rendered documentation's layout.
                    doc = "\n\n".join(parts).strip()
                    break

            # Group all signatures in this directive by their fqn (stacked
            # signatures share both fqn and docstring).
            by_fqn = {}  # fqn -> [raw, ...]
            for sig_node in node.children:
                if not isinstance(sig_node, addnodes.desc_signature):
                    continue
                module = sig_node.get("module", "")
                fullname = sig_node.get("fullname", "")
                if not fullname:
                    continue
                fqn = f"{module}.{fullname}" if module else fullname
                by_fqn.setdefault(fqn, []).append(sig_node.astext())

            for fqn, raws in by_fqn.items():
                if fqn not in sigs:
                    sigs[fqn] = (objtype, list(raws), doc)
                    continue
                # Prefer a real method directive over a class-level placeholder
                # that Sphinx sometimes emits. Otherwise merge new signatures
                # in.
                existing_objtype, existing_raws, existing_doc = sigs[fqn]
                if objtype == "method" and existing_objtype != "method":
                    sigs[fqn] = (objtype, list(raws), doc)
                else:
                    merged = list(existing_raws)
                    for raw in raws:
                        if raw not in merged:
                            merged.append(raw)
                    sigs[fqn] = (existing_objtype, merged, existing_doc)

    # Module docstrings: the intro paragraphs of each module's page, i.e.
    # everything in the first section before the first subsection or
    # documented object.
    module_docs = {}
    for mod_name, docname in module_docnames.items():
        if docname not in app.env.found_docs:
            continue
        doctree = app.env.get_doctree(docname)
        prune_only_nodes(doctree)
        section = next(doctree.findall(docutils_nodes.section), None)
        if section is None:
            continue
        parts = []
        for child in section.children:
            if isinstance(child, (addnodes.desc, docutils_nodes.section)):
                break
            if isinstance(child, (docutils_nodes.paragraph,
                                  docutils_nodes.bullet_list,
                                  docutils_nodes.enumerated_list,
                                  docutils_nodes.block_quote,
                                  docutils_nodes.literal_block)):
                text = render_body_part(child)
                if text:
                    parts.append(text)
        if parts:
            module_docs[mod_name] = "\n\n".join(parts)

    # Drop objects that only existed inside pruned ".. only::" subtrees.
    for fqn in all_pruned:
        if fqn not in sigs:
            objects.pop(fqn, None)

    shutil.rmtree(tmp)
    return objects, sigs, module_docs


# ---------------------------------------------------------------------------
# Parse signatures
# ---------------------------------------------------------------------------

def valid_identifier(name):
    """True if `name` is a usable Python identifier (not a keyword)."""
    return bool(name) and name.isidentifier() and not keyword.iskeyword(name)


def sanitize_params(params):
    """Drop a bare ``*`` separator that no keyword-only parameter follows.

    Some docs spell a kwargs-only method as ``f(*, **kwargs)``; in Python a
    bare ``*`` is only legal when at least one keyword-only parameter (not
    ``**kwargs``) follows it. Strip the lone ``*`` so the emitted stub parses.
    """
    if not params:
        return params
    toks = [t.strip() for t in _split_top_level(params, ",")]
    if "*" in toks:
        i = toks.index("*")
        rest = toks[i + 1:]
        if not rest or all(t.startswith("**") for t in rest):
            toks.pop(i)
    return ", ".join(t for t in toks if t)


def parse_attr_sig(raw):
    """Parse a data/attribute signature ('name' or 'name: type').

    Returns (name, type_str). ``type_str`` is empty when the source did
    not specify a ``:type:`` annotation.
    """
    raw = raw.strip()
    name_part, sep, type_ = raw.partition(":")
    name = name_part.strip().rsplit(".", 1)[-1]
    return name, type_.strip() if sep else ""


def parse_sig(raw):
    """Parse 'name(params) -> ret' from Sphinx signature text.

    Returns (name, params_str, return_type).
    """
    # Strip leading 'class ' prefix
    raw = raw.strip()
    if raw.startswith("class "):
        raw = raw[6:]

    # Strip module/class prefix: 'module.Class.method(...)' -> 'method(...)'
    paren = raw.find("(")
    if paren == -1:
        name = raw.rsplit(".", 1)[-1] if "." in raw else raw
        return name, "", "Any"

    prefix = raw[:paren]
    name = prefix.rsplit(".", 1)[-1] if "." in prefix else prefix

    # Find matching close paren
    depth = 0
    end = paren
    for i in range(paren, len(raw)):
        if raw[i] == "(":
            depth += 1
        elif raw[i] == ")":
            depth -= 1
            if depth == 0:
                end = i
                break

    params = raw[paren + 1:end].strip()
    rest = raw[end + 1:].strip()

    ret = "Any"
    if rest.startswith("->"):
        ret = rest[2:].strip()

    return name, sanitize_params(params), ret


# ---------------------------------------------------------------------------
# Build module data
# ---------------------------------------------------------------------------

def build_modules(objects, sigs, module_docs=None):
    """Organize domain objects into per-module data structures."""
    modules = defaultdict(lambda: {
        "doc": "",
        "functions": [],
        "classes": defaultdict(lambda: {"overloads": [], "doc": "", "methods": []}),
        "constants": [],
        "exceptions": [],
    })

    skipped = []  # fully-qualified names dropped (not valid Python identifiers)

    # Collect known module names first
    known_modules = {fqn for fqn, ot in objects.items() if ot == "module"}

    def resolve_module(parts):
        """Find the longest prefix that is a known module."""
        for i in range(len(parts) - 1, 0, -1):
            candidate = ".".join(parts[:i])
            if candidate in known_modules:
                return candidate, parts[i:]
        return "", parts

    for fqn, objtype in sorted(objects.items()):
        parts = fqn.split(".")
        if objtype == "module":
            modules[fqn]["doc"] = (module_docs or {}).get(fqn, "")
            continue

        if objtype == "function":
            mod, rest = resolve_module(parts)
            fname = rest[-1]
            if not valid_identifier(fname):
                skipped.append(fqn)
                continue
            if fqn in sigs:
                overloads = [parse_sig(raw)[1:] for raw in sigs[fqn][1]]
                doc = sigs[fqn][2]
            else:
                overloads = [("", "Any")]
                doc = ""
            modules[mod]["functions"].append((fname, overloads, doc))

        elif objtype == "class":
            mod, rest = resolve_module(parts)
            cname = rest[-1]
            if not valid_identifier(cname):
                skipped.append(fqn)
                continue
            if fqn in sigs:
                # For classes the "ret" half of parse_sig is meaningless;
                # we only need the constructor params list.
                overloads = [parse_sig(raw)[1] for raw in sigs[fqn][1]]
                doc = sigs[fqn][2]
            else:
                overloads = [""]
                doc = ""
            modules[mod]["classes"][cname]["overloads"] = overloads
            modules[mod]["classes"][cname]["doc"] = doc

        elif objtype == "method":
            mod, rest = resolve_module(parts)
            if len(rest) >= 2:
                cname = rest[-2]
                mname = rest[-1]
            else:
                continue
            if not (valid_identifier(cname) and valid_identifier(mname)):
                skipped.append(fqn)
                continue
            if fqn in sigs:
                overloads = [parse_sig(raw)[1:] for raw in sigs[fqn][1]]
                doc = sigs[fqn][2]
            else:
                overloads = [("", "Any")]
                doc = ""
            modules[mod]["classes"][cname]["methods"].append(
                (mname, overloads, doc)
            )

        elif objtype == "exception":
            mod, rest = resolve_module(parts)
            ename = rest[-1]
            if not valid_identifier(ename):
                skipped.append(fqn)
                continue
            doc = sigs[fqn][2] if fqn in sigs else ""
            modules[mod]["exceptions"].append((ename, doc))

        elif objtype in ("data", "attribute"):
            mod, rest = resolve_module(parts)
            doc = ""
            attr_type = ""
            if fqn in sigs:
                doc = sigs[fqn][2]
                if sigs[fqn][1]:
                    _, attr_type = parse_attr_sig(sigs[fqn][1][0])
            if objtype == "attribute" and len(rest) >= 2:
                # Class attribute (e.g. Model.len)
                cname = rest[-2]
                aname = rest[-1]
                if not (valid_identifier(cname) and valid_identifier(aname)):
                    skipped.append(fqn)
                    continue
                if "attrs" not in modules[mod]["classes"][cname]:
                    modules[mod]["classes"][cname]["attrs"] = []
                modules[mod]["classes"][cname]["attrs"].append((aname, doc, attr_type))
            else:
                dname = rest[-1]
                if not valid_identifier(dname):
                    skipped.append(fqn)
                    continue
                modules[mod]["constants"].append((dname, doc, attr_type))

    # Move empty-string module to "builtins", filtering out
    # non-builtin objects that lack a .. module:: directive.
    BUILTIN_NAMES = {
        "abs", "all", "any", "bin", "callable", "chr", "classmethod",
        "compile", "delattr", "dir", "divmod", "enumerate", "eval",
        "exec", "filter", "getattr", "globals", "hasattr", "hash",
        "hex", "id", "input", "isinstance", "issubclass", "iter",
        "len", "locals", "map", "max", "min", "next", "oct", "open",
        "ord", "pow", "print", "property", "range", "repr",
        "reversed", "round", "setattr", "sorted", "staticmethod",
        "sum", "super", "type", "zip",
        "bool", "bytearray", "bytes", "complex", "dict", "float",
        "frozenset", "int", "list", "memoryview", "object", "set",
        "slice", "str", "tuple",
        "AssertionError", "AssertionError", "AttributeError",
        "Exception", "ImportError", "IndexError", "KeyError",
        "KeyboardInterrupt", "MemoryError", "NameError",
        "NotImplementedError", "OSError", "RuntimeError",
        "StopIteration", "SyntaxError", "SystemExit", "TypeError",
        "ValueError", "ZeroDivisionError",
    }
    if "" in modules:
        orphans = modules.pop("")
        filtered = {
            "functions": [(n, ov, d) for n, ov, d in orphans["functions"]
                          if n in BUILTIN_NAMES],
            "classes": defaultdict(
                lambda: {"overloads": [], "doc": "", "methods": []},
                {k: v for k, v in orphans["classes"].items()
                 if k in BUILTIN_NAMES},
            ),
            "constants": [(n, d, t) for n, d, t in orphans["constants"]
                          if n in BUILTIN_NAMES],
            "exceptions": [(n, d) for n, d in orphans["exceptions"]
                           if n in BUILTIN_NAMES],
        }
        if "builtins" in modules:
            modules["builtins"]["functions"].extend(filtered["functions"])
            modules["builtins"]["constants"].extend(filtered["constants"])
            modules["builtins"]["exceptions"].extend(filtered["exceptions"])
            for k, v in filtered["classes"].items():
                modules["builtins"]["classes"][k] = v
        else:
            modules["builtins"] = filtered

    # A module-level name cannot be both a function and a class in Python.
    # The MicroPython docs sometimes document a callable and its result
    # type under one lowercase name (re.match(), select.poll()). Keep the
    # function -- the call is the primary API -- and drop the shadowed class.
    for mname, m in modules.items():
        fnames = {n for n, *_ in m["functions"]}
        for cname in [c for c in m["classes"] if c in fnames]:
            del m["classes"][cname]
            skipped.append(f"{mname}.{cname} (class shadowed by same-named function)")

    return dict(modules), skipped


# ---------------------------------------------------------------------------
# .pyi emission
# ---------------------------------------------------------------------------

def find_module_refs(module, all_module_names):
    """Find cross-module type references in all signatures."""
    refs = set()
    mod_name = module.get("_name", "")
    sigs = []
    for _, overloads, _doc in module["functions"]:
        for params, ret in overloads:
            sigs.append(params)
            sigs.append(ret)
    for cls in module["classes"].values():
        for params in cls.get("overloads", []):
            sigs.append(params)
        for _, overloads, _doc in cls["methods"]:
            for params, ret in overloads:
                sigs.append(params)
                sigs.append(ret)
    blob = " ".join(sigs)
    for name in all_module_names:
        if name and name != mod_name and name + "." in blob:
            refs.add(name)
    return sorted(refs)


def format_docstring(doc, indent=0):
    """Format a docstring with proper indentation for .pyi emission."""
    if not doc:
        return []
    prefix = " " * indent
    doc = doc.replace('"""', "'''")
    # RST artifacts (\ escaped-space, \pi, \<n>, ...) leak into astext().
    # Emit a raw string when a backslash is present so the literal stays
    # valid and warning-free; a string still cannot end with a backslash.
    q = 'r"""' if "\\" in doc else '"""'
    lines = doc.split("\n")
    if len(lines) == 1:
        body = lines[0].rstrip("\\")
        if body.endswith('"'):
            body += " "
        return [f"{prefix}{q}{body}\"\"\""]
    result = [f"{prefix}{q}"]
    for line in lines:
        # Preserve leading whitespace (indented example code); only trailing
        # whitespace is dropped.
        result.append(f"{prefix}{line.rstrip()}" if line.strip() else "")
    # The last non-empty content line must not end with a backslash.
    for idx in range(len(result) - 1, 0, -1):
        if result[idx].strip():
            result[idx] = result[idx].rstrip("\\")
            break
    result.append(f'{prefix}"""')
    return result


# Names from `typing` we may need to import. Imports are emitted only for
# names actually referenced in the module's signatures.
TYPING_NAMES = (
    "Any", "Awaitable", "Callable", "Coroutine", "Dict", "FrozenSet",
    "Generator", "Iterable", "Iterator", "List", "Mapping", "Optional",
    "Sequence", "Set", "Tuple", "Type", "Union", "overload",
)


def _replace_generic(s, name, transform):
    """Replace `name[...]` (balanced brackets) by transform of inner."""
    out = []
    i = 0
    pat = re.compile(rf"\b{re.escape(name)}\[")
    while i < len(s):
        m = pat.search(s, i)
        if not m:
            out.append(s[i:])
            break
        out.append(s[i:m.start()])
        depth = 1
        j = m.end()
        while j < len(s) and depth > 0:
            if s[j] == "[":
                depth += 1
            elif s[j] == "]":
                depth -= 1
            j += 1
        inner = _modernize_types(s[m.end():j - 1].strip())
        out.append(transform(inner))
        i = j
    return "".join(out)


def _modernize_types(s):
    """Rewrite typing-module forms as PEP 604 / lowercase-builtin generics.

    The bundled pyright-browser (v1.1.299) does not resolve `typing.Optional`,
    `typing.List`, etc. against the in-memory file system used by the studio,
    so anything wrapped in those aliases hovers as `Unknown`. PEP 604 unions
    (`X | None`) and lowercase-builtin subscripts (`list[X]`) sidestep the
    issue while remaining valid in any modern Python type checker.
    """
    if not s:
        return s
    s = _replace_generic(s, "Optional", lambda inner: f"{inner} | None")
    s = _replace_generic(
        s, "Union",
        lambda inner: " | ".join(p.strip() for p in _split_top_level(inner, ",")),
    )
    s = re.sub(r"\bList\b", "list", s)
    s = re.sub(r"\bTuple\b", "tuple", s)
    s = re.sub(r"\bDict\b", "dict", s)
    s = re.sub(r"\bSet\b", "set", s)
    s = re.sub(r"\bFrozenSet\b", "frozenset", s)
    s = re.sub(r"\bType\b", "type", s)
    return s


def _modernize_module(module):
    """Apply `_modernize_types` to all signatures stored in `module`."""
    module["functions"] = [
        (n, [(_modernize_types(p), _modernize_types(r)) for p, r in overloads], d)
        for n, overloads, d in module["functions"]
    ]
    for cls in module["classes"].values():
        cls["overloads"] = [
            _modernize_types(p) for p in cls.get("overloads", [])
        ]
        cls["methods"] = [
            (n, [(_modernize_types(p), _modernize_types(r)) for p, r in overloads], d)
            for n, overloads, d in cls["methods"]
        ]


def _collect_typing_names(module):
    """Return the set of typing names referenced in the module's signatures."""
    used = set()
    blobs = []
    has_overloads = False
    for _, overloads, _ in module["functions"]:
        if len(overloads) > 1:
            has_overloads = True
        for params, ret in overloads:
            blobs.append(params)
            blobs.append(ret)
    for cls in module["classes"].values():
        if len(cls.get("overloads", [])) > 1:
            has_overloads = True
        for params in cls.get("overloads", []):
            blobs.append(params)
        for _, overloads, _ in cls["methods"]:
            if len(overloads) > 1:
                has_overloads = True
            for params, ret in overloads:
                blobs.append(params)
                blobs.append(ret)
    text = " ".join(blobs)
    for name in TYPING_NAMES:
        if re.search(rf"\b{name}\b", text):
            used.add(name)
    # `Any` is emitted unconditionally for class attributes (`name: Any`).
    used.add("Any")
    if has_overloads:
        used.add("overload")
    return used


def _split_top_level(s, sep):
    """Split s on sep at bracket/paren depth 0."""
    parts = []
    depth = 0
    last = 0
    for i, ch in enumerate(s):
        if ch in "([{":
            depth += 1
        elif ch in ")]}":
            depth -= 1
        elif ch == sep and depth == 0:
            parts.append(s[last:i])
            last = i + 1
    parts.append(s[last:])
    return parts


def _emit_callable(lines, name, overloads, doc, indent, is_method):
    """Emit a function or method, using ``@overload`` if more than one signature.

    Stub conventions: when overloaded, every signature is prefixed with
    ``@overload`` and the docstring is attached to the last overload so that
    Pyright/Pylance pick it up in hover.
    """
    prefix = " " * indent
    body_indent = indent + 4
    if not overloads:
        overloads = [("", "Any")]
    overloaded = len(overloads) > 1
    self_arg = "self" if is_method else ""

    def _sig_line(params, ret):
        if is_method:
            args = f"self, {params}" if params else "self"
        else:
            args = params
        return f"{prefix}def {name}({args}) -> {ret}:"

    if overloaded:
        for i, (params, ret) in enumerate(overloads):
            lines.append(f"{prefix}@overload")
            lines.append(_sig_line(params, ret))
            if i == len(overloads) - 1:
                ds = format_docstring(doc, indent=body_indent)
                if ds:
                    lines.extend(ds)
            lines.append(f"{' ' * body_indent}...")
    else:
        params, ret = overloads[0]
        lines.append(_sig_line(params, ret))
        ds = format_docstring(doc, indent=body_indent)
        if ds:
            lines.extend(ds)
        lines.append(f"{' ' * body_indent}...")


def emit_pyi(mod_name, module, out_path, all_module_names):
    """Write a .pyi stub file for one module."""
    module["_name"] = mod_name
    _modernize_module(module)
    refs = find_module_refs(module, all_module_names)

    lines = []
    lines.append("# Auto-generated by tools/genpyi.py -- do not edit")
    module_doc = format_docstring(module.get("doc", ""), indent=0)
    if module_doc:
        lines.extend(module_doc)
        lines.append("")
    typing_used = sorted(_collect_typing_names(module))
    lines.append(f"from typing import {', '.join(typing_used)}")
    for ref in refs:
        lines.append(f"import {ref}")
    lines.append("")

    for name, doc, ctype in module["constants"]:
        lines.append(f"{name}: {ctype or 'int'}")
        lines.extend(format_docstring(doc, indent=0))

    if module["constants"]:
        lines.append("")

    for name, overloads, doc in module["functions"]:
        _emit_callable(lines, name, overloads, doc, indent=0, is_method=False)

    if module["functions"]:
        lines.append("")

    for ename, doc in module.get("exceptions", []):
        lines.append(f"class {ename}(Exception):")
        ds = format_docstring(doc, indent=4)
        if ds:
            lines.extend(ds)
            lines.append("    ...")
        else:
            lines.append("    ...")

    if module.get("exceptions"):
        lines.append("")

    for cls_name, cls in sorted(module["classes"].items()):
        lines.append(f"class {cls_name}:")
        lines.extend(format_docstring(cls.get("doc", ""), indent=4))

        ctor_overloads = cls.get("overloads", [""]) or [""]
        if len(ctor_overloads) > 1:
            for ctor in ctor_overloads:
                lines.append("    @overload")
                if ctor:
                    lines.append(f"    def __init__(self, {ctor}) -> None: ...")
                else:
                    lines.append("    def __init__(self) -> None: ...")
        else:
            ctor = ctor_overloads[0]
            if ctor:
                lines.append(f"    def __init__(self, {ctor}) -> None: ...")
            else:
                lines.append("    def __init__(self) -> None: ...")

        for aname, adoc, atype in cls.get("attrs", []):
            lines.append(f"    {aname}: {atype or 'Any'}")
            lines.extend(format_docstring(adoc, indent=4))

        for mname, overloads, doc in cls["methods"]:
            _emit_callable(lines, mname, overloads, doc, indent=4, is_method=True)

        lines.append("")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(
        description="Generate .pyi stubs from RST documentation."
    )
    ap.add_argument(
        "--docs-dir", type=Path, required=True,
        help="RST docs directory (e.g. openmv-doc/docs/_sources/library/)",
    )
    ap.add_argument(
        "--pyi-dir", type=Path, required=True,
        help="Output directory for .pyi stubs (recreated from scratch)",
    )
    args = ap.parse_args()

    if not args.docs_dir.exists():
        print(f"Error: {args.docs_dir} not found", file=sys.stderr)
        sys.exit(1)

    print("Running Sphinx build...", file=sys.stderr)
    objects, sigs, module_docs = run_sphinx(args.docs_dir)
    modules, skipped = build_modules(objects, sigs, module_docs)
    if skipped:
        print(
            f"Warning: skipped {len(skipped)} object(s) that cannot be "
            f"represented in a stub (invalid Python identifier, or a class "
            f"shadowed by a same-named function): "
            f"{', '.join(sorted(skipped))}",
            file=sys.stderr,
        )

    # Clean output directory
    pyi_dir = args.pyi_dir
    if pyi_dir.exists():
        shutil.rmtree(pyi_dir)
    pyi_dir.mkdir(parents=True)

    all_mod_names = set(modules.keys())

    # Identify which modules are packages (have submodules)
    packages = set()
    for name in modules:
        parts = name.split(".")
        for i in range(1, len(parts)):
            packages.add(".".join(parts[:i]))

    # Write stubs
    for name, mod in sorted(modules.items()):
        if not name:
            continue
        parts = name.split(".")
        if name in packages:
            # This module is a package -- write to name/__init__.pyi
            pkg_dir = pyi_dir / Path(*parts)
            pkg_dir.mkdir(parents=True, exist_ok=True)
            out_path = pkg_dir / "__init__.pyi"
        elif len(parts) > 1:
            pkg_dir = pyi_dir / Path(*parts[:-1])
            pkg_dir.mkdir(parents=True, exist_ok=True)
            out_path = pkg_dir / (parts[-1] + ".pyi")
        else:
            out_path = pyi_dir / (name + ".pyi")

        emit_pyi(name, mod, out_path, all_mod_names)

    # PEP 561 stub-only packages: for modules whose names collide with the
    # CPython standard library (time, os, struct, ...), type checkers and
    # language servers prefer their bundled typeshed stubs over a plain
    # name.pyi on the search path - so MicroPython-specific members like
    # time.ticks_ms() would not resolve. A "name-stubs" package takes
    # precedence over typeshed, restoring the documented API. "builtins" is
    # excluded: replacing the real builtins stubs would break inference of
    # int/str/object themselves.
    stdlib_names = getattr(sys, "stdlib_module_names", frozenset())
    for entry in sorted(pyi_dir.iterdir()):
        base = entry.name[:-4] if entry.suffix == ".pyi" else entry.name
        if (base not in stdlib_names) or (base == "builtins"):
            continue
        alias = pyi_dir / (base + "-stubs")
        if entry.is_dir():
            shutil.copytree(entry, alias)
        else:
            alias.mkdir()
            shutil.copy(entry, alias / "__init__.pyi")

    nf = sum(len(m["functions"]) for m in modules.values())
    nc = sum(len(m["classes"]) for m in modules.values())
    nm = sum(
        sum(len(c["methods"]) for c in m["classes"].values())
        for m in modules.values()
    )
    nk = sum(len(m.get("constants", [])) for m in modules.values())
    print(
        f"Done: {len(modules)} modules, {nf} functions, "
        f"{nc} classes, {nm} methods, {nk} constants"
    )


if __name__ == "__main__":
    sys.exit(main())
