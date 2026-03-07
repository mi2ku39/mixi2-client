import { afterEach, describe, expect, test, vi } from 'vitest'

import { getAccessTokenFromEnv } from '../src/auth'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
  vi.restoreAllMocks()
})

describe('getAccessTokenFromEnv', () => {
  test('retrieves access token using env variables', async () => {
    process.env.CLIENT_ID = 'client-id'
    process.env.CLIENT_SECRET = 'client-secret'
    process.env.TOKEN_URL = 'https://example.com/oauth/token'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'access-token-value',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'read write',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )

    const token = await getAccessTokenFromEnv({ fetchImpl: fetchMock, scope: 'read write' })

    expect(token).toEqual({
      accessToken: 'access-token-value',
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'read write',
      raw: {
        access_token: 'access-token-value',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'read write',
      },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }),
    )
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      'grant_type=client_credentials&client_id=client-id&client_secret=client-secret&scope=read+write',
    )
  })

  test('throws when required env vars are missing', async () => {
    delete process.env.CLIENT_ID
    delete process.env.CLIENT_SECRET
    delete process.env.TOKEN_URL

    await expect(getAccessTokenFromEnv({ fetchImpl: vi.fn() })).rejects.toThrow(
      'Missing required environment variable: CLIENT_ID',
    )
  })

  test('throws when token endpoint returns a non-ok response', async () => {
    process.env.CLIENT_ID = 'client-id'
    process.env.CLIENT_SECRET = 'client-secret'
    process.env.TOKEN_URL = 'https://example.com/oauth/token'

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('bad request', {
        status: 400,
        statusText: 'Bad Request',
      }),
    )

    await expect(getAccessTokenFromEnv({ fetchImpl: fetchMock })).rejects.toThrow(
      'Token request failed: 400 Bad Request - bad request',
    )
  })
})
