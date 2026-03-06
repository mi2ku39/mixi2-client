import type { CreatePostRequest } from '../generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'
import { ValidationError } from '../errors'

export type CreatePostInput = Omit<CreatePostRequest, '$typeName'>

export function validateCreatePostRequest(request: CreatePostInput): void {
  if (request.inReplyToPostId && request.quotedPostId) {
    throw new ValidationError('inReplyToPostId and quotedPostId are mutually exclusive')
  }

  if (request.mediaIdList.length > 4) {
    throw new ValidationError('mediaIdList must have at most 4 items')
  }
}
