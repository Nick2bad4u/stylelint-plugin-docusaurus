---
title: all
description: Full shareable config for stylelint-plugin-docusaurus.
---

# all

`configs.all` enables the full current public rule catalog.

## Usage

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs.all;
```

## Current behavior

This config enables every current public rule, including stricter or more
specialized opt-in rules such as
`docusaurus/require-ifm-color-primary-scale`,
`docusaurus/prefer-data-theme-docsearch-overrides`,
`docusaurus/no-unstable-docusaurus-generated-class-selectors`, and
`docusaurus/prefer-stable-docusaurus-theme-class-names`.

## Intended future role

As the plugin grows, `all` should remain the exhaustive opt-in surface for teams that want every stable public `docusaurus/*` rule enabled at once.

## Rules in this config

| Rule | Fix | Description |
| --- | :-: | --- |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope) | — | Disallow declaring Docusaurus theme custom properties outside global theme scopes. |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter) | — | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint. |
| [`no-mobile-navbar-stacking-context-traps`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-stacking-context-traps) | — | Disallow containing-block and stacking-context properties on Docusaurus navbar selectors unless they are guarded behind the desktop breakpoint. |
| [`no-unstable-docusaurus-generated-class-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unstable-docusaurus-generated-class-selectors) | — | Disallow exact selectors that target Docusaurus theme CSS-module class names with unstable hash suffixes. |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode) | 🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes. |
| [`prefer-data-theme-docsearch-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-docsearch-overrides) | — | Prefer [data-theme] selectors over .navbar--dark when overriding DocSearch styles. |
| [`prefer-stable-docusaurus-theme-class-names`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-stable-docusaurus-theme-class-names) | — | Prefer documented stable Docusaurus theme class names over attribute-selector fallbacks for known theme components. |
| [`require-ifm-color-primary-scale`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale) | — | Require the full recommended Infima primary color scale when overriding --ifm-color-primary. |
