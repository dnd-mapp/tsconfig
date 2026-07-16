# `release.yml` splits into an ungated `validate` job and a fully-gated `release` job

`validate` runs immediately on tag push with no approval gate: it checks the tag is stable-semver (`vX.Y.Z`), that the tagged commit is reachable from `main` (there is no GitHub ruleset for this. Ruleset tag rules cover naming, permissions, signing, and status checks, but not ancestry, so it's enforced here as a workflow step instead), that the tag's version matches `package.json`, and re-runs `pnpm format-check`/`pnpm lint-md` rather than trusting that the tagged commit already passed `pull-request.yml`/`push-main.yml` (a tag can point at any commit, not just ones that went through those workflows).

`release` depends on `validate` and is gated by the `npm-publish` GitHub Environment (required reviewers). Approval blocks the entire job, not a single step, so building `dist/`, packing the tarball, drafting the GitHub release, and calling `pnpm stage publish` all happen only after a maintainer approves. This is deliberate, so nothing npm- or release-visible happens without a human clicking approve first. The GitHub release is created as a **draft**, published manually later once the npm side has also been approved, so the two "this is out" signals (GitHub release, npm registry) don't get out of sync with each other.

We considered creating the GitHub release immediately on tag push, independent of the npm approval, which would have required splitting `release` further into an ungated "draft release" job and a separately gated "publish" job. We chose the single combined job instead: one approval click covers the whole release-visible side of the process, at the cost of the (already-validated) tag occasionally being approved into a run that still fails a redundant check.

## Considered options

- Everything in one job, no environment gate at all. Rejected: the only collaborator has push access to create tags today, but an environment gate stops any future collaborator's tag push from silently reaching npm's OIDC endpoint unattended.
- Three jobs (validate → draft-release → gated-publish), so the GitHub release appears the instant the tag is pushed. Rejected in favor of the simpler two-job structure; see above.
