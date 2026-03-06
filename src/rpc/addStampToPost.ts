import { create } from '@bufbuild/protobuf'
import {
  AddStampToPostRequestSchema,
  type AddStampToPostResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { RpcCallOptions } from '../transport'

export async function addStampToPost(
  serviceClient: ApplicationApiClient,
  postId: string,
  stampId: string,
  options?: RpcCallOptions,
): Promise<AddStampToPostResponse> {
  if (!postId.trim()) {
    throw new ValidationError('postId is required')
  }

  if (!stampId.trim()) {
    throw new ValidationError('stampId is required')
  }

  const request = create(AddStampToPostRequestSchema, { postId, stampId })

  try {
    return await serviceClient.addStampToPost(request, options)
  } catch (error) {
    throw new TransportError('failed to call AddStampToPost', { cause: error })
  }
}
