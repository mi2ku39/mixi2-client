import { Mixi2Client, type ApplicationApiClient, type ApplicationStreamClient } from '../src'

const serviceClient: ApplicationApiClient = {
  getUsers: async () => ({ users: [] }) as never,
  getPosts: async () => ({ posts: [] }) as never,
  createPost: async () => ({}) as never,
  initiatePostMediaUpload: async () => ({}) as never,
  getPostMediaStatus: async () => ({}) as never,
  sendChatMessage: async () => ({}) as never,
  getStamps: async () => ({}) as never,
  addStampToPost: async () => ({}) as never,
}

const streamServiceClient: ApplicationStreamClient = {
  subscribeEvents: async function* () {
    yield { events: [{ body: { case: 'pingEvent', value: {} } }] } as never
    yield { events: [{ body: { case: 'chatMessageEvent', value: {} } }] } as never
  },
}

async function main() {
  const controller = new AbortController()
  const client = new Mixi2Client({
    baseUrl: 'https://api.mixi.social',
    accessToken: process.env.MIXI2_ACCESS_TOKEN ?? 'dummy-token',
    serviceClient,
    streamServiceClient,
  })

  for await (const event of client.subscribeEvents({ signal: controller.signal })) {
    console.log('event case:', event.body.case)

    if (event.body.case === 'chatMessageEvent') {
      controller.abort()
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
