---
title: Current Status
description: Current status of the public rule catalog for stylelint-plugin-docusaurus.
---

# Current Status

The public `docusaurus/*` rule catalog is no longer empty.

## What has shipped so far

The public catalog now includes **21** rules instead of the initial starter set.

Newer additions now cover:

- CSS Modules global-selector boundaries
- content-wrapper scoping for broad element overrides
- explicit root `data-theme` selector correctness
- responsive navbar/sidebar breakpoint alignment
- paired color-mode requirements for Infima primary scales and DocSearch tokens
- curated token-over-structure guidance for common Infima surfaces
- reserved cascade-layer names and `revert-layer` isolation safety

## Why the catalog is still curated

This repository is being turned into the **Stylelint** counterpart of the maintainer's ESLint plugin template.

The previous repository content contained a large amount of utility-library-specific rule content that does not belong in a Docusaurus-focused Stylelint plugin. Instead of renaming that content into something misleading, the obsolete rule corpus was removed and the Stylelint runtime/template infrastructure was rebuilt cleanly.

## What is already ready

With the expanded public rule catalog, the repository now includes the important long-term pieces:

- typed Stylelint plugin runtime scaffolding
- package exports and CJS/ESM build output
- Vitest-based Stylelint integration-test helpers
- Docusaurus docs-site scaffolding
- README/config sync infrastructure driven by real rule metadata

## What a future rule must include

Every future public rule should ship with:

1. a typed rule module in `src/rules/`
2. static authored docs metadata
3. a hand-written docs page in `docs/rules/`
4. Vitest coverage using real `stylelint.lint(...)` execution
5. registration in the plugin runtime and shareable configs

The package is now in active rule-authoring mode rather than template-only mode, but the same implementation bar still applies to each future addition.
