# Release publishing uses npm trusted publishing and staged publishing, not a direct token-based publish

`release.yml` authenticates to npm via OIDC trusted publishing (no long-lived `NPM_TOKEN`) and submits the package with `pnpm stage publish` rather than `pnpm publish`. This means the workflow can never complete a release unattended: a maintainer must still separately approve the staged version with 2FA (CLI or npmjs.com) before it becomes installable. We chose this combination deliberately, even though it adds a manual step, because trusted publishing alone removes the human-presence guarantee that a token-based publish implicitly had. Staged publishing puts that guarantee back, specifically for CI-originated publishes.

## Considered options

- Direct `pnpm publish` via trusted publishing, going fully live the moment the workflow runs. Rejected: with OIDC alone, a compromised or accidental tag push publishes to the world with no human ever looking at it.
- A classic `NPM_TOKEN` secret instead of trusted publishing. Rejected: long-lived tokens are exactly what trusted publishing exists to eliminate and don't need to be reconsidered now that OIDC is available.
