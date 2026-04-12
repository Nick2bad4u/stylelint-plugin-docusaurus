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

This config enables every current public rule, including the stricter
`docusaurus/require-ifm-color-primary-scale` rule.

## Intended future role

As the plugin grows, `all` should remain the exhaustive opt-in surface for teams that want every stable public `docusaurus/*` rule enabled at once.

## Rules in this config

| Rule                                                                                                                                                   | Fix | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | -------------------------------------------------------------------------------------------- |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope) |  —  | Disallow declaring Docusaurus theme custom properties outside global theme scopes.           |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode)                     |  🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes.           |
| [`require-ifm-color-primary-scale`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale)               |  —  | Require the full recommended Infima primary color scale when overriding --ifm-color-primary. |
