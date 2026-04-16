---
title: Configs
description: Shareable Stylelint configs exported by stylelint-plugin-docusaurus.
---

# Configs

`stylelint-plugin-docusaurus` exports these shareable configs:

- `docusaurus-recommended`
- `docusaurus-all`
- `docusaurus-docs-safe`

Use them from `docusaurusPluginConfigs` or from `extends` subpath exports.

`docusaurus-recommended` stays focused on broadly applicable, low-noise guardrails, while `docusaurus-all` additionally enables stricter opt-in rules such as `docusaurus/no-unscoped-content-element-overrides`, `docusaurus/no-unanchored-infima-subcomponent-selectors`, `docusaurus/no-navbar-breakpoint-desync`, `docusaurus/require-docsearch-color-mode-pairs`, and cascade-layer safety rules.

`docusaurus-docs-safe` currently mirrors `docusaurus-recommended` and exists as a stable home for docs-surface guidance.
