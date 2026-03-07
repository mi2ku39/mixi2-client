import { create } from '@bufbuild/protobuf'
import {
  EventSchema,
  GetUsersResponseSchema,
  Mixi2Client,
  SubscribeEventsResponseSchema,
  type ApplicationApiClient,
  type ApplicationStreamClient,
} from '../src'

const serviceClient: ApplicationApiClient = {
  getUsers: async () => create(GetUsersResponseSchema, { users: [] }) as never,
  getPosts: async () => {
    throw new Error('not used in this example')
  },
  createPost: async () => {
    throw new Error('not used in this example')
  },
  initiatePostMediaUpload: async () => {
    throw new Error('not used in this example')
  },
  getPostMediaStatus: async () => {
    throw new Error('not used in this example')
  },
  sendChatMessage: async () => {
    throw new Error('not used in this example')
  },
  getStamps: async () => {
    throw new Error('not used in this example')
  },
  addStampToPost: async () => {
    throw new Error('not used in this example')
  },
}

const streamServiceClient: ApplicationStreamClient = {
  subscribeEvents: async function* () {
    yield create(SubscribeEventsResponseSchema, {
      events: [
        create(EventSchema, {
          body: {
            case: 'pingEvent',
            value: {},
          },
        }),
      ],
    })
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
    console.log('event type:', event.body.case)
    controller.abort()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
