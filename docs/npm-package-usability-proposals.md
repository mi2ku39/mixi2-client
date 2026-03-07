# npmパッケージとして使いやすくするための実装提案

このドキュメントは、`@mi2ku39/mixi2-client` を npm パッケージとして公開した際に、初回導入から運用までのハードルを下げるための具体的な実装案をまとめたものです。

## 1. インストール直後に迷わない導線を作る

### 1-1. README のパッケージ名・最短導入コードを公開内容に合わせる

- `README.md` のインストール・import 例を実際の公開名 (`@mi2ku39/mixi2-client`) に統一する。
- 30秒で動かせる「Quick Start」を最上部に追加する。
- 「最低限必要な値（baseUrl / accessToken）」だけで初期化できる例を先頭に置く。

**実装例**

- `README.md` の先頭に以下を追加:
  - インストール
  - 最小初期化
  - 1つの API 呼び出し

### 1-2. サンプルコードを `examples/` に実ファイルとして追加

- README 内の断片コードだけでなく、コピペで動かせる `.ts` ファイルを複数提供する。
- 例:
  - `examples/quick-start.ts`
  - `examples/subscribe-events.ts`
  - `examples/oauth-refresh.ts`

**狙い**

- ユーザーが「どこまで自前実装が必要か」を短時間で理解できる。

## 2. 初期化のボイラープレートを減らす

### 2-1. デフォルトクライアントファクトリを提供する

- 現状は `serviceClientFactory` の注入が必要で、利用者の実装負荷が高い。
- `createDefaultServiceClient({ baseUrl, headers })` のようなヘルパーを提供し、`Mixi2Client` から直接使えるようにする。

**実装イメージ**

- `new Mixi2Client({ baseUrl, accessToken })` だけで最低限の呼び出しが可能。
- 高度な用途では既存どおり `serviceClient` / `serviceClientFactory` の注入を許可。

### 2-2. Node 以外の利用条件を明示する

- `engines.node` は定義済みだが、ブラウザ・Edge Runtime での可否や制限を README に明記する。
- `fetch` / gRPC transport の差異を表で整理する。

## 3. 認証と再試行の実装を「推奨パターン」として同梱する

### 3-1. Token Provider API を追加する

- `accessToken` の固定文字列だけでなく、非同期で更新可能な Provider を受けられるようにする。
- 例: `accessTokenProvider: async () => string`

**メリット**

- 401 時の再認証や短命トークン運用に対応しやすい。

### 3-2. 再試行ポリシーのユーティリティを提供する

- 現在は再接続戦略を利用者に委ねているため、最小限の再試行ヘルパーを同梱すると導入が簡単になる。
- 例:
  - `withRetry(fn, { maxRetries, baseDelayMs, jitter })`
  - `createExponentialBackoff()`

## 4. エラーハンドリングを扱いやすくする

### 4-1. エラー正規化ヘルパーを追加

- gRPC エラーやネットワークエラーを統一形へ変換する `normalizeMixi2Error(error)` を提供。
- `code`, `retryable`, `requestId`, `message` を標準化。

### 4-2. TypeScript での分岐しやすさを上げる

- 判別可能なエラー型 (`Mixi2AuthError`, `Mixi2RateLimitError`, `Mixi2TransientError`) を公開。
- `instanceof` や `error.kind` で分岐可能にする。

## 5. API 発見性と補完体験を改善する

### 5-1. エントリポイントを用途別に分割

- 現在の `exports` を拡張し、用途別 import を可能にする。
  - `@mi2ku39/mixi2-client/auth`
  - `@mi2ku39/mixi2-client/events`
  - `@mi2ku39/mixi2-client/generated`

**効果**

- 補完で目的の API を見つけやすくなる。
- バンドル環境で不要コードを取り込みにくくなる。

### 5-2. TSDoc を整備し、公開 API に説明を付与

- `src/index.ts` で再公開している API に TSDoc を追加。
- 引数の意味、利用前提、失敗時挙動を明記する。

## 6. 運用を見据えた品質保証を追加する

### 6-1. Public API 破壊検知を CI で強化

- すでに `tests/public-api.test.ts` はあるため、リリース前ジョブで必須化する。
- 変更がある場合は `CHANGELOG.md` 更新を CI で要求する。

### 6-2. 公開前検証コマンドを追加

- `pnpm run release:check` を追加し、以下をまとめて実行する。
  - `pnpm run typecheck`
  - `pnpm run test`
  - `pnpm run build`
  - `npm pack --dry-run`

**効果**

- 「公開後に import できない」「types が不足」などを未然に防げる。

## 優先順位（実装順の推奨）

1. README と examples の整備（導入離脱を即時に下げる）
2. デフォルトクライアントファクトリの提供（初期化コストを削減）
3. Token Provider + retry ユーティリティ（運用負荷を削減）
4. エラー正規化と型分岐（障害対応を高速化）
5. exports 分割と TSDoc（中長期の開発体験を改善）
6. release:check と CI 強化（品質の下支え）
