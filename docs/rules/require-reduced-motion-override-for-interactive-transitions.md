# require-reduced-motion-override-for-interactive-transitions

Require a `@media (prefers-reduced-motion)` override when interactive selectors declare `transition` or `animation`.

## Targeted pattern scope

This rule targets `transition`, `transition-property`, `transition-duration`, `animation`, `animation-name`, and `animation-duration` declarations on CSS rule selectors that contain interactive pseudo-classes: `:hover`, `:focus`, `:focus-visible`, `:focus-within`, and `:active`.

The rule skips declarations whose value is already a safe no-motion value (`none`, `0s`, `initial`, `unset`, `inherit`, `revert`, or a zero-duration shorthand such as `0ms`).

The rule also skips declarations that are already written inside a `@media (prefers-reduced-motion)` block — those are already part of the reduced-motion handling path.

## What this rule reports

The rule reports `transition` or `animation` declarations on interactive selectors when no `@media (prefers-reduced-motion: reduce)` companion exists in the file that covers the same selector.

"Covered" means one of the following is true:

1. A `@media (prefers-reduced-motion)` block in the file contains a rule with the **same selector**.
2. A `@media (prefers-reduced-motion)` block in the file contains a rule with the **base selector** (the interactive pseudo-classes stripped from the selector — for example `.button` as the base of `.button:hover`).
3. A `@media (prefers-reduced-motion)` block in the file contains a **universal-selector reset** (`*`, `*::before`, or `*::after`) that sets `transition` or `animation` to a safe value such as `none`.

## Why this rule exists

Users who prefer reduced motion (WCAG 2.1 Success Criterion 2.3.3, AAA) or who have configured their operating system to minimise motion may not see the elegant CSS transitions you designed — they may instead experience nausea, vestibular disorder symptoms, or discomfort.

Docusaurus sites commonly add hover and focus transitions to navbar links, sidebar items, buttons, and interactive cards. Each of those transitions should have a paired `@media (prefers-reduced-motion: reduce)` block that suppresses or greatly reduces the motion.

This rule surfaces missing companions before users are affected.

## ❌ Incorrect

```css
/* Missing @media (prefers-reduced-motion) companion */
.navbar__link:hover {
 color: var(--ifm-color-primary);
 transition: color 0.2s ease;
}
```

```css
/* Missing companion even though another reduced-motion block exists for a different selector */
.sidebar__link:focus-visible {
 outline-offset: 2px;
 transition: outline-offset 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
 .hero__cta:hover {
  transition: none;
 }
}
```

## ✅ Correct

```css
/* Exact selector companion */
.navbar__link:hover {
 color: var(--ifm-color-primary);
 transition: color 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
 .navbar__link:hover {
  transition: none;
 }
}
```

```css
/* Base selector companion (without interactive pseudo) */
.sidebar__link:focus-visible {
 outline-offset: 4px;
 transition: outline-offset 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
 .sidebar__link {
  transition: none;
 }
}
```

```css
/* Universal reset companion — covers all interactive selectors in the file */
@media (prefers-reduced-motion: reduce) {
 *,
 *::before,
 *::after {
  animation: none !important;
  transition: none !important;
 }
}

.button:hover {
 transform: translateY(-2px);
 transition: transform 0.2s ease;
}

.card:focus-visible {
 box-shadow: 0 0 0 3px var(--ifm-color-primary);
 transition: box-shadow 0.15s ease;
}
```

```css
/* Already inside @media (prefers-reduced-motion: no-preference) — safe */
@media (prefers-reduced-motion: no-preference) {
 .hero__cta:hover {
  transform: scale(1.04);
  transition: transform 0.2s ease;
 }
}
```

## Behavior and migration notes

- **Motion properties checked:** `transition`, `transition-property`, `transition-duration`, `animation`, `animation-name`, `animation-duration`.
- **Interactive pseudo-classes checked:** `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`.
- **Companion discovery:** The rule scans the entire file for `@media (prefers-reduced-motion)` blocks; the companion does not need to be adjacent to the flagged declaration.
- **No autofix** is provided. Safe motion suppression depends on design intent and it is impossible to automatically determine whether `transition: none` or a reduced alternative (e.g. `transition: opacity 0.05s`) is the correct replacement.
- **`recommended: false`** — this rule is opt-in. Enable it when you want strict reduced-motion hygiene across your Docusaurus CSS.

## Additional examples

### ✅ Correct — safe `none` value requires no companion

```css
/* transition: none is already a no-motion value, nothing to flag */
.navbar__link:hover {
 transition: none;
}
```

### ✅ Correct — reduced-motion block uses the unqualified base selector

```css
.menu__link:active {
 background: var(--ifm-color-primary-lightest);
 transition: background 0.1s ease;
}

@media (prefers-reduced-motion: reduce) {
 /* Covers .menu__link:active via base selector match */
 .menu__link {
  transition: none;
 }
}
```

### ❌ Incorrect — companion exists but does not cover this selector

```css
.badge:hover {
 transform: scale(1.08);
 transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
 /* Covers .card:hover, not .badge:hover */
 .card:hover {
  transition: none;
 }
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/require-reduced-motion-override-for-interactive-transitions": true,
 },
};
```

## When not to use it

Disable this rule if your site already enforces reduced-motion compliance through a global reset stylesheet or a third-party accessibility utility that handles `prefers-reduced-motion` at a different layer. You can also disable it for individual declarations using a `/* stylelint-disable-next-line */` comment when the transition is intentionally safe (for example a short `opacity` fade that is not considered vestibular-triggering).

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)

## Further reading

- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.1 SC 2.3.3 Animation from Interactions (AAA)](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)
- [WebAIM: Vestibular Disorders and Motion Sensitivity](https://webaim.org/articles/vestibular/)
- [CSS Tricks: An Introduction to the Reduced Motion Media Query](https://css-tricks.com/introduction-reduced-motion-media-query/)

> **Rule catalog ID:** R027
