import { TransportError, ValidationError } from './errors'

export type OAuth2TokenRequestOptions = {
  clientId: string
  clientSecret: string
  tokenUrl: string
  fetch?: typeof globalThis.fetch
  grantType?: string
  scope?: string
}

export type OAuth2Env = {
  clientId: string
  clientSecret: string
  tokenUrl: string
  streamAddress: string
}

export type OAuth2EnvRequestOptions = {
  env?: NodeJS.ProcessEnv
  fetch?: typeof globalThis.fetch
  grantType?: string
  scope?: string
}

export function createAuthorizationHeader(accessToken: string): string {
  const token = accessToken.trim()
  if (!token) {
    throw new ValidationError('accessToken is required')
  }
  return `Bearer ${token}`
}

export function loadOAuth2Env(env: NodeJS.ProcessEnv = process.env): OAuth2Env {
  return {
    clientId: getRequiredEnv('CLIENT_ID', env),
    clientSecret: getRequiredEnv('CLIENT_SECRET', env),
    tokenUrl: getRequiredEnv('TOKEN_URL', env),
    streamAddress: getRequiredEnv('STREAM_ADDRESS', env),
  }
}

export async function issueOAuth2AccessToken(options: OAuth2TokenRequestOptions): Promise<string> {
  const clientId = options.clientId.trim()
  const clientSecret = options.clientSecret.trim()
  const tokenUrl = options.tokenUrl.trim()
  const grantType = options.grantType?.trim() || 'client_credentials'
  const scope = options.scope?.trim()

  if (!clientId) {
    throw new ValidationError('clientId is required')
  }
  if (!clientSecret) {
    throw new ValidationError('clientSecret is required')
  }
  if (!tokenUrl) {
    throw new ValidationError('tokenUrl is required')
  }

  const fetchFn = options.fetch ?? globalThis.fetch
  const body = new URLSearchParams({
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
  })

  if (scope) {
    body.set('scope', scope)
  }

  let response: Response
  try {
    response = await fetchFn(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
  } catch (error) {
    throw new TransportError('Failed to request OAuth2 token endpoint', { cause: error })
  }

  if (!response.ok) {
    throw new TransportError(`OAuth2 token endpoint returned HTTP ${response.status}`)
  }

  let payload: unknown
  try {
    payload = (await response.json()) as unknown
  } catch (error) {
    throw new TransportError('OAuth2 token endpoint returned invalid JSON', { cause: error })
  }

  const accessToken = extractAccessToken(payload)
  if (!accessToken) {
    throw new TransportError('OAuth2 token response does not contain access_token')
  }

  return accessToken
}

export async function issueOAuth2AccessTokenFromEnv(
  options: OAuth2EnvRequestOptions = {},
): Promise<{ accessToken: string; streamAddress: string }> {
  const oauth2Env = loadOAuth2Env(options.env)
  const accessToken = await issueOAuth2AccessToken({
    clientId: oauth2Env.clientId,
    clientSecret: oauth2Env.clientSecret,
    tokenUrl: oauth2Env.tokenUrl,
    fetch: options.fetch,
    grantType: options.grantType,
    scope: options.scope,
  })

  return {
    accessToken,
    streamAddress: oauth2Env.streamAddress,
  }
}

function getRequiredEnv(name: string, env: NodeJS.ProcessEnv): string {
  const value = env[name]?.trim()
  if (!value) {
    throw new ValidationError(`${name} is required`)
  }
  return value
}

function extractAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const accessToken = (payload as { access_token?: unknown }).access_token
  if (typeof accessToken !== 'string') {
    return undefined
  }

  const token = accessToken.trim()
  return token || undefined
}
