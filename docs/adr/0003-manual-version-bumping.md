# Version bumps and changelog entries are manual; `release.yml` only validates them

There is no changesets/semantic-release-style tooling in this repo. Bumping `package.json`'s `version` and rewriting `CHANGELOG.md`'s `[Unreleased]` section into a dated `[X.Y.Z]` section happens by hand, in a normal PR, before a release tag is ever pushed. `release.yml` never writes either file. Its `validate` job only checks that the pushed tag's version matches `package.json`, failing the run if they disagree. We chose this over having the workflow own version bumping to avoid a tag-triggered job needing to push new commits back to `main`, and because this repo's changelog was already hand-maintained with no automation in place to build on.

## Considered options

- Have `release.yml` itself compute the version/changelog from the tag and commit the bump. Rejected: a tag-triggered workflow writing back to `main` is awkward (races, extra permissions, unclear commit authorship) for a repo with no existing versioning automation to hook into.
- Adopt changesets or semantic-release now. Rejected as out of scope. This ADR only covers how the release workflow behaves given the current manual process; adopting a versioning tool is a separate decision.
