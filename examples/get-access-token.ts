import { getAccessTokenFromEnv } from '../src/auth'

async function main(): Promise<void> {
  const token = await getAccessTokenFromEnv({
    scope: process.env.MIXI2_SCOPE,
  })

  console.log('access token:', token.accessToken)
  console.log('token type:', token.tokenType)
  console.log('expires in:', token.expiresIn)
  console.log('scope:', token.scope)
}

void main().catch((error) => {
  console.error('Failed to get access token:', error)
  process.exitCode = 1
})
