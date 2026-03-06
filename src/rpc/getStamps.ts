import { create } from '@bufbuild/protobuf'
import {
  GetStampsRequestSchema,
  type GetStampsRequest,
  type GetStampsResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { RpcCallOptions } from '../transport'
import type { ApplicationApiClient } from './applicationApiClient'

export type GetStampsInput = Omit<GetStampsRequest, '$typeName'>

export async function getStamps(
  serviceClient: ApplicationApiClient,
  request: GetStampsInput,
  options?: RpcCallOptions,
): Promise<GetStampsResponse> {
  if (!request) {
    throw new ValidationError('request is required')
  }

  const payload = create(GetStampsRequestSchema, request)

  try {
    return await serviceClient.getStamps(payload, options)
  } catch (error) {
    throw new TransportError('failed to call GetStamps', { cause: error })
  }
}
