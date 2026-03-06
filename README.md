# tsdown-starter

TypeScript client types and RPC utilities for the mixi2 API.

## イベント購読 (`Mixi2Client#subscribeEvents`)

`Mixi2Client#subscribeEvents(options)` は `AsyncIterable<Event>` を返し、サーバーストリーミングのイベントを順次受け取れます。

- `options.signal` に `AbortSignal` を渡すと、購読をキャンセルできます。
- 返却される要素は `Event` 型そのままのため、`event.body.case` で `pingEvent` を含むイベント種別を利用側で判別できます。

### 再接続戦略

本 SDK は **自動再接続を内包しません**。再接続ポリシー（指数バックオフ、最大試行回数、終了条件など）はアプリケーション側で実装してください。

理由:

- プロダクトごとに許容する遅延・再試行回数・監視方針が異なるため
- 認証更新やネットワーク制約に応じて、適切な制御が利用側依存になるため

## インストール

```bash
pnpm add mixi2-ts
```

開発環境でこのリポジトリを直接利用する場合:

```bash
git clone https://github.com/mixi2ts/mixi2-ts.git
cd mixi2-ts
pnpm install
```

## ESM import について

このパッケージは ESM として公開されます（`"type": "module"`）。
README内の import 例はすべて ESM 形式です。

```ts
import { Mixi2Client, createAuthorizationHeader } from 'mixi2-ts'
```

## 初期化方法

`Mixi2Client` を使って、`baseUrl`（APIエンドポイント）と `accessToken`（OAuth2アクセストークン）を指定して初期化します。

```ts
import { Mixi2Client } from 'mixi2-ts'

const client = new Mixi2Client({
  baseUrl: 'https://api.mixi.social',
  accessToken: process.env.MIXI2_ACCESS_TOKEN ?? '',
  serviceClientFactory: () => {
    throw new Error('実際のRPCクライアントを注入してください')
  },
})
```

> `serviceClient` または `serviceClientFactory` は必須です。生成済みの gRPC/Connect クライアントを注入して利用してください。

## OAuth2トークン設定方法

アクセストークンは環境変数経由で扱うのが安全です。例:

```bash
export MIXI2_ACCESS_TOKEN='your-oauth2-access-token'
```

`createAuthorizationHeader` を使うと `Authorization` ヘッダー文字列を生成できます。

```ts
import { createAuthorizationHeader } from 'mixi2-ts'

const authorization = createAuthorizationHeader(process.env.MIXI2_ACCESS_TOKEN ?? '')
// => "Bearer your-oauth2-access-token"
```

## 各RPCの最小実行サンプル

最小サンプルを `examples/rpc-minimal.ts` に用意しています。各RPCについて「入力」「呼び出し」「結果利用」を1つずつ含みます。

実行手順:

```bash
pnpm install
pnpm tsx examples/rpc-minimal.ts
```

サンプル内容（抜粋）:

```ts
import {
  addStampToPost,
  createPost,
  getPostMediaStatus,
  getPosts,
  getStamps,
  getUsers,
  initiatePostMediaUpload,
  sendChatMessage,
} from 'mixi2-ts'

// 1) 入力
const userIds = ['user-1']

// 2) 呼び出し
const usersResponse = await getUsers(serviceClient, userIds)

// 3) 結果利用
console.log(usersResponse.users)
```

## Development

- Install dependencies:

```bash
npm install
```

- Run the unit tests:

```bash
npm run test
```

- Build the library:

```bash
npm run build
```

## リリース運用

- SemVer方針とCHANGELOG更新フロー: `docs/release-policy.md`
- Changelog本体: `CHANGELOG.md`
- 手動publish workflow: `.github/workflows/publish.yml`

## 生成済み型（`src/generated/mixi2-api/...`）の利用方針

Initialize submodules and run the generation script:

```bash
git submodule update --init --recursive
npm run generate:mixi2-types
```

The script searches known OpenAPI schema locations under `mixi2-api/` and writes generated TypeScript definitions to `src/generated/mixi2-api.ts`.
