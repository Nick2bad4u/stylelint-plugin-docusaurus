---
title: Configs
description: Shareable Stylelint configs exported by stylelint-plugin-docusaurus.
---

# Configs

`stylelint-plugin-docusaurus` currently exports two shareable configs:

- `recommended`
- `all`

## Why both exist already

The template keeps both config entrypoints from day one so new rules can be categorized cleanly without needing another runtime or docs reshuffle later.

The configs are no longer equivalent.

`recommended` stays focused on broadly applicable, low-noise Docusaurus guardrails, while `all` additionally enables stricter opt-in rules such as `docusaurus/require-ifm-color-primary-scale`.
