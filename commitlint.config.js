// Enforces the same Conventional Commits types the release pipeline reads
// to decide the version bump and changelog section (see
// .release-it.json's conventional-changelog `types` list) — a commit typed
// wrong here isn't just a style nit, it silently changes what the next
// `npm run release` does (or skips doing).
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'revert', 'docs', 'refactor', 'test', 'chore', 'ci', 'build', 'style'],
    ],
  },
};
