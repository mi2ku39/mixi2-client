import { create } from '@bufbuild/protobuf'
import {
  GetPostsRequestSchema,
  type GetPostsResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { RpcCallOptions } from '../transport'

export async function getPosts(
  serviceClient: ApplicationApiClient,
  postIdList: string[],
  options?: RpcCallOptions,
): Promise<GetPostsResponse> {
  if (postIdList.length === 0) {
    throw new ValidationError('postIdList must not be empty')
  }

  const request = create(GetPostsRequestSchema, { postIdList })

  try {
    return await serviceClient.getPosts(request, options)
  } catch (error) {
    throw new TransportError('failed to call GetPosts', { cause: error })
  }
}
