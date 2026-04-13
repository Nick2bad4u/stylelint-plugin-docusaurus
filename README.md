# stylelint-plugin-docusaurus

[![npm license.](https://flat.badgen.net/npm/license/stylelint-plugin-docusaurus?color=purple)](https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/stylelint-plugin-docusaurus?color=pink)](https://www.npmjs.com/package/stylelint-plugin-docusaurus) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/stylelint-plugin-docusaurus?color=cyan)](https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/stylelint-plugin-docusaurus?color=yellow)](https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/stylelint-plugin-docusaurus?color=green)](https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/stylelint-plugin-docusaurus?color=red)](https://github.com/Nick2bad4u/stylelint-plugin-docusaurus/issues) [![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/stylelint-plugin-docusaurus?color=blue)](https://codecov.io/gh/Nick2bad4u/stylelint-plugin-docusaurus) [![Mutation testing badge.](https://img.shields.io/endpoint?style=flat-square\&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FNick2bad4u%2Fstylelint-plugin-docusaurus%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/Nick2bad4u/stylelint-plugin-docusaurus/main)

Stylelint plugin scaffold for Docusaurus-focused CSS rules, shareable configs, and future Docusaurus styling conventions.

## Table of contents

1. [Installation](#installation)
2. [Quick start](#quick-start)
3. [Exports](#exports)
4. [Configs](#configs)
5. [Rules](#rules)
6. [Documentation](#documentation)
7. [Contributors ✨](#contributors-)

## Installation

```sh
npm install --save-dev stylelint stylelint-plugin-docusaurus
```

### Compatibility

- **Supported Stylelint versions:** `16.x` and `17.x`
- **Config system:** ESM config files such as `stylelint.config.mjs`
- **Node.js runtime:** `>=22.0.0`

## Quick start

Use the recommended shareable config:

```js
import { configs } from "stylelint-plugin-docusaurus";

export default configs.recommended;
```

If you want to compose the config yourself, register the plugin pack directly:

```js
import docusaurusPlugin from "stylelint-plugin-docusaurus";

export default {
 plugins: [...docusaurusPlugin],
 rules: {
  // Future docusaurus/* rules go here.
 },
};
```

## Exports

The package currently exports:

- the default Stylelint plugin pack
- `configs.recommended`
- `configs.all`
- typed runtime metadata and rule-registry exports for future rule authoring

## Configs

This package intentionally exports these configs from the start:

| Config                | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `configs.recommended` | Default low-noise config for broadly applicable Docusaurus rules. |
| `configs.all`         | Exhaustive stable config for every public `docusaurus/*` rule.    |

`configs.recommended` currently enables eight lower-noise baseline rules, while `configs.all` adds stricter opt-in rules for CSS Modules boundaries, explicit local anchoring for global CSS Module theme escapes, content-scope hygiene, selector stability, paired color-mode overrides, curated token guidance, and reset/cascade-layer safety.

## Rules

| Rule                                                                                                                                                                                                   | Fix | Configs          | Description                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`no-broad-all-resets-outside-isolation-subtrees`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-broad-all-resets-outside-isolation-subtrees)                                 |  —  | all              | Disallow broad all: initial\|revert\|unset resets outside explicitly isolated local subtrees.                                                       |
| [`no-direct-theme-token-consumption-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-direct-theme-token-consumption-in-css-modules)                             |  —  | all              | Disallow direct --ifm-\* and --docsearch-\* token consumption in CSS Modules declarations.                                                          |
| [`no-docusaurus-layer-name-collisions`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-docusaurus-layer-name-collisions)                                                       |  —  | all              | Disallow author-defined cascade layer names that collide with reserved Docusaurus-managed layer prefixes.                                           |
| [`no-invalid-theme-custom-property-scope`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-invalid-theme-custom-property-scope)                                                 |  —  | recommended, all | Disallow declaring Docusaurus theme custom properties outside global theme scopes, except for DocSearch variables scoped to the DocSearch UI.       |
| [`no-mobile-navbar-backdrop-filter`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-backdrop-filter)                                                             |  —  | recommended, all | Disallow backdrop-filter on Docusaurus navbar selectors unless it is guarded behind the desktop breakpoint.                                         |
| [`no-mobile-navbar-stacking-context-traps`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-mobile-navbar-stacking-context-traps)                                               |  —  | all              | Disallow containing-block and stacking-context properties on Docusaurus navbar selectors unless they are guarded behind the desktop breakpoint.     |
| [`no-navbar-breakpoint-desync`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-navbar-breakpoint-desync)                                                                       |  —  | all              | Disallow custom CSS breakpoints for Docusaurus mobile navbar/sidebar surfaces that can desync from the built-in JS breakpoint.                      |
| [`no-revert-layer-outside-isolation-subtrees`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-revert-layer-outside-isolation-subtrees)                                         |  —  | all              | Disallow revert-layer usage outside explicitly isolated local subtrees.                                                                             |
| [`no-subtree-data-theme-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-subtree-data-theme-selectors)                                                               |  —  | recommended, all | Disallow subtree-scoped data-theme selectors that do not start from the Docusaurus root color-mode attribute.                                       |
| [`no-unanchored-infima-subcomponent-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unanchored-infima-subcomponent-selectors)                                       |  —  | all              | Disallow unanchored Infima subcomponent selectors in global Docusaurus stylesheets.                                                                 |
| [`no-unsafe-theme-internal-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unsafe-theme-internal-selectors)                                                         |  —  | all              | Disallow curated unsafe Docusaurus internal selector fallbacks that have no documented stable CSS contract.                                         |
| [`no-unscoped-content-element-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unscoped-content-element-overrides)                                                   |  —  | all              | Disallow unscoped content-element overrides that leak across the whole Docusaurus site.                                                             |
| [`no-unstable-docusaurus-generated-class-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unstable-docusaurus-generated-class-selectors)                             |  —  | all              | Disallow exact selectors that target Docusaurus theme CSS-module class names with unstable hash suffixes.                                           |
| [`no-unwrapped-global-theme-selectors-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/no-unwrapped-global-theme-selectors-in-css-modules)                         |  —  | recommended, all | Disallow unwrapped Docusaurus and Infima global theme selectors inside CSS Modules.                                                                 |
| [`prefer-data-theme-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-color-mode)                                                                     |  🔧 | recommended, all | Prefer Docusaurus data-theme selectors over legacy theme-dark/theme-light classes.                                                                  |
| [`prefer-data-theme-docsearch-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-docsearch-overrides)                                                   |  —  | all              | Prefer \[data-theme] selectors over .navbar--dark when overriding DocSearch styles.                                                                 |
| [`prefer-data-theme-over-prefers-color-scheme`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-data-theme-over-prefers-color-scheme)                                       |  —  | recommended, all | Prefer Docusaurus data-theme selector scopes over prefers-color-scheme media queries when styling Docusaurus theme tokens or global theme surfaces. |
| [`prefer-docsearch-theme-tokens-over-structural-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-docsearch-theme-tokens-over-structural-overrides)               |  —  | all              | Prefer curated DocSearch theme tokens over hard-coded structural overrides on common DocSearch UI surfaces.                                         |
| [`prefer-infima-theme-tokens-over-structural-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-infima-theme-tokens-over-structural-overrides)                     |  —  | all              | Prefer curated Infima theme tokens over hard-coded structural overrides on common Docusaurus theme surfaces.                                        |
| [`prefer-stable-docusaurus-theme-class-names`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/prefer-stable-docusaurus-theme-class-names)                                         |  —  | all              | Prefer documented stable Docusaurus theme class names over attribute-selector fallbacks for known theme components.                                 |
| [`require-docsearch-color-mode-pairs`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-docsearch-color-mode-pairs)                                                         |  —  | all              | Require paired light/dark DocSearch token override blocks when customizing DocSearch by color mode.                                                 |
| [`require-docsearch-root-scope-for-docsearch-token-overrides`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-docsearch-root-scope-for-docsearch-token-overrides)         |  —  | all              | Require DocSearch token overrides to live on the .DocSearch root scope instead of descendant or non-DocSearch selectors.                            |
| [`require-html-prefix-for-docusaurus-data-attribute-selectors`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-html-prefix-for-docusaurus-data-attribute-selectors)       |  —  | recommended, all | Require an html prefix for bare Docusaurus root data-attribute selectors that target global theme surfaces.                                         |
| [`require-ifm-color-primary-scale`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale)                                                               |  —  | all              | Require the full recommended Infima primary color scale when overriding --ifm-color-primary.                                                        |
| [`require-ifm-color-primary-scale-per-color-mode`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-ifm-color-primary-scale-per-color-mode)                                 |  —  | all              | Require matching Infima primary color-scale overrides for each Docusaurus color mode you customize.                                                 |
| [`require-local-anchor-for-global-theme-overrides-in-css-modules`](https://nick2bad4u.github.io/stylelint-plugin-docusaurus/docs/rules/require-local-anchor-for-global-theme-overrides-in-css-modules) |  —  | recommended, all | Require a local selector anchor when overriding Docusaurus global theme surfaces inside CSS Modules.                                                |

## Documentation

- [Overview](./docs/rules/overview.md)
- [Getting Started](./docs/rules/getting-started.md)
- [Current Status](./docs/rules/guides/current-status.md)
- [Configs](./docs/rules/configs/index.md)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind are welcome.
