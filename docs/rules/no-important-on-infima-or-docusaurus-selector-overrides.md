# no-important-on-infima-or-docusaurus-selector-overrides

Disallow `!important` on declarations inside rules that target Infima or Docusaurus class selectors.

## Targeted pattern scope

This rule walks all declarations that carry the `!important` flag and reports any that appear inside a rule whose selector contains at least one Infima or Docusaurus global theme class name.

Infima/Docusaurus classes are identified using the same class-name heuristics used by other plugin rules — including well-known prefixes such as `menu__`, `navbar__`, `navbar-`, `footer__`, `breadcrumbs__`, `dropdown__`, `pagination-nav__`, `tabs__`, `table-of-contents__`, `DocSearch-`, `theme-`, and exact class names such as `navbar`, `footer`, `navbar-sidebar`, `pagination-nav`, and all documented `theme-*` wrapper classes.

## What this rule reports

Any `!important` declaration whose containing rule selector resolves to an Infima or Docusaurus theme class.

## Why this rule exists

`!important` is a nuclear override: once applied to a property on an Infima or Docusaurus selector, that property becomes immune to all future cascade updates in the same or lower layers. This creates two compounding problems:

1. **Token cascade breakage**: Docusaurus ships design tokens (`--ifm-*` variables) that flow through the component styles via normal cascade specificity. An `!important` override bypasses this flow entirely — a future token value change will not propagate through to the `!important`-flagged property.

2. **Framework upgrade fragility**: When Docusaurus upgrades Infima or restructures its component styles, `!important` overrides on framework selectors are the overrides most likely to silently stop applying correctly, because the specificity context they were written against may have changed.

The correct fix is almost always to increase selector specificity legitimately (for example by prepending a layout wrapper class) or, better, to override the relevant `--ifm-*` token value in the proper scope.

## ❌ Incorrect

```css
/* !important on a navbar class — bypasses the token cascade */
.navbar__link {
  color: red !important;
}
```

```css
/* !important on a menu class */
.menu__link--active {
  font-weight: 700 !important;
  background-color: var(--ifm-color-primary) !important;
}
```

```css
/* !important on a theme wrapper */
.theme-doc-sidebar-container {
  width: 280px !important;
}
```

## ✅ Correct

```css
/* Use a wrapper scope to increase specificity instead */
.my-layout .navbar__link {
  color: red;
}
```

```css
/* Override the token at the right scope */
:root {
  --ifm-menu-link-padding-horizontal: 16px;
}
```

```css
/* !important on a project-local class — not Infima/Docusaurus */
.my-custom-component {
  display: flex !important;
}
```

## Behavior and migration notes

- Class name detection uses the same heuristics as [`no-unanchored-infima-subcomponent-selectors`](./no-unanchored-infima-subcomponent-selectors.md) — it checks class names extracted by the selector parser and matches against documented Infima/Docusaurus prefixes and exact names.
- Only class names are checked. Type selectors (`html`, `body`), ID selectors, and attribute selectors are not included in the Infima/Docusaurus class name check.
- Declarations inside `:global(...)` wrappers in CSS Modules are still checked if the resolved class matches.
- This rule is report-only; no autofix removes `!important` or rewrites selectors.

## Additional examples

### ✅ Correct — `!important` on a custom utility class

```css
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
}
```

### ❌ Incorrect — compound selector includes Infima class

```css
/* Still flagged because .navbar__brand is an Infima selector */
.custom-header .navbar__brand {
  width: 160px !important;
}
```

### ✅ Correct — override token, not the property with !important

```css
/* Override the token at root scope instead */
[data-theme="dark"] {
  --ifm-navbar-background-color: #1a1b26;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/no-important-on-infima-or-docusaurus-selector-overrides": true
  }
};
```

## When not to use it

Disable this rule for third-party CSS compatibility shims that cannot change specificity without `!important`, or for specific overrides where you have verified the `!important` is required and have documented why the normal token-override path is insufficient.

## Further reading

- [MDN: Specificity — !important](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#the_!important_exception)
- [Infima CSS framework](https://infima.dev/)
- [Docusaurus: Custom CSS and theming](https://docusaurus.io/docs/styling-layout)
- [`no-unanchored-infima-subcomponent-selectors` rule](./no-unanchored-infima-subcomponent-selectors.md) — related specificity rule

> **Rule catalog ID:** R033
