---
name: commit-changes
description: Prepare and commit local changes safely for any repository. Use when Codex is asked to create a commit, prepare changes before `git push`, review whether edits are ready to commit, split unrelated changes into separate commits, or enforce Conventional Commit messages with validation checks.
---

# Commit Changes

## Overview
Create clean, reviewable commits with minimal regression risk. Inspect git state first, keep commit scope tight, run available checks, and do not commit secrets or failing changes unless the user explicitly asks for a WIP commit.

## Workflow
1. Read current git context:
   - `git branch --show-current`
   - `git status --porcelain`
   - `git diff ${0:-main}...HEAD --name-only`
   - `git diff --stat ${0:-main}...HEAD`
2. Ensure commit focus:
   - group only related changes
   - split features, refactors, formatting churn, and generated files when they do not belong together
   - if scope is unclear, propose a split before staging
3. Review the changed files using [references/commit-writter.md](references/commit-writter.md).
4. Run sanity checks when available:
   - JavaScript/TypeScript: `npm -s test`, `npm -s run lint`, `npm -s run typecheck`
   - Python: `python -m pytest -q`
   - do not commit on failures unless the user explicitly requests a WIP commit
5. Stage deliberately:
   - prefer `git add -p`
   - inspect the staged diff for secrets before committing
6. Compose the commit message:
   - required format: `<type>(<scope>): <titulo curto>`
   - allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
   - keep the subject imperative, specific, and within 72 characters
   - add a body when the change is not trivial
7. Commit and verify:
   - create the commit
   - show `git show --stat --oneline -1`
   - show `git log ${0:-main}...HEAD --oneline`

## Guardrails
- Do not commit secrets, credentials, or sensitive `.env` values.
- Do not commit large generated artifacts unless they are required by the repository.
- Do not bundle unrelated changes just to reduce commit count.
- If repo instructions define a commit convention, follow the repo convention over generic defaults.

## Output
Return a concise report with:
- commit hash and message
- included files
- checks executed and status
- any remaining uncommitted changes

## References
- Read [references/commit-writter.md](references/commit-writter.md) before final staging and commit creation.
