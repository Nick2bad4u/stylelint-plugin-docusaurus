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

This config currently enables three lower-noise baseline rules:

- `docusaurus/no-invalid-theme-custom-property-scope`
- `docusaurus/no-mobile-navbar-backdrop-filter`
- `docusaurus/prefer-data-theme-color-mode`

## Intended future role

As Docusaurus-specific rules are added, `recommended` should stay focused on low-noise, broadly applicable rules that are safe to enable in most Docusaurus codebases.

## Rules in this config

| Rule | Fix | Description |
| --- | :-: | --- |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope) | — | Disallow declaring Docusaurus theme custom properties outside global theme scopes. |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter) | — | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint. |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode) | 🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes. |
