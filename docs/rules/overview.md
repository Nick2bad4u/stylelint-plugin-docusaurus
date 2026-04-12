---
title: Overview
description: Overview of stylelint-plugin-docusaurus and its current package surface.
---

# stylelint-plugin-docusaurus

`stylelint-plugin-docusaurus` is a Stylelint plugin scaffold focused on Docusaurus styling conventions, theme-token hygiene, and future Docusaurus-specific CSS rules.

The repository is intentionally being converted from a mature ESLint-plugin template into a Stylelint-first template. That means the infrastructure is already high quality, but the public Stylelint rule catalog is intentionally minimal while the new rule families are designed.

## What the package currently exports

- A default Stylelint plugin pack export.
- Two shareable configs:
  - `configs.recommended`
  - `configs.all`
- Static runtime metadata and typed helper infrastructure for future rule authoring.

## Current rule status

The public rule catalog is currently empty on purpose.

That is not an omission or a placeholder trick. The goal is to ship a clean, coherent Stylelint template rather than invent speculative rules copied from the previous ESLint template.

## What comes next

Future public rules are expected to focus on Docusaurus-specific authoring concerns such as:

- safe use of Infima and Docusaurus custom properties
- color-mode-aware selectors and theme boundaries
- component-scoped token aliasing
- stylesheet patterns that interact cleanly with swizzled components and generated theme CSS

Until those rules are added, the package surface stays intentionally small and accurate.
