---
name: audit-stylelint-plugin-best-practices
description: "🤖🤖 Use this prompt to audit the repository against modern Stylelint plugin authoring best practices and official guidance."
argument-hint: Provide any focus areas such as custom syntax support, rule metadata, shareable configs, docs, tests, or package validation.
---

# Task: Looping Stylelint Plugin Best-Practices Audit

Compare this repository against modern Stylelint plugin authoring and rule-authoring best practices, especially official Stylelint guidance and current PostCSS/Stylelint ecosystem conventions.

## Audit areas

Prioritize the following surfaces:

1. plugin runtime shape and package exports
2. rule metadata (`ruleName`, `messages`, `meta.url`, `meta.fixable`, docs metadata)
3. shareable config ergonomics and namespace consistency
4. PostCSS traversal strategy and performance
5. custom-syntax handling and failure behavior
6. tests, fixer coverage, and config-level integration tests
7. docs quality and Docusaurus/site consistency
8. package-validation and publish readiness

## Expectations

- Prefer official Stylelint guidance over local habit when they conflict.
- Call out unsafe autofixers, repeated whole-root rescans, and hidden syntax assumptions.
- Recommend concrete code or docs changes, not vague observations.
- If the repo is a template, audit the template quality as well as the current implementation.

## Deliverable

At the end, provide:

- the highest-priority problems you found
- what you changed or recommend changing
- how you validated the improvements
- any follow-up work that should happen in later prompts
