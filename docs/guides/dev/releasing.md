# Releasing a new version

This repo has no automated version-bumping tool. You decide the version and write the changelog entry yourself, in a normal PR. Pushing a release tag is what triggers publishing; see [ADR 0003](../../adr/0003-manual-version-bumping.md) for why.

## 1. Bump the version and changelog

In a normal PR against `main`:

1. Update `version` in [package.json](../../../package.json) to the new version.
2. In [CHANGELOG.md](../../../CHANGELOG.md), rename the `## [Unreleased]` heading to `## [X.Y.Z] - YYYY-MM-DD` (today's date), and add a fresh empty `## [Unreleased]` section above it.

Get this merged to `main` like any other change.

## 2. Tag the merged commit

Once the version bump is on `main`:

```shell
git checkout main
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

The tag must:

- Match the pattern `vX.Y.Z` (stable versions only, no pre-release suffixes are supported)
- Point at a commit that's reachable from `main`
- Have a version (after stripping the leading `v`) that exactly matches `package.json`'s `version` field at that commit

Pushing a tag that fails any of these is caught by the `validate` job in [release.yml](../../../.github/workflows/release.yml) before anything else happens.

## 3. Approve the release

Once `validate` passes, the `release` job waits at the `package-publish` GitHub Environment for a required reviewer to approve it (see [ADR 0004](../../adr/0004-release-workflow-job-structure.md) and [ADR 0005](../../adr/0005-private-github-package-registry.md)). Go to the workflow run under the **Actions** tab and click **Review deployments** to approve it.

This is the only approval gate in the process. Approving lets the job run, which:

1. Builds the package and packs it into a tarball.
2. Extracts the matching section of `CHANGELOG.md` into the release notes.
3. Creates the GitHub Release for the tag, with that tarball attached, visible immediately, and starts an **Announcements** discussion mirroring the release's title and notes.
4. Publishes the package to GitHub Package Registry using the workflow's own `GITHUB_TOKEN`. There is no separate staging/2FA-approval step: the version is live on GitHub Package Registry as soon as this step completes.

The release is no longer created as a draft. That existed to keep two separate "this is out" signals (GitHub release, npm registry) in sync while npm's staged publish meant the npm side could lag behind; see [ADR 0005](../../adr/0005-private-github-package-registry.md). With staged publishing gone, both signals land in the same step, so there's nothing left to keep in sync.

## 4. First publish only: set the package to private

GitHub Package Registry has no way to preset a package's visibility before it exists, so the very first publish creates the package with public visibility (inherited from this repository). Immediately after the first release, an org admin must manually set the package to private:

1. Go to the package's page under the `dnd-mapp` org (**Packages** tab, or `github.com/orgs/dnd-mapp/packages`).
2. Open **Package settings**.
3. Under **Danger Zone**, change visibility to **Private**.

Every subsequent release keeps whatever visibility the package already has, so this is a one-time step, not something to repeat per release.

## Troubleshooting

- **`validate` fails with a version mismatch**: the tag doesn't match `package.json`'s `version` at the tagged commit. Fix the version, delete the tag, retag, and re-push.
- **`validate` fails the main-ancestry check**: the tagged commit isn't reachable from `main`. Make sure you tagged a commit that's actually been merged.
- **`validate` fails with no matching changelog section**: `CHANGELOG.md` has no `## [X.Y.Z]` heading for the tagged version. Add the section (see step 1) before tagging.
- **The `release` job never seems to start**: check the `package-publish` environment's "Deployment branches and tags" configuration includes a tag rule matching `v*`. It needs to allow tags, not just the `main` branch.
