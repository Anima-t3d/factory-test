# Guardrails check — issue #14 (Run the tests on Node 22 and 24 in CI)

**Verdict: GATE_PENDING** — normal CI configuration work, not a bootstrap task.

The issue asks for one edit to an existing workflow file: turn the `test` job in
`.github/workflows/test.yml` into a matrix over Node 22 and 24
(`strategy.matrix.node` / `node-version: ${{ matrix.node }}`), with no other
changes. It does not ask for tests, linting, type checking, CI or `AGENTS.md`
to be created — the workflow already exists and the test suite is already in
place. The bootstrap escape hatch therefore does not apply.

## Install

| Command | Result |
| --- | --- |
| `npm ci` | Not attempted — no `package-lock.json`, which `npm ci` requires |
| `npm install` | Exit 0 — "up to date, audited 1 package in 581ms; found 0 vulnerabilities" |

The repo declares no `dependencies`/`devDependencies` and ships no lockfile
(checking in a lockfile is out of scope for this issue); the only tooling it
needs is Node's built-in test runner. `npm install` generated a
`package-lock.json` as a side effect; it was removed afterwards so the
executor starts from a clean tree (`git status --porcelain` empty).

Environment: Node v24.22.1, npm 11.19.1 (repo requires `>=22`).

## Checks

### 1. Test framework — PRESENT, must pass

- `package.json` declares `"test": "node --test"` (Node's built-in runner).
- Test files exist: `test/case.test.js`, `test/slugify.test.js`,
  `test/truncate.test.js`.
- CI (`.github/workflows/test.yml`) runs exactly `npm test`.
- Not run here per instructions; the harness runs the full suite.

Note for the executor: the issue is workflow-only. Do not touch `src/` or
`test/`, and do not change the test command. The matrix must keep both legs
running the existing `npm test` step.

### 2. Linting — ABSENT (not a blocker)

No ESLint/Biome/oxlint/Prettier config, no `lint` script and no lint step in
CI. Nothing to run; noted only.

### 3. Type checking — ABSENT (not a blocker)

No `tsconfig.json`/`jsconfig.json`, no `.ts` files and no `typecheck` script.
Plain ESM JavaScript; nothing to run, noted only.

### 4. CI pipeline — PRESENT (informational)

`.github/workflows/test.yml` runs on `pull_request` and on `push` to `main`
with `permissions: contents: read`, one `ubuntu-latest` job, checkout +
`actions/setup-node@v4` (`node-version: 22`) + `npm test`. That is the file
this issue targets. Per `AGENTS.md`, touching `.github/workflows/` is allowed
here because the issue explicitly asks for it, and `main` is protected by the
required `test` check.

Two things the executor should preserve:

- `AGENTS.md` also says not to add dependencies — none are needed.
- `main` requires the `test` check. `AGENTS.md` notes the check is named
  `test`; a matrix job's visible check names become `test (22)` / `test (24)`,
  so if the branch protection rule is set to the plain job name this may need
  a maintainer decision. That is outside this repo's code, so just flag it in
  the PR rather than adding unrelated workflow changes.

## Gate script

`.git/lastlight-gate.sh` (inside `.git`, never committed) contains the full
suite command exactly as CI runs it:

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Full test suite gate (run by the harness)

_Pending — the harness appends the result here._
