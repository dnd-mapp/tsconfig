import { cp, readFile, rm, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Name of the package manifest file, both at the repository root and inside `dist/`.
 *
 * @type {string}
 */
const packageManifestFileName = 'package.json';

/**
 * Root-level files that are copied verbatim into `dist/` before publishing, so that the
 * published npm package looks like a self-contained project (manifest, docs, license,
 * changelog) even though the actual publish happens from the `dist/` directory rather
 * than the repository root (see `publishConfig.directory` in `package.json`).
 *
 * @type {string[]}
 */
const files = [packageManifestFileName, 'README.md', 'LICENSE', 'CHANGELOG.md'];

/**
 * Absolute path to the `dist/` directory that gets published to npm.
 *
 * Resolved against `process.cwd()` rather than `import.meta.url`, so this script must
 * always be invoked with the package root as the working directory (which is how npm/pnpm
 * run lifecycle scripts by default).
 *
 * @type {string}
 */
const distFolderPath = join(process.cwd(), 'dist');

/**
 * Copies the plain, unmodified project files (see {@link files}) from the repository root
 * into `dist/`.
 *
 * Each file is copied independently and concurrently via `Promise.all`; `fs.cp` creates any
 * missing destination directories as needed. Note that `package.json` is copied here as-is
 * and is only rewritten afterward by {@link adjustPackageManifest}.
 *
 * @returns {Promise<void>} Resolves once every file has finished copying.
 * @throws {Error} If any source file is missing or cannot be read/written (e.g., due to
 *   filesystem permissions), rejecting the whole `Promise.all`.
 */
async function copyFiles() {
    console.log('Copying raw files');

    await Promise.all(
        files.map((file) => {
            const srcPath = join(process.cwd(), file);
            const dstPath = join(distFolderPath, file);

            return cp(srcPath, dstPath);
        }),
    );
}

/**
 * Recursively copies the `configs/` directory (the actual tsconfig presets this package
 * exists to distribute) from the repository root into `dist/configs/`.
 *
 * This is what makes the `./configs/*.json` entries in the package's `exports` map resolve
 * correctly once the package is installed from npm.
 *
 * @returns {Promise<void>} Resolves once the entire directory tree has been copied.
 * @throws {Error} If the source `configs/` directory does not exist or cannot be read.
 */
async function copyConfigsFolder() {
    console.log('Copying config files');

    const configsFolderName = 'configs/';

    const configsSrcPath = join(process.cwd(), configsFolderName);
    const configsDstPath = join(distFolderPath, configsFolderName);

    await cp(configsSrcPath, configsDstPath, { recursive: true });
}

/**
 * Rewrites the `package.json` that was copied into `dist/` by {@link copyFiles}, stripping
 * fields that are only relevant to developing this repository and have no meaning for a
 * consumer who installs the published package.
 *
 * Specifically removes:
 * - `scripts`: repo-local tooling commands (lint, format, prepare, etc.).
 * - `devEngines`: contributor-facing Node/pnpm version enforcement; unlike `engines`, this
 *   is not meant to constrain consumers and pnpm in particular shouldn't be forced on them.
 * - `publishConfig`: dropped entirely. `publishConfig.directory` (`dist`) is meaningless once
 *   the manifest already lives at the root of the published package, and `publishConfig.registry`
 *   only matters when this repo publishes the package, not to consumers installing it (they
 *   resolve the `@dnd-mapp` scope via their own `.npmrc`).
 * - `devDependencies`: not needed at install time by consumers.
 *
 * All other fields (including the public `engines` field) are preserved unchanged via the
 * `...rest` spread.
 *
 * @returns {Promise<void>} Resolves once the adjusted manifest has been written back to
 *   `dist/package.json`, overwriting the raw copy.
 * @throws {SyntaxError} If `dist/package.json` is not valid JSON.
 * @throws {Error} If the file cannot be read or written.
 */
async function adjustPackageManifest() {
    console.log('Adjusting package manifest');
    const packageManifestPath = join(distFolderPath, packageManifestFileName);

    const packageManifestContents = await readFile(packageManifestPath, { encoding: 'utf8' });

    const { scripts, devEngines, publishConfig, devDependencies, ...strippedPackageManifest } =
        JSON.parse(packageManifestContents);

    await writeFile(packageManifestPath, JSON.stringify(strippedPackageManifest, null, 2), { encoding: 'utf8' });
}

/**
 * Entry point that assembles the publishable package under `dist/`.
 *
 * Runs as the `prepublishOnly` npm lifecycle script (see `package.json`), i.e., immediately
 * before `pnpm publish` packs the tarball, but only when publishing from the repository root
 * (not when pnpm re-invokes lifecycle scripts from within an already-packed tarball).
 *
 * Steps:
 * 1. Remove any pre-existing `dist/` directory, so stale files from a previous build/publish
 *    can never leak into the new package.
 * 2. {@link copyFiles} - copy root docs/manifest files into `dist/`.
 * 3. {@link copyConfigsFolder} and {@link adjustPackageManifest} - run concurrently via
 *    `Promise.all`, since they touch disjoint parts of `dist/` (`dist/configs/` vs.
 *    `dist/package.json`). Both depend on `dist/` already existing from step 1, and
 *    `adjustPackageManifest` additionally depends on `dist/package.json` already being
 *    present from step 2, so neither can start until steps 1 and 2 have completed.
 *
 * @returns {Promise<void>} Resolves once `dist/` is fully prepared for publishing.
 * @throws {Error} Propagates any error from the individual steps; the caller (see the
 *   bottom of this file) catches it, logs it, and exits the process with a non-zero code.
 *   If both concurrent steps in step 3 reject, only the first rejection is surfaced (the
 *   standard `Promise.all` behavior), and the other's rejection becomes an unhandled
 *   rejection unless something else observes it.
 */
async function prePublishOnly() {
    console.log('Preparing package...');

    await rm(distFolderPath, { recursive: true, force: true });

    await copyFiles();

    await Promise.all([copyConfigsFolder(), adjustPackageManifest()]);
}

prePublishOnly()
    .then(() => console.log('Package prepared successfully'))
    .catch((error) => {
        console.error('Package preparation failed!');
        console.error('Something unexpected went wrong: ', error);
        process.exit(1);
    });
