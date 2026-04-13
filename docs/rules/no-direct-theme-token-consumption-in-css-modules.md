# no-direct-theme-token-consumption-in-css-modules

Disallow direct `--ifm-*` and `--docsearch-*` token consumption in CSS Modules declarations.

## Targeted pattern scope

This rule runs on CSS Modules files such as `*.module.css`, `*.module.scss`, and `*.module.sass`.

It reports non-custom-property declarations that read global theme tokens directly with `var(--ifm-...)` or `var(--docsearch-...)`.

## What this rule reports

This rule reports declarations like `color: var(--ifm-color-primary)` inside CSS Modules.

## Why this rule exists

Direct token consumption makes a local component depend on global theme token names everywhere those values are used.

Aliasing the global token to a component-scoped custom property keeps the boundary clearer and makes later refactors easier.

## ❌ Incorrect

```css
.card {
 color: var(--ifm-color-primary);
}
```

## ✅ Correct

```css
.card {
 --card-link-color: var(--ifm-color-primary);
 color: var(--card-link-color);
}
```

## Behavior and migration notes

- Local alias declarations such as `--card-link-color: var(--ifm-color-primary)` are allowed.
- This rule only runs on CSS Modules file names.
- It is report-only because introducing the right local alias name requires human judgment.

## Additional examples

### ❌ Incorrect — direct DocSearch token use in a module

```css
.search {
 background: color-mix(in srgb, var(--docsearch-primary-color) 75%, white);
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/no-direct-theme-token-consumption-in-css-modules": true,
 },
};
```

## When not to use it

Disable this rule if your CSS Modules intentionally read global Docusaurus or DocSearch tokens directly and you do not want a local alias layer.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Search](https://docusaurus.io/docs/search)

> **Rule catalog ID:** R021

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Docusaurus Search — Styling your Algolia search](https://docusaurus.io/docs/search#styling-your-algolia-search)
