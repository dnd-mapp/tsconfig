# @dnd-mapp/tsconfig

Shared, strict `tsconfig.json` presets for Node.js, NestJS, and Angular projects, distributed as an npm package.

## Language

**Staged publish**:
The state of a package version on npm after `release.yml` submits it via `pnpm stage publish`, but before a maintainer has approved it with 2FA. A staged version is not resolved by `pnpm install`/`npm install` until approved on npmjs.com or via `pnpm stage approve`.
_Avoid_: Publish, deploy, staging environment

**Trusted publishing**:
npm's OIDC-based authentication that lets `release.yml` authenticate to the npm registry using the `id-token: write` permission, without a long-lived `NPM_TOKEN` secret.
_Avoid_: OIDC auth, npm token auth
