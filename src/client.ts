import { ValidationError } from './errors'
import { getUsers, type ApplicationApiClient } from './rpc/getUsers'

export type Mixi2ClientOptions = {
  accessToken: string
  serviceClient: ApplicationApiClient
  timeoutMs?: number
}

export class Mixi2Client {
  private readonly serviceClient: ApplicationApiClient
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
}
