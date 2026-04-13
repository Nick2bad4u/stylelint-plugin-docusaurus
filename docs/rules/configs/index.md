---
title: Configs
description: Shareable Stylelint configs exported by stylelint-plugin-docusaurus.
---

# Configs

`stylelint-plugin-docusaurus` currently exports these shareable configs:

- `recommended`
- `all`

## Why both exist already

The template keeps both config entrypoints from day one so new rules can be categorized cleanly without needing another runtime or docs reshuffle later.

The configs are no longer equivalent.

`recommended` stays focused on broadly applicable, low-noise Docusaurus guardrails, while `all` additionally enables stricter or more specialized opt-in rules such as `docusaurus/no-unscoped-content-element-overrides`, `docusaurus/no-unanchored-infima-subcomponent-selectors`, `docusaurus/no-navbar-breakpoint-desync`, `docusaurus/require-docsearch-color-mode-pairs`, `docusaurus/prefer-infima-theme-tokens-over-structural-overrides`, and the cascade-layer safety rules.
