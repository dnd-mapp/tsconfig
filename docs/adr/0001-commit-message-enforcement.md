# Commit message enforcement via CI, scoped to pull requests only

This repository only allows merge commits (squash and rebase merge are disabled in the GitHub repo settings), so every commit on a branch lands in `main`'s history exactly as written. There's no squash step to clean up a stray non-conventional commit message. The local `commit-msg` husky hook can be skipped (`--no-verify`) or simply never installed, so `pull-request.yml` also runs `commitlint` across the full commit range of the PR (`--from <base> --to <head>`) as a backstop.

`push-main.yml` does not repeat this check. `main` is configured as a protected branch requiring pull requests, so every commit reaching it was already validated by `pull-request.yml` before merging. Re-checking in `push-main.yml` would just re-validate the same commits. This reasoning depends on that branch protection setting staying enabled; if it's ever relaxed to allow direct pushes to `main`, those commits would bypass commit-message linting entirely.

## Considered options

- Also, lint in `push-main.yml`, for defense-in-depth regardless of branch protection. Rejected as pure redundancy given the PR-only merge policy (revisit if direct pushes to `main` are ever allowed).
