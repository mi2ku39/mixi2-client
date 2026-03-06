# Release Policy

## Semantic Versioning

このリポジトリは [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) に従います。

- `MAJOR`: 後方互換性のない変更
- `MINOR`: 後方互換性を維持した機能追加
- `PATCH`: 後方互換性を維持したバグ修正

プレリリースは `prepatch`, `preminor`, `premajor`, `prerelease` を利用します。

## CHANGELOG 更新フロー

- 開発中の変更は `CHANGELOG.md` の `[Unreleased]` に追記します。
- リリース時は `[Unreleased]` の内容を対象バージョン見出しに移動し、日付を追記します。
- 空になった `[Unreleased]` セクションを残し、次回リリース準備に使います。

## Version Management with bumpp

ローカルでバージョン更新する場合は以下を利用します。

```bash
pnpm run version:bump -- <patch|minor|major|prepatch|preminor|premajor|prerelease>
```

CI では `workflow_dispatch` の入力値を bumpp に渡して同じルールでバージョン更新を行います。


## npm package provenance

手動 publish workflow は npmjs の Trusted Publisher（GitHub OIDC）を使って `npm publish --provenance` を実行します。
`NODE_AUTH_TOKEN` は利用せず、OIDC ベースで npm publish を行います。
これにより npmjs.com 上で package provenance を表示できます。
