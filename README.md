[![Firmware Build 🔥](https://github.com/openmv/openmv-doc/actions/workflows/main.yml/badge.svg)](https://github.com/openmv/openmv-doc/actions/workflows/main.yml)
[![GitHub license](https://img.shields.io/github/license/openmv/openmv-doc?label=license%20%E2%9A%96)](https://github.com/openmv/openmv-doc/blob/master/LICENSE)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/openmv/openmv-doc?sort=semver)
[![GitHub forks](https://img.shields.io/github/forks/openmv/openmv-doc?color=green)](https://github.com/openmv/openmv-doc/network)
[![GitHub stars](https://img.shields.io/github/stars/openmv/openmv-doc?color=yellow)](https://github.com/openmv/openmv-doc/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/openmv/openmv-doc?color=orange)](https://github.com/openmv/openmv-doc/issues)

<img  width="480" src="https://raw.githubusercontent.com/openmv/openmv-media/master/logos/openmv-logo/logo.png">

# OpenMV Documentation

The OpenMV Cam documentation.

- [How to build](#how-to-build)
- [Contributing to the project](#contributing-to-the-project)
  + [Contribution guidelines](#contribution-guidelines)

## How to build

Install Sphinx, and optionally (for the RTD-styling), sphinx_rtd_theme, preferably in a virtualenv:

     pip install sphinx
     pip install sphinx_rtd_theme

In `/`, build the docs:

     make.py

You'll find the index page at `micropython/docs/_build/html/index.html`.

## Contributing to the project

Contributions are most welcome. If you are interested in contributing to the project, start by creating a fork of each of the following repositories:

* https://github.com/openmv/openmv-doc.git
* https://github.com/openmv/micropython.git

Clone the forked openmv-doc repository, and add a remote to the main openmv-doc repository:
```bash
git clone --recursive https://github.com/<username>/openmv-doc.git
git -C openmv remote add upstream https://github.com/openmv/openmv-doc.git
```

Set the `origin` remote of the micropython submodule to the forked micropython repo:
```bash
git -C openmv-doc/src/micropython remote set-url origin https://github.com/<username>/micropython.git
```

Finally add a remote to openmv-doc's micropython fork:
```bash
git -C openmv-doc/src/micropython remote add upstream https://github.com/openmv/micropython.git
```

Now the repositories are ready for pull requests. To send a pull request, create a new feature branch and push it to origin, and use Github to create the pull request from the forked repository to the upstream openmv/micropython repository. For example:
```bash
git checkout -b <some_branch_name>
<commit changes>
git push origin -u <some_branch_name>
```

### Contribution guidelines
Please follow the [best practices](https://developers.google.com/blockly/guides/modify/contribute/write_a_good_pr) when sending pull requests upstream. In general, the pull request should:
* Fix one problem. Don't try to tackle multiple issues at once.
* Split the changes into logical groups using git commits.
* Pull request title should be less than 78 characters, and match this pattern:
  * `<scope>:<1 space><description><.>`
* Commit subject line should be less than 78 characters, and match this pattern:
  * `<scope>:<1 space><description><.>`
