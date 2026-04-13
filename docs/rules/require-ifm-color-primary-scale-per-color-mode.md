# require-ifm-color-primary-scale-per-color-mode

Require matching Infima primary color-scale overrides for each Docusaurus color mode you customize.

## Targeted pattern scope

This rule checks primary-scale overrides in Docusaurus theme scopes such as:

- `:root`
- `[data-theme='light']`
- `[data-theme='dark']`

It focuses on whether you customize the primary scale in both light/default and dark mode, not on whether each individual scope contains every required variable. The existing `require-ifm-color-primary-scale` rule covers the full-scale requirement within a touched scope.

## What this rule reports

This rule reports files that customize Infima primary-scale variables in only one color mode.

## Why this rule exists

Docusaurus explicitly encourages different palettes in light and dark mode because one primary color scale rarely works equally well in both.

If you customize only one mode, the other mode may fall back to an unrelated default palette and the site can feel inconsistent during color-mode switches.

## ❌ Incorrect

```css
:root {
 --ifm-color-primary: #4f46e5;
}
```

## ✅ Correct

```css
:root {
 --ifm-color-primary: #4f46e5;
}

[data-theme="dark"] {
 --ifm-color-primary: #818cf8;
}
```

## Behavior and migration notes

- This rule is intentionally stricter than Docusaurus itself.
- It complements `require-ifm-color-primary-scale` instead of replacing it.
- It is report-only because choosing a second color palette is a design decision.

## Additional examples

### ❌ Incorrect — dark mode customized without a matching light/default scope

```css
[data-theme="dark"] {
 --ifm-color-primary: #818cf8;
}
```

### ✅ Correct — explicit light-mode scope instead of `:root`

```css
[data-theme="light"] {
 --ifm-color-primary: #4f46e5;
}

[data-theme="dark"] {
 --ifm-color-primary: #818cf8;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/require-ifm-color-primary-scale-per-color-mode": true,
 },
};
```

## When not to use it

Disable this rule if your design intentionally uses the same Infima primary palette for both light and dark mode, or if you are comfortable leaving one mode on the framework defaults.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R014

## Further reading

- [Docusaurus Styling and Layout — Styling your site with Infima](https://docusaurus.io/docs/styling-layout#styling-your-site-with-infima)
