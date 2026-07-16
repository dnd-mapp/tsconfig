# @dnd-mapp/tsconfig

[![Push to main](https://github.com/dnd-mapp/tsconfig/actions/workflows/push-main.yml/badge.svg)](https://github.com/dnd-mapp/tsconfig/actions/workflows/push-main.yml)
[![npm version](https://img.shields.io/npm/v/@dnd-mapp/tsconfig.svg)](https://www.npmjs.com/package/@dnd-mapp/tsconfig)
[![npm downloads](https://img.shields.io/npm/dm/@dnd-mapp/tsconfig.svg)](https://www.npmjs.com/package/@dnd-mapp/tsconfig)
[![NPM License](https://img.shields.io/npm/l/@dnd-mapp/tsconfig)](LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)

Shared, strict `tsconfig.json` presets for Node.js, NestJS, and Angular projects.

## Features

- **`base.json`**: the strict baseline every other preset builds on, including `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules`, and consistent lint-like checks (`noUnusedLocals`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`, LF newlines).
- **`node.json`** _(extends `base.json`)_: targets Node.js, using `nodenext` module/resolution, `ES2023` target with `ES2024` lib, and `@types/node` as the only ambient types.
- **`nest.json`** _(extends `node.json`)_: tailored for NestJS, using `commonjs` module (matching Nest's decorator-metadata/DI model), `experimentalDecorators` + `emitDecoratorMetadata` enabled, `erasableSyntaxOnly` disabled to allow constructor parameter properties, `strictPropertyInitialization` disabled for DTO/entity ergonomics, plus `sourceMap` and `incremental` builds.
- **`angular.json`** _(extends `base.json`)_: tailored for Angular, using a browser target (`ES2024` + `DOM` lib), `bundler` module resolution to match the Angular CLI's esbuild-based builder, `experimentalDecorators` enabled, and `erasableSyntaxOnly` disabled to allow constructor parameter properties.

## Requirements

- [TypeScript](https://www.npmjs.com/package/typescript) `>=5.9`
- [@types/node](https://www.npmjs.com/package/@types/node) `>=24` (when using `node.json`, `nest.json`, or `angular.json`)

## Installation

```shell
pnpm add -D @dnd-mapp/tsconfig typescript @types/node
```

`typescript` and `@types/node` are peer dependencies, see [Requirements](#requirements) for supported versions.

## Usage

Extend the preset that matches your project from your `tsconfig.json`.

**Plain TypeScript project:**

```json
{
    "extends": "@dnd-mapp/tsconfig/configs/base.json"
}
```

**Node.js project:**

```json
{
    "extends": "@dnd-mapp/tsconfig/configs/node.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src"]
}
```

**NestJS project:**

```json
{
    "extends": "@dnd-mapp/tsconfig/configs/nest.json"
}
```

**Angular project:**

```json
{
    "extends": "@dnd-mapp/tsconfig/configs/angular.json"
}
```

Each preset only sets `compilerOptions`, add your own `include`/`exclude`, `outDir`/`rootDir`, and any `angularCompilerOptions` on top as needed for your project's layout.

## Contributing

See the org-wide [CONTRIBUTING.md](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md) for how to propose changes, and [DEVELOPMENT.md](DEVELOPMENT.md) for how to work in this repository day-to-day. This project follows the [Code of Conduct](https://github.com/dnd-mapp/.github/blob/main/CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](https://github.com/dnd-mapp/.github/blob/main/SECURITY.md) for how to report a vulnerability.

## Support

See [SUPPORT.md](https://github.com/dnd-mapp/.github/blob/main/SUPPORT.md) for how to get help.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

[MIT](LICENSE)
