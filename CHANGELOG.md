# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-17

### Added

- `base.json` preset with the strict baseline compiler options shared by every other preset (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules`, and related lint-like checks).
- `node.json` preset (extends `base.json`) targeting Node.js, using `nodenext` module/resolution, an `ES2023` target, and `ES2024` lib.
- `nest.json` preset (extends `node.json`) tailored for NestJS, enabling `commonjs` module output, decorator metadata, and relaxed `erasableSyntaxOnly`/`strictPropertyInitialization` for constructor parameter properties and DTO/entity ergonomics.
- `angular.json` preset (extends `base.json`) tailored for Angular, using a browser target, `bundler` module resolution, and decorator support.
- `typescript` and `@types/node` peer dependencies.
- `exports` map exposing the `configs/*.json` presets as extendable subpaths.
- `engines.node` field requiring Node.js `>=24.18.0`.
