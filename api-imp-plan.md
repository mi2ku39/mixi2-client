# mixi2 RPC API 実装計画（Node.jsパッケージ公開向け）

公式リファレンス  
https://developer.mixi.social/docs/reference/api-document

---

## 1. 目的とスコープ

本リポジトリを **Node.js 向け npm パッケージ** として公開し、mixi2 の Connect/gRPC-Web API を TypeScript から安全に利用できる SDK を提供する。

- 対象ランタイム: Node.js（推奨 LTS）
- 言語: TypeScript
- 公開形態: npm package（ESM 優先、型定義同梱）
- 対象 API:
  - GetUsers
  - GetPosts
  - CreatePost
  - InitiatePostMediaUpload
  - GetPostMediaStatus
  - SendChatMessage
  - GetStamps
  - AddStampToPost
  - SubscribeEvents（ストリーミング）

---

## 2. 成果物（Definition of Done）

1. `src/` 配下に API クライアントを実装し、各 RPC を型安全に呼び出せる。
2. OAuth2 アクセストークンを使った認証付きリクエストが可能。
3. 主要な入力制約（相互排他・必須条件・上限値）を SDK 側で検証する。
4. SubscribeEvents を async iterator として受信できる。
5. ユニットテストを追加し、主要バリデーションとリクエスト構築を検証する。
6. README に利用手順（インストール・初期化・各 API 例・公開手順）を記載する。
7. npm 公開に必要な `package.json` メタデータを整備する（name, repository, files, exports など）。

---

## 3. 想定アーキテクチャ

### 3.1 モジュール構成

- `src/client.ts`
  - SDK のエントリーポイント
  - `Mixi2Client` クラスと初期化オプション
- `src/auth.ts`
  - OAuth2 トークン注入（Authorization ヘッダ）
- `src/rpc/*.ts`
  - API ごとの呼び出しラッパー
- `src/validators/*.ts`
  - CreatePost / SendChatMessage などの入力検証
- `src/errors.ts`
  - SDK 独自エラー（ValidationError, TransportError 等）
- `src/index.ts`
  - 公開 API の再エクスポート

### 3.2 依存関係（想定）

- Connect/gRPC-Web クライアント（Node.js で利用可能な実装）
- 既存の生成済み型（`src/generated/mixi2-api/...`）を再利用

---

## 4. API 実装ポリシー

### 4.1 メソッド設計

- 各 RPC を `Mixi2Client` のメソッドとして提供
- 返却値は可能な限り protobuf 生成型を利用
- API 呼び出し時に以下のバリデーションを実施

#### CreatePost
- `inReplyToPostId` と `quotedPostId` は同時指定不可
- `mediaIdList` は最大 4 件

#### SendChatMessage
- `text` または `mediaId` のどちらか必須

#### GetStamps
- `officialStampLanguage` 未指定時の挙動（空配列）を README に明記

### 4.2 ストリーミング（SubscribeEvents）

- `subscribeEvents(): AsyncIterable<Event>` 形式で公開
- キャンセル処理（AbortSignal）を受け付ける
- Ping イベントを利用側で識別しやすいよう型を維持

### 4.3 エラー処理

- 入力不正: `ValidationError`
- 認証/通信失敗: `TransportError` に正規化
- 可能なら status code / error code / request id を保持

---

## 5. 実装フェーズ

### Phase 0: 事前整備

- 現在の公開設定を npm パッケージ向けに整理
  - `name`, `description`, `repository`, `bugs`, `homepage`
- Node.js バージョン方針（`engines`）を定義
- 生成済み型の利用方針を確定（再生成手順を README に明記）

### Phase 1: SDK 基盤

- クライアント初期化オプションを定義
  - `baseUrl`, `accessToken`, `fetch`, `timeoutMs`, `userAgent` など
- 共通 transport 作成ロジックを実装
- 認証ヘッダ注入を実装

### Phase 2: Unary RPC 実装

- 以下を順次実装 + テスト
  1. GetUsers
  2. GetPosts
  3. CreatePost（相互排他 + 上限チェック）
  4. InitiatePostMediaUpload
  5. GetPostMediaStatus
  6. SendChatMessage（必須条件チェック）
  7. GetStamps
  8. AddStampToPost

### Phase 3: Streaming RPC 実装

- SubscribeEvents を実装
- 再接続方針を決定（SDKで内包するか、利用側に委譲するか）
- 長時間接続時のエラー伝播をテスト

### Phase 4: DX とドキュメント

- README を SDK 向けに更新
  - インストール
  - OAuth2 トークン設定
  - 各 RPC の最小サンプル
  - イベント購読サンプル
- 使用例を `examples/` に追加（必要なら）

### Phase 5: 公開準備

- `pnpm run build`, `pnpm run test`, `pnpm run typecheck` を CI 相当で確認
- ライセンス、公開対象ファイル（`files`）を最終確認
- セマンティックバージョニングと CHANGELOG 運用を決定

---

## 6. テスト計画

### 6.1 ユニットテスト

- バリデーション
  - CreatePost の相互排他
  - mediaIdList 上限
  - SendChatMessage の必須条件
- クライアント
  - 認証ヘッダが付与される
  - 正しい RPC に正しい payload を渡す

### 6.2 統合寄りテスト（モック transport）

- 正常系レスポンスのマッピング
- エラー時の正規化
- SubscribeEvents のイベント受信・終了処理

---

## 7. 公開時のパッケージ方針

- `type: module` のまま ESM を正式サポート
- `types` を同梱し TypeScript 利用者の補完を保証
- 将来的に CJS が必要ならデュアル配布を検討
- 公開前チェックリスト
  1. 不要ファイルが publish 対象に含まれていない
  2. README の import 例が実際に動作する
  3. バージョン・タグ運用ルールが合意済み

---

## 8. リスクと対策

1. **API 仕様更新リスク**
   - 対策: `mixi2-api` 生成型更新手順を固定化し、差分確認を CI 化
2. **ストリーミングの接続安定性**
   - 対策: AbortSignal と再接続戦略を明示し、利用側に制御点を提供
3. **OAuth2 トークン管理の誤用**
   - 対策: README に安全な取り扱い（環境変数利用、ログ出力禁止）を記載

---

## 9. 実装順の提案（短期）

1. `Mixi2Client` 基盤 + GetUsers/GetPosts
2. CreatePost/SendChatMessage のバリデーション層
3. 残り unary RPC
4. SubscribeEvents
5. README と公開設定の仕上げ

この順序で進めることで、早期に SDK の利用価値を提供しつつ、難易度の高いストリーミング処理を後段で安定実装できる。
