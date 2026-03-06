# mixi2 API 仕様まとめ

公式リファレンス  
https://developer.mixi.social/docs/reference/api-document

---

# 概要

mixi2 API は **Connect（gRPC-Web互換）** を利用した RPC API です。

- プロトコル: **Connect / gRPC-Web**
- 認証: **OAuth 2.0**
- データ形式: **Protocol Buffers**

---

# タスク目標
これらのAPIにアクセスできるNode.jsパッケージを作成することです。

# RPC API 一覧

## GetUsers

指定したユーザーIDのユーザー情報を取得します。

### Request

| フィールド | 型 | 説明 |
|---|---|---|
| user_id_list | repeated string | 取得対象ユーザーID |

### Response

| フィールド | 型 |
|---|---|
| users | repeated User |

---

## GetPosts

指定したポストIDのポスト情報を取得します。

### Request

| フィールド | 型 | 説明 |
|---|---|---|
| post_id_list | repeated string | ポストID |

### Response

| フィールド | 型 |
|---|---|
| posts | repeated Post |

---

## CreatePost

ポストを作成します。

⚠️ `in_reply_to_post_id` と `quoted_post_id` は **同時指定不可**

### Request

| フィールド | 型 | 説明 |
|---|---|---|
| text | string | 投稿本文 |
| in_reply_to_post_id | optional string | 返信先 |
| quoted_post_id | optional string | 引用ポスト |
| media_id_list | repeated string | 添付メディアID（最大4件） |
| post_mask | optional PostMask | マスク |
| publishing_type | optional PostPublishingType | 配信設定 |

### Response

| フィールド | 型 |
|---|---|
| post | Post |

---

## InitiatePostMediaUpload

メディアアップロードを開始します。

### Request

| フィールド | 型 | 説明 |
|---|---|---|
| content_type | string | MIMEタイプ |
| data_size | uint64 | ファイルサイズ |
| media_type | Type | メディア種別 |
| description | optional string | 説明 |

### Response

| フィールド | 型 |
|---|---|
| media_id | string |
| upload_url | string |

---

## GetPostMediaStatus

メディア処理状況を取得します。

### Request

| フィールド | 型 |
|---|---|
| media_id | string |

### Response

| フィールド | 型 |
|---|---|
| status | Status |

---

## SendChatMessage

チャットメッセージを送信します。

⚠️ `text` または `media_id` の **どちらか必須**

### Request

| フィールド | 型 | 説明 |
|---|---|---|
| room_id | string | 送信先 |
| text | optional string | メッセージ |
| media_id | optional string | 添付 |

### Response

| フィールド | 型 |
|---|---|
| message | ChatMessage |

---

## GetStamps

公式スタンプ一覧取得

⚠️ `official_stamp_language` 未指定の場合  
公式スタンプは **空配列**

### Request

| フィールド | 型 |
|---|---|
| official_stamp_language | optional LanguageCode |

### Response

| フィールド | 型 |
|---|---|
| official_stamp_sets | repeated OfficialStampSet |

---

## AddStampToPost

ポストにスタンプを追加します。

### Request

| フィールド | 型 |
|---|---|
| post_id | string |
| stamp_id | string |

### Response

| フィールド | 型 |
|---|---|
| post | Post |

---

## SubscribeEvents

イベントストリームを購読します。

### Request

なし

### Response

| フィールド | 型 |
|---|---|
| events | repeated Event |

---

# オブジェクト定義

## User

| フィールド | 型 |
|---|---|
| user_id | string |
| is_disabled | bool |
| name | string |
| display_name | string |
| profile | string |
| user_avatar | UserAvatar |
| visibility | UserVisibility |
| access_level | UserAccessLevel |

---

## UserAvatar

| フィールド | 型 |
|---|---|
| large_image_url | string |
| large_image_mime_type | string |
| large_image_height | uint32 |
| large_image_width | uint32 |
| small_image_url | string |
| small_image_mime_type | string |
| small_image_height | uint32 |
| small_image_width | uint32 |

---

## Post

| フィールド | 型 |
|---|---|
| post_id | string |
| is_deleted | bool |
| creator_id | string |
| text | string |
| created_at | Timestamp |
| post_media_list | repeated PostMedia |
| in_reply_to_post_id | optional string |
| post_mask | optional PostMask |
| visibility | PostVisibility |
| access_level | PostAccessLevel |
| stamps | repeated PostStamp |
| reader_stamp_id | optional string |

---

## PostMask

| フィールド | 型 |
|---|---|
| mask_type | PostMaskType |
| caption | string |

---

## PostMedia

| フィールド | 型 |
|---|---|
| media_type | PostMediaType |
| image | PostMediaImage |
| video | PostMediaVideo |

---

## PostMediaImage

| フィールド | 型 |
|---|---|
| large_image_url | string |
| large_image_mime_type | string |
| large_image_height | uint32 |
| large_image_width | uint32 |
| small_image_url | string |
| small_image_mime_type | string |
| small_image_height | uint32 |
| small_image_width | uint32 |

---

## PostMediaVideo

| フィールド | 型 |
|---|---|
| video_url | string |
| video_mime_type | string |
| video_height | uint32 |
| video_width | uint32 |
| preview_image_url | string |
| preview_image_mime_type | string |
| preview_image_height | uint32 |
| preview_image_width | uint32 |
| duration | float |

---

## ChatMessage

| フィールド | 型 |
|---|---|
| room_id | string |
| message_id | string |
| creator_id | string |
| text | string |
| created_at | Timestamp |
| media_list | repeated Media |
| post_id | optional string |

---

# イベント

## Event

| フィールド | 型 |
|---|---|
| event_id | string |
| event_type | EventType |
| ping_event | PingEvent |
| post_created_event | PostCreatedEvent |
| chat_message_received_event | ChatMessageReceivedEvent |

---

## PostCreatedEvent

| フィールド | 型 |
|---|---|
| event_reason_list | repeated EventReason |
| post | Post |
| issuer | User |

---

## ChatMessageReceivedEvent

| フィールド | 型 |
|---|---|
| event_reason_list | repeated EventReason |
| message | ChatMessage |
| issuer | User |

---

# Enum

## EventType

| 値 | 説明 |
|---|---|
| EVENT_TYPE_UNSPECIFIED | 未指定 |
| EVENT_TYPE_PING | 接続確認 |
| EVENT_TYPE_POST_CREATED | 投稿作成 |
| EVENT_TYPE_CHAT_MESSAGE_RECEIVED | メッセージ受信 |

---

## MediaType

| 値 | 説明 |
|---|---|
| MEDIA_TYPE_IMAGE | 画像 |
| MEDIA_TYPE_VIDEO | 動画 |

---

## PostAccessLevel

| 値 | 説明 |
|---|---|
| POST_ACCESS_LEVEL_PUBLIC | 公開 |
| POST_ACCESS_LEVEL_PRIVATE | 非公開 |

---

## PostMaskType

| 値 | 説明 |
|---|---|
| POST_MASK_TYPE_SENSITIVE | センシティブ |
| POST_MASK_TYPE_SPOILER | ネタバレ |

---

## StampSetType

| 値 | 説明 |
|---|---|
| STAMP_SET_TYPE_DEFAULT | デフォルト |
| STAMP_SET_TYPE_SEASONAL | 季節 |

---

# 実装注意

- OAuth2 認証が必須
- gRPC-Web / Connect RPC
- 投稿メディアは **最大4件**
- 返信と引用は **同時指定不可**
- チャットは **text or media 必須**
- イベントは **ストリーミング受信**

---

# 参考

公式ドキュメント  
https://developer.mixi.social/docs/reference/api-document