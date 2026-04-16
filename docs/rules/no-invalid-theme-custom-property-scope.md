# no-invalid-theme-custom-property-scope

Disallow declaring Docusaurus theme custom properties outside global theme scopes.

## Targeted pattern scope

This rule targets declarations of Docusaurus-wide theme variables such as `--ifm-*` and `--docsearch-*`.

It is focused on **where** those variables are declared, not where they are read with `var(...)`.

For `--docsearch-*` variables, the rule allows both global theme scopes and explicit `.DocSearch` UI scopes because Docusaurus documents DocSearch theming through the DocSearch component surface.

## What this rule reports

This rule reports Docusaurus theme custom property declarations when they appear inside component or page selectors instead of a global theme scope such as `:root` or `[data-theme='dark']`.

## Why this rule exists

Docusaurus and Infima theme variables are intended to behave like global theme tokens.

Declaring them inside component selectors makes theme behavior harder to reason about and can accidentally scope what should be a global override.

## ❌ Incorrect

```css
.heroBanner {
 --ifm-color-primary: #4e89e8;
}
```

## ✅ Correct

```css
:root {
 --ifm-color-primary: #4e89e8;
}

[data-theme="dark"] {
 --ifm-color-primary: #8ab4f8;
}
```

## Behavior and migration notes

- Use `:root` for global defaults.
- Use `[data-theme='dark']` for dark-mode-only overrides.
- Keep component selectors focused on consuming tokens rather than redefining them.

## Additional examples

### ✅ Correct — use global token consumption in a component

```css
.heroBanner {
 color: var(--ifm-color-primary);
}
```

### ✅ Correct — scope DocSearch variables to the DocSearch UI

```css
[data-theme="dark"] .DocSearch {
 --docsearch-primary-color: #8ab4f8;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-recommended"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-recommended"].rules,
  "docusaurus/no-invalid-theme-custom-property-scope": true,
 },
};
```

## When not to use it

Disable this rule if your project intentionally redefines Docusaurus theme variables inside local component scopes and that scoping is part of your design system contract.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Theme configuration](https://docusaurus.io/docs/api/themes/configuration)

> **Rule catalog ID:** R001

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Infima documentation](https://infima.dev/)
