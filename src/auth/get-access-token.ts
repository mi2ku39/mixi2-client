export type TokenRequestOptions = {
  scope?: string
  grantType?: string
  signal?: AbortSignal
  fetchImpl?: typeof fetch
}

export type TokenResponse = {
  accessToken: string
  tokenType: string
  expiresIn?: number
  scope?: string
  raw: unknown
}

const REQUIRED_ENV_KEYS = ['CLIENT_ID', 'CLIENT_SECRET', 'TOKEN_URL'] as const

function readRequiredEnv(key: (typeof REQUIRED_ENV_KEYS)[number]): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

function toTokenResponse(payload: unknown): TokenResponse {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Token endpoint returned a non-object JSON payload')
  }

  const raw = payload as Record<string, unknown>
  const accessToken = raw.access_token
  const tokenType = raw.token_type

  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('Token endpoint response does not include a valid access_token')
  }

  if (typeof tokenType !== 'string' || tokenType.length === 0) {
    throw new Error('Token endpoint response does not include a valid token_type')
  }

  const expiresInValue = raw.expires_in
  const scopeValue = raw.scope
  const expiresIn = typeof expiresInValue === 'number' ? expiresInValue : undefined
  const scope = typeof scopeValue === 'string' ? scopeValue : undefined

  return {
    accessToken,
    tokenType,
    expiresIn,
    scope,
    raw,
  }
}

export async function getAccessTokenFromEnv(options: TokenRequestOptions = {}): Promise<TokenResponse> {
  const clientId = readRequiredEnv('CLIENT_ID')
  const clientSecret = readRequiredEnv('CLIENT_SECRET')
  const tokenUrl = readRequiredEnv('TOKEN_URL')

  const grantType = options.grantType ?? 'client_credentials'
  const requestBody = new URLSearchParams({
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
  })

  if (options.scope) {
    requestBody.set('scope', options.scope)
  }

  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(tokenUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: requestBody.toString(),
    signal: options.signal,
  })

  const responseBody = await response.text()
  if (!response.ok) {
    throw new Error(
      `Token request failed: ${response.status} ${response.statusText} - ${responseBody}`,
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(responseBody)
  } catch {
    throw new Error('Token endpoint response is not valid JSON')
  }

  return toTokenResponse(payload)
}
