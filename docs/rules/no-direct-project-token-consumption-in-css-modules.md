# no-direct-project-token-consumption-in-css-modules

Disallow direct project-scoped CSS custom property token consumption in CSS Modules declarations.

## Targeted pattern scope

This rule is a configurable generalisation of [`no-direct-theme-token-consumption-in-css-modules`](./no-direct-theme-token-consumption-in-css-modules.md). While that rule is hardcoded to `--ifm-*` and `--docsearch-*` tokens, this rule accepts a `tokenPrefixes` secondary option that targets any project-defined token namespace.

The rule applies only to CSS Modules files (`.module.css`, `.module.scss`, etc.). It walks every non-custom-property declaration and reports any `var(...)` reference whose custom property name starts with one of the configured prefixes.

## What this rule reports

This rule reports declarations inside CSS Modules that reference a project token directly rather than aliasing it to a component-scoped custom property first.

Example: if `tokenPrefixes: ["--sb-"]`, then any `color: var(--sb-brand-primary)` inside a `.module.css` file triggers a violation.

## Why this rule exists

Project tokens (for example `--sb-*`, `--my-app-*`, or `--brand-*`) define a design contract that belongs to the project level, not to individual components. When a CSS Module consumes a project token directly, it creates invisible coupling:

- The component breaks silently when the token is renamed or removed.
- The component cannot be tested in isolation without reproducing the entire project token sheet.
- Multiple components consuming the same token diverge independently when overrides are applied.

The correct pattern is to alias the project token to a component-scoped custom property at the top of the CSS Module (for example `--button-background: var(--sb-brand-primary)`), then use only the local alias throughout the component. This makes the coupling explicit, self-documenting, and single-point-of-change.

This rule enforces that aliasing discipline for any token namespace you define.

## ❌ Incorrect

```css
/* button.module.css — consumes --sb- token directly */
.button {
  background-color: var(--sb-brand-primary);
  color: var(--sb-text-inverse);
}
```

```css
/* card.module.css — consumes --my-app- token directly */
.card {
  border: 1px solid var(--my-app-border-color);
  padding: var(--my-app-spacing-md);
}
```

## ✅ Correct

```css
/* button.module.css — alias first, then consume the alias */
.button {
  --button-background: var(--sb-brand-primary);
  --button-color: var(--sb-text-inverse);

  background-color: var(--button-background);
  color: var(--button-color);
}
```

```css
/* card.module.css — component-scoped aliases */
.card {
  --card-border-color: var(--my-app-border-color);
  --card-padding: var(--my-app-spacing-md);

  border: 1px solid var(--card-border-color);
  padding: var(--card-padding);
}
```

## Behavior and migration notes

- The rule applies only to CSS Modules files identified by the `.module.css`, `.module.scss`, `.module.sass`, or `.module.less` filename pattern.
- Declarations that define custom properties (where `prop` starts with `--`) are skipped, because aliasing declarations themselves are the desired pattern.
- The rule matches on the first `var(...)` reference per declaration. Nested `var()` fallbacks are not separately analysed.
- This rule is report-only; no autofix inserts aliases automatically.
- The `tokenPrefixes` secondary option is required. Without at least one prefix the rule has no tokens to check and will skip processing.

## Additional examples

### ✅ Correct — alias declared then referenced

```css
/* theme.module.css */
.hero {
  --hero-bg: var(--sb-hero-background);
  --hero-text: var(--sb-hero-foreground);

  background: var(--hero-bg);
  color: var(--hero-text);
}
```

### ❌ Incorrect — multiple project-token namespaces

```css
/* layout.module.css */
.sidebar {
  width: var(--ds-sidebar-width);
  background: var(--brand-surface-secondary);
}
```

```js
// stylelint.config.mjs — catching both namespaces
export default {
  rules: {
    "docusaurus/no-direct-project-token-consumption-in-css-modules": [
      true,
      { tokenPrefixes: ["--ds-", "--brand-"] }
    ]
  }
};
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/no-direct-project-token-consumption-in-css-modules": [
      true,
      { tokenPrefixes: ["--sb-"] }
    ]
  }
};
```

## When not to use it

Disable this rule if your project intentionally allows direct project token consumption in CSS Modules, or if your component architecture does not follow a token-aliasing pattern.

## Further reading

- [`no-direct-theme-token-consumption-in-css-modules` rule](./no-direct-theme-token-consumption-in-css-modules.md) — same pattern for Docusaurus/Infima theme tokens
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Modules specification](https://github.com/css-modules/css-modules)

> **Rule catalog ID:** R031
