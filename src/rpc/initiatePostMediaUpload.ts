import { create } from '@bufbuild/protobuf'
import {
  InitiatePostMediaUploadRequestSchema,
  type InitiatePostMediaUploadRequest,
  type InitiatePostMediaUploadResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { RpcCallOptions } from '../transport'
import type { ApplicationApiClient } from './applicationApiClient'

export type InitiatePostMediaUploadInput = Omit<InitiatePostMediaUploadRequest, '$typeName'>

export async function initiatePostMediaUpload(
  serviceClient: ApplicationApiClient,
  request: InitiatePostMediaUploadInput,
  options?: RpcCallOptions,
): Promise<InitiatePostMediaUploadResponse> {
  if (!request.contentType.trim()) {
    throw new ValidationError('contentType is required')
  }

  if (request.dataSize <= 0) {
    throw new ValidationError('dataSize must be greater than 0')
  }

  const payload = create(InitiatePostMediaUploadRequestSchema, request)

  try {
    return await serviceClient.initiatePostMediaUpload(payload, options)
  } catch (error) {
    throw new TransportError('failed to call InitiatePostMediaUpload', { cause: error })
  }
}
