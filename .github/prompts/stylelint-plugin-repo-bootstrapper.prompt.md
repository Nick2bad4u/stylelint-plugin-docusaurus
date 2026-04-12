---
name: stylelint-plugin-repo-bootstrapper
description: "🤖🤖 Use this prompt to migrate an existing Stylelint plugin into this modern template structure."
argument-hint: Provide the source plugin location, package name, namespace, and any migration constraints.
---

# Task: Bootstrap a Stylelint Plugin Repository by Migrating a Source Plugin

Use this prompt when the user wants to migrate an existing Stylelint plugin into this template rather than inventing a new plugin from scratch.

## Principles

- Preserve the **source plugin's real rule behavior**.
- Use this repository only as the **template structure and quality bar**.
- Do not import unrelated copied rule content from the template.
- Modernize the runtime, tests, docs, and packaging as part of the migration.

## Workflow

1. Inventory the source plugin's real rules, docs, tests, and package surface.
2. Remove unrelated copied template rule content from the target repo.
3. Port the source plugin into `src/`, `docs/`, `test/`, and package exports using modern Stylelint patterns.
4. Ensure every migrated rule has matching docs and tests.
5. Rebrand the Docusaurus site and package metadata to the target plugin.
6. Run the full validation flow and clean up stale references.

## Deliverable

At the end, provide:

- what source plugin content was migrated
- what template-only content was removed
- how the runtime/docs/tests were modernized
- what validation steps passed
- any follow-up work still worth doing
