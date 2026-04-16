# require-font-face-local-src-before-remote

Require `local()` sources to appear before `url()` sources in `@font-face` `src` declarations.

## Targeted pattern scope

This rule inspects `src` declarations inside `@font-face` blocks and reports two problems:

1. A `src` that contains `url()` sources but **no** `local()` fallback at all.
2. A `src` where the first `url()` appears **before** the first `local()` (wrong ordering).

The rule only applies when a `url()` source is present. A `@font-face` with only `local()` sources passes.

## What this rule reports

- `@font-face` whose `src` contains at least one `url()` but no `local()` — missing local fallback.
- `@font-face` whose `src` has both `local()` and `url()` but the `url()` appears first — wrong ordering.

## Why this rule exists

`local()` sources tell browsers to prefer any copy of the font already installed on the operating system before downloading a remote copy. Placing `local()` first — and ensuring it exists — yields two concrete benefits:

1. **Zero-latency font rendering** for users who already have the font installed (common for web-safe fonts, system fonts, and popular CDN fonts).
2. **Reduced bandwidth and CLS** because no network request is needed in the local-hit case.

Docusaurus sites commonly add `@font-face` blocks for icon fonts (Nerd Fonts, Material Icons) and branding fonts. If a new `@font-face` is added with only a CDN `url()` and no `local()`, users who have that font installed waste a network round-trip on every page load.

## ❌ Incorrect

```css
/* No local() fallback — always downloads from CDN */
@font-face {
  font-family: "NerdFont";
  font-display: swap;
  src: url("/fonts/nerdfont.woff2") format("woff2");
}
```

```css
/* url() appears before local() — browser downloads before checking locally */
@font-face {
  font-family: "MyFont";
  font-display: swap;
  src:
    url("/fonts/myfont.woff2") format("woff2"),
    local("MyFont");
}
```

## ✅ Correct

```css
/* Correct: local() before url() */
@font-face {
  font-family: "MyFont";
  font-display: swap;
  src:
    local("MyFont"),
    local("MyFont-Regular"),
    url("/fonts/myfont.woff2") format("woff2");
}
```

```css
/* Correct: only local() sources — no url() present */
@font-face {
  font-family: "SystemFallback";
  src: local("Arial"), local("Helvetica Neue"), local("Helvetica");
}
```

## Behavior and migration notes

- The rule reports on the `@font-face` at-rule node itself.
- Detection uses lightweight string matching on the `src` value — it does not parse the full CSS value AST, so comma-separated multi-line values are checked as a concatenated string.
- This rule is report-only; no autofix reorders or inserts `local()` sources because the correct local font name depends on the font family.
- A `@font-face` with no `src` declaration passes silently (the CSS is invalid for other reasons).

## Additional examples

### ✅ Correct — multiple url() formats with local() first

```css
@font-face {
  font-family: "OpenSans";
  font-display: swap;
  src:
    local("Open Sans"),
    local("OpenSans"),
    url("/fonts/open-sans.woff2") format("woff2"),
    url("/fonts/open-sans.woff") format("woff");
}
```

### ❌ Incorrect — mixed formats with url() first

```css
@font-face {
  font-family: "OpenSans";
  font-display: swap;
  src:
    url("/fonts/open-sans.woff2") format("woff2"),
    local("Open Sans");
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/require-font-face-local-src-before-remote": true
  }
};
```

## When not to use it

Disable this rule for icon fonts (such as Material Icons or Nerd Fonts) where the local system version may have a different glyph set or version than the one your site requires. In those cases a `local()` fallback might produce incorrect icons if the locally installed version differs from the expected one.

## Further reading

- [MDN: @font-face src](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src)
- [web.dev: Best practices for fonts — local() sources](https://web.dev/articles/font-best-practices)
- [`require-font-display-on-font-face` rule](./require-font-display-on-font-face.md) — companion rule for font-loading behavior

> **Rule catalog ID:** R030
