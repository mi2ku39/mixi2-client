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
import { create } from '@bufbuild/protobuf'
import { ValidationError } from './errors'
import type { Event } from './generated/mixi2-api/social/mixi/application/model/v1/event_pb'
import { SubscribeEventsRequestSchema } from './generated/mixi2-api/social/mixi/application/service/application_stream/v1/service_pb'
import { addStampToPost } from './rpc/addStampToPost'
import type { ApplicationApiClient } from './rpc/applicationApiClient'
import type { ApplicationStreamClient, SubscribeEventsOptions } from './rpc/applicationStreamClient'
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
  streamServiceClient?: ApplicationStreamClient
  streamServiceClientFactory?: (transport: RpcTransport) => ApplicationStreamClient
}

export class Mixi2Client {
  private readonly serviceClient: ApplicationApiClient
  private readonly streamServiceClient?: ApplicationStreamClient
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
    this.streamServiceClient =
      options.streamServiceClient ?? options.streamServiceClientFactory?.(this.transport)
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

  subscribeEvents(options: SubscribeEventsOptions = {}): AsyncIterable<Event> {
    if (!this.streamServiceClient) {
      throw new ValidationError(
        'streamServiceClient or streamServiceClientFactory is required for subscribeEvents',
      )
    }

    const stream = this.streamServiceClient.subscribeEvents(
      create(SubscribeEventsRequestSchema),
      this.transport.createCallOptions(options),
    )

    return this.createEventStream(stream, options.signal)
  }

  private async *createEventStream(
    stream: AsyncIterable<{ events: Event[] }>,
    signal?: AbortSignal,
  ): AsyncIterable<Event> {
    const iterator = stream[Symbol.asyncIterator]()
    let aborted = signal?.aborted ?? false
    let iteratorClosed = false

    const closeIterator = async () => {
      if (iteratorClosed) {
        return
      }
      iteratorClosed = true
      await iterator.return?.()
    }

    const abortHandler = () => {
      aborted = true
      void closeIterator()
    }

    signal?.addEventListener('abort', abortHandler, { once: true })

    try {
      while (!aborted) {
        const result = await this.nextWithAbort(iterator, signal)
        if (result.done || aborted) {
          break
        }

        for (const event of result.value.events) {
          if (aborted) {
            break
          }
          yield event
        }
      }
    } finally {
      signal?.removeEventListener('abort', abortHandler)
      await closeIterator()
    }
  }

  private async nextWithAbort<T>(
    iterator: AsyncIterator<T>,
    signal?: AbortSignal,
  ): Promise<IteratorResult<T>> {
    if (!signal) {
      return iterator.next()
    }

    if (signal.aborted) {
      return { done: true, value: undefined }
    }

    return new Promise<IteratorResult<T>>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort)
        resolve({ done: true, value: undefined })
      }

      signal.addEventListener('abort', onAbort, { once: true })

      void iterator
        .next()
        .then((result) => {
          signal.removeEventListener('abort', onAbort)
          resolve(result)
        })
        .catch((error) => {
          signal.removeEventListener('abort', onAbort)
          reject(error)
        })
    })
  }
}
