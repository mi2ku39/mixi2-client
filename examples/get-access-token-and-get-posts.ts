import type { GetPostsResponse } from '../src'
import { createDefaultServiceClient, getAccessTokenFromEnv } from '../src'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

function getPostIdListFromEnv(): string[] {
  return getRequiredEnv('MIXI2_POST_IDS')
    .split(',')
    .map((postId) => postId.trim())
    .filter((postId) => postId.length > 0)
}

async function getPosts(
  client: ReturnType<typeof createDefaultServiceClient>,
  postIdList: string[],
): Promise<GetPostsResponse> {
  return await new Promise<GetPostsResponse>((resolve, reject) => {
    client.applicationApi.getPosts({ postIdList }, (error, result) => {
      if (error) {
        reject(error)
        return
      }

      resolve(result)
    })
  })
}

async function main(): Promise<void> {
  const token = await getAccessTokenFromEnv({
    scope: process.env.MIXI2_SCOPE,
  })

  const serviceClient = createDefaultServiceClient({
    baseUrl: getRequiredEnv('MIXI2_BASE_URL'),
    accessToken: token.accessToken,
  })

  try {
    const response = await getPosts(serviceClient, getPostIdListFromEnv())
    console.log('fetched posts:', response.posts)
  } finally {
    serviceClient.applicationApi.close()
    serviceClient.applicationStream.close()
  }
}

void main().catch((error) => {
  console.error('Failed to get access token or fetch posts:', error)
  process.exitCode = 1
})
