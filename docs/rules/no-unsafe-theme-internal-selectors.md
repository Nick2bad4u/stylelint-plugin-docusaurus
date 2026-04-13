# no-unsafe-theme-internal-selectors

Disallow curated unsafe Docusaurus internal selector fallbacks that have no documented stable CSS contract.

## Targeted pattern scope

This rule targets a curated set of attribute-selector fallbacks for internal Docusaurus theme fragments, including:

- `announcementBarContent`
- `announcementBarClose`
- `docItemContainer`
- `tableOfContents`
- `tocCollapsible`

## What this rule reports

This rule reports selectors such as `[class*='announcementBarContent']` when they target theme internals that Docusaurus does not document as a stable customization surface.

## Why this rule exists

Docusaurus explicitly encourages stable theme class names and invites users to report missing customization hooks.

If you target an undocumented internal fragment anyway, the selector may break on an upgrade and there is no stable contract to fall back to.

## ❌ Incorrect

```css
[class*="announcementBarContent"] {
 max-inline-size: 60rem;
}
```

## ✅ Correct

```css
.theme-announcement-bar {
 max-inline-size: 60rem;
}
```

## Behavior and migration notes

- This rule is intentionally curated and opt-in strict.
- It is different from `prefer-stable-docusaurus-theme-class-names`: that rule reports cases where a known stable replacement exists, while this rule reports internal fragments that should generally not be targeted at all.
- It is report-only because there is no universally safe automatic replacement.

## Additional examples

### ❌ Incorrect — undocumented table-of-contents fallback

```css
[class^="tableOfContents"] {
 inset-block-start: 4rem;
}
```

## Stylelint config example

```js
import { configs } from "stylelint-plugin-docusaurus";

export default {
 ...configs.all,
 rules: {
  ...configs.all.rules,
  "docusaurus/no-unsafe-theme-internal-selectors": true,
 },
};
```

## When not to use it

Disable this rule if your project knowingly relies on those undocumented internals and accepts the need to repair selectors after Docusaurus upgrades.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Swizzling](https://docusaurus.io/docs/swizzling)

> **Rule catalog ID:** R017

## Further reading

- [Docusaurus Styling and Layout — Theme class names](https://docusaurus.io/docs/styling-layout#theme-class-names)
- [Docusaurus Swizzling](https://docusaurus.io/docs/swizzling)
- [Customization use-cases discussion](https://github.com/facebook/docusaurus/discussions/5468)
