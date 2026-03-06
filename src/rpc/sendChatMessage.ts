import { create } from '@bufbuild/protobuf'
import {
  SendChatMessageRequestSchema,
  type SendChatMessageResponse,
} from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { TransportError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { RpcCallOptions } from '../transport'
import {
  validateSendChatMessageRequest,
  type SendChatMessageInput,
} from '../validators/sendChatMessage'

export type { SendChatMessageInput } from '../validators/sendChatMessage'

export async function sendChatMessage(
  serviceClient: ApplicationApiClient,
  request: SendChatMessageInput,
  options?: RpcCallOptions,
): Promise<SendChatMessageResponse> {
  validateSendChatMessageRequest(request)

  const payload = create(SendChatMessageRequestSchema, request)

  try {
    return await serviceClient.sendChatMessage(payload, options)
  } catch (error) {
    throw new TransportError('failed to call SendChatMessage', { cause: error })
  }
}
