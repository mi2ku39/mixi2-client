import { describe, expect, it, vi } from 'vitest'
import type {
  AddStampToPostRequest,
  AddStampToPostResponse,
  CreatePostRequest,
  CreatePostResponse,
  GetPostMediaStatusRequest,
  GetPostMediaStatusResponse,
  GetPostsRequest,
  GetPostsResponse,
  GetStampsRequest,
  GetStampsResponse,
  GetUsersRequest,
  GetUsersResponse,
  InitiatePostMediaUploadRequest,
  InitiatePostMediaUploadResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { ValidationError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import { addStampToPost } from './addStampToPost'
import { createPost, type CreatePostInput } from './createPost'
import { getPostMediaStatus } from './getPostMediaStatus'
import { getPosts } from './getPosts'
import { getStamps, type GetStampsInput } from './getStamps'
import { getUsers } from './getUsers'
import { initiatePostMediaUpload } from './initiatePostMediaUpload'
import { sendChatMessage, type SendChatMessageInput } from './sendChatMessage'

function createMockClient(): ApplicationApiClient {
  return {
    getUsers: vi.fn<(
      request: GetUsersRequest,
    ) => Promise<GetUsersResponse>>(),
    getPosts: vi.fn<(
      request: GetPostsRequest,
    ) => Promise<GetPostsResponse>>(),
    createPost: vi.fn<(
      request: CreatePostRequest,
    ) => Promise<CreatePostResponse>>(),
    initiatePostMediaUpload: vi.fn<(
      request: InitiatePostMediaUploadRequest,
    ) => Promise<InitiatePostMediaUploadResponse>>(),
    getPostMediaStatus: vi.fn<(
      request: GetPostMediaStatusRequest,
    ) => Promise<GetPostMediaStatusResponse>>(),
    sendChatMessage: vi.fn<(
      request: SendChatMessageRequest,
    ) => Promise<SendChatMessageResponse>>(),
    getStamps: vi.fn<(
      request: GetStampsRequest,
    ) => Promise<GetStampsResponse>>(),
    addStampToPost: vi.fn<(
      request: AddStampToPostRequest,
    ) => Promise<AddStampToPostResponse>>(),
  }
}

describe('rpc wrappers', () => {
  it('getUsers: success and validation error', async () => {
    const client = createMockClient()
    const response = { users: [] } as unknown as GetUsersResponse
    vi.mocked(client.getUsers).mockResolvedValue(response)

    await expect(getUsers(client, ['u1'])).resolves.toBe(response)
    await expect(getUsers(client, [])).rejects.toBeInstanceOf(ValidationError)
  })

  it('getPosts: success and validation error', async () => {
    const client = createMockClient()
    const response = { posts: [] } as unknown as GetPostsResponse
    vi.mocked(client.getPosts).mockResolvedValue(response)

    await expect(getPosts(client, ['p1'])).resolves.toBe(response)
    await expect(getPosts(client, [])).rejects.toBeInstanceOf(ValidationError)
  })

  it('createPost: success and validation error', async () => {
    const client = createMockClient()
    const response = {} as CreatePostResponse
    vi.mocked(client.createPost).mockResolvedValue(response)

    await expect(createPost(client, { text: 'hello', mediaIdList: [] } as CreatePostInput)).resolves.toBe(
      response,
    )

    await expect(
      createPost(client, {
        text: 'invalid',
        inReplyToPostId: 'r1',
        quotedPostId: 'q1',
        mediaIdList: [],
      } as CreatePostInput),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('initiatePostMediaUpload: success and validation error', async () => {
    const client = createMockClient()
    const response = { mediaId: 'm1', uploadUrl: 'https://example.com' } as unknown as InitiatePostMediaUploadResponse
    vi.mocked(client.initiatePostMediaUpload).mockResolvedValue(response)

    await expect(
      initiatePostMediaUpload(client, {
        contentType: 'image/png',
        dataSize: 10n,
        mediaType: 1,
      } as InitiatePostMediaUploadRequest),
    ).resolves.toBe(response)

    await expect(
      initiatePostMediaUpload(client, {
        contentType: '',
        dataSize: 10n,
        mediaType: 1,
      } as InitiatePostMediaUploadRequest),
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('getPostMediaStatus: success and validation error', async () => {
    const client = createMockClient()
    const response = { mediaId: 'm1' } as unknown as GetPostMediaStatusResponse
    vi.mocked(client.getPostMediaStatus).mockResolvedValue(response)

    await expect(getPostMediaStatus(client, 'm1')).resolves.toBe(response)
    await expect(getPostMediaStatus(client, '')).rejects.toBeInstanceOf(ValidationError)
  })

  it('sendChatMessage: success and validation error', async () => {
    const client = createMockClient()
    const response = {} as SendChatMessageResponse
    vi.mocked(client.sendChatMessage).mockResolvedValue(response)

    await expect(sendChatMessage(client, { roomId: 'room', text: 'hello' } as SendChatMessageInput)).resolves.toBe(
      response,
    )

    await expect(sendChatMessage(client, { roomId: 'room' } as SendChatMessageInput)).rejects.toBeInstanceOf(
      ValidationError,
    )
  })

  it('getStamps: success and validation error', async () => {
    const client = createMockClient()
    const response = { officialStampSets: [] } as unknown as GetStampsResponse
    vi.mocked(client.getStamps).mockResolvedValue(response)

    await expect(getStamps(client, {} as GetStampsInput)).resolves.toBe(response)
    await expect(getStamps(client, undefined as unknown as GetStampsInput)).rejects.toBeInstanceOf(
      ValidationError,
    )
  })

  it('addStampToPost: success and validation error', async () => {
    const client = createMockClient()
    const response = {} as AddStampToPostResponse
    vi.mocked(client.addStampToPost).mockResolvedValue(response)

    await expect(addStampToPost(client, 'p1', 's1')).resolves.toBe(response)
    await expect(addStampToPost(client, '', 's1')).rejects.toBeInstanceOf(ValidationError)
  })
})
