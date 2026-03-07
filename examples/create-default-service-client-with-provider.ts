import { status } from '@grpc/grpc-js'

import { createDefaultServiceClient, getAccessTokenFromEnv } from '../src'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

async function callGetUsersOnce(
  client: ReturnType<typeof createDefaultServiceClient>,
  userId: string,
): Promise<{ users: unknown[] }> {
  return await new Promise<{ users: unknown[] }>((resolve, reject) => {
    client.applicationApi.getUsers({ userIdList: [userId] }, (error, result) => {
      if (error) {
        reject(error)
        return
      }

      resolve(result)
    })
  })
}

async function main(): Promise<void> {
  const serviceClient = createDefaultServiceClient({
    baseUrl: getRequiredEnv('MIXI2_BASE_URL'),
    accessTokenProvider: async () => {
      const token = await getAccessTokenFromEnv({
        scope: process.env.MIXI2_SCOPE,
      })

      return token.accessToken
    },
  })

  const userId = getRequiredEnv('MIXI2_USER_ID')

  try {
    const response = await callGetUsersOnce(serviceClient, userId)
    console.log('users:', response.users)
  } catch (error) {
    const grpcError = error as { code?: number }

    if (grpcError.code === status.UNAUTHENTICATED) {
      console.log('received UNAUTHENTICATED. retrying once with a newly resolved token...')
      const retryResponse = await callGetUsersOnce(serviceClient, userId)
      console.log('retry users:', retryResponse.users)
      return
    }

    throw error
  } finally {
    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  }
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
