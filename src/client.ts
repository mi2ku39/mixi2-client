import { ValidationError } from './errors'
import { getUsers, type ApplicationApiClient } from './rpc/getUsers'
import { createRpcTransport, type RpcTransport, type RpcTransportOptions } from './transport'

export type Mixi2ClientInitOptions = RpcTransportOptions & {
  serviceClient?: ApplicationApiClient
  serviceClientFactory?: (transport: RpcTransport) => ApplicationApiClient
}

export class Mixi2Client {
  private readonly serviceClient: ApplicationApiClient
  private readonly transport: RpcTransport

  constructor(options: Mixi2ClientInitOptions) {
    if (!options.baseUrl.trim()) {
      throw new ValidationError('baseUrl is required')
    }

    this.transport = createRpcTransport(options)
    this.serviceClient =
      options.serviceClient ??
      options.serviceClientFactory?.(this.transport) ??
      (() => {
        throw new ValidationError('serviceClient or serviceClientFactory is required')
      })()
  }

  async getUsers(userIdList: string[]) {
    return getUsers(this.serviceClient, userIdList, this.transport.createCallOptions())
  }
}
