# require-font-display-on-font-face

Require a `font-display` declaration in every `@font-face` block.

## Targeted pattern scope

This rule inspects every `@font-face` at-rule block and checks two things:

1. A `font-display` declaration must be present.
2. When `allowedValues` is configured, the `font-display` value must be one of the allowed keywords.

The default allowed values are `block`, `fallback`, `optional`, and `swap`. The `auto` keyword is excluded by default because its behavior is browser-defined and produces inconsistent results across rendering engines.

## What this rule reports

- An `@font-face` block without any `font-display` declaration.
- An `@font-face` block whose `font-display` value is not in the configured `allowedValues` list.

## Why this rule exists

The `font-display` property controls how a browser behaves while a web font loads. Without it, browsers fall back to browser-default behavior — typically either a Flash of Invisible Text (FOIT, where text is invisible while the font loads) or a Flash of Unstyled Text (FOUT, where text renders in a fallback font briefly). Both outcomes hurt Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP) scores.

Docusaurus sites frequently load fonts from CDN sources such as Google Fonts or Nerd Fonts. Any `@font-face` added to a Docusaurus custom stylesheet should declare `font-display` to control that loading behavior explicitly and ensure consistent performance.

## ❌ Incorrect

```css
/* Missing font-display */
@font-face {
  font-family: "MyFont";
  src: local("MyFont"), url("/fonts/myfont.woff2") format("woff2");
}
```

```css
/* font-display: auto is not in the default allowed list */
@font-face {
  font-family: "NerdFont";
  font-display: auto;
  src: url("/fonts/nerdfont.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* Correct: font-display: swap declared */
@font-face {
  font-family: "MyFont";
  font-display: swap;
  src: local("MyFont"), url("/fonts/myfont.woff2") format("woff2");
}
```

```css
/* Correct: font-display: optional for a non-critical decorative font */
@font-face {
  font-family: "DecorativeFont";
  font-display: optional;
  src: url("/fonts/decorative.woff2") format("woff2");
}
```

## Behavior and migration notes

- The rule reports on the `@font-face` at-rule node itself rather than the individual declaration, so the error points to the block opening.
- The `font-display` value comparison is case-insensitive.
- This rule is report-only; no autofix inserts a `font-display` declaration.
- When `allowedValues` is provided in secondary options, only the specified values pass. All other `font-display` values are reported.

## Additional examples

### Allowing only `swap` and `optional`

```js
// stylelint.config.mjs
export default {
  rules: {
    "docusaurus/require-font-display-on-font-face": [
      true,
      { allowedValues: ["swap", "optional"] }
    ]
  }
};
```

### ✅ Correct — `font-display: fallback`

```css
@font-face {
  font-family: "SystemFont";
  font-display: fallback;
  src: local("Arial"), url("/fonts/arial.woff2") format("woff2");
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/require-font-display-on-font-face": true
  }
};
```

## When not to use it

Disable this rule if your project does not load any custom web fonts, or if your font-loading pipeline injects `font-display` automatically at build time and the declarations are not present in the authored CSS.

## Further reading

- [MDN: font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display)
- [web.dev: Optimize WebFont loading and rendering](https://web.dev/articles/optimize-webfont-loading)
- [web.dev: font-display best practices](https://web.dev/articles/font-best-practices)
- [Docusaurus: Custom fonts](https://docusaurus.io/docs/styling-layout#fonts)

> **Rule catalog ID:** R029
