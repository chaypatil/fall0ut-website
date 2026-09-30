#!/usr/bin/env python3
"""Builds look/look.css for the fall0ut.xyz design preview.

The live stylesheet is dark. To preview the light backgrounds from the direction
board on every page without hand-editing 237 colour rules, this reads styles.css and
emits a remapped copy of each colour declaration, scoped to the chosen background:

    html[data-look-bg="a"]  Frost        light, icy blue-white
    html[data-look-bg="b"]  Overexposed  brighter white, higher contrast
    html[data-look-bg="c"]  Night frost  stays dark, retinted from steel to icy navy

Hand-tuned rules for every other option live in look/options.css and are appended.
Only the preview loads this file (see look/look.js); fall0ut.in never does.

    python3 look/build-look.py
"""

import colorsys
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "styles.css")
OPTIONS = os.path.join(os.path.dirname(__file__), "options.css")
OUT = os.path.join(os.path.dirname(__file__), "look.css")

COLOR_PROPS = re.compile(
    r"^(color|background|background-color|background-image|border|border-top|border-right|border-bottom|"
    r"border-left|border-color|border-left-color|box-shadow|text-decoration-color|outline|fill|stroke|"
    r"scrollbar-color|text-shadow|-webkit-tap-highlight-color)$"
)
COLOR_RE = re.compile(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([^)]+))?\)")
SKIP_VALUES = ("var(--chrome", "var(--action-gradient", "url(")


def parse(c):
    if c.startswith("#"):
        v = c[1:]
        if len(v) == 3:
            v = "".join(ch * 2 for ch in v)
        return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), None
    m = COLOR_RE.match(c)
    return int(m.group(1)), int(m.group(2)), int(m.group(3)), (m.group(4) or "").strip() or None


def fmt(r, g, b, a):
    r, g, b = (max(0, min(255, round(x))) for x in (r, g, b))
    return f"rgba({r}, {g}, {b}, {a})" if a is not None else f"#{r:02x}{g:02x}{b:02x}"


def light_map(lo, hi, hue, contrast_boost=1.0):
    """Invert lightness into a blue-white range, tint every neutral the same hue."""

    def f(r, g, b, a, in_shadow):
        if in_shadow and (r, g, b) == (0, 0, 0):
            # Dark drop shadows become soft blue shadows on a light page.
            alpha = a if a is not None else "1"
            try:
                alpha = f"{min(1.0, float(alpha) * 0.35):.3f}"
            except ValueError:
                pass
            return fmt(30, 60, 100, alpha)
        if in_shadow and (r, g, b) == (255, 255, 255):
            return fmt(255, 255, 255, a)  # highlights stay highlights
        _, l, _ = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        l2 = 1 - l
        l2 = 0.5 + (l2 - 0.5) * contrast_boost
        l2 = lo + max(0, min(1, l2)) * (hi - lo)
        s2 = 0.16 + 0.34 * abs(l2 - 0.5) * 2
        r2, g2, b2 = colorsys.hls_to_rgb(hue / 360, l2, s2)
        return fmt(r2 * 255, g2 * 255, b2 * 255, a)

    return f


def night_map(r, g, b, a, in_shadow):
    if (r, g, b) in ((0, 0, 0), (255, 255, 255)):
        return fmt(r, g, b, a)
    _, l, _ = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    s2 = 0.42 if l < 0.2 else (0.14 if l < 0.75 else 0.5)
    r2, g2, b2 = colorsys.hls_to_rgb(215 / 360, l, s2)
    return fmt(r2 * 255, g2 * 255, b2 * 255, a)


SCHEMES = {
    "a": light_map(0.085, 0.962, 212),
    "b": light_map(0.045, 0.985, 214, contrast_boost=1.08),
    "c": night_map,
}


def remap_value(prop, value, fn):
    if any(s in value for s in SKIP_VALUES):
        return None
    in_shadow = prop in ("box-shadow", "text-shadow")

    def sub(m):
        r, g, b, a = parse(m.group(0))
        return fn(r, g, b, a, in_shadow)

    new = COLOR_RE.sub(sub, value)
    return new if new != value else None


def split_blocks(css):
    """Yield (media_prelude_or_None, selector, body) for each plain rule."""
    i = 0
    n = len(css)
    while i < n:
        j = css.find("{", i)
        if j == -1:
            break
        prelude = re.sub(r"/\*.*?\*/", "", css[i:j], flags=re.S).strip()
        if prelude.startswith("@media"):
            depth, k = 1, j + 1
            while depth:
                if css[k] == "{":
                    depth += 1
                elif css[k] == "}":
                    depth -= 1
                k += 1
            inner = css[j + 1 : k - 1]
            for _, sel, body in split_blocks(inner):
                yield prelude, sel, body
            i = k
        elif prelude.startswith("@"):
            depth, k = 1, j + 1
            while depth:
                if css[k] == "{":
                    depth += 1
                elif css[k] == "}":
                    depth -= 1
                k += 1
            i = k
        else:
            k = css.find("}", j)
            yield None, prelude, css[j + 1 : k]
            i = k + 1


def scope(selector, key):
    parts = []
    for s in selector.split(","):
        s = s.strip()
        if not s:
            continue
        if s in (":root", "html"):
            parts.append(f'html[data-look-bg="{key}"]')
        else:
            parts.append(f'html[data-look-bg="{key}"] {s}')
    return ", ".join(parts)


def build():
    css = open(SRC, encoding="utf-8").read()
    out = [
        "/* Generated by look/build-look.py from styles.css. Preview only (fall0ut.xyz). */",
    ]
    for key, fn in SCHEMES.items():
        grouped = {}
        for media, sel, body in split_blocks(css):
            if sel.startswith(":root"):
                continue  # tokens are set by hand in options.css
            decls = []
            for d in body.split(";"):
                if ":" not in d:
                    continue
                prop, value = d.split(":", 1)
                prop = prop.strip()
                if not COLOR_PROPS.match(prop):
                    continue
                new = remap_value(prop, value.strip(), fn)
                if new:
                    decls.append(f"{prop}: {new}")
            if decls:
                grouped.setdefault(media, []).append(f"{scope(sel, key)} {{ {'; '.join(decls)} }}")
        for media, rules in grouped.items():
            if media:
                out.append(f"{media} {{\n" + "\n".join(rules) + "\n}")
            else:
                out.extend(rules)
    out.append(open(OPTIONS, encoding="utf-8").read())
    open(OUT, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("wrote", os.path.relpath(OUT), f"{os.path.getsize(OUT) // 1024} KB")


if __name__ == "__main__":
    build()
