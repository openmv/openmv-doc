#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
# Copyright (C) 2026 OpenMV, LLC.
#
# Verifies that the .pyi stubs produced by genpyi.py faithfully match the
# library API documented in the RST sources. Intended to run in CI right
# after genpyi.py, against the same --docs-dir / --pyi-dir, so a broken or
# incomplete stub set fails the build instead of being published.
#
# Ground truth is the Sphinx Python domain (what the RST documents). The
# check has three layers:
#   A. docs objects  -> genpyi model      (nothing documented silently lost)
#   B. model         -> emitted .pyi      (everything emitted, right place)
#   C. signatures     docs -> emitted      (params/return match, normalized)
#
# Objects genpyi intentionally drops are accepted as long as genpyi reported
# them: names that are not valid Python identifiers, and a class shadowed by
# a same-named function. Everything else must round-trip exactly.
#
# Usage:
#   python3 verify_stubs.py \
#       --docs-dir micropython/docs/build/html/_sources/library/ \
#       --pyi-dir  micropython/docs/build/stubs

import argparse
import ast
import sys
from pathlib import Path

import genpyi


def sig_str(args, returns):
    """Render an ast.arguments + return annotation as 'name(...) -> ret'."""
    parts = []
    posonly = getattr(args, "posonlyargs", [])
    allpos = posonly + args.args
    defaults = args.defaults
    ndef, npos = len(defaults), len(allpos)
    for i, a in enumerate(allpos):
        di = i - (npos - ndef)
        d = ast.unparse(defaults[di]) if di >= 0 else None
        ann = f": {ast.unparse(a.annotation)}" if a.annotation else ""
        parts.append(a.arg + ann + (f" = {d}" if d is not None else ""))
        if posonly and i == len(posonly) - 1:
            parts.append("/")
    if args.vararg:
        v = args.vararg
        parts.append("*" + v.arg + (f": {ast.unparse(v.annotation)}" if v.annotation else ""))
    elif args.kwonlyargs:
        parts.append("*")
    for a, d in zip(args.kwonlyargs, args.kw_defaults):
        ann = f": {ast.unparse(a.annotation)}" if a.annotation else ""
        parts.append(a.arg + ann + (f" = {ast.unparse(d)}" if d is not None else ""))
    if args.kwarg:
        k = args.kwarg
        parts.append("**" + k.arg + (f": {ast.unparse(k.annotation)}" if k.annotation else ""))
    ret = ast.unparse(returns) if returns is not None else ""
    return f"({', '.join(parts)}) -> {ret}"


def norm(s):
    return "".join((s or "").split())


def expected_sig(params, ret, is_method):
    """Build the signature genpyi should have emitted, normalized through
    the same ast round-trip as the parsed stub so cosmetic literal
    formatting (0x1000 vs 4096) is not a false mismatch."""
    params = genpyi._modernize_types(params or "")
    ret = genpyi._modernize_types(ret or "Any") or "Any"
    inner = (["self"] if is_method else []) + ([params] if params else [])
    src = f"def __x__({', '.join(inner)}) -> {ret}: ..."
    try:
        fn = ast.parse(src).body[0]
        return sig_str(fn.args, fn.returns)
    except SyntaxError:
        return f"({', '.join(inner)}) -> {ret}"


def main():
    ap = argparse.ArgumentParser(
        description="Verify genpyi .pyi stubs match the documented library API."
    )
    ap.add_argument("--docs-dir", type=Path, required=True,
                    help="RST docs directory (same as genpyi.py --docs-dir)")
    ap.add_argument("--pyi-dir", type=Path, required=True,
                    help="Directory of stubs genpyi.py already produced")
    args = ap.parse_args()

    if not args.docs_dir.exists():
        print(f"Error: {args.docs_dir} not found", file=sys.stderr)
        return 1
    if not args.pyi_dir.exists():
        print(f"Error: {args.pyi_dir} not found", file=sys.stderr)
        return 1

    objects, sigs, module_docs = genpyi.run_sphinx(args.docs_dir)
    modules, skipped = genpyi.build_modules(objects, sigs, module_docs)

    skipped_fqns = {s.split(" ", 1)[0] for s in skipped}
    collision_classes = {s.split(" ", 1)[0] for s in skipped if "shadowed" in s}
    known_mods = {f for f, ot in objects.items() if ot == "module"}

    def resolve_mod(parts):
        for i in range(len(parts) - 1, 0, -1):
            if ".".join(parts[:i]) in known_mods:
                return ".".join(parts[:i]), parts[i:]
        return "", parts

    def in_model(fqn, objtype):
        mod, rest = resolve_mod(fqn.split("."))
        m = modules.get(mod)
        if m is None:
            return False
        if objtype == "function":
            return any(n == rest[-1] for n, *_ in m["functions"])
        if objtype == "class":
            return rest[-1] in m["classes"]
        if objtype == "method" and len(rest) >= 2:
            c = m["classes"].get(rest[-2])
            return bool(c) and any(n == rest[-1] for n, *_ in c["methods"])
        if objtype == "exception":
            return any(n == rest[-1] for n, _ in m["exceptions"])
        if objtype in ("data", "attribute"):
            if objtype == "attribute" and len(rest) >= 2:
                c = m["classes"].get(rest[-2])
                return bool(c) and any(n == rest[-1] for n, *_ in c.get("attrs", []))
            return any(n == rest[-1] for n, *_ in m["constants"])
        return False

    def is_overload(fn):
        """True if `fn` is decorated with @overload."""
        for d in fn.decorator_list:
            if isinstance(d, ast.Name) and d.id == "overload":
                return True
            if isinstance(d, ast.Attribute) and d.attr == "overload":
                return True
        return False

    problems = []

    # ---- Layer A: every documented object represented (or explained) ------
    for fqn, objtype in sorted(objects.items()):
        if objtype == "module" or fqn in skipped_fqns:
            continue
        parts = fqn.split(".")
        rmod, rest = resolve_mod(parts)
        if objtype in ("method", "attribute") and len(parts) >= 2:
            owner = f"{rmod}.{parts[-2]}" if rmod else ".".join(parts[:-1])
            if owner in collision_classes:
                continue  # member of an intentionally dropped collision class
        if not rmod and not in_model(fqn, objtype):
            continue  # orphan filtered into the synthesized builtins set
        if not in_model(fqn, objtype):
            problems.append(f"[A missing-from-model] {objtype} {fqn}")

    # ---- parse emitted stubs into {fqn: (kind, [signatures...])} ----------
    # Functions/methods store a list because an overloaded callable emits
    # multiple `@overload`-decorated definitions under the same name.
    emitted = {}

    def _add_callable(key, kind, fn):
        existing = emitted.get(key)
        sig = sig_str(fn.args, fn.returns)
        if existing is None:
            emitted[key] = (kind, [sig])
        else:
            existing[1].append(sig)

    for f in sorted(args.pyi_dir.rglob("*.pyi")):
        rel = f.relative_to(args.pyi_dir)
        # "name-stubs" PEP 561 packages are verbatim copies of "name" made
        # for stdlib-name precedence; skip them rather than parse them as a
        # bogus "name-stubs" module.
        if any(part.endswith("-stubs") for part in rel.parts):
            continue
        mod = (".".join(rel.parent.parts) if f.name == "__init__.pyi"
               else ".".join(rel.with_suffix("").parts))
        try:
            tree = ast.parse(f.read_text(encoding="utf-8"), filename=str(f))
        except SyntaxError as e:
            problems.append(f"[B unparsable] {rel}: {e}")
            continue
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                _add_callable(f"{mod}.{node.name}", "function", node)
            elif isinstance(node, ast.ClassDef):
                emitted[f"{mod}.{node.name}"] = ("class", None)
                for sub in node.body:
                    if isinstance(sub, ast.FunctionDef):
                        _add_callable(f"{mod}.{node.name}.{sub.name}", "method", sub)
                    elif isinstance(sub, ast.AnnAssign) and isinstance(sub.target, ast.Name):
                        emitted[f"{mod}.{node.name}.{sub.target.id}"] = ("attribute", None)
            elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
                emitted[f"{mod}.{node.target.id}"] = ("data", None)

    def _match_overloads(expected_list, actual_list):
        """True if both lists describe the same set of overloads (order matters)."""
        if len(expected_list) != len(actual_list):
            return False
        for exp, act in zip(expected_list, actual_list):
            if norm(exp) != norm(act):
                return False
        return True

    # ---- Layers B + C: model -> files, with signature equivalence ---------
    for mod, m in modules.items():
        if not mod or mod == "builtins":
            continue
        for n, overloads, _ in m["functions"]:
            key = f"{mod}.{n}"
            if key not in emitted:
                problems.append(f"[B missing fn] {key}")
                continue
            expected = [expected_sig(p, r, False) for p, r in overloads]
            actual = emitted[key][1]
            if not _match_overloads(expected, actual):
                problems.append(
                    f"[C fn sig] {key}\n    docs: {expected}\n    pyi : {actual}"
                )
        for cn, c in m["classes"].items():
            if f"{mod}.{cn}" not in emitted:
                problems.append(f"[B missing class] {mod}.{cn}")
                continue
            # Constructor overloads -> __init__.
            ctor_overloads = c.get("overloads", [])
            if ctor_overloads:
                init_key = f"{mod}.{cn}.__init__"
                expected_init = [expected_sig(p, "None", True) for p in ctor_overloads]
                actual_init = emitted.get(init_key, ("method", []))[1]
                if not _match_overloads(expected_init, actual_init):
                    problems.append(
                        f"[C ctor sig] {init_key}\n    docs: {expected_init}\n"
                        f"    pyi : {actual_init}"
                    )
            for mn, overloads, _ in c["methods"]:
                key = f"{mod}.{cn}.{mn}"
                if key not in emitted:
                    problems.append(f"[B missing method] {key}")
                    continue
                expected = [expected_sig(p, r, True) for p, r in overloads]
                actual = emitted[key][1]
                if not _match_overloads(expected, actual):
                    problems.append(
                        f"[C method sig] {key}\n    docs: {expected}\n"
                        f"    pyi : {actual}"
                    )
        for cnm, *_ in m["constants"]:
            if f"{mod}.{cnm}" not in emitted:
                problems.append(f"[B missing const] {mod}.{cnm}")
        for en, _ in m.get("exceptions", []):
            if f"{mod}.{en}" not in emitted:
                problems.append(f"[B missing exc] {mod}.{en}")

    print(f"docs objects: {len(objects)}  modules: {len(modules)}  "
          f"emitted symbols: {len(emitted)}  intentionally skipped: {len(skipped)}")
    if problems:
        print(f"\nFAIL: {len(problems)} discrepancy(ies):", file=sys.stderr)
        for p in problems:
            print(" -", p, file=sys.stderr)
        return 1
    print("PASS: every documented library object is emitted with a matching "
          "signature.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
