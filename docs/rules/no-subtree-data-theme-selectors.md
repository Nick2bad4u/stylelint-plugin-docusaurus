# no-subtree-data-theme-selectors

Disallow subtree-scoped `data-theme` selectors that do not start from the Docusaurus root color-mode attribute.

## Targeted pattern scope

This rule targets selectors that use `[data-theme='dark']` or `[data-theme='light']` somewhere in the middle of the selector instead of starting from the root `html` color-mode surface.

## What this rule reports

This rule reports selectors such as:

- `.widget [data-theme='dark'] .navbar`
- `.widget[data-theme='dark']`
- `body [data-theme='light'] .footer`

Those patterns imply that `data-theme` is present on some descendant subtree, but Docusaurus sets it on the root document element.

## Why this rule exists

Docusaurus color mode is a document-level concern.

When CSS treats `data-theme` like an arbitrary local attribute, the selector usually does not match what the runtime actually renders. That leads to dead overrides and confusing dark-mode bugs.

## ❌ Incorrect

```css
.widget [data-theme="dark"] .navbar {
 color: white;
}
```

## ✅ Correct

```css
[data-theme="dark"] .navbar {
 color: white;
}
```

## Behavior and migration notes

- This rule complements `prefer-data-theme-color-mode`. That rule migrates legacy `.theme-dark` and `.theme-light` classes; this rule checks that your `data-theme` selectors are rooted correctly.
- It is report-only because automatically rewriting subtree selectors can change meaning.

## Additional examples

### ✅ Correct — explicit root element form

```css
html[data-theme="light"] .footer {
 color: black;
}
```

### ❌ Incorrect — attribute placed on a local element

```css
.widget[data-theme="dark"] {
 color: white;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-recommended"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-recommended"].rules,
  "docusaurus/no-subtree-data-theme-selectors": true,
 },
};
```

## When not to use it

Disable this rule if your application deliberately adds `data-theme` to non-Docusaurus subtree elements and you want this repository to treat that pattern as intentional.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R012

## Further reading

- [Docusaurus Styling and Layout — Dark Mode](https://docusaurus.io/docs/styling-layout#dark-mode)
