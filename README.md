# @mi2ku39/mixi2-client

TypeScript client types and gRPC utilities for the mixi2 API.

## インストール

```bash
pnpm add @mi2ku39/mixi2-client
```

## 最小初期化（`baseUrl` + `accessToken` のみ）

```ts
import { createDefaultServiceClient } from '@mi2ku39/mixi2-client'

const serviceClient = createDefaultServiceClient({
  baseUrl: 'https://api.mixi.social',
  accessToken: process.env.MIXI2_ACCESS_TOKEN ?? '',
})
```

## 30秒で試す（初期化 + 1つの API 呼び出し）

```ts
import type { GetUsersResponse } from '@mi2ku39/mixi2-client'
import { createDefaultServiceClient } from '@mi2ku39/mixi2-client'

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

async function getUsersOnce(baseUrl: string, accessToken: string, userId: string): Promise<GetUsersResponse> {
  const serviceClient = createDefaultServiceClient({ baseUrl, accessToken })

  try {
    return await new Promise<GetUsersResponse>((resolve, reject) => {
      serviceClient.applicationApi.getUsers({ userIdList: [userId] }, (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      })
    })
  } finally {
    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  }
}

const response = await getUsersOnce(
  getRequiredEnv('MIXI2_BASE_URL'),
  getRequiredEnv('MIXI2_ACCESS_TOKEN'),
  getRequiredEnv('MIXI2_USER_ID'),
)

console.log(response.users)
```

## イベント購読（`applicationStream.subscribeEvents`）

`createDefaultServiceClient` で生成した `applicationStream` からサーバーストリーミングを購読できます。

```ts
import { createDefaultServiceClient } from '@mi2ku39/mixi2-client'

const serviceClient = createDefaultServiceClient({
  baseUrl: process.env.MIXI2_BASE_URL ?? '',
  accessToken: process.env.MIXI2_ACCESS_TOKEN ?? '',
})

const stream = serviceClient.applicationStream.subscribeEvents({})

stream.on('data', (message) => {
  console.log('event:', message.event)
})

stream.on('error', (error) => {
  console.error('stream error:', error)
})

stream.on('end', () => {
  console.log('stream ended')
})
```

> 再接続戦略（指数バックオフ、最大試行回数、終了条件など）は SDK ではなく利用側で実装してください。

## OAuth2 アクセストークン取得

`getAccessTokenFromEnv` を利用すると、環境変数（`CLIENT_ID` / `CLIENT_SECRET` / `TOKEN_URL`）からトークンを取得できます。

```ts
import { getAccessTokenFromEnv } from '@mi2ku39/mixi2-client'

const token = await getAccessTokenFromEnv({
  scope: process.env.MIXI2_SCOPE,
})

console.log(token.accessToken)
```

## examples

- `examples/create-default-service-client.ts`
  - 既存アクセストークンで `createDefaultServiceClient` を初期化し、`getUsers` を 1 回実行します。
- `examples/get-access-token.ts`
  - `getAccessTokenFromEnv` でトークンを取得します。
- `examples/get-access-token-and-get-posts.ts`
  - `getAccessTokenFromEnv` で取得したトークンを使って `getPosts` を実行します。

実行例:

```bash
pnpm install
node --experimental-strip-types examples/create-default-service-client.ts
node --experimental-strip-types examples/get-access-token.ts
node --experimental-strip-types examples/get-access-token-and-get-posts.ts
```

## Development

- Install dependencies:

```bash
pnpm install
```

- Run the unit tests:

```bash
pnpm run test
```

- Build the library:

```bash
pnpm run build
```

## リリース運用

- SemVer方針とCHANGELOG更新フロー: `docs/release-policy.md`
- Changelog本体: `CHANGELOG.md`
- 手動publish workflow: `.github/workflows/publish.yml`

## 生成済み型（`src/generated/mixi2-api/...`）の利用方針

Initialize submodules and run the generation script:

```bash
git submodule update --init --recursive
pnpm run generate:mixi2-grpc
```

`generate:mixi2-grpc` は `ts-proto` + `@grpc/grpc-js` 用の実装を生成し、`src/generated/mixi2-api-grpc.ts` に barrel export を書き出します。
