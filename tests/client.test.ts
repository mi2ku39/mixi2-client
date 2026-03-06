import { create } from '@bufbuild/protobuf'
import { describe, expect, test, vi } from 'vitest'
import { Mixi2Client, ValidationError } from '../src'
import {
  GetUsersResponseSchema,
  type GetUsersRequest,
} from '../src/generated/mixi2-api/social/mixi/application/service/application_api/v1/service_pb'

describe('Mixi2Client#getUsers', () => {
  test('delegates to separated getUsers RPC', async () => {
    const getUsersMock = vi
      .fn<
        (request: GetUsersRequest) => Promise<ReturnType<typeof create<typeof GetUsersResponseSchema>>>
      >()
      .mockResolvedValue(create(GetUsersResponseSchema))

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      serviceClient: { getUsers: getUsersMock },
    })

    await client.getUsers(['user-1'])

    expect(getUsersMock).toHaveBeenCalledTimes(1)
  })

  test('applies authorization header, user-agent and timeout defaults', async () => {
    const getUsersMock = vi
      .fn<
        (request: GetUsersRequest) => Promise<ReturnType<typeof create<typeof GetUsersResponseSchema>>>
      >()
      .mockResolvedValue(create(GetUsersResponseSchema))

    const client = new Mixi2Client({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      timeoutMs: 3000,
      userAgent: 'mixi2-ts/test',
      serviceClient: { getUsers: getUsersMock },
    })

    await client.getUsers(['user-1'])

    expect(getUsersMock.mock.calls[0]?.[1]?.timeoutMs).toBe(3000)
    expect(getUsersMock.mock.calls[0]?.[1]?.headers).toBeInstanceOf(Headers)
    const headers = getUsersMock.mock.calls[0]?.[1]?.headers as Headers
    expect(headers.get('authorization')).toBe('Bearer token')
    expect(headers.get('user-agent')).toBe('mixi2-ts/test')
  })

  test('requires baseUrl', () => {
    expect(
      () =>
        new Mixi2Client({
          baseUrl: '  ',
          accessToken: 'token',
          serviceClient: { getUsers: vi.fn() },
        }),
    ).toThrowError(ValidationError)
  })
})
