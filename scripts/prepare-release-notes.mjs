import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Reads the repository's `CHANGELOG.md` in full.
 *
 * @returns {Promise<string>} The raw contents of `CHANGELOG.md`, encoded as UTF-8.
 * @throws {Error} If `CHANGELOG.md` does not exist at the repository root or cannot be read.
 */
async function readChangelog() {
    console.log('Reading changelog');
    const changelogPath = join(process.cwd(), 'CHANGELOG.md');

    return await readFile(changelogPath, { encoding: 'utf8' });
}

/**
 * Escapes regular expression metacharacters in `value`, so it can be safely interpolated
 * into a `RegExp` pattern and matched literally.
 *
 * Needed because a version string may contain characters that are meaningful in a regex
 * (e.g. `.` in `1.2.3`, or `+` in a build-metadata suffix like `1.2.3+build.4`).
 *
 * @param {string} value - The literal string to escape.
 * @returns {string} `value` with every regex metacharacter prefixed by a backslash.
 */
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)-formatted section
 * for the version named by the `RELEASED_VERSION` environment variable, including its
 * `## [x.x.x] - YYYY-MM-DD` heading line.
 *
 * `RELEASED_VERSION` is expected to hold the git tag of the release being published (e.g.
 * `v1.2.3`); a leading `v` is stripped before matching, since git tags conventionally carry
 * it while changelog headings (e.g. `## [1.2.3] - 2026-07-16`) do not. The section is
 * bounded by the matching `## [1.2.3] ...` heading and the next `## [...]` heading that
 * follows it (typically the previous release), or the end of the file if there is none.
 *
 * @param {string} changelog - The full contents of `CHANGELOG.md`, as returned by
 *   {@link readChangelog}.
 * @returns {Promise<string>} The matched section, trimmed of surrounding whitespace and
 *   terminated with a single trailing newline.
 * @throws {Error} If `RELEASED_VERSION` is unset or empty.
 * @throws {Error} If no `## [<version>]` heading for the resolved version exists in
 *   `changelog`.
 */
async function extractReleaseNotesSection(changelog) {
    console.log('Extracting release notes from changelog');
    const releasedVersion = process.env['RELEASED_VERSION'];

    if (!releasedVersion) {
        throw new Error('The `RELEASED_VERSION` environment variable is not set.');
    }
    const version = releasedVersion.replace(/^v/, '');

    const headingPattern = new RegExp(`^## \\[${escapeRegExp(version)}\\].*$`, 'm');
    const headingMatch = headingPattern.exec(changelog);

    if (!headingMatch) {
        throw new Error(`Could not find a changelog section for version "${version}".`);
    }
    const sectionStart = headingMatch.index;
    const contentStart = sectionStart + headingMatch[0].length;
    const nextHeadingMatch = /^## \[.*$/m.exec(changelog.slice(contentStart));
    const sectionEnd = nextHeadingMatch ? contentStart + nextHeadingMatch.index : changelog.length;

    return changelog.slice(sectionStart, sectionEnd).trim() + '\n';
}

/**
 * Writes the prepared release notes to `.github/release-notes.md`, overwriting any
 * existing file at that path.
 *
 * @param {string} notes - The release notes content to write, as produced by
 *   {@link extractReleaseNotesSection}.
 * @returns {Promise<void>} Resolves once the file has been written.
 * @throws {Error} If `.github/` does not exist or the file cannot be written.
 */
async function writeReleaseNotes(notes) {
    console.log('Writing release notes');
    const releaseNotesPath = join(process.cwd(), '.github/release-notes.md');

    await writeFile(releaseNotesPath, notes, { encoding: 'utf8' });
}

/**
 * Entry point that prepares the release notes for the version being published.
 *
 * Intended to run in CI when a release tag is pushed, with `RELEASED_VERSION` set to that
 * tag, so the resulting `.github/release-notes.md` can be used as the body of the
 * corresponding GitHub release.
 *
 * Steps:
 * 1. {@link readChangelog} - read `CHANGELOG.md` from the repository root.
 * 2. {@link extractReleaseNotesSection} - pull out the section matching
 *    `RELEASED_VERSION`.
 * 3. {@link writeReleaseNotes} - write that section to `.github/release-notes.md`.
 *
 * @returns {Promise<void>} Resolves once the release notes file has been written.
 * @throws {Error} Propagates any error from the individual steps; the caller (see the
 *   bottom of this file) catches it, logs it, and exits the process with a non-zero code.
 */
async function prepareReleaseNotes() {
    console.log('Preparing release notes...');
    const changelog = await readChangelog();
    const releaseNotes = await extractReleaseNotesSection(changelog);

    await writeReleaseNotes(releaseNotes);
}

prepareReleaseNotes()
    .then(() => console.log('Release notes prepared successfully.'))
    .catch((error) => {
        console.error('Failed to prepare the release notes');
        console.error('Something unexpected went wrong', error);
        process.exit(1);
    });
