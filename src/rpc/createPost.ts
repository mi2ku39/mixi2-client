import { create } from '@bufbuild/protobuf'
import {
  CreatePostRequestSchema,
  type CreatePostResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { RpcCallOptions } from '../transport'
import { validateCreatePostRequest, type CreatePostInput } from '../validators/createPost'

export type { CreatePostInput } from '../validators/createPost'

export async function createPost(
  serviceClient: ApplicationApiClient,
  request: CreatePostInput,
  options?: RpcCallOptions,
): Promise<CreatePostResponse> {
  validateCreatePostRequest(request)

  const payload = create(CreatePostRequestSchema, request)

  try {
    return await serviceClient.createPost(payload, options)
  } catch (error) {
    throw new TransportError('failed to call CreatePost', { cause: error })
  }
}
