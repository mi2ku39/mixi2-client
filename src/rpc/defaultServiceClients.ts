import { ValidationError } from '../errors'
import type { ApplicationApiClient } from './applicationApiClient'
import type { ApplicationStreamClient } from './applicationStreamClient'

function throwMissingClientError(clientName: string): never {
  throw new ValidationError(
    `${clientName} is not configured. Set ${clientName} or ${clientName}Factory when initializing Mixi2Client.`,
  )
}

export function createDefaultApplicationApiClient(): ApplicationApiClient {
  return {
    getUsers: () => throwMissingClientError('serviceClient'),
    getPosts: () => throwMissingClientError('serviceClient'),
    createPost: () => throwMissingClientError('serviceClient'),
    initiatePostMediaUpload: () => throwMissingClientError('serviceClient'),
    getPostMediaStatus: () => throwMissingClientError('serviceClient'),
    sendChatMessage: () => throwMissingClientError('serviceClient'),
    getStamps: () => throwMissingClientError('serviceClient'),
    addStampToPost: () => throwMissingClientError('serviceClient'),
  }
}

export function createDefaultApplicationStreamClient(): ApplicationStreamClient {
  return {
    subscribeEvents: () => throwMissingClientError('streamServiceClient'),
  }
}
