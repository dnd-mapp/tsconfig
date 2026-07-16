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

Once `validate` passes, the `release` job waits at the `npm-publish` GitHub Environment for a required reviewer to approve it (see [ADR 0004](../../adr/0004-release-workflow-job-structure.md)). Go to the workflow run under the **Actions** tab and click **Review deployments** to approve it.

Approving lets the job run, which:

1. Builds the package and packs it into a tarball.
2. Extracts the matching section of `CHANGELOG.md` into the release notes.
3. Creates a **draft** GitHub Release for the tag, with that tarball attached.
4. Stages the npm publish via `pnpm stage publish`, using [trusted publishing](../../../CONTEXT.md) (OIDC), no `NPM_TOKEN` involved.

## 4. Approve the staged npm publish

Staging is different from publishing (see [ADR 0002](../../adr/0002-staged-and-trusted-publishing.md)). The package now sits in npm's stage queue and won't be installable until you approve it with 2FA, either:

- **On npmjs.com**: open the package's **Staged Packages** tab and click **Approve**.
- **Via the CLI**:

  ```shell
  pnpm stage list
  pnpm stage approve <stage-id>
  ```

If you spot a problem before approving, `pnpm stage reject <stage-id>` discards it instead.

## 5. Publish the draft GitHub Release

Once the npm side has gone live, publish the draft release so it's visible to everyone. Either click **Publish release** on the draft in the **Releases** tab, or:

```shell
gh release edit vX.Y.Z --draft=false
```

The two are deliberately independent: the draft is created as soon as the `npm-publish` environment is approved, but it's on you to only make it public once npm has actually approved the staged package too.

## Troubleshooting

- **`validate` fails with a version mismatch**: the tag doesn't match `package.json`'s `version` at the tagged commit. Fix the version, delete the tag, retag, and re-push.
- **`validate` fails the main-ancestry check**: the tagged commit isn't reachable from `main`. Make sure you tagged a commit that's actually been merged.
- **The `release` job never seems to start**: check the `npm-publish` environment's "Deployment branches and tags" configuration includes a tag rule matching `v*`. It needs to allow tags, not just the `main` branch.
