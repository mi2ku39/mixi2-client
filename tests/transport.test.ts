import { describe, expect, test } from 'vitest'
import { createRpcTransport } from '../src'

describe('createRpcTransport', () => {
  test('applies default timeout and headers', () => {
    const transport = createRpcTransport({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      timeoutMs: 5000,
      userAgent: 'mixi2-ts/test',
    })

    const options = transport.createCallOptions()

    expect(options.timeoutMs).toBe(5000)
    expect(options.headers.get('authorization')).toBe('Bearer token')
    expect(options.headers.get('user-agent')).toBe('mixi2-ts/test')
  })

  test('allows call-level overrides', () => {
    const transport = createRpcTransport({
      baseUrl: 'https://example.com',
      accessToken: 'token',
      timeoutMs: 5000,
      userAgent: 'mixi2-ts/test',
    })

    const options = transport.createCallOptions({
      timeoutMs: 1000,
      headers: {
        'x-trace-id': 'abc',
        authorization: 'Bearer override',
      },
    })

    expect(options.timeoutMs).toBe(1000)
    expect(options.headers.get('x-trace-id')).toBe('abc')
    expect(options.headers.get('authorization')).toBe('Bearer override')
    expect(options.headers.get('user-agent')).toBe('mixi2-ts/test')
  })
})
