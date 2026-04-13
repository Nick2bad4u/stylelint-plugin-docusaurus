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
import { configs } from "stylelint-plugin-docusaurus";

export default configs.recommended;
```

This is the simplest way to adopt the package because the shareable config already wires in the local plugin pack.

## Manual plugin registration

If you prefer to compose the config yourself, register the plugin pack explicitly:

```js
import docusaurusPlugin from "stylelint-plugin-docusaurus";

export default {
 plugins: [...docusaurusPlugin],
 rules: {
  // Future docusaurus/* rules go here.
 },
};
```

## Why the config looks this way

This package default-exports a **plugin pack array**, not a single plugin object. That matches common Stylelint multi-rule plugin packages.

Using `plugins: [...docusaurusPlugin]` keeps the config explicit and TypeScript-friendly when you author your config in ESM.

## Current behavior

At the moment, both exported configs are intentionally conservative because the public Docusaurus rule catalog is not published yet.

- `configs.recommended` registers the package and enables the current recommended rules.
- `configs.all` registers the package and enables the full current catalog.
- Because the public catalog is still empty, both configs are currently equivalent.

That equivalence is temporary but intentional.
