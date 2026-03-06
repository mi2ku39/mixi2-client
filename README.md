# mixi2-ts

TypeScript client types and RPC utilities for the mixi2 API.

## Development

- Install dependencies:

```bash
pnpm install
```

- Run the unit tests:

```bash
pnpm test
```

- Build the library:

```bash
pnpm build
```

## 生成済み型（`src/generated/mixi2-api/...`）の利用方針

- `src/generated/mixi2-api/...` 配下のファイルと `src/generated/mixi2-api.ts` は、`mixi2-api` の proto 定義から自動生成される成果物です。
- 生成済みファイルは手動編集せず、変更が必要な場合は必ず再生成を行ってください。
- ライブラリ利用側では、個別ファイルではなく `src/generated/mixi2-api.ts`（公開後はパッケージのエントリポイント経由）から参照することを推奨します。

## 生成済み型の再生成手順

1. サブモジュールを初期化・更新します。

   ```bash
   git submodule update --init --recursive
   ```

2. 依存関係をインストールします。

   ```bash
   pnpm install
   ```

3. 型生成スクリプトを実行します。

   ```bash
   pnpm run generate:mixi2-types
   ```

上記コマンドにより、`src/generated/mixi2-api/...` 配下の TypeScript 定義と、エクスポートをまとめた `src/generated/mixi2-api.ts` が更新されます。
