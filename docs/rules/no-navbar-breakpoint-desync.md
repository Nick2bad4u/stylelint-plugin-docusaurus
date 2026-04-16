# no-navbar-breakpoint-desync

Disallow custom CSS breakpoints for Docusaurus mobile navbar/sidebar surfaces that can desync from the built-in JS breakpoint.

## Targeted pattern scope

This rule targets explicit mobile navbar/sidebar surfaces such as:

- `.navbar-sidebar`
- `.navbar-sidebar--show`
- `.navbar__toggle`
- `.theme-layout-navbar-sidebar`

It checks the surrounding `@media` queries and reports custom width breakpoints that do not match Docusaurus's documented mobile/desktop cutoff.

## What this rule reports

This rule reports custom breakpoint values like `1024px` around Docusaurus mobile-navbar surfaces.

## Why this rule exists

Docusaurus does not switch those surfaces with CSS alone. The theme also uses JS logic for the mobile navbar/sidebar behavior.

If your CSS moves those surfaces to a different breakpoint without swizzling the matching theme components, you can end up with a UI where CSS thinks the site is mobile while the theme logic still thinks it is desktop, or the other way around.

## ❌ Incorrect

```css
@media (max-width: 1024px) {
 .navbar-sidebar {
  transform: translateX(0);
 }
}
```

## ✅ Correct

```css
@media (max-width: 996px) {
 .navbar-sidebar {
  transform: translateX(0);
 }
}
```

## Behavior and migration notes

- Docusaurus documents `996px` as the mobile max-width and `997px` as the desktop min-width boundary.
- This rule intentionally focuses on the explicit mobile navbar/sidebar surfaces rather than all navbar styling.
- It is report-only because changing the breakpoint safely may also require swizzling JS that uses `useWindowSize`.

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-navbar-breakpoint-desync": true,
 },
};
```

## When not to use it

Disable this rule if you have intentionally swizzled the relevant Docusaurus navbar/sidebar components so the JS breakpoint matches your custom CSS breakpoint.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Swizzling](https://docusaurus.io/docs/swizzling)

> **Rule catalog ID:** R013

## Further reading

- [Docusaurus Styling and Layout — Mobile View](https://docusaurus.io/docs/styling-layout#mobile-view)
- [Docusaurus Swizzling](https://docusaurus.io/docs/swizzling)
