import { createAuthorizationHeader } from './auth'

export type RpcHeadersInit = Headers | Record<string, string> | Array<[string, string]>

export type RpcCallOptions = {
  timeoutMs?: number
  headers?: RpcHeadersInit
  signal?: AbortSignal
}

export type RpcTransportOptions = {
  baseUrl: string
  accessToken: string
  fetch?: typeof globalThis.fetch
  timeoutMs?: number
  userAgent?: string
}

export type RpcTransport = {
  baseUrl: string
  fetch: typeof globalThis.fetch
  createCallOptions: (options?: RpcCallOptions) => { timeoutMs?: number; headers: Headers; signal?: AbortSignal }
}

export function createRpcTransport(options: RpcTransportOptions): RpcTransport {
  const fetchFn = options.fetch ?? globalThis.fetch
  const defaultHeaders = new Headers({
    Authorization: createAuthorizationHeader(options.accessToken),
  })

  if (options.userAgent) {
    defaultHeaders.set('User-Agent', options.userAgent)
  }

  return {
    baseUrl: options.baseUrl,
    fetch: fetchFn,
    createCallOptions(callOptions) {
      const headers = new Headers(defaultHeaders)

      if (callOptions?.headers) {
        const overrideHeaders = new Headers(callOptions.headers)
        overrideHeaders.forEach((value, key) => {
          headers.set(key, value)
        })
      }

      return {
        timeoutMs: callOptions?.timeoutMs ?? options.timeoutMs,
        headers,
        signal: callOptions?.signal,
      }
    },
  }
}
