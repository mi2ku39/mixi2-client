# tsdown-starter

A starter for creating a TypeScript package.

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

## mixi2-api 型定義の生成

```bash
npm run generate:mixi2-types -- --url <mixi2-openapi-url>
```

- 出力先の既定値: `src/generated/mixi2-api-types.ts`
- 環境変数 `MIXI2_OPENAPI_URL` / `MIXI2_TYPES_OUTPUT` でも指定可能
- 詳細な実行計画は `docs/mixi2-api-types-generation-plan.md` を参照
