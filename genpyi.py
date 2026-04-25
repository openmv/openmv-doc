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
import os
import re
import shutil
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

from sphinx import addnodes
from sphinx.application import Sphinx


# ---------------------------------------------------------------------------
# Sphinx build
# ---------------------------------------------------------------------------

def run_sphinx(docs_dir):
    """Copy RST files, run Sphinx, return (domain objects, signatures)."""
    tmp = tempfile.mkdtemp()
    src = os.path.join(tmp, "src")
    out = os.path.join(tmp, "out")
    dtree = os.path.join(tmp, "dtree")
    os.makedirs(src)

    # Minimal conf.py
    with open(os.path.join(src, "conf.py"), "w") as f:
        f.write("extensions = []\nsuppress_warnings = ['*']\n")

    # Copy .rst.txt files as .rst
    for rst in sorted(docs_dir.glob("*.rst.txt")):
        dst_name = rst.name[:-4]  # strip .txt
        shutil.copy(rst, os.path.join(src, dst_name))

    # Minimal index
    with open(os.path.join(src, "index.rst"), "w") as f:
        f.write("X\n=\n\n")

    # Run Sphinx (suppress all output)
    app = Sphinx(src, src, out, dtree, "dummy",
                 status=None, warning=None)
    app.build()

    # Collect domain objects
    py = app.env.get_domain("py")
    objects = {}
    for name, entry in py.objects.items():
        objects[name] = entry.objtype

    # Walk doctrees for signatures
    sigs = {}  # fullname -> raw signature text
    for docname in sorted(app.env.found_docs):
        if docname == "index":
            continue
        doctree = app.env.get_doctree(docname)
        for node in doctree.findall(addnodes.desc):
            objtype = node.get("objtype", "")
            for sig_node in node.findall(addnodes.desc_signature):
                module = sig_node.get("module", "")
                fullname = sig_node.get("fullname", "")
                if not fullname:
                    continue
                fqn = f"{module}.{fullname}" if module else fullname
                raw = sig_node.astext()
                # Prefer method signatures over class-level duplicates
                if fqn not in sigs or objtype == "method":
                    sigs[fqn] = (objtype, raw)

    shutil.rmtree(tmp)
    return objects, sigs


# ---------------------------------------------------------------------------
# Parse signatures
# ---------------------------------------------------------------------------

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
        # Normalize Optional
        if ret.endswith("| None"):
            inner = ret[:-len("| None")].strip()
            ret = f"Optional[{inner}]"

    return name, params, ret


# ---------------------------------------------------------------------------
# Build module data
# ---------------------------------------------------------------------------

def build_modules(objects, sigs):
    """Organize domain objects into per-module data structures."""
    modules = defaultdict(lambda: {
        "functions": [],
        "classes": defaultdict(lambda: {"params": "", "methods": []}),
        "constants": [],
        "exceptions": [],
    })

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
            modules[fqn]
            continue

        if objtype == "function":
            mod, rest = resolve_module(parts)
            fname = rest[-1]
            if fqn in sigs:
                _, params, ret = parse_sig(sigs[fqn][1])
            else:
                params, ret = "", "Any"
            modules[mod]["functions"].append((fname, params, ret))

        elif objtype == "class":
            mod, rest = resolve_module(parts)
            cname = rest[-1]
            if fqn in sigs:
                _, params, ret = parse_sig(sigs[fqn][1])
            else:
                params = ""
            modules[mod]["classes"][cname]["params"] = params

        elif objtype == "method":
            mod, rest = resolve_module(parts)
            if len(rest) >= 2:
                cname = rest[-2]
                mname = rest[-1]
            else:
                continue
            if fqn in sigs:
                _, params, ret = parse_sig(sigs[fqn][1])
            else:
                params, ret = "", "Any"
            modules[mod]["classes"][cname]["methods"].append(
                (mname, params, ret)
            )

        elif objtype == "exception":
            mod, rest = resolve_module(parts)
            ename = rest[-1]
            modules[mod]["exceptions"].append(ename)

        elif objtype in ("data", "attribute"):
            mod, rest = resolve_module(parts)
            if objtype == "attribute" and len(rest) >= 2:
                # Class attribute (e.g. Model.len)
                cname = rest[-2]
                aname = rest[-1]
                if "attrs" not in modules[mod]["classes"][cname]:
                    modules[mod]["classes"][cname]["attrs"] = []
                modules[mod]["classes"][cname]["attrs"].append(aname)
            else:
                dname = rest[-1]
                modules[mod]["constants"].append(dname)

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
            "functions": [(n, p, r) for n, p, r in orphans["functions"]
                          if n in BUILTIN_NAMES],
            "classes": defaultdict(lambda: {"params": "", "methods": []},
                                   {k: v for k, v in orphans["classes"].items()
                                    if k in BUILTIN_NAMES}),
            "constants": [c for c in orphans["constants"]
                          if c in BUILTIN_NAMES],
            "exceptions": [e for e in orphans["exceptions"]
                           if e in BUILTIN_NAMES],
        }
        if "builtins" in modules:
            modules["builtins"]["functions"].extend(filtered["functions"])
            modules["builtins"]["constants"].extend(filtered["constants"])
            modules["builtins"]["exceptions"].extend(filtered["exceptions"])
            for k, v in filtered["classes"].items():
                modules["builtins"]["classes"][k] = v
        else:
            modules["builtins"] = filtered

    return dict(modules)


# ---------------------------------------------------------------------------
# .pyi emission
# ---------------------------------------------------------------------------

def find_module_refs(module, all_module_names):
    """Find cross-module type references in all signatures."""
    refs = set()
    mod_name = module.get("_name", "")
    sigs = []
    for _, params, ret in module["functions"]:
        sigs.append(params)
        sigs.append(ret)
    for cls in module["classes"].values():
        sigs.append(cls["params"])
        for _, params, ret in cls["methods"]:
            sigs.append(params)
            sigs.append(ret)
    blob = " ".join(sigs)
    for name in all_module_names:
        if name and name != mod_name and name + "." in blob:
            refs.add(name)
    return sorted(refs)


def emit_pyi(mod_name, module, out_path, all_module_names):
    """Write a .pyi stub file for one module."""
    module["_name"] = mod_name
    refs = find_module_refs(module, all_module_names)

    lines = []
    lines.append("# Auto-generated by tools/genpyi.py -- do not edit")
    lines.append("from typing import Any, Optional, Union, Tuple, List")
    for ref in refs:
        lines.append(f"import {ref}")
    lines.append("")

    for name in module["constants"]:
        lines.append(f"{name}: int")

    if module["constants"]:
        lines.append("")

    for name, params, ret in module["functions"]:
        if params:
            lines.append(f"def {name}({params}) -> {ret}: ...")
        else:
            lines.append(f"def {name}() -> {ret}: ...")

    if module["functions"]:
        lines.append("")

    for ename in module.get("exceptions", []):
        lines.append(f"class {ename}(Exception): ...")

    if module.get("exceptions"):
        lines.append("")

    for cls_name, cls in sorted(module["classes"].items()):
        lines.append(f"class {cls_name}:")
        ctor = cls["params"]
        if ctor:
            lines.append(f"    def __init__(self, {ctor}) -> None: ...")
        else:
            lines.append(f"    def __init__(self) -> None: ...")

        for aname in cls.get("attrs", []):
            lines.append(f"    {aname}: Any")

        for mname, params, ret in cls["methods"]:
            if params:
                lines.append(f"    def {mname}(self, {params}) -> {ret}: ...")
            else:
                lines.append(f"    def {mname}(self) -> {ret}: ...")

        lines.append("")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n")


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
    objects, sigs = run_sphinx(args.docs_dir)
    modules = build_modules(objects, sigs)

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

    nf = sum(len(m["functions"]) for m in modules.values())
    nc = sum(len(m["classes"]) for m in modules.values())
    nm = sum(
        sum(len(c["methods"]) for c in m["classes"].values())
        for m in modules.values()
    )
    nk = sum(len(m["constants"]) for m in modules.values())
    print(
        f"Done: {len(modules)} modules, {nf} functions, "
        f"{nc} classes, {nm} methods, {nk} constants"
    )


if __name__ == "__main__":
    sys.exit(main())
