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

This config enables every current public rule, including stricter opt-in rules
for CSS Modules boundaries, content-scope hygiene, responsive navbar/sidebar
contracts, paired color-mode overrides, curated token preferences, and
cascade-layer safety.

## Intended future role

As the plugin grows, `all` should remain the exhaustive opt-in surface for teams that want every stable public `docusaurus/*` rule enabled at once.

## Rules in this config

| Rule                                                                                                                                                                                                   | Fix | Description                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`no-broad-all-resets-outside-isolation-subtrees`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-broad-all-resets-outside-isolation-subtrees)                                 |  —  | Disallow broad all: initial\|revert\|unset resets outside explicitly isolated local subtrees.                                                       |
| [`no-direct-theme-token-consumption-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-direct-theme-token-consumption-in-css-modules)                             |  —  | Disallow direct --ifm-_and --docsearch-_ token consumption in CSS Modules declarations.                                                             |
| [`no-docusaurus-layer-name-collisions`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-docusaurus-layer-name-collisions)                                                       |  —  | Disallow author-defined cascade layer names that collide with reserved Docusaurus-managed layer prefixes.                                           |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope)                                                 |  —  | Disallow declaring Docusaurus theme custom properties outside global theme scopes, except for DocSearch variables scoped to the DocSearch UI.       |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter)                                                             |  —  | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint.                                         |
| [`no-mobile-navbar-stacking-context-traps`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-stacking-context-traps)                                               |  —  | Disallow containing-block and stacking-context properties on Docusaurus navbar selectors unless they are guarded behind the desktop breakpoint.     |
| [`no-navbar-breakpoint-desync`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-navbar-breakpoint-desync)                                                                       |  —  | Disallow custom CSS breakpoints for Docusaurus mobile navbar/sidebar surfaces that can desync from the built-in JS breakpoint.                      |
| [`no-revert-layer-outside-isolation-subtrees`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-revert-layer-outside-isolation-subtrees)                                         |  —  | Disallow revert-layer usage outside explicitly isolated local subtrees.                                                                             |
| [`no-subtree-data-theme-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-subtree-data-theme-selectors)                                                               |  —  | Disallow subtree-scoped data-theme selectors that do not start from the Docusaurus root color-mode attribute.                                       |
| [`no-unanchored-infima-subcomponent-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unanchored-infima-subcomponent-selectors)                                       |  —  | Disallow unanchored Infima subcomponent selectors in global Docusaurus stylesheets.                                                                 |
| [`no-unsafe-theme-internal-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unsafe-theme-internal-selectors)                                                         |  —  | Disallow curated unsafe Docusaurus internal selector fallbacks that have no documented stable CSS contract.                                         |
| [`no-unscoped-content-element-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unscoped-content-element-overrides)                                                   |  —  | Disallow unscoped content-element overrides that leak across the whole Docusaurus site.                                                             |
| [`no-unstable-docusaurus-generated-class-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unstable-docusaurus-generated-class-selectors)                             |  —  | Disallow exact selectors that target Docusaurus theme CSS-module class names with unstable hash suffixes.                                           |
| [`no-unwrapped-global-theme-selectors-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unwrapped-global-theme-selectors-in-css-modules)                         |  —  | Disallow unwrapped Docusaurus and Infima global theme selectors inside CSS Modules.                                                                 |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode)                                                                     |  🔧 | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes.                                                                  |
| [`prefer-data-theme-docsearch-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-docsearch-overrides)                                                   |  —  | Prefer `\[data-theme\]` selectors over .navbar--dark when overriding DocSearch styles.                                                              |
| [`prefer-data-theme-over-prefers-color-scheme`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-over-prefers-color-scheme)                                       |  —  | Prefer Docusaurus data-theme selector scopes over prefers-color-scheme media queries when styling Docusaurus theme tokens or global theme surfaces. |
| [`prefer-docsearch-theme-tokens-over-structural-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-docsearch-theme-tokens-over-structural-overrides)               |  —  | Prefer curated DocSearch theme tokens over hard-coded structural overrides on common DocSearch UI surfaces.                                         |
| [`prefer-infima-theme-tokens-over-structural-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-infima-theme-tokens-over-structural-overrides)                     |  —  | Prefer curated Infima theme tokens over hard-coded structural overrides on common Docusaurus theme surfaces.                                        |
| [`prefer-stable-docusaurus-theme-class-names`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-stable-docusaurus-theme-class-names)                                         |  —  | Prefer documented stable Docusaurus theme class names over attribute-selector fallbacks for known theme components.                                 |
| [`require-docsearch-color-mode-pairs`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-docsearch-color-mode-pairs)                                                         |  —  | Require paired light/dark DocSearch token override blocks when customizing DocSearch by color mode.                                                 |
| [`require-docsearch-root-scope-for-docsearch-token-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-docsearch-root-scope-for-docsearch-token-overrides)         |  —  | Require DocSearch token overrides to live on the .DocSearch root scope instead of descendant or non-DocSearch selectors.                            |
| [`require-html-prefix-for-docusaurus-data-attribute-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-html-prefix-for-docusaurus-data-attribute-selectors)       |  —  | Require an html prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces.                                         |
| [`require-ifm-color-primary-scale`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale)                                                               |  —  | Require the full recommended Infima primary color scale when overriding --ifm-color-primary.                                                        |
| [`require-ifm-color-primary-scale-per-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale-per-color-mode)                                 |  —  | Require matching Infima primary color-scale overrides for each Docusaurus color mode you customize.                                                 |
| [`require-local-anchor-for-global-theme-overrides-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-local-anchor-for-global-theme-overrides-in-css-modules) |  —  | Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules.                                                |
