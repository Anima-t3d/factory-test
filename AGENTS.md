# Agent instructions

This repo is a sandbox for the agent factory. Keep changes small and focused on the issue.

- Test command: `npm test` (Node 22+, no dependencies). Run it before every commit; it must pass.
- Commits follow Conventional Commits: `type(scope): summary`, e.g. `feat(slugify): keep digits`, `fix(slugify): handle empty input`, `test: cover unicode`.
- Never push to `main`. Work on a branch and open a pull request; `main` is protected and needs the `test` check.
- Do not add dependencies or change `.github/workflows/` unless the issue asks for it.
- This repo is public: never commit secrets, tokens, personal data or internal hostnames.
