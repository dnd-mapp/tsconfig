# Development

How to work on this repository day-to-day. For how to propose a change, see the org-wide [CONTRIBUTING.md](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md).

## Requirements

- Node.js `24.18.0` (see `devEngines` in [package.json](package.json))
- pnpm `11.13.1` (see `devEngines` in [package.json](package.json))

## Getting started

```shell
pnpm i
```

This also installs the [Husky](https://typicode.github.io/husky) git hooks: `lint-staged` runs Prettier/markdownlint on staged files before each commit, and `commitlint` checks each commit message follows [Conventional Commits](https://www.conventionalcommits.org).

## Common tasks

- `pnpm format` / `pnpm format-check` (format, or check formatting, of the whole repo with Prettier)
- `pnpm lint-md` (lint all Markdown files)

## Releasing

Version bumps and changelog entries are manual (see [ADR 0003](docs/adr/0003-manual-version-bumping.md)); pushing a `vX.Y.Z` tag on `main` triggers a gated GitHub Actions workflow that stages the npm publish via trusted publishing and drafts a GitHub release.

See [Releasing a new version](docs/guides/dev/releasing.md) for the full, step-by-step procedure.
