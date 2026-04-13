# prefer-data-theme-over-prefers-color-scheme

Prefer Docusaurus `data-theme` selector scopes over `prefers-color-scheme` media queries when styling Docusaurus theme tokens or global theme surfaces.

## Targeted pattern scope

This rule is intentionally narrow.

It reports `@media (prefers-color-scheme: dark)` and `@media (prefers-color-scheme: light)` blocks only when they style Docusaurus-specific surfaces such as:

- Docusaurus or Infima theme tokens like `--ifm-*` and `--docsearch-*`
- documented runtime theme surfaces such as `.navbar`, `.footer`, `.DocSearch`, or stable `theme-*` classes

It does **not** report unrelated local component media queries such as `.card` or `.heroBanner` dark-mode styling when no Docusaurus theme surface is involved.

## What this rule reports

This rule reports Docusaurus theme overrides that rely on `prefers-color-scheme` instead of the site’s real color-mode contract.

## Why this rule exists

Docusaurus exposes color mode through root `data-theme` selectors on the HTML element.

That matters because the site can be configured to force a mode, remember a user choice, or differ from the raw operating-system preference. Styling Docusaurus theme tokens and theme surfaces through `prefers-color-scheme` can therefore drift away from the actual site mode.

## ❌ Incorrect

```css
@media (prefers-color-scheme: dark) {
 :root {
  --ifm-color-primary: #4e89e8;
 }
}
```

```css
@media (prefers-color-scheme: dark) {
 .navbar {
  box-shadow: none;
 }
}
```

## ✅ Correct

```css
[data-theme="dark"] {
 --ifm-color-primary: #4e89e8;
}
```

```css
[data-theme="dark"] .navbar {
 box-shadow: none;
}
```

## Behavior and migration notes

- This rule is report-only.
- It does not autofix because converting an `@media` block into `[data-theme]` selectors can require restructuring nested rules and preserving surrounding media conditions.
- It complements `prefer-data-theme-color-mode`, which rewrites legacy `.theme-dark` / `.theme-light` selectors after you are already using selector-based color-mode scopes.

## Additional examples

### ✅ Correct — local component media query outside the Docusaurus theme surface

```css
@media (prefers-color-scheme: dark) {
 .card {
  color: plum;
 }
}
```

This rule intentionally leaves this pattern alone because it is not directly overriding a Docusaurus theme token or curated global theme surface.

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.recommended,
 rules: {
  ...configs.recommended.rules,
  "docusaurus/prefer-data-theme-over-prefers-color-scheme": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally styles Docusaurus theme surfaces from raw operating-system color-scheme media queries and that divergence from Docusaurus runtime color mode is acceptable.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Theme configuration](https://docusaurus.io/docs/api/themes/configuration)

> **Rule catalog ID:** R022

## Further reading

- [Docusaurus Styling and Layout — Dark mode](https://docusaurus.io/docs/styling-layout#dark-mode)
- [Docusaurus Search](https://docusaurus.io/docs/search)
