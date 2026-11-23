# Guardrails check — issue #21

Branch: `lastlight/21-add-a-reversecase-helper-to-src-case-js`
Issue: add a `swapCase(text)` helper to `src/case.js`. Normal feature work,
not a bootstrap/tooling task.

## Environment / install

- Node `v24.22.1`, npm `11.19.1` (repo requires Node >= 22).
- No lockfile and no dependencies in `package.json`; `npm install --no-audit
  --no-fund` exited 0 ("up to date"). The generated `package-lock.json` was
  removed again to keep the tree clean. Install is effectively a no-op.

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| Test framework | PRESENT, not run | `node --test` via `npm test`; tests exist in `test/` (`case.test.js`, `slugify.test.js`, `truncate.test.js`). Setup phase deliberately does not run the suite. |
| Linting | ABSENT | No eslint/biome/oxlint config and no `lint` script. Not a blocker. |
| Type checking | ABSENT | No `tsconfig.json`, no tsc/mypy (plain ESM JavaScript). Not a blocker. |
| CI pipeline | INFORMATIONAL | `.github/workflows/test.yml` runs `npm test` on Node 22 for `pull_request` and pushes to `main`; no lint/typecheck steps. |

## Gate script

`.git/lastlight-gate.sh` (never committed) contains only the full test suite,
exactly as CI and `AGENTS.md` run it:

```sh
#!/usr/bin/env bash
set -euo pipefail
npm test
```

## Verdict

No configured check is failing. The harness now runs `npm test` as the gate.
