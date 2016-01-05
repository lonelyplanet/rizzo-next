![](https://doc.esdoc.org/github.com/lonelyplanet/rizzo-next/badge.svg)
# Rizzo Next
Rizzo next is the evolution of Lonely Planet's pattern library. 

The idea of a pattern library such as rizzo is to have common grounds between design and development. Pull out patterns
from the design and implement them in a re-usable fashion across projects.

This repository contains common styles, and components as well as performance data, and unit tests.

### NPM Tasks
```shell
npm test # Run unit tests
npm run lint # Lint code
npm run docs # Document code with ESDoc
```

### Test
Run all the tests with...

```shell
npm test
```

To use watch mode...

```shell
npm run ci
```

### Docs
Generate documentation locally with

```shell
npm run docs
```

### Linting

Linting will be done locally before you commit via a pre-commit hook.

#### SCSS Linting

1. Install [scss_lint gem](https://github.com/brigade/scss-lint#installation)
2. Run `npm install` to install new dependencies
3. Write your SCSS to conform with the rules in .scss-lint.yml (a proper styleguide will follow); view [linters documentation](https://github.com/brigade/scss-lint/blob/master/lib/scss_lint/linter/README.md)
4. Check your code; manually by running `npm run scsslint` or automatically via the precommit hook when you `git commit`
