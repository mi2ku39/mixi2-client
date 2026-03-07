import { createDefaultServiceClient } from '../src'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

async function main(): Promise<void> {
  const serviceClient = createDefaultServiceClient({
    baseUrl: getRequiredEnv('MIXI2_BASE_URL'),
    accessToken: getRequiredEnv('MIXI2_ACCESS_TOKEN'),
  })

  const userId = getRequiredEnv('MIXI2_USER_ID')

  const response = await new Promise<{ users: unknown[] }>((resolve, reject) => {
    serviceClient.applicationApi.getUsers({ userIdList: [userId] }, (error, result) => {
      if (error) {
        reject(error)
        return
      }

      resolve(result)
    })
  })

  console.log('users:', response.users)

  serviceClient.applicationApi.close()
  serviceClient.applicationStream.close()
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
