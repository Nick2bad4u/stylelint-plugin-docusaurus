# prefer-data-theme-docsearch-overrides

Prefer explicit site `data-theme` selectors over `.navbar--dark` when overriding DocSearch styles.

## Targeted pattern scope

This rule targets selectors that do all of the following at the same time:

- match `.navbar--dark`
- target a DocSearch class such as `.DocSearch-Button` or `.DocSearch-Modal`
- do not include any explicit `[data-theme=...]` scope

The rule is intentionally narrow. It does not report general `.navbar--dark` styling, and it does not report DocSearch selectors that are already scoped by the site's actual color mode.

## What this rule reports

This rule reports DocSearch overrides that use `.navbar--dark` as a proxy for site color mode.

## Why this rule exists

In Docusaurus, the site's active light/dark mode is exposed on the root HTML element through the `data-theme` attribute.

DocSearch styling also follows the root site's color mode. That means `.navbar--dark` is not a reliable substitute for the site's active theme when you customize DocSearch UI pieces.

Using `.navbar--dark` for DocSearch dark-mode overrides can make the search UI drift away from the actual site color mode and produce unreadable combinations.

## ❌ Incorrect

```css
.navbar--dark .DocSearch-Button {
 color: white;
 background: rgb(20 20 20 / 80%);
}
```

## ✅ Correct

```css
[data-theme="dark"] .DocSearch-Button {
 color: white;
 background: rgb(20 20 20 / 80%);
}
```

## Behavior and migration notes

- This rule only checks selectors that touch DocSearch classes.
- It does not autofix because converting `.navbar--dark` selectors into correct site-level `data-theme` selectors requires author intent.
- If you truly want DocSearch to follow navbar styling instead of site color mode, disable this rule for that project.

## Additional examples

### ✅ Correct — explicit light-mode scope

```css
[data-theme="light"] .DocSearch-Button {
 color: var(--ifm-color-emphasis-700);
}
```

### ✅ Correct — non-DocSearch navbar override

```css
.navbar--dark .searchLabel {
 color: white;
}
```

## Stylelint config example

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default {
 ...docusaurusPluginConfigs["docusaurus-all"],
 rules: {
  ...docusaurusPluginConfigs["docusaurus-all"].rules,
  "docusaurus/prefer-data-theme-docsearch-overrides": true,
 },
};
```

## When not to use it

Disable this rule if your site intentionally keeps DocSearch visually tied to a permanently dark navbar style instead of the site's actual `data-theme` value.

## Package documentation

Docusaurus package documentation:

- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [DocSearch styles don't respect `navbar.style: dark`](https://github.com/facebook/docusaurus/issues/11542)

> **Rule catalog ID:** R005

## Further reading

- [Docusaurus Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Docusaurus issue #11542: DocSearch styles don't respect `navbar.style: dark`](https://github.com/facebook/docusaurus/issues/11542)
