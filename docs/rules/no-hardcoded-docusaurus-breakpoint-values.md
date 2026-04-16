# no-hardcoded-docusaurus-breakpoint-values

Disallow hardcoded pixel values in `@media` queries that match Docusaurus/Infima documented breakpoints.

## Targeted pattern scope

This rule inspects every `@media` at-rule's query parameters and flags any literal `px` value that matches one of the documented Docusaurus/Infima breakpoints:

| Value    | Docusaurus meaning                                                                      |
| -------- | --------------------------------------------------------------------------------------- |
| `576px`  | Infima small breakpoint (`--ifm-breakpoint-sm`)                                         |
| `768px`  | Infima medium breakpoint (`--ifm-breakpoint-md`)                                        |
| `992px`  | Infima large breakpoint (`--ifm-breakpoint-lg`)                                         |
| `996px`  | JS `MOBILE_TOGGLE_BREAKPOINT` — where the navbar switches from mobile to desktop layout |
| `997px`  | Internal `docusaurusDesktopNavbarMinWidthPx` — CSS counterpart to the JS toggle         |
| `1200px` | Infima extra-large breakpoint (`--ifm-breakpoint-xl`)                                   |
| `1400px` | Infima extra-extra-large breakpoint (`--ifm-breakpoint-xxl`)                            |

The rule flags both `min-width` and `max-width` usage as well as modern range-syntax queries.

## What this rule reports

Any `@media` at-rule whose query string contains one of the above hardcoded pixel values triggers a warning — unless the value appears in the `ignoreBreakpoints` secondary option.

## Why this rule exists

Hardcoding these values creates a silent regression vector. The most dangerous example is **`992px` vs `996px`**: both look like plausible "large screen" breakpoints, but Docusaurus's JavaScript fires the mobile-toggle logic at exactly **996px**. A CSS rule written at `992px` will visually desync from the JS behavior — the CSS will switch layout 4px before the sidebar/navbar JavaScript does, causing a brief flash where CSS and JS are out of step.

Centralizing breakpoints in a SCSS variable, custom property, or a shared design-token avoids this class of bug entirely.

## ❌ Incorrect

```css
/* 996px is the Docusaurus JS mobile-toggle boundary — hardcoded here */
@media (max-width: 996px) {
  .custom-nav {
    display: none;
  }
}
```

```css
/* 768px matches the Infima medium breakpoint — fragile hardcode */
@media screen and (min-width: 768px) {
  .sidebar {
    width: 300px;
  }
}
```

```css
/* Dangerous: 992px is NOT the Docusaurus breakpoint (996px is) */
@media (max-width: 992px) {
  .navbar__toggle {
    display: block;
  }
}
```

## ✅ Correct

```scss
// SCSS: extract to a variable
$breakpoint-mobile: 996px;

@media (max-width: #{$breakpoint-mobile}) {
  .custom-nav {
    display: none;
  }
}
```

```css
/* Container query — not a Docusaurus breakpoint */
@media (min-width: 600px) {
  .widget {
    flex-direction: row;
  }
}
```

```css
/* @media that does not reference a known breakpoint value */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

## Behavior and migration notes

- Only literal `px` values are checked; `em` and `rem` equivalents are not flagged (they do not appear in Docusaurus's documented breakpoint table).
- The rule is report-only; no autofix rewrites `@media` parameters.
- All 7 breakpoint values in the set have a documented Docusaurus/Infima meaning.

## Additional examples

### Exempting a specific breakpoint with `ignoreBreakpoints`

An array of breakpoint strings to exempt from reporting. Useful when you intentionally need to match a Docusaurus breakpoint and have documented the reasoning.

```js
// stylelint.config.mjs
export default {
  rules: {
    "docusaurus/no-hardcoded-docusaurus-breakpoint-values": [
      true,
      { ignoreBreakpoints: ["768px"] }
    ]
  }
};
```

### ✅ Correct — modern range syntax without a known breakpoint value

```css
@media (width <= 600px) {
  .widget {
    flex-direction: column;
  }
}
```

### ❌ Incorrect — modern range syntax with a known breakpoint value

```css
@media (width <= 996px) {
  .mobile-panel {
    display: block;
  }
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
  plugins: ["stylelint-plugin-docusaurus"],
  rules: {
    "docusaurus/no-hardcoded-docusaurus-breakpoint-values": true
  }
};
```

## When not to use it

Disable this rule if your project intentionally duplicates Docusaurus breakpoint values and has a build-time mechanism (for example a design-token pipeline) that guarantees they stay in sync.

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Infima Grid and Breakpoints](https://infima.dev/docs/layout/grid)
- [`no-navbar-breakpoint-desync` rule](./no-navbar-breakpoint-desync.md) — complementary rule for the navbar surface specifically

> **Rule catalog ID:** R028
