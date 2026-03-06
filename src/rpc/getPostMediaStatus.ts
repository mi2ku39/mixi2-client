import { create } from '@bufbuild/protobuf'
import {
  GetPostMediaStatusRequestSchema,
  type GetPostMediaStatusRequest,
  type GetPostMediaStatusResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'

export type PostMediaStatusApiClient = {
  getPostMediaStatus: (
    request: GetPostMediaStatusRequest,
    options?: { timeoutMs?: number },
  ) => Promise<GetPostMediaStatusResponse>
}

export async function getPostMediaStatus(
  serviceClient: PostMediaStatusApiClient,
  mediaId: string,
  timeoutMs?: number,
): Promise<GetPostMediaStatusResponse> {
  if (!mediaId.trim()) {
    throw new ValidationError('mediaId is required')
  }

  const request = create(GetPostMediaStatusRequestSchema, { mediaId })

  try {
    return await serviceClient.getPostMediaStatus(request, { timeoutMs })
  } catch (error) {
    throw new TransportError('failed to call GetPostMediaStatus', { cause: error })
  }
}
