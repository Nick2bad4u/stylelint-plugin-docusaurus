---
title: docusaurus-docs-safe
description: Opinionated docs-surface preset that mirrors recommended plugin rules and documents Docusaurus docs CSS guardrail strategy.
---

# docusaurus-docs-safe

`configs.docusaurus-docs-safe` is an opinionated preset intended for teams linting Docusaurus docs surfaces.

## Usage

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs["docusaurus-docs-safe"];
```

## What it enables

This preset currently mirrors `configs.recommended` for all public `docusaurus/*` plugin rules.

Its purpose is to provide a stable home for Docusaurus docs-surface guidance without forcing third-party rule dependencies into this package runtime.

## Docusaurus docs CSS guardrails (important)

When linting real Docusaurus docs CSS (for example `custom.css` and `index.module.css`), some third-party rules are intentionally noisy and should be handled with targeted overrides plus justified inline `stylelint-disable ... -- reason` comments.

Known trap-prone rules:

- `a11y/media-prefers-reduced-motion`
- `defensive-css/require-named-grid-lines`
- `no-descending-specificity`
- `plugin/no-low-performance-animation-properties`
- `order/properties-order`
- `scales/font-sizes`

Suggested approach:

1. Keep docs overrides explicit in your Stylelint config.
2. Use narrow file-level disables with `-- reason` for intentional exceptions.
3. Add a CI guardrail test that verifies both of the above.

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule | Fix | Description |
| --- | :-: | --- |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope) | — | Disallow declaring Docusaurus theme custom properties outside global theme scopes, except for DocSearch variables scoped to the DocSearch UI. |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter) | — | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint. |
| [`no-subtree-data-theme-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-subtree-data-theme-selectors) | — | Disallow subtree-scoped data-theme selectors that do not start from the Docusaurus root color-mode attribute. |
| [`no-unwrapped-global-theme-selectors-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unwrapped-global-theme-selectors-in-css-modules) | — | Disallow unwrapped Docusaurus and Infima global theme selectors inside CSS Modules. |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode) | 🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes. |
| [`prefer-data-theme-over-prefers-color-scheme`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-over-prefers-color-scheme) | — | Prefer Docusaurus data-theme selector scopes over prefers-color-scheme media queries when styling Docusaurus theme tokens or global theme surfaces. |
| [`require-html-prefix-for-docusaurus-data-attribute-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-html-prefix-for-docusaurus-data-attribute-selectors) | — | Require an html prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces. |
| [`require-local-anchor-for-global-theme-overrides-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-local-anchor-for-global-theme-overrides-in-css-modules) | — | Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules. |
