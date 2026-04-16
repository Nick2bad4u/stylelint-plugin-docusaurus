---
title: Getting Started
description: Install and use stylelint-plugin-docusaurus in an ESM Stylelint config.
---

# Getting Started

## Installation

```sh
npm install --save-dev stylelint stylelint-plugin-docusaurus
```

## Quick start with a shareable config

```js
import { docusaurusPluginConfigs } from "stylelint-plugin-docusaurus";

export default docusaurusPluginConfigs["docusaurus-recommended"];
```

## Quick start with `extends`

```js
export default {
 extends: [
  "stylelint-config-standard",
  "stylelint-config-recess-order",
  "stylelint-config-idiomatic-order",
  "stylelint-config-standard-scss",
  "stylelint-config-tailwindcss",
  "stylelint-plugin-docusaurus/configs/docusaurus-recommended",
 ],
};
```

## Manual plugin registration

If you prefer to compose rules manually:

```js
import docusaurusPlugin from "stylelint-plugin-docusaurus";

export default {
 plugins: ["stylelint-plugin-docusaurus"],
 // Alternative explicit pack form:
 // plugins: [...docusaurusPlugin],
 rules: {
  "docusaurus/no-mobile-navbar-backdrop-filter": true,
 },
};
```

This package default-exports a plugin-pack array, so both plugin registration forms are supported.
