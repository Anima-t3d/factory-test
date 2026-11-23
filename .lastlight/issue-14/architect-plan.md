# Architect plan — issue #14: Run the tests on Node 22 and 24 in CI

## Problem Statement

`.github/workflows/test.yml:12-19` defines a single `test` job that installs one
Node version (`node-version: 22` at `.github/workflows/test.yml:18`) and runs
`npm test` (`.github/workflows/test.yml:19`). Regressions that only appear on
Node 24 are never caught in CI, even though `package.json` declares
`"engines": { "node": ">=22" }`. The issue asks for the `test` job to become a
matrix over Node 22 and 24 using `strategy.matrix.node` and
`node-version: ${{ matrix.node }}`, with no other changes.

## Summary

One file, one job: add `strategy.matrix.node: [22, 24]` to the `test` job and
replace the hard-coded `node-version: 22` with `node-version: ${{ matrix.node }}`.
Triggers, permissions, runner, checkout step and the `npm test` step stay
byte-for-byte unchanged.

## Files to modify (exhaustive)

`ls .github/workflows/` → only `test.yml`. No other workflow exists.

| # | Path | Anchor | Change |
|---|------|--------|--------|
| 1 | `.github/workflows/test.yml` | `jobs.test` (lines 12-13), between `runs-on: ubuntu-latest` and `steps:` | Insert `strategy:` / `matrix:` / `node: [22, 24]` |
| 2 | `.github/workflows/test.yml` | line 18, `node-version: 22` under `actions/setup-node@v4` | Replace with `node-version: ${{ matrix.node }}` |

No changes to `src/`, `test/`, `package.json`, `AGENTS.md`, `README.md`, and
no lockfile is added.

### Exact target content of `.github/workflows/test.yml`

```yaml
name: test

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [22, 24]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

Notes:
- Do **not** add `fail-fast: false`, `name:`, caching, `npm ci`, or other
  extras — the issue says "No other changes". Default `fail-fast: true` still
  fails the workflow if either leg fails (acceptance criterion satisfied).
- Keep 2-space indentation consistent with the existing file.

## Commands (from guardrails-report.md)

- Install: `npm install` (no lockfile; `npm ci` is not usable). Delete any
  generated `package-lock.json` afterwards — it must not be committed.
- Test: `npm test` (runs `node --test`; 53 tests currently pass).
- Full gate: `.git/lastlight-gate.sh` (`set -euo pipefail; npm test`).
- Lint: none configured. Typecheck: none configured.

## Implementation approach

1. Edit `.github/workflows/test.yml` to exactly the target content above.
2. Validate the YAML parses, e.g.
   `python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/workflows/test.yml')); print(d['jobs']['test']['strategy'])"`
   if PyYAML is available; otherwise visually diff with `git diff`.
3. Run `npm test` locally; it must exit 0.
4. `git diff --stat` must show only `.github/workflows/test.yml` (plus
   `.lastlight/issue-14/` scratch files handled by the harness).
5. Commit: `ci: run tests on Node 22 and 24` (Conventional Commits).

## Risks and edge cases

- **Branch protection check name (warn-and-surface):** `main` requires a check
  named `test`. With a matrix, GitHub reports `test (22)` and `test (24)`
  instead of `test`. If the protection rule lists the bare `test` context, the
  PR may sit waiting for a check that never reports. This cannot be fixed in
  repo code without going beyond the issue's scope (e.g. adding an aggregator
  job). The executor must **surface this explicitly in the PR description** so
  a maintainer can update the required checks to `test (22)` / `test (24)`.
  Do not add extra jobs or rename the job to work around it.
- **Local verification covers only one Node version:** the sandbox has Node
  v24; the Node 22 leg is only verified by CI. Say so in the PR body rather
  than implying both versions were tested locally.
- **YAML numeric versions:** `22` / `24` as bare numbers are fine for
  `setup-node` (they resolve to latest 22.x / 24.x). No quoting needed; avoid
  values like `22.10` which YAML would turn into floats.
- No unsupported inputs in the design — the change is static configuration.

## Test strategy

- `npm test` locally (Node 24) must pass — no test code changes.
- YAML validity check of the edited workflow.
- CI on the PR is the real verification: both `test (22)` and `test (24)` must
  run `npm test` and pass.

## Estimated complexity

simple
