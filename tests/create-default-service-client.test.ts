import { Server, ServerCredentials, status, type handleUnaryCall } from '@grpc/grpc-js'
import { describe, expect, test, vi } from 'vitest'

import { createDefaultServiceClient } from '../src'
import {
  ApplicationServiceService,
  type GetUsersRequest,
  type GetUsersResponse,
} from '../src/generated/mixi2-api-grpc/social/mixi/application/service/application_api/v1/service'

function getUsers(
  client: ReturnType<typeof createDefaultServiceClient>,
): Promise<{ errorCode?: number; response?: GetUsersResponse }> {
  return new Promise((resolve) => {
    client.applicationApi.getUsers({ userIdList: ['user-1'] }, (error, response) => {
      resolve({ errorCode: error?.code, response })
    })
  })
}

describe('createDefaultServiceClient', () => {
  test('creates default clients from baseUrl and accessToken', () => {
    const serviceClient = createDefaultServiceClient({
      baseUrl: 'https://api.example.com/v1',
      accessToken: 'test-token',
    })

    expect(typeof serviceClient.applicationApi.getUsers).toBe('function')
    expect(typeof serviceClient.applicationStream.subscribeEvents).toBe('function')

    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  })

  test('accepts explicit headers and plain host:port baseUrl', () => {
    const serviceClient = createDefaultServiceClient({
      baseUrl: 'localhost:50051',
      headers: {
        authorization: 'Bearer explicit-token',
        'x-trace-id': 'trace-id',
      },
      accessToken: 'test-token',
    })

    expect(typeof serviceClient.applicationApi.getUsers).toBe('function')
    expect(typeof serviceClient.applicationStream.subscribeEvents).toBe('function')

    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  })

  test('throws when baseUrl is empty', () => {
    expect(() => createDefaultServiceClient({ baseUrl: '' })).toThrow('baseUrl is required')
  })

  test('prefers accessTokenProvider over accessToken when authorization header is not explicit', async () => {
    const accessTokenProvider = vi.fn().mockResolvedValue('provider-token')
    const serviceClient = createDefaultServiceClient({
      baseUrl: 'localhost:50051',
      accessToken: 'fixed-token',
      accessTokenProvider,
    })

    await getUsers(serviceClient)

    expect(accessTokenProvider).toHaveBeenCalledTimes(1)

    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  })

  test('does not call accessTokenProvider when authorization header is explicitly set', async () => {
    const accessTokenProvider = vi.fn().mockResolvedValue('provider-token')
    const serviceClient = createDefaultServiceClient({
      baseUrl: 'localhost:50051',
      headers: {
        authorization: 'Bearer explicit-token',
      },
      accessTokenProvider,
    })

    await getUsers(serviceClient)

    expect(accessTokenProvider).not.toHaveBeenCalled()

    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  })

  test('re-runs accessTokenProvider when retrying after UNAUTHENTICATED response', async () => {
    const server = new Server()
    const observedTokens: string[] = []

    const handler: handleUnaryCall<GetUsersRequest, GetUsersResponse> = (call, callback) => {
      const authorization = call.metadata.get('authorization')[0]
      observedTokens.push(typeof authorization === 'string' ? authorization : '')

      if (authorization === 'Bearer retry-token-1') {
        callback({
          name: 'UnauthenticatedError',
          code: status.UNAUTHENTICATED,
          message: 'token expired',
        })
        return
      }

      callback(null, { users: [] })
    }

    server.addService(ApplicationServiceService, {
      getUsers: handler,
    })

    const port = await new Promise<number>((resolve, reject) => {
      server.bindAsync('127.0.0.1:0', ServerCredentials.createInsecure(), (error, boundPort) => {
        if (error) {
          reject(error)
          return
        }

        resolve(boundPort)
      })
    })


    const accessTokenProvider = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('retry-token-1')
      .mockResolvedValueOnce('retry-token-2')

    const serviceClient = createDefaultServiceClient({
      baseUrl: `127.0.0.1:${port}`,
      accessTokenProvider,
    })

    const firstResult = await getUsers(serviceClient)
    expect(firstResult.errorCode).toBe(status.UNAUTHENTICATED)

    const secondResult = await getUsers(serviceClient)
    expect(secondResult.errorCode).toBeUndefined()
    expect(secondResult.response).toEqual({ users: [] })

    expect(accessTokenProvider).toHaveBeenCalledTimes(2)
    expect(observedTokens).toEqual(['Bearer retry-token-1', 'Bearer retry-token-2'])

    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
    await new Promise<void>((resolve) => {
      server.tryShutdown(() => resolve())
    })
  })
})
