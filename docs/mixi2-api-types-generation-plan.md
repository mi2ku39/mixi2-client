# mixi2-api 型定義生成計画

## 目的
- mixi2-api の OpenAPI スキーマから TypeScript 型を自動生成し、手書き型のメンテナンスコストを下げる。

## 追加した仕組み
- `scripts/generate-mixi2-types.mjs`
  - `openapi-typescript` を使って OpenAPI URL から型定義を生成する。
  - 既定の出力先は `src/generated/mixi2-api-types.ts`。
  - `MIXI2_OPENAPI_URL`（または `--url`）を必須入力として扱う。
  - `MIXI2_TYPES_OUTPUT`（または `--out`）で出力先を変更できる。

## 実行手順
1. OpenAPI スキーマ URL を確認する。
2. 以下のコマンドで型定義を生成する。
   ```bash
   npm run generate:mixi2-types -- --url <mixi2-openapi-url>
   ```
3. 生成物 `src/generated/mixi2-api-types.ts` を差分レビューする。
4. API 変更があったタイミングで同じコマンドを再実行し、型定義を更新する。

## 運用ルール
- 生成ファイルは手動編集しない。
- 生成コマンドはリリース前チェック、または API バージョン更新時に実行する。
- 将来的に CI へ組み込む場合は、生成後に差分がないことを検証するジョブを追加する。
