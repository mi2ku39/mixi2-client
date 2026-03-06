import type {
  AddStampToPostResponse,
  CreatePostResponse,
  GetPostMediaStatusResponse,
  GetPostsResponse,
  GetStampsResponse,
  GetUsersResponse,
  InitiatePostMediaUploadResponse,
  SendChatMessageResponse,
} from './generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { ValidationError } from './errors'
import { addStampToPost } from './rpc/addStampToPost'
import type { ApplicationApiClient } from './rpc/applicationApiClient'
import { createPost, type CreatePostInput } from './rpc/createPost'
import { getPostMediaStatus } from './rpc/getPostMediaStatus'
import { getPosts } from './rpc/getPosts'
import { getStamps, type GetStampsInput } from './rpc/getStamps'
import { getUsers } from './rpc/getUsers'
import {
  initiatePostMediaUpload,
  type InitiatePostMediaUploadInput,
} from './rpc/initiatePostMediaUpload'
import { sendChatMessage, type SendChatMessageInput } from './rpc/sendChatMessage'
import { createRpcTransport, type RpcTransport, type RpcTransportOptions } from './transport'

export type Mixi2ClientInitOptions = RpcTransportOptions & {
  serviceClient?: ApplicationApiClient
  serviceClientFactory?: (transport: RpcTransport) => ApplicationApiClient
}

export class Mixi2Client {
  private readonly serviceClient: ApplicationApiClient
  private readonly transport: RpcTransport

  constructor(options: Mixi2ClientInitOptions) {
    if (!options.baseUrl.trim()) {
      throw new ValidationError('baseUrl is required')
    }

    this.transport = createRpcTransport(options)
    this.serviceClient =
      options.serviceClient ??
      options.serviceClientFactory?.(this.transport) ??
      (() => {
        throw new ValidationError('serviceClient or serviceClientFactory is required')
      })()
  }

  async getUsers(userIdList: string[]): Promise<GetUsersResponse> {
    return getUsers(this.serviceClient, userIdList, this.transport.createCallOptions())
  }

  async getPosts(postIdList: string[]): Promise<GetPostsResponse> {
    return getPosts(this.serviceClient, postIdList, this.transport.createCallOptions())
  }

  async createPost(request: CreatePostInput): Promise<CreatePostResponse> {
    return createPost(this.serviceClient, request, this.transport.createCallOptions())
  }

  async initiatePostMediaUpload(
    request: InitiatePostMediaUploadInput,
  ): Promise<InitiatePostMediaUploadResponse> {
    return initiatePostMediaUpload(this.serviceClient, request, this.transport.createCallOptions())
  }

  async getPostMediaStatus(mediaId: string): Promise<GetPostMediaStatusResponse> {
    return getPostMediaStatus(this.serviceClient, mediaId, this.transport.createCallOptions())
  }

  async sendChatMessage(request: SendChatMessageInput): Promise<SendChatMessageResponse> {
    return sendChatMessage(this.serviceClient, request, this.transport.createCallOptions())
  }

  async getStamps(request: GetStampsInput = {}): Promise<GetStampsResponse> {
    return getStamps(this.serviceClient, request, this.transport.createCallOptions())
  }

  async addStampToPost(postId: string, stampId: string): Promise<AddStampToPostResponse> {
    return addStampToPost(this.serviceClient, postId, stampId, this.transport.createCallOptions())
  }
}
