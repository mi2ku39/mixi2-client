import { describe, expect, test } from 'vitest'

import { createDefaultServiceClient } from '../src'

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
})
