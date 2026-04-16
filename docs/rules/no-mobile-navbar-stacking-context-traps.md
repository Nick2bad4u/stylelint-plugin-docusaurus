# no-mobile-navbar-stacking-context-traps

Disallow containing-block and stacking-context properties on Docusaurus navbar selectors unless they are guarded behind the desktop breakpoint.

## Targeted pattern scope

This rule targets Docusaurus navbar selectors such as `.navbar`, `.navbar--fixed-top`, and `.theme-layout-navbar` when they use properties that can trap the mobile sidebar and backdrop inside a new containing block or stacking context.

The initial rule scope checks:

- `transform`
- `filter`
- `perspective`
- `contain`
- `will-change` when it hints transform-like behavior

The rule allows safe reset values like `none`, `initial`, and `unset`, and it also allows these properties inside a desktop-only media query such as `@media (min-width: 997px)`.

## What this rule reports

This rule reports navbar declarations that can change containing-block or stacking-context behavior for the mobile sidebar subtree.

## Why this rule exists

In Docusaurus mobile view, the sidebar and its backdrop are rendered inside the navbar subtree.

Those mobile overlay elements rely on fixed-position behavior. If custom CSS puts transform-like or containment properties on the navbar itself, the mobile sidebar can start behaving relative to the navbar instead of the viewport, which can break positioning, clipping, and overlay rendering.

## ❌ Incorrect

```css
.navbar {
 transform: translateZ(0);
}
```

## ✅ Correct

```css
@media (min-width: 997px) {
 .navbar {
  transform: translateZ(0);
 }
}
```

## Behavior and migration notes

- This rule is intentionally conservative and only checks a curated set of high-risk properties.
- It is report-only because moving or restructuring these declarations safely requires layout intent that Stylelint cannot infer.
- If you need one of these properties on desktop only, guard it explicitly behind the desktop breakpoint.

## Additional examples

### ❌ Incorrect — containment on the navbar

```css
.navbar--fixed-top {
 contain: content;
}
```

### ✅ Correct — harmless reset

```css
.navbar {
 transform: none;
 will-change: opacity;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/no-mobile-navbar-stacking-context-traps": true,
 },
};
```

## When not to use it

Disable this rule if your site has swizzled the navbar layout enough that the mobile sidebar no longer depends on the default Docusaurus navbar subtree behavior.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Mobile sidebar not working with backdrop-filter](https://github.com/facebook/docusaurus/issues/6996)

> **Rule catalog ID:** R008

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Docusaurus issue #6996: mobile sidebar not working with backdrop-filter](https://github.com/facebook/docusaurus/issues/6996)
- [MDN: containing block](https://developer.mozilla.org/docs/Web/CSS/CSS_display/Containing_block)
