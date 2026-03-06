import { create } from '@bufbuild/protobuf'
import {
  GetUsersRequestSchema,
  type GetUsersRequest,
  type GetUsersResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError, ValidationError } from '../errors'
import type { RpcCallOptions } from '../transport'

export type ApplicationApiClient = {
  getUsers: (request: GetUsersRequest, options?: RpcCallOptions) => Promise<GetUsersResponse>
}

export async function getUsers(
  serviceClient: ApplicationApiClient,
  userIdList: string[],
  options?: RpcCallOptions,
): Promise<GetUsersResponse> {
  if (userIdList.length === 0) {
    throw new ValidationError('userIdList must not be empty')
  }

  const request = create(GetUsersRequestSchema, { userIdList })

  try {
    return await serviceClient.getUsers(request, options)
  } catch (error) {
    throw new TransportError('failed to call GetUsers', { cause: error })
  }
}
