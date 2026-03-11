# Commit Review Protocol

## Git Context
Collect this context before deciding to commit:

- `git branch --show-current`
- `git status --porcelain`
- `git diff ${0:-main}...HEAD --name-only`
- `git diff --stat ${0:-main}...HEAD`

Check whether the worktree contains unrelated edits, partially finished experiments, generated files, or local environment changes. If it does, split the work or leave unrelated files unstaged.

## Review Priorities
Review changed files in this order:

1. Entry points, routes, handlers, or public APIs
2. Shared services, data access, auth, and config
3. Migrations, schemas, or persistence changes
4. Documentation and developer workflow files

Flag:

- behavioral regressions
- missing validation or error handling
- risky refactors mixed with feature work
- accidental formatting churn
- secrets, keys, tokens, passwords, or copied credentials

## Sanity Checks
Run the smallest relevant check set available for the repository:

- JavaScript/TypeScript: `npm -s test`, `npm -s run lint`, `npm -s run typecheck`
- Python: `python -m pytest -q`

If a command does not exist, report that it was unavailable. If a relevant check fails, stop before commit unless the user explicitly requests a WIP commit.

## Staging Discipline
Prefer `git add -p` or targeted `git add <path>` over broad staging. After staging, inspect the cached diff and search for secrets:

`git diff --cached | grep -E "PRIVATE KEY|BEGIN RSA|SECRET|TOKEN|PASSWORD|AWS_" || true`

If sensitive material appears, stop and warn.

## Commit Message Rules
Use:

`<type>(<scope>): <titulo curto>`

Allowed types:

- `feat`
- `fix`
- `refactor`
- `chore`
- `docs`
- `test`
- `perf`

Rules:

- choose a concrete scope such as `auth`, `api`, `db`, `infra`, `worker`, or the repo-specific component name
- keep the subject imperative and within 72 characters
- avoid vague messages such as `update` or `changes`
- add a body for non-trivial changes covering what changed, why it changed, and any risks

## Documentation Analysis
Check whether the changed behavior requires documentation updates:

- If `README.md` exists, confirm whether setup steps, commands, environment variables, ports, or user-facing behavior changed.
- If `DESIGN_SPEC.md` exists, confirm whether the implementation still matches the stated objectives and requirements.
- If either file does not exist, report that explicitly instead of assuming no documentation impact.

Also note when a change introduces:

- new functionality
- altered API behavior
- new configuration or runtime requirements
- changed developer workflow

## Post-Commit Verification
After committing, report:

- `git show --stat --oneline -1`
- `git log ${0:-main}...HEAD --oneline`
- remaining uncommitted files from `git status --porcelain`
