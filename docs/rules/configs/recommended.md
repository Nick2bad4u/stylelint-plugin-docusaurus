---
title: recommended
description: Default shareable config for stylelint-plugin-docusaurus.
---

# recommended

`configs.recommended` is the default shareable config for this package.

## Usage

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs.recommended;
```

## What it enables

This config registers the local plugin pack and enables the rules marked as recommended.

This config currently enables eight lower-noise baseline rules:

- `docusaurus/no-invalid-theme-custom-property-scope`
- `docusaurus/no-mobile-navbar-backdrop-filter`
- `docusaurus/no-subtree-data-theme-selectors`
- `docusaurus/no-unwrapped-global-theme-selectors-in-css-modules`
- `docusaurus/prefer-data-theme-color-mode`
- `docusaurus/prefer-data-theme-over-prefers-color-scheme`
- `docusaurus/require-html-prefix-for-docusaurus-data-attribute-selectors`
- `docusaurus/require-local-anchor-for-global-theme-overrides-in-css-modules`

## Intended future role

As Docusaurus-specific rules are added, `recommended` should stay focused on low-noise, broadly applicable rules that are safe to enable in most Docusaurus codebases.

## Rules in this config

| Rule                                                                                                                                                                                                   | Fix | Description                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope)                                                 |  —  | Disallow declaring Docusaurus theme custom properties outside global theme scopes, except for DocSearch variables scoped to the DocSearch UI.       |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter)                                                             |  —  | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint.                                         |
| [`no-subtree-data-theme-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-subtree-data-theme-selectors)                                                               |  —  | Disallow subtree-scoped data-theme selectors that do not start from the Docusaurus root color-mode attribute.                                       |
| [`no-unwrapped-global-theme-selectors-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unwrapped-global-theme-selectors-in-css-modules)                         |  —  | Disallow unwrapped Docusaurus and Infima global theme selectors inside CSS Modules.                                                                 |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode)                                                                     |  🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes.                                                                  |
| [`prefer-data-theme-over-prefers-color-scheme`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-over-prefers-color-scheme)                                       |  —  | Prefer Docusaurus data-theme selector scopes over prefers-color-scheme media queries when styling Docusaurus theme tokens or global theme surfaces. |
| [`require-html-prefix-for-docusaurus-data-attribute-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-html-prefix-for-docusaurus-data-attribute-selectors)       |  —  | Require an html prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces.                                         |
| [`require-local-anchor-for-global-theme-overrides-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-local-anchor-for-global-theme-overrides-in-css-modules) |  —  | Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules.                                                |
