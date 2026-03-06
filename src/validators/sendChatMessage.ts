import type { SendChatMessageRequest } from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { ValidationError } from '../errors'

export type SendChatMessageInput = Omit<SendChatMessageRequest, '$typeName'>

export function validateSendChatMessageRequest(request: SendChatMessageInput): void {
  if (!request.text && !request.mediaId) {
    throw new ValidationError('either text or mediaId is required')
  }
}
