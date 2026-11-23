current_phase: executor

- Plan written to `.lastlight/issue-21/architect-plan.md`.
- Scope: `src/case.js` (append `swapCase`) and `test/case.test.js` (import + 5 tests).
- Function name is `swapCase` per issue body (title says "reverseCase").
- Gate: `npm test`. Complexity: simple.
guardrails_status: READY

executor:
- Implemented `swapCase` + 5 tests (TDD: red then green). Only the two planned files changed.
- `node --test test/case.test.js` -> 32 pass / 0 fail.
- `npm test` -> EXIT=0, 58 pass / 0 fail.
- No build/lint/typecheck configured in this repo. Summary: `.lastlight/issue-21/executor-summary.md`.
