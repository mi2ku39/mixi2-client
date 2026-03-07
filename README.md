# @mi2ku39/mixi2-client

mixi2 Connect/gRPC-Web API を TypeScript から利用するための Node.js 向け SDK です。

## インストール

```bash
pnpm add @mi2ku39/mixi2-client
```

このリポジトリを直接使う場合:

```bash
git clone https://github.com/mi2ku39/mixi2-client.git
cd mixi2-client
pnpm install
```

## OAuth2 トークンの設定

アクセストークンは環境変数で管理することを推奨します。

```bash
export MIXI2_ACCESS_TOKEN='your-oauth2-access-token'
```

`createAuthorizationHeader` で Authorization ヘッダーを作成できます。

```ts
import { createAuthorizationHeader } from '@mi2ku39/mixi2-client'

const authorization = createAuthorizationHeader(process.env.MIXI2_ACCESS_TOKEN ?? '')
// => "Bearer your-oauth2-access-token"
```

## クライアント初期化

`Mixi2Client` には `baseUrl` と `accessToken` を渡すだけで利用できます。

```ts
import { Mixi2Client } from '@mi2ku39/mixi2-client'

const client = new Mixi2Client({
  baseUrl: 'https://api.mixi.social',
  accessToken: process.env.MIXI2_ACCESS_TOKEN ?? '',
})
```

必要に応じて、`serviceClient` / `serviceClientFactory` と `streamServiceClient` / `streamServiceClientFactory` を注入して挙動を差し替えられます。

## 各 RPC の最小サンプル

- Unary RPC の最小サンプル: `examples/rpc-minimal.ts`
- SubscribeEvents の最小サンプル: `examples/subscribe-events.ts`

実行例:

```bash
pnpm tsx examples/rpc-minimal.ts
pnpm tsx examples/subscribe-events.ts
```

`examples/rpc-minimal.ts` では以下をすべて実行しています。

- `getUsers`
- `getPosts`
- `createPost`
- `initiatePostMediaUpload`
- `getPostMediaStatus`
- `sendChatMessage`
- `getStamps`
- `addStampToPost`

## イベント購読（SubscribeEvents）

`Mixi2Client#subscribeEvents(options)` は `AsyncIterable<Event>` を返します。

- `options.signal` に `AbortSignal` を渡すと購読を停止できます。
- 受け取るイベントは `Event` 型のままなので、`event.body.case` で `pingEvent` などを判別できます。

### 再接続ポリシー

この SDK は自動再接続を内包しません。指数バックオフや最大試行回数などの再接続戦略は利用側で実装してください。

## GetStamps の officialStampLanguage 未指定時の挙動

`officialStampLanguage` を指定しない場合、`officialStampSets` は空配列になる可能性があります。必要に応じて `officialStampLanguage` を明示してください。

## Development

```bash
pnpm test
pnpm run build
pnpm run typecheck
```

## 生成済み型（`src/generated/mixi2-api/...`）の利用方針

- `src/generated/mixi2-api/...` と `src/generated/mixi2-api.ts` は `mixi2-api` proto からの自動生成物です。
- 生成済みファイルは手動編集せず、必要な場合は再生成してください。
- 利用時は個別ファイルではなく `src/generated/mixi2-api.ts`（公開後はパッケージエントリポイント）経由の参照を推奨します。

## 生成済み型の再生成手順

```bash
git submodule update --init --recursive
pnpm install
pnpm run generate:mixi2-types
```

## リリース運用

- SemVer 方針と CHANGELOG 更新フロー: `docs/release-policy.md`
- Changelog: `CHANGELOG.md`
- 手動 publish workflow: `.github/workflows/publish.yml`
