---
name: stylelint-plugin-new-plugin-bootstrapper
description: "🤖🤖 Use this prompt to scaffold a brand-new Stylelint plugin repository from this modern template."
argument-hint: Provide the new package name, plugin namespace, short purpose, and optionally the initial rules to create.
---

# Task: Bootstrap a New Stylelint Plugin Repository

This is a comprehensive, multi-step task to scaffold a brand-new Stylelint plugin repository from this standardized modern template.

## Critical framing

Treat the current repository only as a **structure and quality baseline**.

Use it for:

- folder structure
- config layout
- documentation format
- testing patterns
- package-validation flows
- Docusaurus setup
- sync-script patterns

Do **not** treat any copied rule content, examples, or rule docs as starter material unless the user explicitly requested equivalent behavior.

## Required inputs

Extract or infer the following carefully from the user's request:

1. **Package name** — for example `stylelint-plugin-foo`
2. **Plugin namespace / rule prefix** — for example `foo`
3. **Short plugin purpose** — for example "Stylelint rules for safer Foo framework styling"
4. **Initial rules to create** (optional)

If no concrete rules are provided, prefer a clean minimal plugin scaffold over speculative rule behavior.

## Core instructions

1. **Re-identify the repository** for the new package name, namespace, docs site, metadata, URLs, README, and Docusaurus branding.
2. **Remove unrelated template rule content** surgically. Preserve shared infrastructure, but do not leave unrelated copied rules or docs in place.
3. **Adapt the runtime to Stylelint.** Use Stylelint plugin packs, PostCSS traversal, and shareable Stylelint configs.
4. **Implement only requested rules.** If none are requested, keep the runtime/docs/tests intentionally minimal.
5. **Keep rule metadata and docs authored statically.** Do not inject real docs content at runtime.
6. **Keep package validation, docs generation, and sync workflows coherent.** Update them when package exports or public docs surfaces change.
7. **Do a final sweep** so there are no stale repo-identity references left behind.

## Definition of done

- The repository is fully identified as the requested Stylelint plugin.
- All explicitly requested rules are implemented with TypeScript, PostCSS/Stylelint best practices, docs, and tests.
- If no rules were requested, the repository is still a coherent, clean plugin scaffold.
- Lint, typecheck, tests, and package-validation flows pass.
- The Docusaurus site is functional and correctly branded.
- There are no leftover unrelated rule docs, examples, or package references from the previous template identity.
