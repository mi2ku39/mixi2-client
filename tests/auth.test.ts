import { describe, expect, test, vi } from 'vitest'
import {
  createAuthorizationHeader,
  issueOAuth2AccessToken,
  issueOAuth2AccessTokenFromEnv,
  loadOAuth2Env,
  TransportError,
  ValidationError,
} from '../src'

describe('createAuthorizationHeader', () => {
  test('returns bearer token header value', () => {
    expect(createAuthorizationHeader('my-token')).toBe('Bearer my-token')
  })

  test('throws ValidationError when token is blank', () => {
    expect(() => createAuthorizationHeader('   ')).toThrowError(ValidationError)
  })
})

describe('loadOAuth2Env', () => {
  test('loads required OAuth2 environment variables', () => {
    expect(
      loadOAuth2Env({
        CLIENT_ID: 'client-id',
        CLIENT_SECRET: 'client-secret',
        TOKEN_URL: 'https://example.com/oauth/token',
        STREAM_ADDRESS: 'https://stream.example.com',
      }),
    ).toEqual({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      tokenUrl: 'https://example.com/oauth/token',
      streamAddress: 'https://stream.example.com',
    })
  })

  test('throws ValidationError when required environment variable is missing', () => {
    expect(() =>
      loadOAuth2Env({
        CLIENT_ID: 'client-id',
        CLIENT_SECRET: '',
        TOKEN_URL: 'https://example.com/oauth/token',
        STREAM_ADDRESS: 'https://stream.example.com',
      }),
    ).toThrowError(ValidationError)
  })
})

describe('issueOAuth2AccessToken', () => {
  test('issues access token with OAuth2 client credentials', async () => {
    const fetchMock = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ access_token: 'issued-token' }), { status: 200 }))

    await expect(
      issueOAuth2AccessToken({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        tokenUrl: 'https://example.com/oauth/token',
        fetch: fetchMock,
      }),
    ).resolves.toBe('issued-token')

    const requestInit = fetchMock.mock.calls[0]?.[1]
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://example.com/oauth/token')
    expect(requestInit?.method).toBe('POST')
    expect((requestInit?.body as URLSearchParams).get('grant_type')).toBe('client_credentials')
    expect((requestInit?.body as URLSearchParams).get('client_id')).toBe('client-id')
    expect((requestInit?.body as URLSearchParams).get('client_secret')).toBe('client-secret')
  })

  test('throws TransportError on non-2xx response', async () => {
    const fetchMock = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ error: 'invalid_client' }), { status: 401 }))

    await expect(
      issueOAuth2AccessToken({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        tokenUrl: 'https://example.com/oauth/token',
        fetch: fetchMock,
      }),
    ).rejects.toThrowError(TransportError)
  })

  test('throws TransportError when access_token is missing', async () => {
    const fetchMock = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ token_type: 'Bearer' }), { status: 200 }))

    await expect(
      issueOAuth2AccessToken({
        clientId: 'client-id',
        clientSecret: 'client-secret',
        tokenUrl: 'https://example.com/oauth/token',
        fetch: fetchMock,
      }),
    ).rejects.toThrowError(TransportError)
  })
})

describe('issueOAuth2AccessTokenFromEnv', () => {
  test('returns accessToken and streamAddress from env', async () => {
    const fetchMock = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify({ access_token: 'issued-token' }), { status: 200 }))

    await expect(
      issueOAuth2AccessTokenFromEnv({
        env: {
          CLIENT_ID: 'client-id',
          CLIENT_SECRET: 'client-secret',
          TOKEN_URL: 'https://example.com/oauth/token',
          STREAM_ADDRESS: 'https://stream.example.com',
        },
        fetch: fetchMock,
      }),
    ).resolves.toEqual({
      accessToken: 'issued-token',
      streamAddress: 'https://stream.example.com',
    })
  })
})
