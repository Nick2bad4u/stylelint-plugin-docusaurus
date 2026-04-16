# prefer-data-theme-color-mode

Prefer Docusaurus data-theme selectors over legacy `.theme-dark` and `.theme-light` classes.

## Targeted pattern scope

This rule targets selector usage of legacy Docusaurus color-mode classes:

- `.theme-dark`
- `.theme-light`

## What this rule reports

This rule reports selectors that use legacy theme classes instead of Docusaurus `data-theme` attribute selectors.

## Why this rule exists

Modern Docusaurus documents color-mode styling through the `data-theme` attribute on the root HTML element.

Using the attribute selector keeps styles aligned with the current platform contract and avoids carrying older selector conventions forward.

## ❌ Incorrect

```css
.theme-dark .navbar {
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

- This rule autofixes `.theme-dark` to `[data-theme='dark']`.
- It autofixes `.theme-light` to `[data-theme='light']`.
- The fixer only rewrites the selector token itself; it does not restructure the surrounding rule.

## Additional examples

### ✅ Correct — light mode selector

```css
[data-theme="light"] .footer {
 color: black;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-recommended"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-recommended"].rules,
  "docusaurus/prefer-data-theme-color-mode": true,
 },
};
```

## When not to use it

Disable this rule if your codebase intentionally preserves legacy theme class selectors for backward-compatibility with an older Docusaurus integration layer.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Theme configuration](https://docusaurus.io/docs/api/themes/configuration)

> **Rule catalog ID:** R003

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Docusaurus Theme Configuration](https://docusaurus.io/docs/api/themes/configuration)
