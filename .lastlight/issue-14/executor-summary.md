# Executor summary — issue #14: Run the tests on Node 22 and 24 in CI

## What was done

Turned the single-version `test` job in `.github/workflows/test.yml` into a
matrix over Node 22 and 24, exactly as the architect plan specified. No other
files were touched.

## Files changed

| Path | Change |
|------|--------|
| `.github/workflows/test.yml` | Added `strategy.matrix.node: [22, 24]` to `jobs.test`; replaced `node-version: 22` with `node-version: ${{ matrix.node }}` |

Final workflow content:

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

Triggers, permissions, runner, checkout/setup steps and `npm test` are
byte-for-byte unchanged. No `fail-fast`, caching, `npm ci`, or extra jobs added.

## Test / lint / typecheck results

Full suite (`npm test`, Node v24.22.1 local — the only version available in the
sandbox), run once with `timeout: 900`:

```
$ npm test
> factory-test@0.1.0 test
> node --test
...
ℹ tests 53
ℹ suites 0
ℹ pass 53
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 491.554069
EXIT=0
```

YAML validity / structure check (PyYAML and Ruby were unavailable, so parsed
with the `yaml` npm package installed in `/tmp`, outside the repo):

```
strategy: {"matrix":{"node":[22,24]}}
node-version: ${{ matrix.node }}
trigger: {"pull_request":null,"push":{"branches":["main"]}}
runs-on: ubuntu-latest
YAML-CHECK: PASS
EXIT=0
```

- Lint: none configured in `package.json` / repo.
- Typecheck: none configured.
- Build: no build step in `package.json`.

`git diff --stat` shows only `.github/workflows/test.yml` (4 insertions, 1
deletion). No `package-lock.json` was generated in the repo (no `npm install`
was needed; the repo has zero dependencies).

## Deviations from the plan / known issues

- **No failing test written first (TDD):** the plan's manifest is a single
  static CI config file and explicitly says "no test code changes"; adding a
  YAML parser dependency to `test/` would violate the issue's "no other
  changes" scope. Verification is the YAML structure check above plus the full
  `npm test` suite.
- **Node 22 leg is only verified by CI.** The sandbox has Node v24 only; local
  `npm test` covers the Node 24 path. Both `test (22)` and `test (24)` will run
  on the PR.
- **Branch protection check-name risk (surfaced, not fixed):** `main` requires a
  check named `test`; a matrix reports `test (22)` / `test (24)`. A maintainer
  may need to update the required status checks. Fixing this in-repo (aggregator
  job / rename) is out of the issue's stated scope. This must be surfaced in the
  PR description.
