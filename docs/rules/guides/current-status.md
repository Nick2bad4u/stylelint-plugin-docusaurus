---
title: Current Status
description: Current status of the public rule catalog for stylelint-plugin-docusaurus.
---

# Current Status

The public `docusaurus/*` rule catalog is no longer empty.

## What has shipped so far

The first public rules are now in place:

- `docusaurus/no-invalid-theme-custom-property-scope`
- `docusaurus/no-mobile-navbar-backdrop-filter`
- `docusaurus/no-mobile-navbar-stacking-context-traps`
- `docusaurus/no-unstable-docusaurus-generated-class-selectors`
- `docusaurus/require-ifm-color-primary-scale`
- `docusaurus/prefer-data-theme-color-mode`
- `docusaurus/prefer-data-theme-docsearch-overrides`
- `docusaurus/prefer-stable-docusaurus-theme-class-names`

## Why the catalog still starts small

This repository is being turned into the **Stylelint** counterpart of the maintainer's ESLint plugin template.

The previous repository content contained a large amount of utility-library-specific rule content that does not belong in a Docusaurus-focused Stylelint plugin. Instead of renaming that content into something misleading, the obsolete rule corpus was removed and the Stylelint runtime/template infrastructure was rebuilt cleanly.

## What is already ready

Even with a still-small public rule catalog, the repository already includes the important long-term pieces:

- typed Stylelint plugin runtime scaffolding
- package exports and CJS/ESM build output
- Vitest-based Stylelint integration-test helpers
- Docusaurus docs-site scaffolding
- README/config sync infrastructure ready to be adapted to real rule metadata

## What a future rule must include

Every future public rule should ship with:

1. a typed rule module in `src/rules/`
2. static authored docs metadata
3. a hand-written docs page in `docs/rules/`
4. Vitest coverage using real `stylelint.lint(...)` execution
5. registration in the plugin runtime and shareable configs

The template is ready for those additions; the content is intentionally waiting for real Docusaurus-specific rule design.
