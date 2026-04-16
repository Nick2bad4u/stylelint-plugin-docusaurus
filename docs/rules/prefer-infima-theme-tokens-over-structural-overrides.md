# prefer-infima-theme-tokens-over-structural-overrides

Prefer curated Infima theme tokens over hard-coded structural overrides on common Docusaurus theme surfaces.

## Targeted pattern scope

This rule is intentionally curated.

The initial coverage focuses on common Docusaurus/Infima surfaces that already expose official tokens, including:

- navbar background → `--ifm-navbar-background-color`
- navbar height → `--ifm-navbar-height`
- navbar shadow → `--ifm-navbar-shadow`
- footer background → `--ifm-footer-background-color`
- pagination border radius → `--ifm-pagination-nav-border-radius`

## What this rule reports

This rule reports direct structural declarations like `background-color`, `height`, `box-shadow`, or `border-radius` on those curated surfaces when the declaration hard-codes a value instead of relying on the documented token.

## Why this rule exists

Token overrides survive Docusaurus and Infima updates better than selector-specific hard-coded values.

When a token already exists, using it keeps the styling contract in one predictable place and reduces the amount of structural CSS that has to be audited after framework upgrades.

## ❌ Incorrect

```css
.navbar {
 background-color: #111827;
}
```

## ✅ Correct

```css
:root {
 --ifm-navbar-background-color: #111827;
}
```

## Behavior and migration notes

- This rule only reports the curated selector/property combinations documented above.
- It does not report declarations that already consume the matching token, such as `background-color: var(--ifm-navbar-background-color)`.
- It is report-only because automatically moving declarations into token scopes would be unsafe.

## Additional examples

### ❌ Incorrect — hard-coded footer background

```css
.theme-layout-footer {
 background: #111827;
}
```

### ✅ Correct — token-driven navbar height

```css
:root {
 --ifm-navbar-height: 4rem;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/prefer-infima-theme-tokens-over-structural-overrides": true,
 },
};
```

## When not to use it

Disable this rule if your site intentionally bypasses those Infima tokens and you prefer direct selector-based structural overrides for those surfaces.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R016

## Further reading

- [Docusaurus Styling and Layout — Styling your site with Infima](https://docusaurus.io/docs/styling-layout#styling-your-site-with-infima)
- [Infima Navbar](https://infima.dev/docs/components/navbar)
- [Infima Footer](https://infima.dev/docs/components/footer)
