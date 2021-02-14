# Go support for Nova

This is an extension that adds Golang support for [Nova](https://nova.app).

<figure>
<img src="https://raw.githubusercontent.com/maku693/go-nova/main/icon.png" alt="Extension icon">
<figcaption><small>The Go gopher was designed by Renee French. (http://reneefrench.blogspot.com/)
The design is licensed under the Creative Commons 3.0 Attributions license.</small></figcaption>
</figure>

## Developer setup

### Clone and install dependencies

```sh
git clone https://github.com/maku693/go-nova.git
cd go-nova
yarn
```

### About commit message format

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit message format, to automate update of `extension.json` and `CHANGELOG.md` with [standard-version](https://github.com/conventional-changelog/standard-version).

When you make a commit, commit message format will be checked by [commitlint](https://github.com/conventional-changelog/commitlint), using pre-commit hook. We manage pre-commit hook with [husky](https://github.com/typicode/husky).
