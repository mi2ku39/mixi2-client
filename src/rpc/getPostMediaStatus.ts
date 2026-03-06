import { create } from '@bufbuild/protobuf'
import {
  GetPostMediaStatusRequestSchema,
  type GetPostMediaStatusResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { RpcCallOptions } from '../transport'

export async function getPostMediaStatus(
  serviceClient: ApplicationApiClient,
  mediaId: string,
  options?: RpcCallOptions,
): Promise<GetPostMediaStatusResponse> {
  if (!mediaId.trim()) {
    throw new ValidationError('mediaId is required')
  }

  const request = create(GetPostMediaStatusRequestSchema, { mediaId })

  try {
    return await serviceClient.getPostMediaStatus(request, options)
  } catch (error) {
    throw new TransportError('failed to call GetPostMediaStatus', { cause: error })
  }
}
