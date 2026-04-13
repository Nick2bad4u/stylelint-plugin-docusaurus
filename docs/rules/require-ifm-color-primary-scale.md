# require-ifm-color-primary-scale

Require the full recommended Infima primary color scale when overriding `--ifm-color-primary`.

## Targeted pattern scope

This rule targets overrides of the Infima primary color family:

- `--ifm-color-primary`
- `--ifm-color-primary-dark`
- `--ifm-color-primary-darker`
- `--ifm-color-primary-darkest`
- `--ifm-color-primary-light`
- `--ifm-color-primary-lighter`
- `--ifm-color-primary-lightest`

## What this rule reports

This rule reports theme-scope blocks that override part of the Infima primary color family without defining the full recommended scale.

## Why this rule exists

Docusaurus documents the Infima primary color scale as a coordinated family of shades.

Defining only part of that family can lead to inconsistent button, link, hover, and dark-mode behavior across the site.

## ❌ Incorrect

```css
:root {
 --ifm-color-primary: #4e89e8;
 --ifm-color-primary-dark: #3576d4;
}
```

## ✅ Correct

```css
:root {
 --ifm-color-primary: #4e89e8;
 --ifm-color-primary-dark: #3576d4;
 --ifm-color-primary-darker: #2c68be;
 --ifm-color-primary-darkest: #234f92;
 --ifm-color-primary-light: #6d9ef0;
 --ifm-color-primary-lighter: #89b1f4;
 --ifm-color-primary-lightest: #b8d0fa;
}
```

## Behavior and migration notes

- This rule only runs when the primary color family is being overridden at all.
- It does not report unrelated Infima variables such as `--ifm-code-font-size`.
- The rule is report-only because generating the missing shades automatically would be unsafe.

## Additional examples

### ✅ Correct — dark mode scale override

```css
[data-theme="dark"] {
 --ifm-color-primary: #8ab4f8;
 --ifm-color-primary-dark: #74a5f6;
 --ifm-color-primary-darker: #6299f4;
 --ifm-color-primary-darkest: #3d7ee9;
 --ifm-color-primary-light: #a0c3fa;
 --ifm-color-primary-lighter: #b5d1fb;
 --ifm-color-primary-lightest: #d7e6fd;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/require-ifm-color-primary-scale": true,
 },
};
```

## When not to use it

Disable this rule if your site intentionally overrides only a subset of the primary Infima scale and you are handling the missing shades elsewhere.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

> **Rule catalog ID:** R002

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Infima documentation](https://infima.dev/)
