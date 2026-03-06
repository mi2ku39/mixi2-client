import { ValidationError } from './errors'
import { getUsers, type ApplicationApiClient } from './rpc/getUsers'
import { getPostMediaStatus, type PostMediaStatusApiClient } from './rpc/getPostMediaStatus'

type ServiceClient = ApplicationApiClient & PostMediaStatusApiClient

export type Mixi2ClientOptions = {
  accessToken: string
  serviceClient: ServiceClient
  timeoutMs?: number
}

export class Mixi2Client {
  private readonly serviceClient: ServiceClient
  private readonly timeoutMs?: number

  constructor(options: Mixi2ClientOptions) {
    if (!options.accessToken.trim()) {
      throw new ValidationError('accessToken is required')
    }

    this.serviceClient = options.serviceClient
    this.timeoutMs = options.timeoutMs
  }

  async getUsers(userIdList: string[]) {
    return getUsers(this.serviceClient, userIdList, this.timeoutMs)
  }

  async getPostMediaStatus(mediaId: string) {
    return getPostMediaStatus(this.serviceClient, mediaId, this.timeoutMs)
  }
}
