# mixi2-ts

mixi2 Connect/gRPC-Web API を TypeScript から利用するための SDK です。

## インストール

```bash
pnpm add @mi2ku39/mixi2-client
```

リポジトリを直接 clone して試す場合:

```bash
git clone https://github.com/mixi2ts/mixi2-ts.git
cd mixi2-ts
pnpm install
```

## ESM import

本パッケージは ESM（`"type": "module"`）として公開されます。

```ts
import { Mixi2Client, createAuthorizationHeader } from '@mi2ku39/mixi2-client'
```

## OAuth2 トークン設定

アクセストークンは環境変数から読み込むことを推奨します。

```bash
export MIXI2_ACCESS_TOKEN='your-oauth2-access-token'
```

```ts
import { createAuthorizationHeader } from '@mi2ku39/mixi2-client'

const authorization = createAuthorizationHeader(process.env.MIXI2_ACCESS_TOKEN ?? '')
// => "Bearer your-oauth2-access-token"
```

> セキュリティのため、アクセストークンをログ出力しないでください。

## 初期化（`Mixi2Client`）

`Mixi2Client` の初期化時には `baseUrl` と `accessToken` に加えて、
`serviceClient` または `serviceClientFactory` を必ず渡してください。
`subscribeEvents()` も利用する場合は `streamServiceClient` もしくは `streamServiceClientFactory` も必要です。

```ts
import { Mixi2Client } from '@mi2ku39/mixi2-client'

const client = new Mixi2Client({
  baseUrl: 'https://api.mixi.social',
  accessToken: process.env.MIXI2_ACCESS_TOKEN ?? '',
  serviceClientFactory: () => {
    throw new Error('実際のRPCクライアントを注入してください')
  },
  streamServiceClientFactory: () => {
    throw new Error('実際のストリーミングRPCクライアントを注入してください')
  },
})
```

## 各 RPC の最小サンプル

`examples/rpc-minimal.ts` で以下の unary RPC をまとめて実行できます。

- `getUsers`
- `getPosts`
- `createPost`
- `initiatePostMediaUpload`
- `getPostMediaStatus`
- `sendChatMessage`
- `getStamps`
- `addStampToPost`

```bash
pnpm tsx examples/rpc-minimal.ts
```

## イベント購読サンプル（`subscribeEvents`）

`examples/subscribe-events.ts` は `Mixi2Client#subscribeEvents()` を `for await ... of` で受信し、`AbortController` で購読停止する最小例です。

```bash
pnpm tsx examples/subscribe-events.ts
```

`subscribeEvents(options)` は `AsyncIterable<Event>` を返します。

- `options.signal` に `AbortSignal` を渡すことで購読を停止できます。
- 返却されるイベントは protobuf 生成型 (`Event`) のままなので、`event.body.case` で `pingEvent` などの種別を判別できます。

### 再接続戦略

本 SDK は **自動再接続を行いません**。
再接続（指数バックオフ・最大試行回数・終了条件）は利用側で実装してください。

## `GetStamps` の挙動

`officialStampLanguage` を指定しない場合、`officialStampSets` は空配列になる可能性があります。
必要に応じて `officialStampLanguage` を指定してください。

## Development

```bash
pnpm test
pnpm build
pnpm typecheck
```

## リリース運用

- SemVer方針と CHANGELOG 更新フロー: `docs/release-policy.md`
- Changelog 本体: `CHANGELOG.md`
- 手動 publish workflow: `.github/workflows/publish.yml`

## 生成済み型（`src/generated/mixi2-api/...`）

- `src/generated/mixi2-api/...` 配下と `src/generated/mixi2-api.ts` は `mixi2-api` proto 定義からの自動生成物です。
- 生成物は手動編集せず、必要時は再生成してください。
- ライブラリ利用側は個別ファイルではなくエントリポイント経由の import を推奨します。

### 再生成手順

```bash
git submodule update --init --recursive
pnpm install
pnpm run generate:mixi2-types
```
